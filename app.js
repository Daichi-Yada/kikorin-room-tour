/* All panoramas share world axes; navigation targets are computed from 3D camera positions. */
'use strict';
let viewer;
const $=s=>document.querySelector(s);
const status=$('#status');
const sound=$('#chainsaw-audio');
let soundRequest=0;
let lastTrigger=null;
function soundState(message){
 const playing=!sound.paused&&!sound.ended;
 $('#alarm-toggle').setAttribute('aria-pressed',String(playing));
 $('#alarm-toggle').setAttribute('aria-label',playing?'チェーンソーアラームを停止':'チェーンソーアラームを再生');
 $('#alarm-toggle').title=playing?'チェーンソーアラームを停止':'チェーンソーアラームを再生';
 $('#audio-state').textContent=message||(playing?'再生中 · サンプル音':'停止中 · サンプル音');
}
function stopSound(){soundRequest++;sound.pause();sound.currentTime=0;soundState();}
function closeAlarm(restore=false){stopSound();$('#alarm-panel').hidden=true;$('#alarm-toggle').setAttribute('aria-expanded','false');if(restore&&lastTrigger?.isConnected)lastTrigger.focus();}
async function toggleAlarm(){
 if(!sound.paused){closeAlarm(true);return;}
 lastTrigger=document.activeElement;
 $('#detail').hidden=true;$('#plan').hidden=true;$('#plan-toggle').setAttribute('aria-expanded','false');
 $('#alarm-panel').hidden=false;$('#alarm-toggle').setAttribute('aria-expanded','true');
 const request=++soundRequest;
 soundState('音を読み込んでいます…');
 try{await sound.play();if(request===soundRequest)soundState();}
 catch(e){if(request===soundRequest){soundState('再生できませんでした。音声の再生ボタンで再試行してください。');console.error(e);}}
}
sound.volume=.4;
for(const event of ['play','pause','ended'])sound.addEventListener(event,()=>soundState());
sound.addEventListener('error',()=>soundState('音声を読み込めませんでした。接続を確認して再試行してください。'));
$('#alarm-toggle').onclick=toggleAlarm;
$('#close-alarm').onclick=()=>closeAlarm(true);
document.addEventListener('visibilitychange',()=>{if(document.hidden)closeAlarm();});
window.addEventListener('pagehide',()=>closeAlarm());
function explain(_,a){if(a.action==='alarm'){toggleAlarm();return;}closeAlarm();$('#detail-title').textContent=a.title;$('#detail-text').textContent=a.text;const cycle=a.action==='wood-cycle';$('#wood-cycle-figure').hidden=!cycle;$('#detail').classList.toggle('with-diagram',cycle);$('#detail').hidden=false;$('#close-detail').focus();}
function hotspot(el,a){el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-label',a.label);if(a.kind==='move'){const t=document.createElement('span');t.className='hot-label';t.textContent=a.label;el.append(t);}el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});}
$('#open-wood-cycle').onclick=()=>$('#wood-cycle-dialog').showModal();
$('#close-wood-cycle').onclick=()=>$('#wood-cycle-dialog').close();
$('#wood-cycle-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.currentTarget.close();}});
async function start(){
 try{
  const simple=new URLSearchParams(location.search).get('quality')==='standard';
  const res=await fetch((simple?'tour-config-equirect.json':'tour-config.json')+'?v=wood4k-20260912');if(!res.ok)throw Error('設定を読み込めません');
  const config=await res.json();
  if(matchMedia('(max-width: 640px)').matches){for(const s of Object.values(config.scenes)){s.hfov=48;s.pitch=Math.min(s.pitch,-8);}config.default.maxHfov=80;}
  for(const scene of Object.values(config.scenes))for(const h of scene.hotSpots){h.createTooltipFunc=hotspot;if(h.type==='info')h.clickHandlerFunc=explain;}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)config.default.sceneFadeDuration=0;
  viewer=pannellum.viewer('panorama',config);window.tourViewer=viewer;
  const entries=Object.entries(config.scenes);
  for(const [id,s] of entries){const b=document.createElement('button');b.dataset.scene=id;b.setAttribute('aria-label',s.title+'へ移動');const img=document.createElement('img');img.src=s.thumbnail||'thumbnails/'+id+'.jpg';img.alt='';const label=document.createElement('span');label.textContent=s.title;b.append(img,label);b.onclick=()=>viewer.loadScene(id,s.pitch,s.yaw,s.hfov);$('#scenes').append(b);}
  function active(id){const i=entries.findIndex(([key])=>key===id);$('#location-index').textContent=String(i+1).padStart(2,'0')+' / 06';$('#location-name').textContent=config.scenes[id].title;for(const b of $('#scenes').children){const selected=b.dataset.scene===id;b.setAttribute('aria-current',selected?'true':'false');if(selected)b.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});}$('#detail').hidden=true;}
  active(config.default.firstScene);
  viewer.on('scenechange',id=>{closeAlarm();active(id);status.textContent='移動しています…';status.hidden=false;});
  viewer.on('load',()=>{status.hidden=true;});
  if(viewer.isLoaded())status.hidden=true;
  viewer.on('error',e=>{status.textContent='画像を読み込めませんでした。ページを再読み込みしてください。';status.hidden=false;console.error(e);});
  $('#fullscreen').onclick=async()=>{
   try{
    if(document.fullscreenElement)await document.exitFullscreen();
    else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
    else throw Error('Fullscreen unavailable');
   }catch(e){
    const note=$('#notice');note.textContent='この環境では、ブラウザのメニューから全画面に切り替えてください。';note.hidden=false;
    setTimeout(()=>{note.hidden=true;},6500);
   }
  };
  document.addEventListener('fullscreenchange',()=>{const full=Boolean(document.fullscreenElement);$('#fullscreen').setAttribute('aria-label',full?'全画面を終了':'全画面');viewer.resize();});
  $('#info-toggle').onclick=()=>{const hide=document.body.classList.toggle('hide-info');$('#info-toggle').setAttribute('aria-pressed',String(!hide));$('#info-toggle').textContent=hide?'解説を表示':'解説を隠す';if(hide)$('#detail').hidden=true;};
  $('#close-detail').onclick=()=>{$('#detail').hidden=true;};
  const plan=show=>{if(show){closeAlarm();$('#detail').hidden=true;}$('#plan').hidden=!show;$('#plan-toggle').setAttribute('aria-expanded',String(show));};
  $('#plan-toggle').onclick=()=>plan($('#plan').hidden);$('#close-plan').onclick=()=>plan(false);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#detail').hidden=true;closeAlarm(true);plan(false);}});
 }catch(e){status.textContent='お部屋を読み込めませんでした。通信状態を確認して再読み込みしてください。';console.error(e);}
}
start();
