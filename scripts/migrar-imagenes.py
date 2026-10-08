#!/usr/bin/env python3
"""Migración única: optimiza las imágenes ya subidas en Supabase Storage.

1. Lee todas las URLs de imágenes referenciadas en la BD (plans, cabins,
   hero_images, site_content — recorriendo jsonb en profundidad).
2. Para cada objeto referenciado y optimizable: descarga, convierte a WebP
   (calidad 85, ancho máx. 2560 en hero / 1920 resto) y lo sube junto al
   original con nuevo nombre.
3. Reescribe en la BD cada referencia antigua → nueva (solo columnas que
   cambiaron).
4. Verifica que no queden referencias a los originales antes de borrarlos.
"""
import json
import os
import re
import sys
import urllib.request
import uuid
from io import BytesIO
from pathlib import Path

from PIL import Image

BASE = os.environ["VITE_SUPABASE_URL"]
KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
HDRS = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}
PUBLIC = BASE + "/storage/v1/object/public/site-images/"
BACKUP = Path("/tmp/migracion-originales")

URL_RE = re.compile(re.escape(PUBLIC) + r"([^\s\"',\]]+)")


def rest(path, payload=None, method="GET", raw=None, extra=None):
    h = dict(HDRS)
    if payload is not None:
        h["Content-Type"] = "application/json"
    if extra:
        h.update(extra)
    data = raw if raw is not None else (json.dumps(payload).encode() if payload is not None else None)
    req = urllib.request.Request(BASE + path, data=data, headers=h, method=method)
    with urllib.request.urlopen(req) as r:
        body = r.read()
        return json.loads(body) if body and body[:1] in (b"[", b"{") else body


def fetch_all(tabla):
    filas = []
    offset = 0
    while True:
        lote = rest(f"/rest/v1/{tabla}?select=*&limit=1000&offset={offset}")
        filas += lote
        if len(lote) < 1000:
            return filas
        offset += 1000


def colectar_refs(obj, encontrados):
    """Recorre cualquier estructura json recolectando paths de site-images."""
    if isinstance(obj, str):
        for m in URL_RE.finditer(obj):
            encontrados.add(m.group(1).split("?")[0])
    elif isinstance(obj, dict):
        for v in obj.values():
            colectar_refs(v, encontrados)
    elif isinstance(obj, list):
        for v in obj:
            colectar_refs(v, encontrados)


def reemplazar(obj, mapa):
    """Reemplaza en profundidad URLs antiguas por nuevas. Devuelve (nuevo, cambió)."""
    if isinstance(obj, str):
        nuevo = obj
        for viejo, nuevourl in mapa.items():
            nuevo = nuevo.replace(viejo, nuevourl)
        return nuevo, nuevo != obj
    if isinstance(obj, dict):
        nuevo, cambió = {}, False
        for k, v in obj.items():
            nv, c = reemplazar(v, mapa)
            nuevo[k] = nv
            cambió = cambió or c
        return nuevo, cambió
    if isinstance(obj, list):
        nuevo, cambió = [], False
        for v in obj:
            nv, c = reemplazar(v, mapa)
            nuevo.append(nv)
            cambió = cambió or c
        return nuevo, cambió
    return obj, False


def optimizable(nombre, mimetype, tam):
    ext = nombre.rsplit(".", 1)[-1].lower()
    if ext in ("jpg", "jpeg", "png", "tiff", "bmp") and tam > 150 * 1024:
        return True
    if ext == "webp" and tam > 400 * 1024:
        return True
    return False


def main():
    BACKUP.mkdir(exist_ok=True)

    # ── 1. Referencias en la BD ────────────────────────────────────────────
    tablas = {"plans": fetch_all("plans"), "cabins": fetch_all("cabins"),
              "hero_images": fetch_all("hero_images"), "site_content": fetch_all("site_content")}
    refs = set()
    for filas in tablas.values():
        for fila in filas:
            colectar_refs(fila, refs)
    print(f"Referencias a site-images en la BD: {len(refs)} objetos distintos")

    # ── 2. Listar Storage y decidir qué optimizar ──────────────────────────
    carpetas = [o["name"] for o in rest("/storage/v1/object/list/site-images",
                  {"prefix": "", "limit": 1000, "offset": 0}, method="POST") if o.get("name")]
    objetos = []
    for c in carpetas:
        for o in rest("/storage/v1/object/list/site-images",
                      {"prefix": c + "/", "limit": 1000, "offset": 0}, method="POST"):
            if o.get("metadata"):
                objetos.append({"path": f"{c}/{o['name']}", "tam": o["metadata"]["size"],
                                "mime": o["metadata"]["mimetype"]})

    pendientes = [o for o in objetos if o["path"] in refs
                  and optimizable(o["path"], o["mime"], o["tam"])]
    heic_ref = [o["path"] for o in objetos if o["path"] in refs and o["path"].lower().endswith(".heic")]
    print(f"Objetos en Storage: {len(objetos)} | referenciados y optimizables: {len(pendientes)}"
          + (f" | HEIC referenciados (requieren re-subida manual): {len(heic_ref)}" if heic_ref else ""))
    for h in heic_ref:
        print(f"   HEIC: {h}")

    if "--solo-plan" in sys.argv:
        for o in pendientes:
            print(f"   {o['path']:60s} {o['tam']/1024:8.0f} KB")
        return

    # ── 3. Optimizar y subir nuevas versiones ──────────────────────────────
    mapa = {}
    total_antes = total_despues = 0
    for o in pendientes:
        path, carpeta = o["path"], o["path"].split("/")[0]
        max_ancho = 2560 if carpeta == "hero" else 1920
        try:
            datos = rest(f"/storage/v1/object/public/site-images/{path}", raw=b"")
            (BACKUP / path.replace("/", "__")).write_bytes(datos)
            im = Image.open(BytesIO(datos))
            if im.width > max_ancho:
                im = im.resize((max_ancho, round(im.height * max_ancho / im.width)), Image.LANCZOS)
            buf = BytesIO()
            im.save(buf, "WEBP", quality=85, method=6)
            if buf.tell() >= len(datos):
                print(f"   = {path}: el WebP no ahorra, se deja el original")
                continue
            nuevo_path = f"{carpeta}/{uuid.uuid4()}.webp"
            rest(f"/storage/v1/object/site-images/{nuevo_path}", raw=buf.getvalue(),
                 method="POST", extra={"Content-Type": "image/webp", "x-upsert": "false"})
            mapa[PUBLIC + path] = PUBLIC + nuevo_path
            total_antes += len(datos)
            total_despues += buf.tell()
            print(f"   ✓ {path} ({len(datos)//1024} KB) → {nuevo_path} ({buf.tell()//1024} KB)")
        except Exception as e:
            print(f"   ✗ {path}: {e} — se deja el original")

    print(f"\nOptimizadas: {len(mapa)} | {total_antes/1024/1024:.1f} MB → {total_despues/1024/1024:.1f} MB")
    if not mapa:
        return

    # ── 4. Actualizar referencias en la BD ─────────────────────────────────
    columnas_fecha = {"created_at", "updated_at"}
    for tabla, filas in tablas.items():
        for fila in filas:
            cambios = {}
            for col, val in fila.items():
                if col in columnas_fecha or not isinstance(val, (dict, list, str)):
                    continue
                nuevo, cambió = reemplazar(val, mapa)
                if cambió:
                    cambios[col] = nuevo
            if cambios:
                rest(f"/rest/v1/{tabla}?id=eq.{fila['id']}", payload=cambios, method="PATCH")
                print(f"   BD actualizada: {tabla}/{fila['id']} ({', '.join(cambios)})")

    # ── 5. Verificación final antes de borrar originales ───────────────────
    resto = set()
    for tabla in tablas:
        for fila in fetch_all(tabla):
            colectar_refs(fila, resto)
    vivos = [viejo for viejo in mapa if viejo.split("site-images/")[-1] in resto]
    if vivos:
        print(f"⚠ Quedan {len(vivos)} referencias a originales — NO se borra nada:")
        for v in vivos:
            print(f"   {v}")
        return

    if "--no-borrar" in sys.argv:
        print("Origenales respaldados en /tmp/migracion-originales (no se borraron de Storage por --no-borrar)")
        return
    for viejo in mapa:
        rest(f"/storage/v1/object/site-images/{viejo.split('site-images/')[-1]}", method="DELETE")
    print(f"Originales borrados de Storage: {len(mapa)} (respaldo local en {BACKUP})")


if __name__ == "__main__":
    main()
