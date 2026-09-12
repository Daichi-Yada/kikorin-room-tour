"""Reproject six 100-degree edited faces to one 4096x2048 panorama.
The ten-degree overlap is feathered in spherical coordinates. No Blender required.
"""
from pathlib import Path
import argparse,json,math
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates
p=argparse.ArgumentParser();p.add_argument('faces');p.add_argument('output');p.add_argument('--width',type=int,default=4096);a=p.parse_args()
faces={'f':(0,0),'r':(90,0),'b':(180,0),'l':(-90,0),'u':(0,90),'d':(0,-90)}
inputs={key:np.asarray(Image.open(Path(a.faces)/(key+'.png')).convert('RGB'),dtype=np.float32) for key in faces}
w=a.width;h=w//2;t=math.tan(math.radians(50));result=np.empty((h,w,3),dtype=np.uint8)
for start in range(0,h,128):
 stop=min(start+128,h);lon=(np.arange(w)+.5)/w*2*np.pi-np.pi;lat=np.pi/2-(np.arange(start,stop)+.5)/h*np.pi
 lo,la=np.meshgrid(lon,lat);directions=np.stack([np.sin(lo)*np.cos(la),np.cos(lo)*np.cos(la),np.sin(la)])
 accum=np.zeros((stop-start,w,3),np.float32);ws=np.zeros((stop-start,w),np.float32)
 for key,(yaw,pitch) in faces.items():
  ya,pi=map(math.radians,(yaw,pitch));f=np.array([math.sin(ya)*math.cos(pi),math.cos(ya)*math.cos(pi),math.sin(pi)]);r=np.array([math.cos(ya),-math.sin(ya),0]);u=np.cross(r,f)
  depth=np.einsum('i,ijk->jk',f,directions);dx=np.einsum('i,ijk->jk',r,directions)/np.maximum(depth,1e-6);dy=np.einsum('i,ijk->jk',u,directions)/np.maximum(depth,1e-6)
  edge=np.maximum(abs(dx),abs(dy));weight=np.clip((t-edge)/(t-1),0,1)**2;weight[depth<=0]=0
  im=inputs[key];ih,iw=im.shape[:2];px=(dx/t+1)*.5*(iw-1);py=(1-dy/t)*.5*(ih-1)
  for c in range(3):accum[:,:,c]+=map_coordinates(im[:,:,c],[py,px],order=1,mode='nearest')*weight
  ws+=weight
 assert ws.min()>0
 result[start:stop]=np.clip(accum/ws[:,:,None],0,255).astype('uint8')
path=Path(a.output);path.parent.mkdir(parents=True,exist_ok=True)
Image.fromarray(result).save(path,quality=97,subsampling=0,optimize=True,progressive=True)
print(path,(w,h),path.stat().st_size)
