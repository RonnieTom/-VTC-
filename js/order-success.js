/* 付款成功頁 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function $(id) {
    return document.getElementById(id);
  }

  function formatTime(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      function pad(n) {
        n = String(n);
        return n.length < 2 ? "0" + n : n;
      }
      return (
        d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
        " " + pad(d.getHours()) + ":" + pad(d.getMinutes())
      );
    } catch (e) {
      return iso;
    }
  }

  ready(function () {
    if (!$("success-panel")) return;

    var params = new URLSearchParams(window.location.search || "");
    var id = params.get("order") || "";
    var orders = window.LaneMart.readOrders();
    var order = null;

    if (id) {
      for (var i = 0; i < orders.length; i++) {
        if (orders[i].id === id) {
          order = orders[i];
          break;
        }
      }
    }
    if (!order && orders.length) order = orders[0];

    if (!order) {
      $("success-panel").hidden = true;
      if ($("success-missing")) $("success-missing").hidden = false;
      return;
    }

    var name = (order.customer && order.customer.name) || "顧客";
    var lead =
      name + "，訂單 <strong>" + order.id + "</strong> 已建立。" +
      (order.payMethod === "cod"
        ? "請於取貨時付款 " + window.LaneMart.money(order.grand) + "。"
        : "已模擬扣款 " + window.LaneMart.money(order.grand) + "。");
    if ($("success-lead")) $("success-lead").innerHTML = lead;

    var lines = (order.items || []).map(function (it) {
      return (
        "<tr><td>" + it.name + "</td>" +
        '<td class="num">' + it.qty + "</td>" +
        '<td class="num">' + window.LaneMart.money((Number(it.price) || 0) * (parseInt(it.qty, 10) || 0)) +
        "</td></tr>"
      );
    }).join("");

    if ($("success-summary")) {
      $("success-summary").innerHTML =
        '<p class="small" style="margin:0 0 8px;">下單時間：' + formatTime(order.at) +
        "　付款方式：" + (order.payMethodLabel || order.payMethod || "—") +
        "　狀態：" + (order.status || "已付款") + "</p>" +
        '<table class="data"><thead><tr><th>商品</th><th>數量</th><th>小計</th></tr></thead><tbody>' +
        lines +
        "</tbody></table>" +
        "<p><strong>商品小計：</strong>" + window.LaneMart.money(order.subtotal) + "</p>" +
        "<p><strong>運費：</strong>" +
        (order.shipping === 0 ? "免運費" : window.LaneMart.money(order.shipping)) + "</p>" +
        '<p class="total"><strong>應付總額：</strong>' + window.LaneMart.money(order.grand) + "</p>";
    }
  });
})();
