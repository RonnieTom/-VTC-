# 青禾超市

純 HTML / CSS / JavaScript 超市購物網站。

版面參考常見超市電商結構（如 ParknShop 網上商店的搜尋／分類／橫幅／商品卡節奏，以及 [FreshCart](https://github.com/codescandy/freshcart-tailwind-ecommerce-HTML-template) 一類 grocery template 的首頁資訊架構），以原生前端實作。

## 頁面

- `index.html` — 首頁（促銷條、搜尋、分類、橫幅、優惠／熱賣）
- `products.html` — 商品列表（分類篩選、搜尋）
- `product.html?id=...` — 商品詳情（左圖預留 3D／右資訊選購）
- `about.html` — 關於
- `contact.html` — 顧客服務
- `cart.html` — 購物車

## 3D 預覽

商品詳情頁支援 Sketchfab 嵌入預覽：

- 預設顯示靜態圖，點「3D 預覽」才懶加載 iframe（`preload=0`、`autostart=0`）
- 切回圖片會卸載 iframe，釋放 WebGL
- 各商品使用較低面數的公開模型，並顯示作者出處

## 預覽

```bash
python3 -m http.server 8080
```

開啟 `http://127.0.0.1:8080/`
