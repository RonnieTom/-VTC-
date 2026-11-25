/* 商品詳情 + Sketchfab 3D 懶加載預覽 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function $(id) {
    return document.getElementById(id);
  }

  function queryId() {
    var m = (window.location.search || "").match(/[?&]id=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  }

  function showMsg(box, type, text) {
    if (!box) return;
    box.className = "msg " + type;
    box.textContent = text;
    box.hidden = false;
  }

  function getQty() {
    var q = parseInt($("product-qty") && $("product-qty").value, 10);
    return isNaN(q) ? null : q;
  }

  /* Sketchfab embed：關閉自動播放／預載，精簡 UI */
  function buildEmbedSrc(uid) {
    var params = [
      "autostart=0",
      "preload=0",
      "ui_theme=dark",
      "ui_hint=0",
      "ui_infos=0",
      "ui_inspector=0",
      "ui_settings=0",
      "ui_annotations=0",
      "ui_watermark=1",
      "ui_watermark_link=1",
      "ui_ar=0",
      "ui_vr=0",
      "ui_help=0",
      "dnt=1",
      "camera=0"
    ].join("&");
    return "https://sketchfab.com/models/" + uid + "/embed?" + params;
  }

  function setViewButtons(mode) {
    var imgBtn = $("btn-view-image");
    var modelBtn = $("btn-view-3d");
    if (imgBtn) {
      imgBtn.className = mode === "image" ? "btn btn-sm media-tab active" : "btn btn-sm btn-ghost media-tab";
      imgBtn.setAttribute("aria-pressed", mode === "image" ? "true" : "false");
    }
    if (modelBtn) {
      modelBtn.className = mode === "model" ? "btn btn-sm media-tab active" : "btn btn-sm btn-ghost media-tab";
      modelBtn.setAttribute("aria-pressed", mode === "model" ? "true" : "false");
    }
  }

  function unloadModel() {
    var host = $("model-host");
    if (!host) return;
    host.innerHTML = "";
    host.hidden = true;
  }

  function showImage(stage) {
    stage.setAttribute("data-view", "image");
    unloadModel();
    var img = $("pd-image");
    if (img) img.hidden = false;
    var loading = $("model-loading");
    if (loading) loading.hidden = true;
    setViewButtons("image");
  }

  function showModel(stage, product) {
    var sf = product.sketchfab;
    if (!sf || !sf.uid) return;

    stage.setAttribute("data-view", "model");
    stage.setAttribute("data-model", sf.uid);

    var img = $("pd-image");
    if (img) img.hidden = true;

    var host = $("model-host");
    var loading = $("model-loading");
    if (loading) {
      loading.hidden = false;
      loading.textContent = "正在載入 3D 模型…";
    }
    if (!host) return;
    host.hidden = false;

    /* 已載入同一個模型則不重複插入 iframe */
    var existing = host.querySelector("iframe");
    if (existing && existing.getAttribute("data-uid") === sf.uid) {
      if (loading) loading.hidden = true;
      setViewButtons("model");
      return;
    }

    host.innerHTML = "";
    var iframe = document.createElement("iframe");
    iframe.title = (sf.title || product.name) + " 3D";
    iframe.setAttribute("data-uid", sf.uid);
    iframe.setAttribute("allow", "autoplay; fullscreen; xr-spatial-tracking");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("mozallowfullscreen", "true");
    iframe.setAttribute("webkitallowfullscreen", "true");
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.src = buildEmbedSrc(sf.uid);

    iframe.addEventListener("load", function () {
      if (loading) loading.hidden = true;
    });

    /* 逾時提示（不阻擋使用） */
    window.setTimeout(function () {
      if (loading && !loading.hidden) {
        loading.textContent = "模型載入較慢，可繼續等待或切回圖片。";
      }
    }, 8000);

    host.appendChild(iframe);
    setViewButtons("model");
  }

  function renderCredit(sf) {
    var credit = $("model-credit");
    if (!credit || !sf) return;
    credit.hidden = false;
    var note = sf.note ? "（" + sf.note + "）" : "";
    credit.innerHTML =
      '3D 模型：<a href="' +
      sf.url +
      '" target="_blank" rel="noopener noreferrer">' +
      (sf.title || "Sketchfab") +
      "</a> by " +
      (sf.author || "Sketchfab") +
      " · via Sketchfab" +
      note;
  }

  function bindMediaTools(product) {
    var stage = $("product-media-stage");
    var tools = $("media-tools");
    var imgBtn = $("btn-view-image");
    var modelBtn = $("btn-view-3d");
    if (!stage || !product.sketchfab) {
      if (tools) tools.hidden = true;
      return;
    }
    if (tools) tools.hidden = false;
    renderCredit(product.sketchfab);
    setViewButtons("image");

    if (imgBtn) {
      imgBtn.addEventListener("click", function () {
        showImage(stage);
      });
    }
    if (modelBtn) {
      modelBtn.addEventListener("click", function () {
        showModel(stage, product);
      });
    }

    /* 深連結：product.html?id=apple&view=3d */
    var params = new URLSearchParams(window.location.search || "");
    if (params.get("view") === "3d") {
      showModel(stage, product);
    }

    /* 離開頁面時卸載 iframe，釋放 WebGL */
    window.addEventListener("pagehide", unloadModel);
  }

  function renderDetail(product) {
    document.title = "青禾超市｜" + product.name;
    if ($("pd-name")) $("pd-name").textContent = product.name;
    if ($("pd-category")) $("pd-category").textContent = product.category;
    if ($("pd-price")) $("pd-price").textContent = window.LaneMart.money(product.price);
    if ($("pd-was")) {
      if (product.was) {
        $("pd-was").hidden = false;
        $("pd-was").textContent = "原價 " + window.LaneMart.money(product.was);
      } else {
        $("pd-was").hidden = true;
      }
    }
    if ($("pd-unit")) $("pd-unit").textContent = product.unit || product.pack || "";
    if ($("pd-desc")) $("pd-desc").textContent = product.desc || "";
    if ($("pd-sku")) $("pd-sku").textContent = product.sku || product.id;
    if ($("pd-stock")) $("pd-stock").textContent = "庫存 " + (product.stock || 0) + " 件";
    if ($("pd-badge") && product.badge) {
      $("pd-badge").hidden = false;
      $("pd-badge").textContent = product.badge;
    }
    if ($("pd-points")) {
      $("pd-points").innerHTML = "";
      (product.points || []).forEach(function (t) {
        var li = document.createElement("li");
        li.textContent = t;
        $("pd-points").appendChild(li);
      });
    }
    if ($("pd-image")) {
      $("pd-image").src = product.image;
      $("pd-image").alt = product.name;
      $("pd-image").hidden = false;
    }
    var stage = $("product-media-stage");
    if (stage) {
      stage.setAttribute("data-product-id", product.id);
      stage.setAttribute("data-view", "image");
      stage.setAttribute("data-model", product.sketchfab ? product.sketchfab.uid : "");
    }
    if ($("pd-crumb")) $("pd-crumb").textContent = product.name;
    bindMediaTools(product);
  }

  function refreshSubtotal(product) {
    var qty = getQty();
    var preview = $("order-preview");
    var msg = $("order-msg");
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
    if (msg) msg.hidden = true;
    if (preview) {
      preview.innerHTML =
        "<p><strong>數量：</strong>" + qty + "</p>" +
        '<p class="total"><strong>小計：</strong>' +
        window.LaneMart.money(product.price * qty) + "</p>";
    }
  }

  function addToCart(product) {
    var qty = getQty();
    var msg = $("order-msg");
    var nameInput = $("customer-name");
    var name = nameInput ? nameInput.value.replace(/^\s+|\s+$/g, "") : "";
    if (!name) {
      showMsg(msg, "err", "請輸入姓名。");
      if (nameInput) nameInput.focus();
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
        name: product.name + (product.pack ? "（" + product.pack + "）" : ""),
        price: product.price,
        qty: qty,
        customer: name
      });
    }
    window.LaneMart.writeCart(cart);
    refreshSubtotal(product);
    showMsg(msg, "ok", "已加入購物車（目前 " + window.LaneMart.cartCount() + " 件）。");
  }

  ready(function () {
    if (!$("product-detail")) return;
    var product = (window.LaneMartCatalog || {})[queryId()];
    if (!product) {
      if ($("product-detail")) $("product-detail").hidden = true;
      if ($("product-missing")) $("product-missing").hidden = false;
      return;
    }
    renderDetail(product);
    refreshSubtotal(product);

    var qty = $("product-qty");
    function bump(d) {
      var q = parseInt(qty.value, 10);
      if (isNaN(q)) q = 1;
      qty.value = String(Math.max(1, Math.min(99, q + d)));
      refreshSubtotal(product);
    }
    if ($("qty-minus")) $("qty-minus").addEventListener("click", function () { bump(-1); });
    if ($("qty-plus")) $("qty-plus").addEventListener("click", function () { bump(1); });
    if (qty) {
      qty.addEventListener("input", function () { refreshSubtotal(product); });
      qty.addEventListener("change", function () { refreshSubtotal(product); });
    }
    if ($("btn-calc")) {
      $("btn-calc").addEventListener("click", function (e) {
        e.preventDefault();
        refreshSubtotal(product);
      });
    }
    if ($("btn-add")) {
      $("btn-add").addEventListener("click", function (e) {
        e.preventDefault();
        addToCart(product);
      });
    }
  });
})();
