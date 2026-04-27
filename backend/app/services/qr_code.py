from __future__ import annotations

import base64
from io import BytesIO

import qrcode


def generate_qr_base64(value: str) -> str:
    image = qrcode.make(value)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"
