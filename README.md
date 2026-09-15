# きこりんルーム Virtual Tour

[公開内覧](https://daichi-yada.github.io/kikorin-room-tour/) · [予約ページ](https://daichi-yada.github.io/kikorin-room-tour/reservation/) · [以前の客室](https://daichi-yada.github.io/kikorin-room-tour/legacy/)

## 現在の構成（2026-09-16）

- `?room=family`：きこりんファミリー。入口・森のあそび・窓側の3地点を移動する360°内覧。
- `?room=business`：きこりんビジネス。従来の6地点を移動する360°内覧。
- `?room=standard`：スタンダード。参考写真による紹介。
- ベーシックは選択肢と公開素材から削除。旧 `premium`・`basic` のURLはビジネスを表示。
- 予約ページは上記3選択肢。きこりんルームについては客室選択欄だけで紹介。
- ファミリーの動物壁を、シカ・リス・ウサギ・キツネ・フクロウ・クマのレリーフに改訂。
- 両室に無花粉スギの木質内装、木製ブラインド、整ったクローゼット、大きめの木製スピーカー。無花粉スギの苗木づくりと、チェーンソーを使う林業の仕事を説明。
- 丸太枕・BAUM・木の香りスプレー、公式WOOD CYCLE画像、パンフレット、木の魅力を伝える説明を継続。
- `0915/tour-config.json` から反映した手動説明を維持。原稿は変更していません。
- 以前の客室は `legacy/` に保存。元の6枚の4K画像と説明を維持。

## 画像

9地点すべて4096×2048。内蔵 `image_gen` で編集し、方向別の画像を球面に投影して再構成しています。ファミリーの追加2地点はカメラ位置を変えて生成。ビジネスは以前の4K画像への部分修正です。ネイティブ4Kの3Dレンダリングではなく、鏡・小物・継ぎ目には視点間の差が残ります。

- 公開画像・プレビュー：`assets/rooms/`。現在使用中の一覧とハッシュ：`docs/asset-manifest.json`、`docs/room-asset-manifest.json`。
- 実行した指示文：`docs/revision-image-prompts-20260916.json`。
- 生成原本と投影面：公開外の `project/assets/revision-20260916/`。
- WOOD CYCLEは `assets/wood-cycle-official.png` を室内の額へ直接投影。サムネイル画像にはHTMLの投影表示は含まれません。

## 編集・検証

| 内容 | ファイル |
| --- | --- |
| 客室の名称・選択肢 | `room-catalog.js`、`room-selection.js` |
| ビジネスの説明・移動 | `tour-config.json`、`tour-config-equirect.json`（同一内容） |
| ファミリーの説明・移動 | `tour-config-family.json` |
| 図版の投影位置 | `surface-config.json`、`surface-overlays.js` |
| 操作と表示 | `app.js`、`index.html`、`styles.css` |
| ガイド・出典 | `brochure.html`、`credits.html` |

```sh
python3 tools/build_room_assets.py
python3 tools/package_assets.py
node --test tests/room-routing.test.cjs
node --check app.js
git diff --check
python3 -m http.server 8768 --bind 127.0.0.1
```

Pythonの画像処理はPillow・numpy・scipyを使用。`tools/prepare_detail_faces.py` と `tools/rebuild_panorama.py` は画像の投影・接合を行います。閲覧時はJavaScriptとWebGLのみ必要です。

PC・スマートフォン幅で、全地点の移動、説明、公式図、音の再生停止、予約からの3種類の遷移を確認してください。更新後はキャッシュ用の `?v=` を改め、mainにコミット・pushし、GitHub Pagesで公開を確認します。

以前の作業記録：`docs/archive-readme-20260915.md`。画像・タイプ・移動数は本ファイルの現行仕様を優先してください。
