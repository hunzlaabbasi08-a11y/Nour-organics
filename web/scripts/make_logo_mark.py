from pathlib import Path

from PIL import Image
import numpy as np

src = Path(r"c:\Users\Ideat\Downloads\Nour Organics\web\public\images\logo.png")
out_mark = Path(r"c:\Users\Ideat\Downloads\Nour Organics\web\public\images\logo-mark.png")

full = Image.open(src).convert("RGBA")
arr = np.array(full)
a = arr[:, :, 3]
ys, xs = np.where(a > 20)
top, bottom = int(ys.min()), int(ys.max())
left, right = int(xs.min()), int(xs.max())

# Monogram only: stop before the NOUR wordmark (starts ~62% down)
cut = top + int((bottom - top) * 0.62)
mono = full.crop((left, top, right, cut))
bbox = mono.getbbox()
if bbox:
    mono = mono.crop(bbox)

w, h = mono.size
# Generous transparent padding so leaves/circle aren't clipped in UI
pad = 48
side = max(w, h) + pad * 2
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(mono, ((side - w) // 2, (side - h) // 2), mono)
canvas.save(out_mark, "PNG")
print("mark", canvas.size, "content", (w, h), "pad", pad)
