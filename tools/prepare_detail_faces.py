"""Project spherical source assets into overlapping perspective faces for image editing."""
from pathlib import Path
import argparse,math,json
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates
p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('out');a=p.parse_args()
out=Path(a.out);out.mkdir(parents=True,exist_ok=True)
# 100 degree faces give ten degrees of overlap for panorama reconstruction.
faces={'f':(0,0),'r':(90,0),'b':(180,0),'l':(-90,0),'u':(0,90),'d':(0,-90)}
im=np.asarray(Image.open(a.source).convert('RGB'));h,w=im.shape[:2];size=1024;t=math.tan(math.radians(50));xx,yy=np.meshgrid(np.linspace(-t,t,size),np.linspace(t,-t,size))
for name,(yaw,pitch) in faces.items():
 ya,pi=map(math.radians,(yaw,pitch));f=np.array([math.sin(ya)*math.cos(pi),math.cos(ya)*math.cos(pi),math.sin(pi)]);r=np.array([math.cos(ya),-math.sin(ya),0]);u=np.cross(r,f)
 d=f[:,None,None]+r[:,None,None]*xx+u[:,None,None]*yy;x,y,z=d;lon=np.arctan2(x,y);lat=np.arcsin(z/np.linalg.norm(d,axis=0));px=(lon/(2*math.pi)+.5)*w-.5;py=(.5-lat/math.pi)*h-.5
 dest=np.stack([map_coordinates(im[:,:,c],[py,px],order=1,mode='wrap') for c in range(3)],axis=-1).astype('uint8');Image.fromarray(dest).save(out/(name+'.png'))
(out/'projection.json').write_text(json.dumps({'source':str(Path(a.source).resolve()),'fov':100,'input_size':1024,'faces':faces},indent=2))
print(out)
