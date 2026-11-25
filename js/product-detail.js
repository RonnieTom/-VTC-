/* 商品詳情頁 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function $(id) { return document.getElementById(id); }

  function queryId() {
    var m = (window.location.search || "").match(/[?&]id=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  }

  function showMsg(box, type, text) {
    if (!box) return;
    box.className = "msg " + type;
    box.textContent = text;
    box.hidden = false;
  }

  function getQty() {
    var q = parseInt($("product-qty") && $("product-qty").value, 10);
    return isNaN(q) ? null : q;
  }

  function renderDetail(product) {
    document.title = "青禾超市｜" + product.name;
    if ($("pd-name")) $("pd-name").textContent = product.name;
    if ($("pd-category")) $("pd-category").textContent = product.category;
    if ($("pd-price")) $("pd-price").textContent = window.LaneMart.money(product.price);
    if ($("pd-was")) {
      if (product.was) {
        $("pd-was").hidden = false;
        $("pd-was").textContent = "原價 " + window.LaneMart.money(product.was);
      } else {
        $("pd-was").hidden = true;
      }
    }
    if ($("pd-unit")) $("pd-unit").textContent = product.unit || product.pack || "";
    if ($("pd-desc")) $("pd-desc").textContent = product.desc || "";
    if ($("pd-sku")) $("pd-sku").textContent = product.sku || product.id;
    if ($("pd-stock")) $("pd-stock").textContent = "庫存 " + (product.stock || 0) + " 件";
    if ($("pd-badge") && product.badge) {
      $("pd-badge").hidden = false;
      $("pd-badge").textContent = product.badge;
    }
    if ($("pd-points")) {
      $("pd-points").innerHTML = "";
      (product.points || []).forEach(function (t) {
        var li = document.createElement("li");
        li.textContent = t;
        $("pd-points").appendChild(li);
      });
    }
    if ($("pd-image")) {
      $("pd-image").src = product.image;
      $("pd-image").alt = product.name;
    }
    var stage = $("product-media-stage");
    if (stage) {
      stage.setAttribute("data-product-id", product.id);
      stage.setAttribute("data-view", "image");
      stage.setAttribute("data-model", "");
    }
    if ($("pd-crumb")) $("pd-crumb").textContent = product.name;
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
    if (msg) msg.hidden = true;
    if (preview) {
      preview.innerHTML =
        "<p><strong>數量：</strong>" + qty + "</p>" +
        '<p class="total"><strong>小計：</strong>' +
        window.LaneMart.money(product.price * qty) + "</p>";
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
      if (cart[i].id === product.id) { found = cart[i]; break; }
    }
    if (found) {
      found.qty = Math.min(99, (parseInt(found.qty, 10) || 0) + qty);
      found.customer = name;
    } else {
      cart.push({
        id: product.id,
        name: product.name + (product.pack ? "（" + product.pack + "）" : ""),
        price: product.price,
        qty: qty,
        customer: name
      });
    }
    window.LaneMart.writeCart(cart);
    refreshSubtotal(product);
    showMsg(msg, "ok", "已加入購物車（目前 " + window.LaneMart.cartCount() + " 件）。");
  }

  ready(function () {
    if (!$("product-detail")) return;
    var product = (window.LaneMartCatalog || {})[queryId()];
    if (!product) {
      if ($("product-detail")) $("product-detail").hidden = true;
      if ($("product-missing")) $("product-missing").hidden = false;
      return;
    }
    renderDetail(product);
    refreshSubtotal(product);

    var qty = $("product-qty");
    function bump(d) {
      var q = parseInt(qty.value, 10);
      if (isNaN(q)) q = 1;
      qty.value = String(Math.max(1, Math.min(99, q + d)));
      refreshSubtotal(product);
    }
    if ($("qty-minus")) $("qty-minus").addEventListener("click", function () { bump(-1); });
    if ($("qty-plus")) $("qty-plus").addEventListener("click", function () { bump(1); });
    if (qty) {
      qty.addEventListener("input", function () { refreshSubtotal(product); });
      qty.addEventListener("change", function () { refreshSubtotal(product); });
    }
    if ($("btn-calc")) {
      $("btn-calc").addEventListener("click", function (e) {
        e.preventDefault();
        refreshSubtotal(product);
      });
    }
    if ($("btn-add")) {
      $("btn-add").addEventListener("click", function (e) {
        e.preventDefault();
        addToCart(product);
      });
    }
  });
})();
