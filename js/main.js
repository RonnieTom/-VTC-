/* 共用：購物車、個人資料、訂單、搜尋、導覽 */
(function () {
  "use strict";

  var CART_KEY = "qingheMartCart";
  var PROFILE_KEY = "qingheMartProfile";
  var ORDERS_KEY = "qingheMartOrders";
  var ACTIVITY_KEY = "qingheMartActivity";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function trim(v) {
    return String(v || "").replace(/^\s+|\s+$/g, "");
  }

  function safeParse(raw, fallback) {
    try {
      var data = raw ? JSON.parse(raw) : fallback;
      return data == null ? fallback : data;
    } catch (e) {
      return fallback;
    }
  }

  function readCart() {
    var data = safeParse(localStorage.getItem(CART_KEY), []);
    return Array.isArray(data) ? data : [];
  }

  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items || []));
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

  function readProfile() {
    var data = safeParse(localStorage.getItem(PROFILE_KEY), {});
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  }

  function writeProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile || {}));
  }

  function clearProfile() {
    localStorage.removeItem(PROFILE_KEY);
  }

  function profileComplete(profile) {
    var p = profile || readProfile();
    return !!(trim(p.name) && trim(p.phone));
  }

  function readOrders() {
    var data = safeParse(localStorage.getItem(ORDERS_KEY), []);
    return Array.isArray(data) ? data : [];
  }

  function writeOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders || []));
  }

  function addOrder(order) {
    var list = readOrders();
    list.unshift(order);
    writeOrders(list.slice(0, 50));
    return order;
  }

  function readActivity() {
    var data = safeParse(localStorage.getItem(ACTIVITY_KEY), []);
    return Array.isArray(data) ? data : [];
  }

  function addActivity(text) {
    var list = readActivity();
    list.unshift({
      id: "A" + Date.now(),
      at: new Date().toISOString(),
      text: text
    });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(list.slice(0, 40)));
  }

  function cartTotals(cart) {
    var items = cart || readCart();
    var subtotal = 0;
    for (var i = 0; i < items.length; i++) {
      subtotal += (Number(items[i].price) || 0) * (parseInt(items[i].qty, 10) || 0);
    }
    var shipping = subtotal >= 200 || subtotal === 0 ? 0 : 20;
    return {
      subtotal: subtotal,
      shipping: shipping,
      grand: subtotal + shipping
    };
  }

  function bindSearch() {
    var form = document.getElementById("site-search");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("search-q");
      var q = input ? trim(input.value) : "";
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
    PROFILE_KEY: PROFILE_KEY,
    ORDERS_KEY: ORDERS_KEY,
    readCart: readCart,
    writeCart: writeCart,
    cartCount: cartCount,
    updateCartBadge: updateCartBadge,
    money: money,
    trim: trim,
    readProfile: readProfile,
    writeProfile: writeProfile,
    clearProfile: clearProfile,
    profileComplete: profileComplete,
    readOrders: readOrders,
    writeOrders: writeOrders,
    addOrder: addOrder,
    readActivity: readActivity,
    addActivity: addActivity,
    cartTotals: cartTotals
  };

  ready(function () {
    updateCartBadge();
    bindSearch();
    bindMenuToggle();
    highlightCatNav();
  });
})();
