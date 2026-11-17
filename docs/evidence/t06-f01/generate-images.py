# /// script
# requires-python = ">=3.12"
# dependencies = ["pillow==13.0.0"]
# ///
from PIL import Image, ImageDraw
from pathlib import Path
root = Path(__file__).resolve().parents[3] / 'frontend/apps/playground/public/files'
for filename, kind, bg, title in [('garden.png', 'PNG', '#d5e8d6', 'GARDEN / 2026'), ('coast.jpg', 'JPEG', '#d6e6f2', 'COAST / 2026')]:
    image=Image.new('RGB',(640,400),bg)
    draw=ImageDraw.Draw(image)
    draw.rectangle((36,36,604,364),outline='#244452',width=4)
    draw.ellipse((360,75,520,235),fill='#e5b96a')
    draw.polygon([(40,320),(220,150),(390,320)],fill='#3f7869')
    draw.polygon([(220,320),(420,220),(600,320)],fill='#7198ac')
    draw.text((65,65),title,fill='#173442',font_size=26)
    draw.text((65,332),'LOCAL IMAGE - 640 x 400',fill='#173442',font_size=18)
    image.save(root/filename,kind)
