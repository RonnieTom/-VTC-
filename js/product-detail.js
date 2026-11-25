/* 商品詳情頁：左圖（預留 3D）／右資訊與選購 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function $(id) {
    return document.getElementById(id);
  }

  function queryId() {
    var q = window.location.search || "";
    var m = q.match(/[?&]id=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  }

  function showMsg(box, type, text) {
    if (!box) return;
    box.className = "msg " + type;
    box.textContent = text;
    box.hidden = false;
  }

  function getQty() {
    var input = $("product-qty");
    var q = parseInt(input && input.value, 10);
    if (isNaN(q)) return null;
    return q;
  }

  function money(n) {
    return window.LaneMart.money(n);
  }

  function renderDetail(product) {
    document.title = "青禾超市｜" + product.name;

    var nameEl = $("pd-name");
    var catEl = $("pd-category");
    var priceEl = $("pd-price");
    var unitEl = $("pd-unit");
    var descEl = $("pd-desc");
    var pointsEl = $("pd-points");
    var imgEl = $("pd-image");
    var stage = $("product-media-stage");

    if (nameEl) nameEl.textContent = product.name;
    if (catEl) catEl.textContent = product.category;
    if (priceEl) priceEl.textContent = money(product.price);
    if (unitEl) unitEl.textContent = product.unit || "";
    if (descEl) descEl.textContent = product.desc || "";

    if (pointsEl) {
      pointsEl.innerHTML = "";
      var pts = product.points || [];
      for (var i = 0; i < pts.length; i++) {
        var li = document.createElement("li");
        li.textContent = pts[i];
        pointsEl.appendChild(li);
      }
    }

    if (imgEl) {
      imgEl.src = product.image;
      imgEl.alt = product.name;
    }

    // 預留 3D：之後可在 stage 內掛載模型，並切換 data-view
    if (stage) {
      stage.setAttribute("data-product-id", product.id);
      stage.setAttribute("data-view", "image");
      stage.setAttribute("data-model", "");
    }

    var crumb = $("pd-crumb");
    if (crumb) crumb.textContent = product.name;
  }

  function refreshSubtotal(product) {
    var qty = getQty();
    var preview = $("order-preview");
    var msg = $("order-msg");

    if (qty === null || qty < 1) {
      showMsg(msg, "err", "數量須為 1 或以上。");
      if (preview) preview.innerHTML = "";
      return;
    }
    if (qty > 99) {
      showMsg(msg, "warn", "單次最多 99 件。");
      if (preview) preview.innerHTML = "";
      return;
    }

    var subtotal = product.price * qty;
    if (msg) msg.hidden = true;
    if (preview) {
      preview.innerHTML =
        "<p><strong>數量：</strong>" + qty + "</p>" +
        '<p class="total"><strong>小計：</strong>' + money(subtotal) + "</p>";
    }
  }

  function addToCart(product) {
    var qty = getQty();
    var msg = $("order-msg");
    var nameInput = $("customer-name");
    var name = nameInput ? nameInput.value.replace(/^\s+|\s+$/g, "") : "";

    if (!name) {
      showMsg(msg, "err", "請輸入姓名。");
      if (nameInput) nameInput.focus();
      return;
    }
    if (qty === null || qty < 1 || qty > 99) {
      showMsg(msg, "err", "請輸入 1 至 99 的數量。");
      return;
    }

    var cart = window.LaneMart.readCart();
    var found = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === product.id) {
        found = cart[i];
        break;
      }
    }

    if (found) {
      found.qty = Math.min(99, (parseInt(found.qty, 10) || 0) + qty);
      found.customer = name;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: qty,
        customer: name
      });
    }

    window.LaneMart.writeCart(cart);
    refreshSubtotal(product);
    showMsg(msg, "ok", "已加入購物車（目前 " + window.LaneMart.cartCount() + " 件）。");
  }

  function showMissing() {
    var layout = $("product-detail");
    var missing = $("product-missing");
    if (layout) layout.hidden = true;
    if (missing) missing.hidden = false;
  }

  ready(function () {
    if (!$("product-detail")) return;

    var id = queryId();
    var catalog = window.LaneMartCatalog || {};
    var product = catalog[id];

    if (!product) {
      showMissing();
      return;
    }

    renderDetail(product);
    refreshSubtotal(product);

    var qty = $("product-qty");
    var minus = $("qty-minus");
    var plus = $("qty-plus");
    var calcBtn = $("btn-calc");
    var addBtn = $("btn-add");

    function bump(delta) {
      var q = parseInt(qty.value, 10);
      if (isNaN(q)) q = 1;
      q = Math.max(1, Math.min(99, q + delta));
      qty.value = String(q);
      refreshSubtotal(product);
    }

    if (minus) minus.addEventListener("click", function () { bump(-1); });
    if (plus) plus.addEventListener("click", function () { bump(1); });
    if (qty) {
      qty.addEventListener("input", function () { refreshSubtotal(product); });
      qty.addEventListener("change", function () { refreshSubtotal(product); });
    }
    if (calcBtn) {
      calcBtn.addEventListener("click", function (e) {
        e.preventDefault();
        refreshSubtotal(product);
      });
    }
    if (addBtn) {
      addBtn.addEventListener("click", function (e) {
        e.preventDefault();
        addToCart(product);
      });
    }
  });
})();
