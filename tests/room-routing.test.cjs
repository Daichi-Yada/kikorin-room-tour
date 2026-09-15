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
