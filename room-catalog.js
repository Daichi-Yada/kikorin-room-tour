/* Shared room IDs keep the tour and reservation links in sync. */
'use strict';
window.ROOM_CATALOG = {
 family: {
  name:'きこりんファミリー', short:'ファミリー', price:15800, capacity:4,
  image:'assets/rooms/family-20260916-preview.jpg', title:'家族で、森を見つける。',
  description:'無花粉スギを取り入れた広めの木質空間に、家族でくつろげるベッドと遊び場。動物の足跡をたどり、木のレリーフや森の生き物を探して楽しめます。',
  spec:'広めの客室 ／ ベッド2台 ／ 定員1〜4名（設定例）',
  features:['無花粉スギの木質内装と木製ブラインド','シカ・リス・ウサギ・キツネ・フクロウ・クマの木製レリーフ','家族で囲める低いテーブルと森の発見遊び','大きめの木製スピーカーで聞くチェーンソーアラーム']
 },
 business: {
  name:'きこりんビジネス', short:'ビジネス', price:12800, capacity:2,
  image:'assets/rooms/business-preview.jpg', title:'靴を脱いで、木の部屋へ。',
  description:'無花粉スギを取り入れた木質内装と、仕事にも使えるデスク。玄関で靴を脱ぎ、木製ブラインドから差し込む光の中でゆったりと過ごせます。',
  spec:'ダブルベッド1台 ／ 定員1〜2名（設定例）',
  features:['無花粉スギの木質内装と木製ブラインド','ドアの前を空けた玄関・室内用スリッパ','ワークデスク・クローゼット・窓辺のラウンジ','大きめの木製スピーカーで聞くチェーンソーアラーム']
 },
 standard: {
  name:'スタンダード', short:'スタンダード', price:9800, capacity:2,
  image:'reservation/assets/double-room.avif', title:'シンプルで快適な、いつもの客室。',
  description:'絨毯の床と一般的なホテルの内装。旅や出張に使いやすい、スタンダードな客室です。',
  spec:'通常客室 ／ ダブルベッド1台 ／ 定員1〜2名（設定例）',
  features:['Wi-Fi・テレビ','バス・トイレ','通常のホテルアメニティ']
 }
};
window.resolveRoom = value => {
 const aliases = {premium:'business', kikorin:'business', basic:'business', single:'standard', double:'standard'};
 if(Object.hasOwn(aliases, value)) return aliases[value];
 return Object.hasOwn(window.ROOM_CATALOG, value) ? value : 'business';
};
