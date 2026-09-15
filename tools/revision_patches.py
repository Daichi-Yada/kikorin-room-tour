"""Project/stitch local image edits; retain the existing 4K panorama elsewhere."""
from pathlib import Path
import json,math,sys
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates
root=Path(__file__).resolve().parents[1]
work=root.parent/'assets/revision-20260916'
config=json.loads((root/'tour-config.json').read_text())
def basis(yaw,pitch):
 y,p=map(math.radians,(yaw,pitch));f=np.array([math.sin(y)*math.cos(p),math.cos(y)*math.cos(p),math.sin(p)]);r=np.array([math.cos(y),-math.sin(y),0]);return f,r,np.cross(r,f)
def prepare():
 jobs=[];closets=[150,174,155,-175,163,175];speakers=[(52,-23),(52.4,-31.1),(106,-18),(72,-44.6),(139,-19),(156,-20)]
 for i,(sid,scene) in enumerate(config['scenes'].items()):
  source=root/scene['panorama'].split('?')[0];arr=np.asarray(Image.open(source));h,w=arr.shape[:2];city=next(h for h in scene['hotSpots'] if h.get('feature')=='city')
  for kind,yaw,pitch,fov in [('window',city['yaw'],0,100),('closet',closets[i],-6,80),('speaker',*speakers[i],60)]:
   size=1024;t=math.tan(math.radians(fov/2));xx,yy=np.meshgrid(np.linspace(-t,t,size),np.linspace(t,-t,size));f,r,u=basis(yaw,pitch);d=f[:,None,None]+r[:,None,None]*xx+u[:,None,None]*yy;x,y,z=d
   px=(np.arctan2(x,y)/(2*math.pi)+.5)*w-.5;py=(.5-np.arcsin(z/np.linalg.norm(d,axis=0))/math.pi)*h-.5
   dest=np.stack([map_coordinates(arr[:,:,c],[py,px],order=1,mode='wrap') for c in range(3)],axis=-1).astype('uint8')
   name=sid+'-'+kind;path=work/'input'/f'{name}.png';Image.fromarray(dest).save(path)
   jobs.append(dict(name=name,scene=sid,kind=kind,yaw=yaw,pitch=pitch,fov=fov,path=str(path),source=str(source)))
 (work/'business-patches.json').write_text(json.dumps(jobs,indent=2))
 for kind in ['window','closet','speaker']:
  tiles=[Image.open(j['path']).resize((512,512)) for j in jobs if j['kind']==kind];sheet=Image.new('RGB',(1536,1024))
  for i,img in enumerate(tiles):sheet.paste(img,((i%3)*512,(i//3)*512))
  sheet.save(work/f'contact-{kind}.jpg')
def stitch():
 jobs=json.loads((work/'business-patches.json').read_text())
 for sid in config['scenes']:
  scenejobs=[j for j in jobs if j['scene']==sid];base=np.asarray(Image.open(scenejobs[0]['source']).convert('RGB'),dtype=np.float32);h,w=base.shape[:2]
  for j in scenejobs:
   im=np.asarray(Image.open(work/'edited'/(j['name']+'.png')).convert('RGB'),dtype=np.float32);ih,iw=im.shape[:2];t=math.tan(math.radians(j['fov']/2));f,r,u=basis(j['yaw'],j['pitch'])
   for start in range(0,h,128):
    stop=min(start+128,h);lo,la=np.meshgrid((np.arange(w)+.5)/w*2*np.pi-np.pi,np.pi/2-(np.arange(start,stop)+.5)/h*np.pi);d=np.stack([np.sin(lo)*np.cos(la),np.cos(lo)*np.cos(la),np.sin(la)])
    dep=np.einsum('i,ijk->jk',f,d);dx=np.einsum('i,ijk->jk',r,d)/np.maximum(dep,1e-6);dy=np.einsum('i,ijk->jk',u,d)/np.maximum(dep,1e-6)
    weight=np.clip((1-np.maximum(abs(dx),abs(dy))/t)/.10,0,1);weight=weight*weight*(3-2*weight);weight[dep<=0]=0
    px=(dx/t+1)*.5*(iw-1);py=(1-dy/t)*.5*(ih-1)
    if j['kind']=='speaker':
     nx=px/(iw-1);ny=py/(ih-1);local=np.minimum.reduce([(nx-.12)/.08,(.88-nx)/.08,(ny-.15)/.08,(.85-ny)/.08]);weight*=np.clip(local,0,1)
    sampled=np.stack([map_coordinates(im[:,:,c],[py,px],order=1,mode='nearest') for c in range(3)],axis=-1);base[start:stop]=base[start:stop]*(1-weight[:,:,None])+sampled*weight[:,:,None]
  name='business' if sid=='PANO_01_ENTRANCE' else 'business-'+sid[5:]
  Image.fromarray(np.clip(base,0,255).astype('uint8')).save(root/'assets/rooms'/f'{name}-4k.jpg',quality=97,subsampling=0,optimize=True)
  print(name)
if __name__=='__main__': prepare() if sys.argv[1]=='prepare' else stitch()
