/* LAZULE — commerce: basket + wishlist (localStorage), rendered bag & wishlist pages.
   Works on every page; only acts where its hooks exist. null-guarded throughout. */
(function () {
  "use strict";
  var CATALOG = window.LAZULE_CATALOG || {};
  var KEY_BAG = "lazule.basket";
  var KEY_WISH = "lazule.wishlist";

  function store(key, fallback) {
    try {
      var v = JSON.parse(window.localStorage.getItem(key));
      return v === null || v === undefined ? fallback : v;
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { window.localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode */ }
  }

  var basket = store(KEY_BAG, {});      // { slug: qty }
  var wishlist = store(KEY_WISH, []);  // [slug, ...]

  /* Site-root relative prefix, by URL depth (works live under /lazule/ and in local dev at /) */
  function prefix() {
    var parts = (window.location.pathname || "/").split("/").filter(Boolean);
    var depth = Math.max(1, parts.length - 1);
    var out = "";
    for (var i = 0; i < depth; i++) out += "../";
    return out;
  }
  function R() { return prefix(); }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function money(n) { return "AED " + Number(n).toLocaleString("en-US"); }
  function item(slug) { return CATALOG[slug] || null; }
  function bagCount() {
    var n = 0;
    for (var k in basket) { if (basket[k] > 0) n += basket[k]; }
    return n;
  }
  function bagSubtotal() {
    var t = 0;
    for (var k in basket) { var it = item(k); if (it) t += it.price * (basket[k] || 0); }
    return t;
  }

  var toastTimer = null;
  function toast(msg) {
    var t = document.getElementById("lazule-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "lazule-toast";
      t.setAttribute("role", "status");
      t.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps tracking-[0.2em] uppercase rounded-full opacity-0 transition-opacity duration-300 pointer-events-none whitespace-nowrap";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.remove("opacity-0");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.add("opacity-0"); }, 1700);
  }

  /* ---------- actions ---------- */
  function addToBag(slug, qty) {
    var it = item(slug);
    if (!it) return;
    qty = qty || 1;
    basket[slug] = (basket[slug] || 0) + qty;
    save(KEY_BAG, basket);
    refresh();
  }
  function setQty(slug, q) {
    q = Math.max(0, Math.min(9, q));
    if (q === 0) { delete basket[slug]; } else { basket[slug] = q; }
    save(KEY_BAG, basket);
    refresh();
  }
  function removeFromBag(slug) {
    delete basket[slug];
    save(KEY_BAG, basket);
    refresh();
  }
  function toggleWish(slug, btn) {
    var it = item(slug);
    if (!it) return;
    var i = wishlist.indexOf(slug);
    if (i === -1) {
      wishlist.push(slug);
      save(KEY_WISH, wishlist);
      toast("Saved to wishlist — " + it.name);
    } else {
      wishlist.splice(i, 1);
      save(KEY_WISH, wishlist);
      toast("Removed from wishlist");
    }
    refresh();
    if (btn) flash(btn, "Saved ✓");
  }
  function removeWish(slug) {
    wishlist = wishlist.filter(function (x) { return x !== slug; });
    save(KEY_WISH, wishlist);
    refresh();
  }
  function flash(el, txt) {
    if (!el || !el.textContent) return;
    if (el._orig === undefined) el._orig = el.textContent;
    el.textContent = txt;
    clearTimeout(el._h);
    el._h = setTimeout(function () { el.textContent = el._orig; }, 1200);
  }

  /* ---------- rendering ---------- */
  function renderBadges() {
    var b = bagCount(), w = wishlist.length;
    document.querySelectorAll("[data-lazule-bag-count]").forEach(function (el) {
      el.textContent = b;
      el.style.display = b ? "inline-flex" : "none";
    });
    document.querySelectorAll("[data-lazule-wish-count]").forEach(function (el) {
      el.textContent = w;
      el.style.display = w ? "inline-flex" : "none";
    });
  }

  function syncWishButtons() {
    document.querySelectorAll("[data-wish-btn]").forEach(function (btn) {
      var slug = btn.getAttribute("data-wish-btn");
      var inList = wishlist.indexOf(slug) !== -1;
      var label = btn.querySelector("[data-wish-label]");
      var ico = btn.querySelector("[data-wish-ico]");
      if (label) label.textContent = inList ? "Saved to Wishlist" : "Add to Wishlist";
      if (ico) ico.textContent = inList ? "favorite" : "favorite_border";
    });
    document.querySelectorAll("[data-wish-heart]").forEach(function (btn) {
      var slug = btn.getAttribute("data-wish-heart");
      var ico = btn.querySelector(".material-symbols-outlined");
      if (ico) ico.textContent = wishlist.indexOf(slug) !== -1 ? "favorite" : "favorite_border";
    });
  }

  function bagRow(slug, qty) {
    var it = item(slug);
    if (!it) return "";
    var r = R();
    var link = r + "product/" + slug + "/";
    return '<div class="flex items-center gap-space-sm sm:gap-space-md py-space-md border-b border-surface-container-highest/60">'
      + '<a class="shrink-0 w-20 h-20 bg-white flex items-center justify-center overflow-hidden" href="' + link + '">'
      + '<img class="w-full h-full object-contain p-2" src="' + r + it.img + '" alt="' + esc(it.name) + '"></a>'
      + '<div class="flex-1 min-w-0">'
      + '<a class="font-headline-sm text-headline-sm text-primary uppercase hover:text-secondary transition-colors" href="' + link + '">' + esc(it.name) + '</a>'
      + '<div class="font-label-price text-label-price text-primary mt-1">' + money(it.price) + '</div>'
      + '</div>'
      + '<div class="flex items-center gap-space-xs shrink-0">'
      + '<button data-qty-dec="' + slug + '" class="w-8 h-8 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors" type="button" aria-label="Decrease quantity">–</button>'
      + '<span class="min-w-[1.5rem] text-center font-label-caps text-label-caps" aria-live="polite">' + qty + '</span>'
      + '<button data-qty-inc="' + slug + '" class="w-8 h-8 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors" type="button" aria-label="Increase quantity">+</button>'
      + '</div>'
      + '<button data-bag-remove="' + slug + '" class="w-8 h-8 shrink-0 text-outline hover:text-error transition-colors" type="button" aria-label="Remove from bag"><span class="material-symbols-outlined text-[18px]">close</span></button>'
      + '</div>';
  }

  function renderBag() {
    var wrap = document.getElementById("lazule-bag-list");
    if (!wrap) return;
    var empty = document.getElementById("lazule-bag-empty");
    var sub = document.getElementById("lazule-bag-subtotal");
    var countEl = document.getElementById("lazule-bag-count");
    var slugs = Object.keys(basket).filter(function (k) { return basket[k] > 0 && item(k); });
    if (countEl) countEl.textContent = bagCount() + " article" + (bagCount() === 1 ? "" : "s") + " in the bag";
    if (empty) empty.style.display = slugs.length ? "none" : "";
    wrap.innerHTML = slugs.map(function (slug) { return bagRow(slug, basket[slug]); }).join("");
    var checkout = document.getElementById("lazule-bag-checkout");
    if (checkout) checkout.style.display = slugs.length ? "" : "none";
    if (sub) sub.textContent = money(bagSubtotal());
    var tot = document.getElementById("lazule-bag-total");
    if (tot) tot.textContent = money(bagSubtotal());
  }

  function renderWishlist() {
    var wrap = document.getElementById("lazule-wish-list");
    if (!wrap) return;
    var empty = document.getElementById("lazule-wish-empty");
    var countW = document.getElementById("lazule-wish-count");
    var slugs = wishlist.filter(function (s) { return item(s); });
    if (countW) countW.textContent = slugs.length + " piece" + (slugs.length === 1 ? "" : "s") + " inscribed so far";
    if (empty) empty.style.display = slugs.length ? "none" : "";
    var r = R();
    wrap.innerHTML = slugs.map(function (slug) {
      var it = item(slug);
      var link = r + "product/" + slug + "/";
      return '<div class="flex items-center gap-space-sm sm:gap-space-md py-space-md border-b border-surface-container-highest/60">'
        + '<a class="shrink-0 w-20 h-20 bg-white flex items-center justify-center overflow-hidden" href="' + link + '">'
        + '<img class="w-full h-full object-contain p-2" src="' + r + it.img + '" alt="' + esc(it.name) + '"></a>'
        + '<div class="flex-1 min-w-0">'
        + '<a class="font-headline-sm text-headline-sm text-primary uppercase hover:text-secondary transition-colors" href="' + link + '">' + esc(it.name) + '</a>'
        + '<div class="font-label-price text-label-price text-primary mt-1">' + money(it.price) + '</div>'
        + '</div>'
        + '<button data-wish-add="' + slug + '" class="shrink-0 border border-primary text-primary px-4 py-2 font-label-caps text-[10px] tracking-[0.15em] uppercase hover:bg-primary hover:text-on-primary transition-colors" type="button">Add to Bag</button>'
        + '<button data-wish-remove="' + slug + '" class="w-8 h-8 shrink-0 text-outline hover:text-error transition-colors" type="button" aria-label="Remove from wishlist"><span class="material-symbols-outlined text-[18px]">close</span></button>'
        + '</div>';
    }).join("");
  }

  function refresh() {
    renderBadges();
    renderBag();
    renderWishlist();
    syncWishButtons();
  }

  /* ---------- wiring ---------- */
  function boot() {
    refresh();
    document.addEventListener("click", function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      var bagBtn = t.closest("[data-add-bag]");
      if (bagBtn) { ev.preventDefault(); addToBag(bagBtn.getAttribute("data-add-bag"), 1); var it = item(bagBtn.getAttribute("data-add-bag")); toast(it ? "Added to bag — " + it.name : "Added to bag"); flash(bagBtn, "Added to Bag ✓"); return; }
      var quick = t.closest(".quick-add[data-slug]");
      if (quick) { ev.preventDefault(); addToBag(quick.getAttribute("data-slug"), 1); var i2 = item(quick.getAttribute("data-slug")); toast(i2 ? "Added to bag — " + i2.name : "Added to bag"); flash(quick, "Added to Bag ✓"); return; }
      var wishBtn = t.closest("[data-wish-btn], [data-wish-heart]");
      if (wishBtn) {
        ev.preventDefault();
        var slug = wishBtn.getAttribute("data-wish-btn") || wishBtn.getAttribute("data-wish-heart");
        toggleWish(slug, wishBtn);
        return;
      }
      var inc = t.closest("[data-qty-inc]");
      if (inc) { var s1 = inc.getAttribute("data-qty-inc"); setQty(s1, (parseInt(basket[s1] || "0", 10)) + 1); return; }
      var dec = t.closest("[data-qty-dec]");
      if (dec) { var s2 = dec.getAttribute("data-qty-dec"); setQty(s2, (parseInt(basket[s2] || "0", 10)) - 1); return; }
      var rem = t.closest("[data-bag-remove]");
      if (rem) { removeFromBag(rem.getAttribute("data-bag-remove")); toast("Removed from bag"); return; }
      var wadd = t.closest("[data-wish-add]");
      if (wadd) { var s3 = wadd.getAttribute("data-wish-add"); addToBag(s3, 1); var it3 = item(s3); toast(it3 ? "Added to bag — " + it3.name : "Added to bag"); return; }
      var wrem = t.closest("[data-wish-remove]");
      if (wrem) { removeWish(wrem.getAttribute("data-wish-remove")); toast("Removed from wishlist"); return; }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
