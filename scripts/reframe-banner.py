#!/usr/bin/env python3
"""Reencuadra un banner a 2560x675 (ratio del contenedor PromotionsBanner).

Técnica: fondo = la misma imagen escalada a "cover" + blur + oscurecida;
primer plano = la imagen completa centrada ajustada por altura (~650px para
que también quepa entera en el centro visible de móviles de 360px, donde
object-cover solo muestra el ~73% central del ancho).
"""

import sys
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance

W, H = 2560, 675
FG_H = 650  # alto del flyer en primer plano (deja márgenes seguros en móvil)


def reframe(src: Path, dst: Path) -> None:
    img = Image.open(src).convert("RGB")

    # Fondo: cover + blur suave + un poco más oscuro para que el flyer resalte
    scale = max(W / img.width, H / img.height)
    bg = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    left = (bg.width - W) // 2
    top = (bg.height - H) // 2
    bg = bg.crop((left, top, left + W, top + H))
    bg = bg.filter(ImageFilter.GaussianBlur(28))
    bg = ImageEnhance.Brightness(bg).enhance(0.82)

    # Primer plano: flyer completo, ajustado por alto y centrado
    fg_w = round(img.width * (FG_H / img.height))
    fg = img.resize((fg_w, FG_H), Image.LANCZOS)
    bg.paste(fg, ((W - fg_w) // 2, (H - FG_H) // 2))

    bg.save(dst, "WEBP", quality=88, method=6)
    print(f"{dst.name}: {img.size} -> {bg.size} (flyer {fg_w}x{FG_H} centrado)")


if __name__ == "__main__":
    base = Path(__file__).resolve().parent.parent / "public" / "images"
    orig = base / "banners-originales"
    orig.mkdir(exist_ok=True)
    for name in sys.argv[1:] or ["banner-san-andres.webp", "banner-punta-cana.webp", "banner-eje-cafetero.webp"]:
        src = base / name
        backup = orig / name
        if not backup.exists():
            backup.write_bytes(src.read_bytes())
        reframe(backup if backup.exists() else src, src)
