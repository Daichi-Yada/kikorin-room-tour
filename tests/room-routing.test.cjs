const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const context={window:{}};vm.runInNewContext(read('room-catalog.js'),context);
const {ROOM_CATALOG:rooms,resolveRoom}=context.window;
test('room URLs resolve all four choices and legacy links safely',()=>{
 assert.equal(Object.keys(rooms).length,4);
 for(const id of Object.keys(rooms))assert.equal(resolveRoom(id),id);
 assert.equal(resolveRoom('kikorin'),'premium');
 for(const id of ['single','double'])assert.equal(resolveRoom(id),'standard');
 for(const bad of [null,'','unknown','__proto__','constructor','toString'])assert.equal(resolveRoom(bad),'premium');
});
test('previous tour remains independent and every current room uses the official artwork',()=>{
 const legacy=JSON.parse(read('legacy/tour-config.json'));
 assert.equal(Object.keys(legacy.scenes).length,6);
 for(const scene of Object.values(legacy.scenes)){
  assert.ok(fs.existsSync(path.resolve(root,'legacy',scene.panorama.split('?')[0])));
  for(const h of scene.hotSpots)if(h.type==='scene')assert.ok(legacy.scenes[h.sceneId]);
 }
 const surfaces=JSON.parse(read('surface-config.json'));
 for(const file of ['tour-config.json','tour-config-family.json','tour-config-basic.json']){
  for(const [id,scene] of Object.entries(JSON.parse(read(file)).scenes)){
   assert.match(scene.panorama,/-4k\.jpg/);
   assert.ok(surfaces[id].some(s=>s.kind==='wood-cycle'),id);
   const baum=scene.hotSpots.find(h=>h.feature==='baum').clickHandlerArgs.text;
   assert.match(baum,/樹木との共生/);
   assert.match(baum,/オーク/);
   assert.match(baum,/ヒノキ/);
  }
 }
 assert.equal(rooms.standard.name,'スタンダード');
 assert.doesNotMatch(read('reservation/index.html'),/concept-banner|shared-amenities|small-concept/);
});
test('every tour has local assets, valid navigation, and all required amenities',()=>{
 for(const id of ['premium','family','basic']){
  const config=JSON.parse(read(id==='premium'?'tour-config.json':`tour-config-${id}.json`));
  assert.ok(config.scenes[config.default.firstScene]);
  for(const scene of Object.values(config.scenes)){
   for(const key of ['panorama','thumbnail'])assert.ok(fs.existsSync(path.join(root,scene[key].split('?')[0])),scene[key]);
   const features=new Set(scene.hotSpots.map(h=>h.feature));
   for(const feature of ['baum','wood-cycle','brochure','wood-spray','log-pillow'])assert.ok(features.has(feature),`${id}: ${feature}`);
   for(const h of scene.hotSpots)if(h.type==='scene')assert.ok(config.scenes[h.sceneId],h.sceneId);
  }
 }
 assert.equal(read('tour-config.json'),read('tour-config-equirect.json'));
 for(const room of Object.values(rooms))assert.ok(fs.existsSync(path.join(root,room.image)),room.image);
});
