/* Shared room IDs keep the tour and reservation links in sync. */
'use strict';
window.ROOM_CATALOG = {
 family: { name:'きこりんファミリー', short:'ファミリー', price:15800, capacity:4, image:'assets/rooms/family-preview.jpg', panorama:'assets/rooms/family.jpg', title:'家族で、森を見つける。', description:'広めの木質空間に、家族でくつろげるベッドと遊び場。動物の足跡をたどり、落ち葉や森の生き物を探して楽しめます。', spec:'広めの客室 ／ ベッド2台 ／ 定員1〜4名（設定例）', features:['広い木の床と、家族で囲める低いテーブル','動物の足跡・落ち葉・コウモリのモチーフ','鹿の角をかたどったフックと森の発見遊び'] },
 premium: { name:'きこりんビジネスプレミアム', short:'ビジネスプレミアム', price:12800, capacity:2, image:'assets/rooms/premium-preview.jpg', title:'靴を脱いで、木の部屋へ。', description:'壁・天井・床の木質感と、仕事にも使えるデスク。玄関に靴を脱ぐスペースを設け、室内ではゆったりと過ごせます。', spec:'従来の客室 ／ ダブルベッド1台 ／ 定員1〜2名（設定例）', features:['壁・天井・床に木を取り入れた内装','ドアの前を空けた玄関・室内用スリッパ','ワークデスクと窓辺のラウンジ'] },
 basic: { name:'きこりんベーシック', short:'ベーシック', price:9800, capacity:2, image:'assets/rooms/basic-preview.jpg', panorama:'assets/rooms/basic.jpg', title:'いつもの宿泊に、木の楽しみを。', description:'コンパクトな客室に、木目を楽しめる木質シートの壁。床は通常のホテルと同じ絨毯で、気軽に木に触れる滞在を提案します。', spec:'狭めの客室 ／ ベッド1台 ／ 定員1〜2名（設定例）', features:['通常のホテルと同じ絨毯の床','壁は木質シート、天井は白い仕上げ','コンパクトなデスクと木を知る小物'] },
 standard: { name:'スタンダード', short:'スタンダード', price:9800, capacity:2, image:'reservation/assets/double-room.avif', title:'シンプルで快適な、いつもの客室。', description:'絨毯の床と一般的なホテルの内装。旅や出張に使いやすい、スタンダードな客室です。', spec:'通常客室 ／ ダブルベッド1台 ／ 定員1〜2名（設定例）', features:['Wi-Fi・テレビ','バス・トイレ','通常のホテルアメニティ'] }
};
window.resolveRoom = value => {
 const aliases = {kikorin:'premium', single:'standard', double:'standard'};
 if(Object.hasOwn(aliases, value)) return aliases[value];
 return Object.hasOwn(window.ROOM_CATALOG, value) ? value : 'premium';
};
