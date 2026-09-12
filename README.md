# きこりんルーム Virtual Tour

[公開内覧（PC・スマートフォン共通）](https://daichi-yada.github.io/kikorin-room-tour/)

6地点を移動できる360°のコンセプト内覧です。現在の公開版と今後の修正元は、このGitHubリポジトリの `main` です。Blenderは使用しません。

## 操作

- ドラッグ／スワイプで見回し、床の矢印または下部の地点ボタンで移動します。
- 額の「i」を押すとWOOD CYCLEの説明と住友林業の公式図が開きます。図を押すと拡大できます。「原寸画像を開く」から画像だけを表示することもできます。
- 右上の「i」、またはスピーカーの「i」で約18秒のチェーンソー音を再生します。もう一度押す、×で閉じる、地点を移動する、別タブへ移ると停止します。時刻予約式の目覚ましではありません。
- 「解説を隠す」で説明マーカーを切り替え、「平面図」で地点配置を確認できます。

窓外は10階・地上約30mからの都会の眺望をイメージしています。ベッドにはきこりんのぬいぐるみ、デスクにはBAUMのスキンケアを配置しています。素材と企画の出典は [credits.html](credits.html) に記載しています。

## 2026-09-12 樹種ラベルとパンフレット

- 木材サンプルの名称を、左から「ウォルナット / WALNUT」「オーク / OAK」「ヒノキ / HINOKI」と表示。画像内の崩れた文字を、拡大しても読める文字のプレートで覆います。
- パソコン左側のノートを、客室ガイド「木と過ごす。」の表紙に置き換えて表示。表紙または解説マーカーを押すと本文が開きます。
- 本文には住友林業の取り組み、WOOD CYCLEの公式図、木質内装・照明と睡眠、スギ・ヒノキの香りに関する研究を掲載。各節に公式資料の出典があります。住友林業が発行した公式パンフレットではありません。
- 全6地点に設定。JPEGに文字を焼き込まず、HTML/SVGをパノラマの視線と画角に合わせて投影しています。元のJPEG単体やサムネイルには、この表示は含まれません。
- 調整方法・出典・確認記録：[docs/brochure-update-20260912.md](docs/brochure-update-20260912.md)。

## 2026-09-12 木質化・高画質化

- 6地点すべてで壁全面と天井を木質仕上げに変更。
- ワードローブの歪んだハンガーを、木製の三角形と金属フックの形に修正。
- 室内の額をFOREST CYCLEからWOOD CYCLEに変更。説明パネルには公式図そのものを掲載し、拡大表示と出典リンクを追加。
- 1774×887ピクセルだった全天球画像を、4096×2048ピクセルに更新。100°の6方向画像に分けてAIで細部を補完し、重なりをなじませて全天球に再構成しています。単純な拡大ではありませんが、Blenderによるネイティブ4K再レンダリングでもありません。視点間の小物、木目、眺望や画像の境界には細部の差が残ります。
- 都会の眺望、きこりん、BAUM、6地点の移動、チェーンソー音を引き継ぎ。音源とPannellum本体は未変更。

## 編集するファイル

| 変更内容 | ファイル |
| --- | --- |
| 室内の見た目 | `PANO_*.jpg`（2:1の全天球画像） |
| 地点ボタンの画像 | `thumb-PANO_*.jpg` |
| 地点・向き・説明文・マーカー | `tour-config.json` と `tour-config-equirect.json` |
| 樹種名・表紙の配置 | `surface-config.json`、`surface-overlays.js` |
| パンフレットの本文・表紙 | `brochure.html`、`assets/brochure-cover.svg` |
| 操作・音・図の開閉 | `app.js` |
| 表示・レイアウト | `index.html`、`styles.css` |
| WOOD CYCLE公式図 | `assets/wood-cycle-official.png` |
| 出典・画像の説明 | `credits.html` |

2つの設定JSONは現在同じ内容です。`?quality=standard` で開いた場合も4Kの全天球画像を使います。説明を変更するときは両方を更新してください。

## 次回の更新

1. このリポジトリで `git pull --ff-only` を実行して、別PCの変更を先に取得します。古い `project/web` や `project/release/public` から上書きしないでください。
2. 画像編集では現在の `PANO_*.jpg` を参照し、カメラの向き、画角、家具位置と画像の左右の連続性を保ちます。Blenderファイルは更新しません。
3. 説明・UIを編集し、画像を変更した場合は `python3 tools/package_assets.py` でサムネイルと画像の検査記録を更新します。
4. `index.html` のCSS・JS、`app.js` の設定JSON、設定JSON内の画像URLに付けた `?v=` の値を更新し、古いキャッシュが残らないようにします。
5. `python3 -m http.server 8767 --bind 127.0.0.1` をこのリポジトリ直下で実行し、http://127.0.0.1:8767/ を開きます。JavaScriptとWebGLが必要です。
6. 樹種名・机上の表紙と本文の開閉、全6地点、左右一周、天井と床、ハンガー、額、公式図、音の再生・停止を確認します。PCとスマートフォン幅の両方で確認してください。
7. `node --check app.js`、`node --check surface-overlays.js` と `git diff --check` を実行し、変更をコミットして `git push origin main`。GitHub Pagesの公開完了後、公開URLでも確認します。

## 方向別画像からの再構成

Pythonの画像処理には `numpy`、`scipy`、`Pillow` を使います。閲覧時にはPythonも画像生成サービスも不要です。

```sh
python3 -m venv .venv
.venv/bin/pip install numpy scipy Pillow
.venv/bin/python tools/prepare_detail_faces.py PANO_02_DESK.jpg /tmp/room-faces
# f/r/b/l/u/d.png を画像編集ツールで個別に編集（必ず同じ100°画角・正方形を維持）
.venv/bin/python tools/rebuild_panorama.py /tmp/room-faces PANO_02_DESK.jpg
.venv/bin/python tools/package_assets.py
```

今回の画像編集の指示文は [docs/image-prompts.txt](docs/image-prompts.txt)、画像寸法とハッシュは [docs/asset-manifest.json](docs/asset-manifest.json) にあります。画像生成は手動工程で、上のスクリプトは投影・接合・保存のみを行います。

今回の編集前画像、方向別の入力・編集済みPNGは、作業PCの `project/assets/wood-upgrade-20260912/` に保存しています。この中間素材はGitHubには同梱していません。別PCでは現在の4Kパノラマを `prepare_detail_faces.py` で分割して編集を始められます。

## WOOD CYCLEと音源の出典

WOOD CYCLE図：住友林業「長期ビジョン」 https://sfc.jp/information/vision/
公式画像： https://sfc.jp/information/vision/img/img_001.png （取得日：2026-09-12）。説明パネルの図は公式画像をそのまま保存したものです。室内の小さな額はAIによる設置イメージです。

音源：Joseph SARDIN / BigSoundBank「Chain saw #0454」、CC0。 https://bigsoundbank.com/chain-saw-s0454.html
現在は社有林の実録ではなく、サンプル音です。
