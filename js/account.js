/* 個人中心：資料、訂單、活動記錄 */
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

  function pad2(n) {
    n = String(n);
    return n.length < 2 ? "0" + n : n;
  }

  function formatTime(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return (
        d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) +
        " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes())
      );
    } catch (e) {
      return iso;
    }
  }

  function fillProfile() {
    var p = window.LaneMart.readProfile();
    if ($("pf-name")) $("pf-name").value = p.name || "";
    if ($("pf-phone")) $("pf-phone").value = p.phone || "";
    if ($("pf-email")) $("pf-email").value = p.email || "";
    if ($("pf-address")) $("pf-address").value = p.address || "";
    updateHello(p);
  }

  function updateHello(p) {
    var hello = $("account-hello");
    if (!hello) return;
    if (window.LaneMart.profileComplete(p)) {
      hello.textContent = "你好，" + p.name;
    } else {
      hello.textContent = "尚未填寫完整個人資料";
    }
  }

  function switchTab(name) {
    var panels = document.querySelectorAll(".account-panel");
    var tabs = document.querySelectorAll(".account-tab");
    for (var i = 0; i < panels.length; i++) {
      panels[i].hidden = panels[i].id !== "tab-" + name;
    }
    for (var j = 0; j < tabs.length; j++) {
      var on = tabs[j].getAttribute("data-tab") === name;
      tabs[j].className = on ? "account-tab active" : "account-tab";
    }
    try {
      var url = new URL(window.location.href);
      url.searchParams.set("tab", name);
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}
  }

  function renderOrders() {
    var list = window.LaneMart.readOrders();
    var host = $("orders-list");
    var empty = $("orders-empty");
    if (!host) return;
    host.innerHTML = "";
    if (!list.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    for (var i = 0; i < list.length; i++) {
      var order = list[i];
      var card = document.createElement("article");
      card.className = "order-card";
      var lines = (order.items || []).map(function (it) {
        return "<li>" + it.name + " × " + it.qty + "（" + window.LaneMart.money(it.price * it.qty) + "）</li>";
      }).join("");
      card.innerHTML =
        '<div class="order-head">' +
        "<div><strong>訂單 " + order.id + "</strong><br><span class=\"small\">" +
        formatTime(order.at) + "</span></div>" +
        '<span class="order-status">' + (order.status || "已付款") + "</span>" +
        "</div>" +
        "<ul>" + lines + "</ul>" +
        '<p class="small">付款方式：' + (order.payMethodLabel || order.payMethod || "—") + "</p>" +
        '<p class="total"><strong>總額：</strong>' + window.LaneMart.money(order.grand) + "</p>";
      host.appendChild(card);
    }
  }

  function renderActivity() {
    var list = window.LaneMart.readActivity();
    var host = $("activity-list");
    var empty = $("activity-empty");
    if (!host) return;
    host.innerHTML = "";
    if (!list.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    for (var i = 0; i < list.length; i++) {
      var li = document.createElement("li");
      li.innerHTML =
        "<strong>" + formatTime(list[i].at) + "</strong> — " + list[i].text;
      host.appendChild(li);
    }
  }

  function handleBanner() {
    var params = new URLSearchParams(window.location.search || "");
    var banner = $("account-banner");
    var goPay = $("btn-go-checkout");
    if (params.get("need") === "profile") {
      if (banner) {
        banner.hidden = false;
        banner.className = "msg warn";
        banner.innerHTML =
          "結賬前請先完善個人資料（姓名、電話）。完成後可前往結賬。";
      }
      switchTab("profile");
    }
    if (params.get("next") === "checkout" && window.LaneMart.profileComplete()) {
      if (goPay) goPay.hidden = false;
    }
    if (params.get("paid") === "1") {
      if (banner) {
        banner.hidden = false;
        banner.className = "msg ok";
        banner.textContent = "付款成功，可在「訂單記錄」查看詳情。";
      }
      switchTab("orders");
    }
  }

  ready(function () {
    if (!$("profile-form")) return;

    fillProfile();
    renderOrders();
    renderActivity();

    var params = new URLSearchParams(window.location.search || "");
    var tab = params.get("tab") || "profile";
    if (tab === "orders" || tab === "activity" || tab === "profile") switchTab(tab);
    handleBanner();

    var tabs = document.querySelectorAll(".account-tab");
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener("click", function (ev) {
        switchTab(ev.currentTarget.getAttribute("data-tab"));
      });
    }

    $("profile-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var next = {
        name: window.LaneMart.trim($("pf-name").value),
        phone: window.LaneMart.trim($("pf-phone").value),
        email: window.LaneMart.trim($("pf-email").value),
        address: window.LaneMart.trim($("pf-address").value)
      };
      if (!next.name || !next.phone) {
        showMsg($("profile-msg"), "err", "請填寫姓名與電話。");
        return;
      }
      window.LaneMart.writeProfile(next);
      window.LaneMart.addActivity("更新了個人資料（" + next.name + "）");
      updateHello(next);
      renderActivity();
      showMsg($("profile-msg"), "ok", "個人資料已儲存。");

      var params2 = new URLSearchParams(window.location.search || "");
      if (params2.get("next") === "checkout" || params2.get("need") === "profile") {
        if ($("btn-go-checkout")) $("btn-go-checkout").hidden = false;
      }
    });

    if ($("btn-clear-profile")) {
      $("btn-clear-profile").addEventListener("click", function () {
        window.LaneMart.clearProfile();
        window.LaneMart.addActivity("清除了個人資料");
        fillProfile();
        renderActivity();
        if ($("btn-go-checkout")) $("btn-go-checkout").hidden = true;
        showMsg($("profile-msg"), "ok", "個人資料已清除。");
      });
    }
  });
})();
