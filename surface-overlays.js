/* Editable type is projected onto room surfaces, so it stays legible at any zoom. */
'use strict';
window.createRoomSurfaces = function (viewer, config, openBrochure) {
  const layer = document.createElement('div');
  layer.id = 'room-surfaces';
  document.querySelector('#panorama').append(layer);
  const faces = {r:90,b:180};
  const items = [];
  let active = [];
  const rad = d => d * Math.PI / 180;
  const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  function ray(face, point) {
    const a = rad(faces[face]), t = Math.tan(rad(50));
    const x = (point[0]/1023*2-1)*t, y = (1-point[1]/1023*2)*t;
    return [Math.sin(a)+x*Math.cos(a), Math.cos(a)-x*Math.sin(a), y];
  }
  // A homography maps the flat artwork to its four projected corners.
  function matrix(points, width, height) {
    const source = [[0,0],[width,0],[width,height],[0,height]], rows=[];
    for (let i=0;i<4;i++) {
      const [x,y]=source[i], [u,v]=points[i];
      rows.push([x,y,1,0,0,0,-u*x,-u*y,u]);
      rows.push([0,0,0,x,y,1,-v*x,-v*y,v]);
    }
    for (let col=0;col<8;col++) {
      let pivot=col;
      for(let row=col+1;row<8;row++) if(Math.abs(rows[row][col])>Math.abs(rows[pivot][col]))pivot=row;
      [rows[col],rows[pivot]]=[rows[pivot],rows[col]];
      const n=rows[col][col]; if(Math.abs(n)<1e-10)return null;
      for(let j=col;j<9;j++)rows[col][j]/=n;
      for(let row=0;row<8;row++)if(row!==col){const k=rows[row][col];for(let j=col;j<9;j++)rows[row][j]-=k*rows[col][j];}
    }
    const [a,b,c,d,e,f,g,h]=rows.map(r=>r[8]);
    return `matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,1)`;
  }
  for(const [scene, surfaces] of Object.entries(config))for(const surface of surfaces){
    const book=surface.kind==='brochure';
    const el=document.createElement(book?'button':'div');
    el.className='room-surface '+(book?'room-brochure':'wood-nameplate');
    const width=book?420:240,height=book?594:84;
    el.style.width=width+'px';el.style.height=height+'px';
    if(book){
      el.type='button';el.setAttribute('aria-label','机のパンフレットを読む');
      const img=document.createElement('img');img.src='assets/brochure-cover.svg';img.alt='木と過ごす。住友林業の取り組みと木質空間の効果';el.append(img);
      el.onclick=openBrochure;
      // Keep a tap on the booklet from starting panorama movement.
      for(const event of ['mousedown','touchstart','pointerdown'])el.addEventListener(event,e=>e.stopPropagation());
    } else {
      el.setAttribute('aria-label',surface.ja+' / '+surface.en);
      const ja=document.createElement('strong');ja.textContent=surface.ja;
      const en=document.createElement('span');en.textContent=surface.en;el.append(ja,en);
    }
    layer.append(el);items.push({el,scene,width,height,rays:surface.quad.map(p=>ray(surface.face,p))});
  }
  function activate(id){for(const item of items)item.el.hidden=true;active=items.filter(i=>i.scene===id);last='';}
  let last='';
  viewer.on('scenechange',activate);activate(viewer.getScene());
  function draw(){
    requestAnimationFrame(draw);
    const width=layer.clientWidth,height=layer.clientHeight;
    const yaw=viewer.getYaw(),pitch=viewer.getPitch(),hfov=viewer.getHfov(),loaded=viewer.isLoaded();
    const key=[yaw,pitch,hfov,width,height,loaded,viewer.getScene()].join('|');if(last===key)return;last=key;
    if(!loaded){for(const i of active)i.el.hidden=true;return;}
    const y=rad(yaw),p=rad(pitch);
    const forward=[Math.sin(y)*Math.cos(p),Math.cos(y)*Math.cos(p),Math.sin(p)];
    const right=[Math.cos(y),-Math.sin(y),0];
    const up=[-Math.sin(y)*Math.sin(p),-Math.cos(y)*Math.sin(p),Math.cos(p)];
    const focal=width/(2*Math.tan(rad(hfov/2)));
    for(const item of active){
      const depths=item.rays.map(r=>dot(r,forward));
      if(depths.some(z=>z<.03)){item.el.hidden=true;continue;}
      const pts=item.rays.map((r,i)=>[width/2+focal*dot(r,right)/depths[i],height/2-focal*dot(r,up)/depths[i]]);
      const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
      if(Math.max(...xs)<0||Math.min(...xs)>width||Math.max(...ys)<0||Math.min(...ys)>height){item.el.hidden=true;continue;}
      const transform=matrix(pts,item.width,item.height);
      item.el.hidden=!transform;if(transform)item.el.style.transform=transform;
    }
  }
  draw();
};
