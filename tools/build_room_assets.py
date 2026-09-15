"""Encode generated panoramas and project perspective thumbnails (no scene edits)."""
from pathlib import Path
import json, math, hashlib
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates
root = Path(__file__).resolve().parents[1]
folder = root / 'assets/rooms'
manifest = []
for source in sorted(folder.glob('*-4k.jpg')):
    name = source.name.replace('-4k.jpg', '')
    image = Image.open(source).convert('RGB')
    w, h = image.size
    if w != h * 2:
        raise ValueError(f'{source}: panorama must be 2:1')
    target = source
    if (w,h) != (4096,2048):
        raise ValueError(f'{source}: expected 4096 x 2048')
    yaw = {'family': -20, 'basic': 30, 'premium': 38, 'premium-02_DESK':100, 'premium-03_BED_FOOT':78, 'premium-04_BED_SIDE':18, 'premium-05_WINDOW':28, 'premium-06_LOUNGE':-3}.get(name, 42)
    pitch = -9
    width, height = 1000, 650
    t = math.tan(math.radians(105) / 2)
    xx, yy = np.meshgrid(np.linspace(-t, t, width), np.linspace(t * height / width, -t * height / width, height))
    ya, pi = map(math.radians, (yaw, pitch))
    f = np.array([math.sin(ya)*math.cos(pi), math.cos(ya)*math.cos(pi), math.sin(pi)])
    r = np.array([math.cos(ya), -math.sin(ya), 0]); u = np.cross(r, f)
    d = f[:,None,None] + r[:,None,None]*xx + u[:,None,None]*yy
    x,y,z = d
    px = (np.arctan2(x,y)/(2*math.pi)+.5)*w-.5
    py = (.5-np.arcsin(z/np.linalg.norm(d,axis=0))/math.pi)*h-.5
    arr = np.asarray(image)
    view = np.stack([map_coordinates(arr[:,:,c],[py,px],order=1,mode='wrap') for c in range(3)],axis=-1).astype('uint8')
    preview = folder / (name + '-preview.jpg')
    Image.fromarray(view).save(preview, quality=90, optimize=True)
    for path in (target,preview):
        manifest.append({'path':str(path.relative_to(root)), 'size':list(Image.open(path).size), 'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
(root/'docs/room-asset-manifest.json').write_text(json.dumps({'date':'2026-09-15','source':'built-in image_gen perspective edits; spherical reprojection; premium original 4K base','assets':manifest},ensure_ascii=False,indent=2)+'\n')
print(f'Prepared {len(manifest)//2} panoramas and previews')
