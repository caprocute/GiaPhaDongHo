#!/usr/bin/env python3
"""Tạo JPEG thật + upload MinIO + cập nhật media_photo.object_key (DEV)."""
from __future__ import annotations

import io
import os
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def load_env(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.is_file():
        return out
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def minimal_jpeg(width: int = 640, height: int = 480, r: int = 122, g: int = 32, b: int = 20) -> bytes:
    """JPEG 1×1 rồi scale bằng pillow nếu có; fallback PNG-in-JPEG-like raw via PIL optional."""
    try:
        from PIL import Image, ImageDraw, ImageFont  # type: ignore

        img = Image.new("RGB", (width, height), (r, g, b))
        draw = ImageDraw.Draw(img)
        draw.rectangle([20, 20, width - 20, height - 20], outline=(201, 162, 39), width=4)
        draw.text((40, height // 2 - 10), "GiaPhaHub · họ Hoàng", fill=(249, 239, 216))
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        return buf.getvalue()
    except Exception:
        # Minimal valid JPEG (1x1 red) — đủ để MinIO nhận image/jpeg
        return bytes.fromhex(
            "ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707"
            "070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c"
            "1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d"
            "0d1832211c2132323232323232323232323232323232323232323232323232323232"
            "323232323232323232323232323232323232ffc00011080001000103011100021100"
            "31100ffc40014000000000000000000000000000000000ffc4001410010000000000"
            "00000000000000000000ffda000c0301000210031000003f00d2cf20ffd9"
        )


def main() -> None:
    env = load_env(ROOT / ".env.local")
    endpoint = env.get("MINIO_ENDPOINT", "http://127.0.0.1:19000").rstrip("/")
    access = env.get("MINIO_ACCESS_KEY", "giapha")
    secret = env.get("MINIO_SECRET_KEY", "")
    bucket = env.get("MINIO_BUCKET", "giapha-media")
    db_user = env.get("DB_USER", "giapha")
    db_pass = env.get("DB_PASSWORD", "")
    db_host = "127.0.0.1"
    db_port = "15432"
    db_name = "giapha"

    import subprocess
    import sys

    def ensure(pkg: str) -> None:
        try:
            __import__(pkg)
        except ImportError:
            subprocess.check_call([sys.executable, "-m", "pip", "install", pkg, "-q"])

    ensure("minio")
    ensure("PIL")
    try:
        import psycopg2  # type: ignore
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary", "-q"])
        import psycopg2  # type: ignore

    from minio import Minio  # type: ignore

    host = endpoint.replace("http://", "").replace("https://", "")
    secure = endpoint.startswith("https://")
    client = Minio(host, access_key=access, secret_key=secret, secure=secure)
    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)

    conn = psycopg2.connect(
        host=db_host, port=db_port, user=db_user, password=db_pass, dbname=db_name
    )
    cur = conn.cursor()
    cur.execute("SELECT id, album_id FROM media_photo ORDER BY id")
    rows = cur.fetchall()
    uploaded = 0
    for photo_id, album_id in rows:
        album = album_id or 0
        key = f"albums/{album}/seed-{photo_id:04d}.jpg"
        data = minimal_jpeg(r=100 + (photo_id % 40), g=30 + (photo_id % 20), b=20)
        client.put_object(
            bucket,
            key,
            io.BytesIO(data),
            length=len(data),
            content_type="image/jpeg",
        )
        cur.execute("UPDATE media_photo SET object_key = %s WHERE id = %s", (key, photo_id))
        uploaded += 1
    conn.commit()
    cur.close()
    conn.close()
    print(f"OK — uploaded {uploaded} JPEG vào bucket `{bucket}` và cập nhật object_key.")


if __name__ == "__main__":
    main()
