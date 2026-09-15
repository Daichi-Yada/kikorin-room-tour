"""Apply the user's September 15 copy while preserving tour behavior and geometry."""
from pathlib import Path
import json,re,copy
root=Path(__file__).resolve().parents[1]
source=root.parents[1]/'0915/tour-config.json'
manual=json.loads(source.read_bytes(),strict=False)
def clean(s):
 s=re.sub(r'。+', '。', s.replace('\r\n','\n'))
 parts=s.split('。');out=[]
 for part in parts:
  if part and (not out or part!=out[-1]):out.append(part)
 return '。'.join(out)+('。' if s.endswith('。') else '')
baum='「樹木との共生」をテーマに掲げる資生堂のブランド「BAUM」のスキンケア製品をデスクに。木製パーツにはオークを使い、スキンケア成分にはヒノキ由来の原料を取り入れています。住友林業の協力により、豊かな森づくりにも貢献しています。'
sleep='木の内装と間接照明を組み合わせた空間では、睡眠の質との関係が研究されています。\n木質化された空間の中で、豊かな睡眠を、豊かな朝を。'
common={}
for sc in manual['scenes'].values():
 for h in sc['hotSpots']:
  args=h.get('clickHandlerArgs',{})
  if 'text' in args:
   args['text']=clean(args['text'])
   if h.get('feature')=='baum':args['text']=baum
   if '睡眠' in args.get('title',''):args['text']=sleep
  if h.get('feature'):common.setdefault(h['feature'],h)
for filename in ['tour-config.json','tour-config-family.json','tour-config-basic.json']:
 cfg=json.loads((root/filename).read_text())
 for sid,sc in cfg['scenes'].items():
  originals=manual['scenes'].get(sid,{}).get('hotSpots',[])
  for i,h in enumerate(sc['hotSpots']):
   src=originals[i] if i<len(originals) and h['type']=='info' else common.get(h.get('feature'))
   if src and h['type']=='info':
    for key in ['text','createTooltipArgs']:
     if key in src:h[key]=copy.deepcopy(src[key])
    for key in ['title','text']:
     if key in src.get('clickHandlerArgs',{}):h.setdefault('clickHandlerArgs',{})[key]=src['clickHandlerArgs'][key]
   if h.get('feature')=='genkan':h['clickHandlerArgs']['text']='タイルの玄関で靴を脱ぎ、木の床の室内へ。ドアの前は広く空け、脇に室内用スリッパをご用意します。'
  if filename!='tour-config.json' and not any(h.get('feature')=='kikorin' for h in sc['hotSpots']):
   h=copy.deepcopy(common['kikorin']);pillow=next(h for h in sc['hotSpots'] if h.get('feature')=='log-pillow')
   h['yaw']=pillow['yaw']+12;h['pitch']=pillow['pitch']-5;sc['hotSpots'].append(h)
 (root/filename).write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n')
(root/'tour-config-equirect.json').write_text((root/'tour-config.json').read_text())
print('Updated premium, family and basic descriptions; preserved input and legacy.')
