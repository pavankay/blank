# Generates the pictures used by tests/smart.e2e.js. Run: python3 tools/make-test-images.py
from PIL import Image, ImageDraw, ImageFilter
import os, random
out = os.path.join(os.path.dirname(__file__), '..', 'tests', 'fixtures', 'images')
os.makedirs(out, exist_ok=True)

def scene(seed, w=480, h=270):
    random.seed(seed)
    im = Image.new('RGB', (w, h))
    d = ImageDraw.Draw(im)
    for y in range(h):  # sunset-ish gradient
        d.line([(0, y), (w, y)], fill=(int(40 + 180 * y / h), int(20 + 60 * (1 - y / h)), int(90 + 100 * (1 - y / h))))
    for _ in range(14):
        x, y = random.randrange(w), random.randrange(h)
        r = random.randrange(15, 70)
        c = tuple(random.randrange(256) for _ in range(3))
        (d.ellipse if random.random() < .5 else d.rectangle)([x - r, y - r // 2, x + r, y + r], fill=c)
    return im.filter(ImageFilter.GaussianBlur(1))

spoiler = scene(7)
spoiler.save(os.path.join(out, 'spoiler.png'))
# The same screenshot reposted: smaller, JPEG, inside a 4:3 letterboxed thumbnail.
small = spoiler.resize((320, 180), Image.LANCZOS)
thumb = Image.new('RGB', (320, 240), (0, 0, 0))
thumb.paste(small, (0, 30))
thumb.save(os.path.join(out, 'spoiler-repost.jpg'), quality=55)
scene(21).save(os.path.join(out, 'safe1.png'))
scene(99).save(os.path.join(out, 'safe2.png'))
scene(1234).save(os.path.join(out, 'vision.png'))
print(sorted(os.listdir(out)))
