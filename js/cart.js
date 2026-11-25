/* 購物車清單與結算 */
(function () {
  "use strict";

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

    var total = 0;
    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      var qty = parseInt(item.qty, 10) || 0;
      var line = (Number(item.price) || 0) * qty;
      total += line;

      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + item.name + "</td>" +
        '<td class="num">' + window.LaneMart.money(item.price) + "</td>" +
        '<td class="num">' + qty + "</td>" +
        '<td class="num">' + window.LaneMart.money(line) + "</td>" +
        '<td><button type="button" class="btn btn-secondary" data-remove="' +
        item.id + '">移除</button></td>';
      tbody.appendChild(tr);
    }

    var removeBtns = tbody.querySelectorAll("[data-remove]");
    for (var j = 0; j < removeBtns.length; j++) {
      removeBtns[j].addEventListener("click", function (ev) {
        removeItem(ev.currentTarget.getAttribute("data-remove"));
      });
    }

    var shipping = total >= 200 ? 0 : 20;
    var grand = total + shipping;

    if (summary) {
      summary.innerHTML =
        "<p><strong>商品小計：</strong>" + window.LaneMart.money(total) + "</p>" +
        "<p><strong>運費：</strong>" +
        (shipping === 0 ? "免運費" : window.LaneMart.money(shipping)) + "</p>" +
        '<p class="total"><strong>應付總額：</strong>' +
        window.LaneMart.money(grand) + "</p>";
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

  function checkout() {
    var cart = window.LaneMart.readCart();
    var msg = $("cart-msg");
    if (!cart.length) {
      showMsg(msg, "err", "購物車是空的。");
      return;
    }

    var total = 0;
    var customer = "顧客";
    for (var i = 0; i < cart.length; i++) {
      total += (Number(cart[i].price) || 0) * (parseInt(cart[i].qty, 10) || 0);
      if (cart[i].customer) customer = cart[i].customer;
    }
    var shipping = total >= 200 ? 0 : 20;
    var grand = total + shipping;

    window.LaneMart.writeCart([]);
    renderCart();
    showMsg(
      msg,
      "ok",
      customer + "，訂單已提交，應付 " + window.LaneMart.money(grand) + "。謝謝惠顧！"
    );
  }

  ready(function () {
    if (!$("cart-body")) return;
    var clearBtn = $("btn-clear");
    var checkoutBtn = $("btn-checkout");
    if (clearBtn) {
      clearBtn.addEventListener("click", function (e) {
        e.preventDefault();
        clearCart();
      });
    }
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        checkout();
      });
    }
    renderCart();
  });
})();
