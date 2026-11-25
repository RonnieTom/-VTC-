/* 共用導覽與購物車數量顯示 — 原生 JS，無框架 */
(function () {
  "use strict";

  var CART_KEY = "laneMartCart";

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function readCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartBadge();
  }

  function cartCount() {
    return readCart().reduce(function (sum, item) {
      return sum + (parseInt(item.qty, 10) || 0);
    }, 0);
  }

  function updateCartBadge() {
    var el = document.getElementById("cart-count");
    if (el) {
      el.textContent = String(cartCount());
    }
  }

  function setActiveNav() {
    var path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (!path) path = "index.html";
    var links = document.querySelectorAll(".nav-inner a");
    for (var i = 0; i < links.length; i++) {
      var href = (links[i].getAttribute("href") || "").toLowerCase();
      if (href === path || (path === "" && href === "index.html")) {
        links[i].className = (links[i].className + " active").trim();
      }
    }
  }

  function bindMenuToggle() {
    var btn = document.getElementById("menu-toggle");
    var nav = document.getElementById("site-nav");
    if (!btn || !nav) return;

    // 手機預設收合
    if (window.matchMedia && window.matchMedia("(max-width: 640px)").matches) {
      nav.className += " is-collapsed";
    }

    btn.addEventListener("click", function () {
      if (nav.className.indexOf("is-collapsed") >= 0) {
        nav.className = nav.className.replace(/\bis-collapsed\b/g, "").trim();
        btn.setAttribute("aria-expanded", "true");
      } else {
        nav.className = (nav.className + " is-collapsed").trim();
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 暴露給其他腳本
  window.LaneMart = {
    CART_KEY: CART_KEY,
    readCart: readCart,
    writeCart: writeCart,
    cartCount: cartCount,
    updateCartBadge: updateCartBadge,
    money: function (n) {
      var v = Number(n) || 0;
      return "HK$ " + v.toFixed(2);
    }
  };

  ready(function () {
    setActiveNav();
    bindMenuToggle();
    updateCartBadge();
  });
})();
