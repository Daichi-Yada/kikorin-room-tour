'use strict';
(() => {
  const params = new URLSearchParams(location.search);
  const id = window.resolveRoom(params.get('room'));
  const room = window.ROOM_CATALOG[id];
  window.activeRoomId = id;
  document.body.dataset.room = id;
  document.title = room.name + '｜客室内覧';
  document.getElementById('panorama').setAttribute('aria-label',room.name + 'の360度内覧');
  const select = document.getElementById('tour-room');
  select.value = id;
  select.addEventListener('change', () => {
    const url = new URL(location.href);
    url.searchParams.set('room', select.value);
    url.hash = '';
    location.assign(url.href);
  });
  document.querySelector('.masthead h1').textContent = room.name;
  document.querySelector('.masthead p').textContent = room.title;
  document.getElementById('reservation-link').href = 'reservation/?room=' + id;
  document.getElementById('room-dialog-title').textContent = room.name;
  document.getElementById('room-description').textContent = room.description;
  document.getElementById('room-spec').textContent = room.spec;
  for (const feature of room.features) {
    const li = document.createElement('li'); li.textContent = feature;
    document.getElementById('room-features').append(li);
  }
  const dialog = document.getElementById('room-dialog');
  document.getElementById('room-about').onclick = () => dialog.showModal();
  document.getElementById('close-room').onclick = () => dialog.close();
  document.getElementById('common-amenities').hidden = id === 'standard';
  if (id !== 'premium') document.getElementById('plan-toggle').hidden = true;
  if (id === 'standard') {
    document.getElementById('standard-room').hidden = false;
    document.getElementById('panorama').hidden = true;
    document.getElementById('room-about').textContent = '客室について';
    document.querySelector('footer').hidden = true;
    document.querySelector('.top-actions').hidden = true;
  } else if (id !== 'premium') {
    document.querySelector('.guide').textContent = 'ドラッグで見回す · 下のボタンで見どころへ';
  }
  const scents = {
    none:'香りを加えずに過ごすこともできます。',
    hinoki:'ヒノキ：すっきりとした、木を思わせる香り。',
    sugi:'スギ：やわらかく、ほのかな甘さを感じる香り。',
    hiba:'ヒバ：深みのある、しっかりとした木の香り。'
  };
  const scent = document.getElementById('scent-select');
  try { const stored = sessionStorage.getItem('kikorin-scent-' + id); if (Object.hasOwn(scents, stored)) scent.value = stored; } catch (_) { /* Storage is optional. */ }
  function updateScent() {
    document.getElementById('scent-description').textContent = scents[scent.value];
    try { sessionStorage.setItem('kikorin-scent-' + id, scent.value); } catch (_) { /* Private browsing can disable storage. */ }
  }
  scent.addEventListener('change', updateScent); updateScent();
})();
