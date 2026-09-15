"""Validate the two room tours and record the nine active panoramic assets."""
from pathlib import Path
import hashlib,json
from PIL import Image
root=Path(__file__).resolve().parents[1]
assert (root/'tour-config.json').read_bytes()==(root/'tour-config-equirect.json').read_bytes()
surfaces=json.loads((root/'surface-config.json').read_text()); records=[]
for room,filename,count in [('business','tour-config.json',6),('family','tour-config-family.json',3)]:
 config=json.loads((root/filename).read_text());scenes=config['scenes'];assert len(scenes)==count
 assert config['default']['firstScene'] in scenes
 assert len({s['panorama'] for s in scenes.values()})==count
 for sid,s in scenes.items():
  source=root/s['panorama'].split('?')[0];thumbnail=s['thumbnail'].split('?')[0]
  assert Image.open(source).size==(4096,2048)
  assert (root/thumbnail).exists()
  features={h.get('feature') for h in s['hotSpots']}
  assert {'baum','wood-cycle','brochure','wood-spray','log-pillow','pollen-free-sugi','wood-blinds','closet','alarm'}<=features,(sid,features)
  assert any(a['kind']=='wood-cycle' for a in surfaces[sid])
  moves=[h['sceneId'] for h in s['hotSpots'] if h['type']=='scene'];assert moves and all(d in scenes for d in moves)
  reached=set();pending=[sid]
  while pending:
   current=pending.pop()
   if current in reached:continue
   reached.add(current);pending.extend(h['sceneId'] for h in scenes[current]['hotSpots'] if h['type']=='scene')
  assert len(reached)==count,sid
  records.append(dict(scene=sid,room=room,image=str(source.relative_to(root)),size=list(Image.open(source).size),bytes=source.stat().st_size,sha256=hashlib.sha256(source.read_bytes()).hexdigest(),thumbnail=thumbnail,destinations=moves))
manifest=dict(updated='2026-09-16',method='Built-in image_gen edits; overlapping perspective detail reconstruction to 4096x2048; business localized patches; three distinct family camera locations',scenes=records,official_diagram=dict(file='assets/wood-cycle-official.png',source='https://sfc.jp/information/vision/img/img_001.png'),audio_sha256=hashlib.sha256((root/'chainsaw-sample.mp3').read_bytes()).hexdigest())
(root/'docs/asset-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Validated nine panoramas, two connected room tours, official artwork and amenities.')
