#!/usr/bin/env python3
"""Inventario de imágenes en el bucket site-images de Supabase."""
import json
import os
import sys
import urllib.request

BASE = os.environ["VITE_SUPABASE_URL"]
KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
HDRS = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}


def api(path, payload=None, method="POST"):
    req = urllib.request.Request(
        BASE + path, data=json.dumps(payload).encode() if payload else None,
        headers=HDRS, method=method)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def listar(prefijo):
    try:
        r = api("/storage/v1/object/list/site-images",
                {"prefix": prefijo, "limit": 1000, "offset": 0})
        return r if isinstance(r, list) else []
    except Exception as e:
        print(f"  ! error en {prefijo}: {e}", file=sys.stderr)
        return []


# descubrir carpetas raíz y luego objetos
carpetas = [o["name"] for o in listar("") if o.get("name")]
objs = []
for c in carpetas:
    objs += listar(c + "/")

total = 0
convertibles = 0
print(f"{len(objs)} objetos en {len(carpetas)} carpetas ({', '.join(carpetas)}):")
for o in objs:
    if not o.get("metadata"):
        continue
    kb = o["metadata"]["size"] / 1024
    total += o["metadata"]["size"]
    mt = o["metadata"]["mimetype"]
    marca = ""
    if mt in ("image/jpeg", "image/png", "image/tiff", "image/bmp") and o["metadata"]["size"] > 150 * 1024:
        convertibles += 1
        marca = " ← OPTIMIZAR"
    print(f"  {o['name']:58s} {kb:8.0f} KB  {mt}{marca}")
print(f"\nTOTAL: {total/1024/1024:.1f} MB | optimizables: {convertibles}")
