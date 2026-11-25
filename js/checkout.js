/* 模擬結賬付款 */
(function () {
  "use strict";

  var PAY_LABELS = {
    fps: "轉數快",
    card: "信用卡",
    cod: "貨到付款"
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

  function selectedPayMethod() {
    var nodes = document.querySelectorAll('input[name="pay-method"]');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].checked) return nodes[i].value;
    }
    return "fps";
  }

  function syncPayUI() {
    var method = selectedPayMethod();
    var card = $("card-fields");
    var fps = $("fps-hint");
    if (card) card.hidden = method !== "card";
    if (fps) fps.hidden = method !== "fps";
    var cards = document.querySelectorAll(".pay-card");
    for (var i = 0; i < cards.length; i++) {
      var input = cards[i].querySelector("input");
      if (input && input.checked) cards[i].className = "pay-card is-active";
      else cards[i].className = "pay-card";
    }
  }

  function renderCheckout() {
    var cart = window.LaneMart.readCart();
    var profile = window.LaneMart.readProfile();
    var empty = $("checkout-empty");
    var block = $("checkout-block");
    var success = $("checkout-success");
    if (success) success.hidden = true;

    if (!cart.length) {
      if (empty) empty.hidden = false;
      if (block) block.hidden = true;
      return false;
    }

    if (!window.LaneMart.profileComplete(profile)) {
      window.location.href = "account.html?need=profile&next=checkout";
      return false;
    }

    if (empty) empty.hidden = true;
    if (block) block.hidden = false;

    var tbody = $("checkout-items");
    if (tbody) {
      tbody.innerHTML = "";
      for (var i = 0; i < cart.length; i++) {
        var it = cart[i];
        var line = (Number(it.price) || 0) * (parseInt(it.qty, 10) || 0);
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + it.name + "</td>" +
          '<td class="num">' + it.qty + "</td>" +
          '<td class="num">' + window.LaneMart.money(line) + "</td>";
        tbody.appendChild(tr);
      }
    }

    var totals = window.LaneMart.cartTotals(cart);
    if ($("checkout-summary")) {
      $("checkout-summary").innerHTML =
        "<p><strong>商品小計：</strong>" + window.LaneMart.money(totals.subtotal) + "</p>" +
        "<p><strong>運費：</strong>" +
        (totals.shipping === 0 ? "免運費" : window.LaneMart.money(totals.shipping)) + "</p>" +
        '<p class="total"><strong>應付總額：</strong>' +
        window.LaneMart.money(totals.grand) + "</p>";
    }

    if ($("checkout-profile")) {
      $("checkout-profile").innerHTML =
        "<p><strong>" + profile.name + "</strong>　" + profile.phone + "</p>" +
        (profile.email ? "<p class=\"small\">" + profile.email + "</p>" : "") +
        (profile.address ? "<p class=\"small\">地址：" + profile.address + "</p>" : "<p class=\"small\">未填寫地址（可到門市自取）</p>");
    }

    return true;
  }

  function validateCard() {
    var name = window.LaneMart.trim($("card-name") && $("card-name").value);
    var number = window.LaneMart.trim($("card-number") && $("card-number").value).replace(/\s+/g, "");
    var exp = window.LaneMart.trim($("card-exp") && $("card-exp").value);
    var cvc = window.LaneMart.trim($("card-cvc") && $("card-cvc").value);
    if (!name || number.length < 12 || !/^\d+$/.test(number)) {
      return "請輸入有效的模擬卡號（至少 12 位數字）。";
    }
    if (!/^\d{2}\/\d{2}$/.test(exp)) return "有效期格式應為 MM/YY。";
    if (!/^\d{3,4}$/.test(cvc)) return "請輸入 3–4 位 CVC。";
    return "";
  }

  function pay() {
    var cart = window.LaneMart.readCart();
    var profile = window.LaneMart.readProfile();
    var msg = $("checkout-msg");
    if (!cart.length) {
      showMsg(msg, "err", "沒有待結賬商品。");
      return;
    }
    if (!window.LaneMart.profileComplete(profile)) {
      window.location.href = "account.html?need=profile&next=checkout";
      return;
    }

    var method = selectedPayMethod();
    if (method === "card") {
      var err = validateCard();
      if (err) {
        showMsg(msg, "err", err);
        return;
      }
    }

    var btn = $("btn-pay");
    var progress = $("pay-progress");
    if (btn) btn.disabled = true;
    if (progress) progress.hidden = false;
    showMsg(msg, "warn", "正在模擬付款，請稍候…");

    window.setTimeout(function () {
      var totals = window.LaneMart.cartTotals(cart);
      var order = {
        id: "QH" + String(Date.now()).slice(-8),
        at: new Date().toISOString(),
        status: method === "cod" ? "待取貨付款" : "已付款",
        payMethod: method,
        payMethodLabel: PAY_LABELS[method] || method,
        items: cart.map(function (it) {
          return {
            id: it.id,
            name: it.name,
            price: Number(it.price) || 0,
            qty: parseInt(it.qty, 10) || 0
          };
        }),
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        grand: totals.grand,
        customer: {
          name: profile.name,
          phone: profile.phone,
          email: profile.email || "",
          address: profile.address || ""
        }
      };

      window.LaneMart.addOrder(order);
      window.LaneMart.addActivity(
        "完成訂單 " + order.id + "（" + order.payMethodLabel + "，" +
        window.LaneMart.money(order.grand) + "）"
      );
      window.LaneMart.writeCart([]);

      if ($("checkout-block")) $("checkout-block").hidden = true;
      if ($("checkout-success")) $("checkout-success").hidden = false;
      if ($("success-text")) {
        $("success-text").textContent =
          profile.name + "，訂單 " + order.id + " 已建立。" +
          (method === "cod"
            ? "請於取貨時付款 " + window.LaneMart.money(order.grand) + "。"
            : "已模擬扣款 " + window.LaneMart.money(order.grand) + "。");
      }
      if (msg) msg.hidden = true;
      if (btn) btn.disabled = false;
      if (progress) progress.hidden = true;
      window.LaneMart.updateCartBadge();
    }, 900);
  }

  ready(function () {
    if (!$("checkout-block") && !$("checkout-empty")) return;
    if (!renderCheckout()) return;

    var radios = document.querySelectorAll('input[name="pay-method"]');
    for (var i = 0; i < radios.length; i++) {
      radios[i].addEventListener("change", syncPayUI);
    }
    syncPayUI();

    if ($("btn-pay")) {
      $("btn-pay").addEventListener("click", function (e) {
        e.preventDefault();
        pay();
      });
    }
  });
})();
