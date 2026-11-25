/* 共用：購物車、搜尋、分類導覽 */
(function () {
  "use strict";

  var CART_KEY = "qingheMartCart";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
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
    var nodes = document.querySelectorAll("[data-cart-count]");
    var n = String(cartCount());
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = n;
  }

  function money(n) {
    return "HK$ " + (Number(n) || 0).toFixed(2);
  }

  function bindSearch() {
    var form = document.getElementById("site-search");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("search-q");
      var q = input ? input.value.replace(/^\s+|\s+$/g, "") : "";
      if (!q) {
        window.location.href = "products.html";
        return;
      }
      window.location.href = "products.html?q=" + encodeURIComponent(q);
    });
  }

  function bindMenuToggle() {
    var btn = document.getElementById("menu-toggle");
    var nav = document.getElementById("cat-nav");
    if (!btn || !nav) return;

    var mq = window.matchMedia ? window.matchMedia("(max-width: 640px)") : null;
    function sync() {
      if (mq && mq.matches) {
        if (nav.className.indexOf("is-collapsed") < 0) {
          nav.className += " is-collapsed";
        }
      } else {
        nav.className = nav.className.replace(/\bis-collapsed\b/g, "").trim();
      }
    }
    sync();
    if (mq) {
      if (mq.addEventListener) mq.addEventListener("change", sync);
      else if (mq.addListener) mq.addListener(sync);
    }

    btn.addEventListener("click", function () {
      if (nav.className.indexOf("is-collapsed") >= 0) {
        nav.className = nav.className.replace(/\bis-collapsed\b/g, "").trim();
      } else {
        nav.className = (nav.className + " is-collapsed").trim();
      }
    });
  }

  function highlightCatNav() {
    var params = new URLSearchParams(window.location.search || "");
    var cat = params.get("cat") || "";
    var deals = params.get("deals");
    var path = (window.location.pathname.split("/").pop() || "").toLowerCase();
    var links = document.querySelectorAll(".cat-nav a[data-cat]");
    for (var i = 0; i < links.length; i++) {
      var key = links[i].getAttribute("data-cat") || "";
      var active = false;
      if (path.indexOf("product") === 0 || path === "products.html") {
        if (deals === "1" && key === "deals") active = true;
        else if (!deals && cat && key === cat) active = true;
        else if (!deals && !cat && key === "all" && path === "products.html") active = true;
      }
      if (active) links[i].className = (links[i].className + " active").replace(/\s+/g, " ").trim();
    }
  }

  window.LaneMart = {
    CART_KEY: CART_KEY,
    readCart: readCart,
    writeCart: writeCart,
    cartCount: cartCount,
    updateCartBadge: updateCartBadge,
    money: money
  };

  ready(function () {
    updateCartBadge();
    bindSearch();
    bindMenuToggle();
    highlightCatNav();
  });
})();
