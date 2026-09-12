# 樹種ラベル・机上パンフレット（2026-09-12）

## 編集元

GitHub `Daichi-Yada/kikorin-room-tour` の `main`。Blenderは使用しない。公開JPEG、音源、Pannellum本体は今回変更していない。

- `surface-config.json`：全6地点の各3樹種名と表紙の四隅。
- `surface-overlays.js`：四隅を球面方向に変換し、Pannellumの視線・画角に合わせてCSS射影変換。画面外・背面では非表示。
- `assets/brochure-cover.svg`：表紙の文字と図形。本文は `brochure.html`。
- `app.js`、`index.html`、`styles.css`：本文ダイアログと表示。2つの `tour-config*.json` に読むマーカー。

樹種名は左からウォルナット、オーク、ヒノキ。名前は文字データとして表示し、生成画像の文字に依存させない。文字プレートと表紙はWeb上に投影するので、JPEG単体には含まれない。入口のヒノキ表示は照明との重なりを避けて幅を調整している。

## 位置を再調整する場合

`tools/prepare_detail_faces.py` で最新のパノラマから100°・1024ピクセル四方の画像を作る。`surface-config.json` の `face` は `r`＝yaw 90°、`b`＝yaw 180°。`quad` はその画像内の左上、右上、右下、左下の順（座標0–1023）。元のパノラマを編集したら、この位置も確認する。作業時の確認用画像はローカル `project/assets/brochure-update-20260912/` に保存。

表紙の四隅を動かした場合は、2つのツアー設定のパンフレットマーカーも中心方向に合わせる。解説を隠しても、樹種名と表紙は室内の一部として表示する。

## 本文の出典

すべて2026-09-12参照。公開資料をもとに編集した客室ガイドであり、住友林業発行の公式パンフレットではない。

- 取り組み：https://sfc.jp/information/vision/woodsolution/
- WOOD CYCLE公式図：https://sfc.jp/information/vision/ （同梱の公式PNGを使用）
- 木質内装・照明と睡眠：https://sfc.jp/information/company/rd/tukuba/woodlibrary/research/13.html
- スギ・ヒノキの香り：https://sfc.jp/information/company/rd/tukuba/woodlibrary/research/16.html

睡眠研究は内装と照明の組み合わせによる比較。主観的な熟眠感の傾向と、睡眠計に有意差がなかった点を併記。香りの研究は健康な成人20名での実験結果として説明する。この客室で効果を実証したとの表現は用いない。

## 確認

Chromeで全6地点のラベル・表紙位置、デスクでの拡大、パンフレットの開閉を確認。390×844のスマートフォン幅でも本文を確認し、横方向のはみ出しがないことを検査。日本語の文章チェックを実行し、不要な回りくどい表現を修正。JavaScript構文と両ツアー設定の一致を確認して公開する。
