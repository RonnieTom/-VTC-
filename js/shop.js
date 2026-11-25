/* 商品選擇、數量與小計 */
(function () {
  "use strict";

  var PRODUCTS = {
    apple: { id: "apple", name: "富士蘋果（約 600g）", price: 22 },
    milk: { id: "milk", name: "全脂鮮奶 1L", price: 26 },
    eggs: { id: "eggs", name: "新鮮雞蛋（6 隻）", price: 18 },
    bread: { id: "bread", name: "全麥吐司", price: 24 },
    spinach: { id: "spinach", name: "有機菠菜 250g", price: 16 },
    juice: { id: "juice", name: "鮮搾橙汁 1L", price: 32 }
  };

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function $(id) {
    return document.getElementById(id);
  }

  function showMsg(box, type, text) {
    if (!box) return;
    box.className = "msg " + type;
    box.textContent = text;
    box.hidden = false;
  }

  function getSelectedProduct() {
    var sel = $("product-select");
    if (!sel) return null;
    return PRODUCTS[sel.value] || null;
  }

  function getQty() {
    var input = $("product-qty");
    var q = parseInt(input && input.value, 10);
    if (isNaN(q)) return null;
    return q;
  }

  function refreshPreview() {
    var product = getSelectedProduct();
    var qty = getQty();
    var preview = $("order-preview");
    var msg = $("order-msg");

    if (!product) {
      showMsg(msg, "warn", "請先選擇商品。");
      if (preview) preview.innerHTML = "";
      return;
    }

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
    showMsg(msg, "ok", product.name + " × " + qty + " = " + window.LaneMart.money(subtotal));

    if (preview) {
      preview.innerHTML =
        "<p><strong>商品：</strong>" + product.name + "</p>" +
        "<p><strong>單價：</strong>" + window.LaneMart.money(product.price) + "</p>" +
        "<p><strong>數量：</strong>" + qty + "</p>" +
        '<p class="total"><strong>小計：</strong>' + window.LaneMart.money(subtotal) + "</p>";
    }
  }

  function addToCart() {
    var product = getSelectedProduct();
    var qty = getQty();
    var msg = $("order-msg");
    var nameInput = $("customer-name");
    var name = nameInput ? nameInput.value.replace(/^\s+|\s+$/g, "") : "";

    if (!name) {
      showMsg(msg, "err", "請輸入姓名。");
      if (nameInput) nameInput.focus();
      return;
    }
    if (!product) {
      showMsg(msg, "err", "請選擇商品。");
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
    refreshPreview();
    showMsg(msg, "ok", "已加入購物車（目前 " + window.LaneMart.cartCount() + " 件）。");
  }

  function bindQuickAdd() {
    var buttons = document.querySelectorAll("[data-add-id]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function (ev) {
        var id = ev.currentTarget.getAttribute("data-add-id");
        var sel = $("product-select");
        var qty = $("product-qty");
        if (sel && PRODUCTS[id]) sel.value = id;
        if (qty && (!qty.value || parseInt(qty.value, 10) < 1)) qty.value = "1";
        refreshPreview();
        var form = $("order-form");
        if (form && form.scrollIntoView) {
          form.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  }

  function bindQtyButtons() {
    var minus = $("qty-minus");
    var plus = $("qty-plus");
    var input = $("product-qty");
    if (!input) return;

    function bump(delta) {
      var q = parseInt(input.value, 10);
      if (isNaN(q)) q = 1;
      q = Math.max(1, Math.min(99, q + delta));
      input.value = String(q);
      refreshPreview();
    }

    if (minus) minus.addEventListener("click", function () { bump(-1); });
    if (plus) plus.addEventListener("click", function () { bump(1); });
  }

  ready(function () {
    if (!$("order-form")) return;

    var sel = $("product-select");
    var qty = $("product-qty");
    var calcBtn = $("btn-calc");
    var addBtn = $("btn-add");

    if (sel) sel.addEventListener("change", refreshPreview);
    if (qty) {
      qty.addEventListener("input", refreshPreview);
      qty.addEventListener("change", refreshPreview);
    }
    if (calcBtn) {
      calcBtn.addEventListener("click", function (e) {
        e.preventDefault();
        refreshPreview();
      });
    }
    if (addBtn) {
      addBtn.addEventListener("click", function (e) {
        e.preventDefault();
        addToCart();
      });
    }

    bindQuickAdd();
    bindQtyButtons();
    refreshPreview();
  });

  window.LaneMartProducts = PRODUCTS;
})();
