/* 購物車清單；結賬前檢查個人資料 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function $(id) {
    return document.getElementById(id);
  }

  function showMsg(box, type, htmlOrText, asHtml) {
    if (!box) return;
    box.className = "msg " + type;
    if (asHtml) box.innerHTML = htmlOrText;
    else box.textContent = htmlOrText;
    box.hidden = false;
  }

  function renderCart() {
    var tbody = $("cart-body");
    var empty = $("cart-empty");
    var tableWrap = $("cart-table-wrap");
    var summary = $("cart-summary");
    var msg = $("cart-msg");
    if (!tbody) return;

    var cart = window.LaneMart.readCart();
    tbody.innerHTML = "";

    if (!cart.length) {
      if (empty) empty.hidden = false;
      if (tableWrap) tableWrap.hidden = true;
      if (summary) summary.innerHTML = "";
      if (msg) msg.hidden = true;
      return;
    }

    if (empty) empty.hidden = true;
    if (tableWrap) tableWrap.hidden = false;
    if (msg) msg.hidden = true;

    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      var qty = parseInt(item.qty, 10) || 0;
      var line = (Number(item.price) || 0) * qty;
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + item.name + "</td>" +
        '<td class="num">' + window.LaneMart.money(item.price) + "</td>" +
        '<td class="num">' + qty + "</td>" +
        '<td class="num">' + window.LaneMart.money(line) + "</td>" +
        '<td><button type="button" class="btn btn-ghost btn-sm" data-remove="' +
        item.id + '">移除</button></td>';
      tbody.appendChild(tr);
    }

    var removeBtns = tbody.querySelectorAll("[data-remove]");
    for (var j = 0; j < removeBtns.length; j++) {
      removeBtns[j].addEventListener("click", function (ev) {
        removeItem(ev.currentTarget.getAttribute("data-remove"));
      });
    }

    var totals = window.LaneMart.cartTotals(cart);
    if (summary) {
      summary.innerHTML =
        "<p><strong>商品小計：</strong>" + window.LaneMart.money(totals.subtotal) + "</p>" +
        "<p><strong>運費：</strong>" +
        (totals.shipping === 0 ? "免運費" : window.LaneMart.money(totals.shipping)) + "</p>" +
        '<p class="total"><strong>應付總額：</strong>' +
        window.LaneMart.money(totals.grand) + "</p>";
    }
  }

  function removeItem(id) {
    var cart = window.LaneMart.readCart().filter(function (item) {
      return item.id !== id;
    });
    window.LaneMart.writeCart(cart);
    renderCart();
    showMsg($("cart-msg"), "ok", "已移除商品。");
  }

  function clearCart() {
    window.LaneMart.writeCart([]);
    renderCart();
    showMsg($("cart-msg"), "ok", "購物車已清空。");
  }

  function goCheckout() {
    var cart = window.LaneMart.readCart();
    var msg = $("cart-msg");
    if (!cart.length) {
      showMsg(msg, "err", "購物車是空的。");
      return;
    }
    if (!window.LaneMart.profileComplete()) {
      showMsg(
        msg,
        "warn",
        '結賬前請先到<a href="account.html?need=profile&next=checkout">個人中心</a>填寫姓名與電話。',
        true
      );
      return;
    }
    window.location.href = "checkout.html";
  }

  ready(function () {
    if (!$("cart-body")) return;
    if ($("btn-clear")) {
      $("btn-clear").addEventListener("click", function (e) {
        e.preventDefault();
        clearCart();
      });
    }
    if ($("btn-checkout")) {
      $("btn-checkout").addEventListener("click", function (e) {
        e.preventDefault();
        goCheckout();
      });
    }
    renderCart();
  });
})();
