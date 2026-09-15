'use strict';
(() => {
  const rooms = {
    kikorin: { name: 'きこりんルーム', price: 12800, capacity: 2 },
    single: { name: 'スタンダードシングル', price: 9800, capacity: 1 },
    double: { name: 'スタンダードダブル', price: 11800, capacity: 2 }
  };
  const $ = id => document.getElementById(id);
  const checkin = $('checkin');
  const checkout = $('checkout');
  const adults = $('adults');
  const roomCount = $('room-count');
  const status = $('search-status');
  const money = value => value.toLocaleString('ja-JP');
  const dayMs = 86400000;
  const isoDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const parseDate = value => new Date(`${value}T12:00:00`);
  const nextDay = value => { const date = parseDate(value); date.setDate(date.getDate() + 1); return isoDate(date); };
  const dateLabel = value => { const date = parseDate(value); return `${date.getMonth() + 1}/${date.getDate()}（${'日月火水木金土'[date.getDay()]}）`; };
  const today = isoDate(new Date());
  checkin.value = today;
  checkin.min = today;
  checkout.value = nextDay(today);
  checkout.min = checkout.value;
  let selected = '';
  const roomType = $('room-type');
  const reserveActions = document.querySelectorAll('.reserve-action');
  const tourUrl = 'https://daichi-yada.github.io/kikorin-room-tour/';
  function enableReservation(enabled) {
    reserveActions.forEach(link => {
      link.setAttribute('aria-disabled', String(!enabled));
      if (enabled) { link.href = tourUrl; link.removeAttribute('tabindex'); }
      else { link.removeAttribute('href'); link.setAttribute('tabindex', '-1'); }
    });
  }

  function updateSummary() {
    if (!checkin.value || !checkout.value || !checkin.validity.valid || !checkout.validity.valid || checkout.value <= checkin.value) {
      status.textContent = 'チェックイン日と、その翌日以降のチェックアウト日をお選びください。';
      status.classList.add('error');
      enableReservation(false);
      return false;
    }
    status.classList.remove('error');
    const guests = Number(adults.value);
    const count = Number(roomCount.value);
    const nights = Math.round((parseDate(checkout.value) - parseDate(checkin.value)) / dayMs);
    const validRooms = Object.entries(rooms).filter(([, room]) => room.capacity >= guests);
    if (selected && rooms[selected].capacity < guests) selected = '';
    roomType.value = selected;
    Object.entries(rooms).forEach(([id, room]) => {
      const card = document.querySelector(`[data-room="${id}"]`);
      const input = card.querySelector('input[type="radio"]');
      const isSelected = id === selected;
      card.hidden = room.capacity < guests;
      input.disabled = card.hidden;
      roomType.querySelector(`option[value="${id}"]`).disabled = card.hidden;
      input.checked = isSelected;
      card.classList.toggle('selected', isSelected);
      card.querySelector('.select-room > span').textContent = isSelected ? '選択中' : 'この部屋を選択';
      card.querySelector('[data-price]').textContent = money(room.price + (guests - 1) * 2000);
    });
    const total = selected ? money((rooms[selected].price + (guests - 1) * 2000) * nights * count) : '—';
    $('result-count').textContent = validRooms.length;
    $('summary-room').textContent = selected ? rooms[selected].name : '選択してください';
    $('mobile-room').textContent = selected ? rooms[selected].name : '選択してください';
    $('summary-kicker').textContent = selected ? '選択中のお部屋' : 'お部屋が未選択です';
    $('summary-plan').textContent = selected ? '素泊まりプラン・禁煙' : '一覧からお好きなお部屋をお選びください。';
    $('summary-checkin').textContent = dateLabel(checkin.value);
    $('summary-checkout').textContent = dateLabel(checkout.value);
    $('summary-stay').textContent = `${nights}泊・${count}室・大人${guests * count}名`;
    $('total-price').textContent = total;
    $('mobile-price').textContent = total;
    enableReservation(Boolean(selected));
    status.textContent = `${nights}泊・${count}室・1室あたり大人${guests}名の条件を表示しています。`;
    return true;
  }

  document.querySelectorAll('input[name="room"]').forEach(input => input.addEventListener('change', () => {
    selected = input.value;
    updateSummary();
  }));
  roomType.addEventListener('change', () => { selected = roomType.value; updateSummary(); });
  checkin.addEventListener('change', () => {
    if (checkin.value) {
      checkout.min = nextDay(checkin.value);
      if (!checkout.value || checkout.value <= checkin.value) checkout.value = checkout.min;
    }
    updateSummary();
  });
  [checkout, adults, roomCount].forEach(input => input.addEventListener('change', updateSummary));
  $('search').addEventListener('click', () => {
    if (updateSummary()) $('rooms').scrollIntoView({ behavior: 'smooth', block: 'start' });
    else { checkin.reportValidity(); checkout.reportValidity(); }
  });
  $('booker-name').addEventListener('input', event => {
    document.querySelectorAll('[data-guest-name]').forEach(element => element.textContent = event.target.value.trim() || '住林倫');
  });
  $('guest-name').addEventListener('input', event => {
    $('summary-guest').textContent = event.target.value.trim() || '住林倫';
  });
  $('arrival').addEventListener('change', event => {
    document.querySelector('.stay-dates small').textContent = `${event.target.value}〜`;
  });
  // All reservation links are ordinary links to the public tour. No form data is sent.
  updateSummary();
})();
