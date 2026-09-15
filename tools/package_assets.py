"""Refresh premium thumbnails and validate all three room tours."""
from pathlib import Path
import hashlib
import json
import math
from urllib.parse import urlsplit

import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates

root = Path(__file__).resolve().parents[1]
config = json.loads((root / 'tour-config.json').read_text())
assert config == json.loads((root / 'tour-config-equirect.json').read_text())
scenes = config['scenes']
assert len(scenes) == 6
records = []
for sid, scene in scenes.items():
    source = root / urlsplit(scene['panorama']).path
    im = Image.open(source).convert('RGB')
    assert im.width == im.height * 2, (sid, im.size)
    pixels = np.asarray(im)
    width, height = 480, 270
    tan_half_fov = math.tan(math.radians(85 / 2))
    xx, yy = np.meshgrid(np.linspace(-tan_half_fov, tan_half_fov, width),
                         np.linspace(tan_half_fov * height / width, -tan_half_fov * height / width, height))
    yaw, pitch = map(math.radians, (scene['yaw'], scene['pitch']))
    forward = np.array([math.sin(yaw)*math.cos(pitch), math.cos(yaw)*math.cos(pitch), math.sin(pitch)])
    right = np.array([math.cos(yaw), -math.sin(yaw), 0])
    up = np.cross(right, forward)
    directions = forward[:, None, None] + right[:, None, None]*xx + up[:, None, None]*yy
    x, y, z = directions
    px = (np.arctan2(x, y)/(2*math.pi)+.5)*im.width-.5
    py = (.5-np.arcsin(z/np.linalg.norm(directions, axis=0))/math.pi)*im.height-.5
    thumbnail = np.stack([map_coordinates(pixels[:, :, c], [py, px], order=1, mode='wrap') for c in range(3)], axis=-1)
    target = root / urlsplit(scene['thumbnail']).path
    Image.fromarray(thumbnail).save(target, quality=92, optimize=True)
    moves = [h['sceneId'] for h in scene['hotSpots'] if h['type'] == 'scene']
    assert moves and all(dest in scenes for dest in moves), sid
    assert sum(h.get('clickHandlerArgs', {}).get('action') == 'wood-cycle' for h in scene['hotSpots']) == 1, sid
    records.append({'scene': sid, 'image': str(source.relative_to(root)), 'size': list(im.size), 'bytes': source.stat().st_size,
                    'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'thumbnail': str(target.relative_to(root)), 'destinations': moves})
# Each scene must be reachable using the on-image movement arrows.
for start in scenes:
    reached, pending = set(), [start]
    while pending:
        current = pending.pop()
        if current in reached:
            continue
        reached.add(current)
        pending.extend(h['sceneId'] for h in scenes[current]['hotSpots'] if h['type'] == 'scene')
    assert len(reached) == 6, start
for room in ('family', 'basic'):
    variant = json.loads((root / f'tour-config-{room}.json').read_text())
    assert variant['default']['firstScene'] in variant['scenes']
    for sid, scene in variant['scenes'].items():
        source = root / urlsplit(scene['panorama']).path
        im = Image.open(source)
        assert im.width == im.height * 2
        assert (root / urlsplit(scene['thumbnail']).path).exists()
        features = {h.get('feature') for h in scene['hotSpots']}
        assert {'baum', 'wood-cycle', 'brochure', 'log-pillow', 'wood-spray'} <= features
        records.append({'scene':sid, 'room':room, 'image':str(source.relative_to(root)), 'size':list(im.size), 'bytes':source.stat().st_size, 'sha256':hashlib.sha256(source.read_bytes()).hexdigest(), 'thumbnail':scene['thumbnail'].split('?')[0], 'destinations':[]})
manifest = {'updated':'2026-09-15', 'method':'Built-in image_gen panorama editing/generation; perspective thumbnails projected from spherical images',
            'scenes':records,
            'official_diagram':{'file':'assets/wood-cycle-official.png', 'source':'https://sfc.jp/information/vision/img/img_001.png'},
            'audio_sha256':hashlib.sha256((root/'chainsaw-sample.mp3').read_bytes()).hexdigest()}
(root/'docs/asset-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
print(f'Validated {len(records)} panoramas across three room types, connected premium navigation, and required amenities.')

# Keep the source/preview manifest current after thumbnail regeneration.
asset_manifest = root/'docs/room-asset-manifest.json'
if asset_manifest.exists():
    data = json.loads(asset_manifest.read_text())
    for item in data['assets']:
        asset = root/item['path']
        item['size'] = list(Image.open(asset).size)
        item['sha256'] = hashlib.sha256(asset.read_bytes()).hexdigest()
    asset_manifest.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
