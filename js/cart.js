/* 購物車清單、個人資料與結算 */
(function () {
  "use strict";

  var PROFILE_KEY = "qingheMartProfile";

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

  function readProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      var data = raw ? JSON.parse(raw) : null;
      return data && typeof data === "object" ? data : {};
    } catch (e) {
      return {};
    }
  }

  function writeProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile || {}));
  }

  function clearProfileStorage() {
    localStorage.removeItem(PROFILE_KEY);
  }

  function trim(v) {
    return String(v || "").replace(/^\s+|\s+$/g, "");
  }

  function profileComplete(p) {
    return !!(p && trim(p.name) && trim(p.phone));
  }

  function fillProfileForm(profile) {
    if ($("pf-name")) $("pf-name").value = profile.name || "";
    if ($("pf-phone")) $("pf-phone").value = profile.phone || "";
    if ($("pf-email")) $("pf-email").value = profile.email || "";
    if ($("pf-address")) $("pf-address").value = profile.address || "";
  }

  function collectProfileForm() {
    return {
      name: trim($("pf-name") && $("pf-name").value),
      phone: trim($("pf-phone") && $("pf-phone").value),
      email: trim($("pf-email") && $("pf-email").value),
      address: trim($("pf-address") && $("pf-address").value)
    };
  }

  function setProfileOpen(open, focusName) {
    var toggle = $("toggle-profile");
    var fields = $("profile-fields");
    if (toggle) toggle.checked = !!open;
    if (fields) fields.hidden = !open;
    if (open && focusName && $("pf-name")) $("pf-name").focus();
  }

  function updateProfileStatus(profile) {
    var status = $("profile-status");
    if (!status) return;
    if (profileComplete(profile)) {
      status.hidden = false;
      status.textContent =
        "已儲存：" + profile.name + "／" + profile.phone +
        (profile.address ? "／" + profile.address : "");
    } else if (trim(profile.name) || trim(profile.phone) || trim(profile.email) || trim(profile.address)) {
      status.hidden = false;
      status.textContent = "資料未完整：結算前請填寫姓名與電話。";
    } else {
      status.hidden = true;
      status.textContent = "";
    }
  }

  function initProfileUI() {
    var profile = readProfile();
    fillProfileForm(profile);
    updateProfileStatus(profile);
    if (profileComplete(profile) || trim(profile.name) || trim(profile.phone)) {
      setProfileOpen(true, false);
    } else {
      setProfileOpen(false, false);
    }

    var toggle = $("toggle-profile");
    if (toggle) {
      toggle.addEventListener("change", function () {
        setProfileOpen(toggle.checked, toggle.checked);
      });
    }

    if ($("btn-save-profile")) {
      $("btn-save-profile").addEventListener("click", function (e) {
        e.preventDefault();
        var next = collectProfileForm();
        if (!next.name || !next.phone) {
          showMsg($("cart-msg"), "err", "儲存個人資料需填寫姓名與電話。");
          setProfileOpen(true, true);
          return;
        }
        writeProfile(next);
        updateProfileStatus(next);
        showMsg($("cart-msg"), "ok", "個人資料已儲存。");
      });
    }

    if ($("btn-clear-profile")) {
      $("btn-clear-profile").addEventListener("click", function (e) {
        e.preventDefault();
        clearProfileStorage();
        fillProfileForm({});
        updateProfileStatus({});
        setProfileOpen(false, false);
        showMsg($("cart-msg"), "ok", "個人資料已清除。");
      });
    }
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

    /* 結算前若表單已打開，先同步最新輸入 */
    var profile = collectProfileForm();
    if (!profileComplete(profile)) {
      profile = readProfile();
    }

    if (!profileComplete(profile)) {
      setProfileOpen(true, true);
      showMsg(msg, "warn", "請先勾選並填寫個人資料（姓名、電話）再結算。");
      var box = $("profile-box");
      if (box && box.scrollIntoView) box.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    /* 自動儲存一次，避免下次再填 */
    writeProfile(profile);
    updateProfileStatus(profile);

    var total = 0;
    for (var i = 0; i < cart.length; i++) {
      total += (Number(cart[i].price) || 0) * (parseInt(cart[i].qty, 10) || 0);
    }
    var shipping = total >= 200 ? 0 : 20;
    var grand = total + shipping;

    window.LaneMart.writeCart([]);
    renderCart();
    showMsg(
      msg,
      "ok",
      profile.name + "，訂單已提交，應付 " + window.LaneMart.money(grand) +
        "。我們會以 " + profile.phone + " 聯絡您。謝謝惠顧！"
    );
  }

  ready(function () {
    if (!$("cart-body")) return;
    initProfileUI();
    if ($("btn-clear")) {
      $("btn-clear").addEventListener("click", function (e) {
        e.preventDefault();
        clearCart();
      });
    }
    if ($("btn-checkout")) {
      $("btn-checkout").addEventListener("click", function (e) {
        e.preventDefault();
        checkout();
      });
    }
    renderCart();
  });
})();
