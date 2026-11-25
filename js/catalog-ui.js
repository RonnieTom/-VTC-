/* 商品列表渲染／篩選（超市目錄風格） */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function badgeClass(badge) {
    if (!badge) return "";
    if (badge.indexOf("冷藏") >= 0) return "cold";
    if (badge.indexOf("有機") >= 0 || badge.indexOf("當日") >= 0) return "soft";
    return "";
  }

  function cardHTML(p) {
    var badge = p.badge
      ? '<span class="badge ' + badgeClass(p.badge) + '">' + p.badge + "</span>"
      : "";
    var badge3d = p.sketchfab
      ? '<span class="badge-3d" title="支援 3D 預覽">3D</span>'
      : "";
    var was = p.was
      ? '<span class="was">' + window.LaneMart.money(p.was) + "</span>"
      : "";
    var detail = "product.html?id=" + p.id;
    var detail3d = detail + "&view=3d";
    return (
      '<article class="p-card" data-id="' + p.id + '" data-cat="' + p.cat + '">' +
      badge + badge3d +
      '<a class="thumb" href="' + detail + '">' +
      '<img src="' + p.image + '" width="400" height="400" alt="' + p.name + '" loading="lazy">' +
      "</a>" +
      '<div class="body">' +
      '<a class="name" href="' + detail + '">' + p.name + "</a>" +
      '<div class="pack">' + (p.pack || p.unit || "") + "</div>" +
      '<div class="price-row"><span class="price">' + window.LaneMart.money(p.price) +
      "</span>" + was + "</div>" +
      '<div class="actions">' +
      '<a class="btn btn-ghost" href="' + (p.sketchfab ? detail3d : detail) + '">' +
      (p.sketchfab ? "3D" : "詳情") + "</a>" +
      '<a class="btn" href="' + detail + '">選購</a>' +
      "</div></div></article>"
    );
  }

  function allProducts() {
    var catalog = window.LaneMartCatalog || {};
    var list = [];
    for (var key in catalog) {
      if (Object.prototype.hasOwnProperty.call(catalog, key)) list.push(catalog[key]);
    }
    return list;
  }

  function filterProducts(list, opts) {
    return list.filter(function (p) {
      if (opts.deals && !(p.was && p.was > p.price)) return false;
      if (opts.cat && opts.cat !== "all" && p.cat !== opts.cat) return false;
      if (opts.q) {
        var hay = (p.name + " " + p.category + " " + (p.desc || "")).toLowerCase();
        if (hay.indexOf(opts.q) < 0) return false;
      }
      return true;
    });
  }

  function renderInto(el, list) {
    if (!el) return;
    if (!list.length) {
      el.innerHTML = '<p class="small">沒有符合條件的商品。</p>';
      return;
    }
    el.innerHTML = list.map(cardHTML).join("");
  }

  function queryOpts() {
    var params = new URLSearchParams(window.location.search || "");
    return {
      cat: params.get("cat") || "all",
      deals: params.get("deals") === "1",
      q: (params.get("q") || "").toLowerCase()
    };
  }

  function syncChips(opts) {
    var chips = document.querySelectorAll(".filter-bar .chip");
    for (var i = 0; i < chips.length; i++) {
      var c = chips[i];
      var cat = c.getAttribute("data-cat") || "";
      var deals = c.getAttribute("data-deals") === "1";
      var active = false;
      if (deals) active = opts.deals;
      else if (opts.deals) active = false;
      else active = cat === opts.cat || (opts.cat === "all" && cat === "all");
      c.className = active ? "chip active" : "chip";
    }
  }

  function fillSearchInput(opts) {
    var input = document.getElementById("search-q");
    if (input && opts.q) input.value = opts.q;
    var hint = document.getElementById("search-hint");
    if (hint) {
      if (opts.q) {
        hint.hidden = false;
        hint.textContent = "搜尋：「" + opts.q + "」";
      } else {
        hint.hidden = true;
      }
    }
  }

  window.LaneMartRender = {
    cardHTML: cardHTML,
    allProducts: allProducts,
    filterProducts: filterProducts,
    renderInto: renderInto
  };

  ready(function () {
    var grid = document.getElementById("product-grid");
    var homeDeals = document.getElementById("home-deals");
    var homeBest = document.getElementById("home-best");
    var list = allProducts();

    if (homeDeals) {
      renderInto(
        homeDeals,
        filterProducts(list, { deals: true, cat: "all", q: "" }).slice(0, 4)
      );
    }
    if (homeBest) {
      renderInto(homeBest, list.slice(0, 4));
    }
    if (grid) {
      var opts = queryOpts();
      fillSearchInput(opts);
      syncChips(opts);
      renderInto(grid, filterProducts(list, opts));
    }
  });
})();
