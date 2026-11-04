
(function () {
  "use strict";


  const dishes = [
    { id: 1, name: "Margherita Pizza", desc: "Homemade pizza with basil", price: 299, cat: "pizza", img: "images/food/Margherita_Pizza.jpg", rating: 4.6 },
    { id: 2, name: "Pepperoni Pizza", desc: "Spicy pepperoni, extra cheese", price: 399, cat: "pizza", img: "images/food/Pepperoni_Pizza.jpg", rating: 4.7 },
    { id: 3, name: "Shrimp Pasta", desc: "Garlic butter shrimp, penne", price: 349, cat: "pasta", img: "images/food/Shrimp_Pasta.jpg", rating: 4.5 },
    { id: 4, name: "Creamy Alfredo", desc: "Fettuccine in parmesan cream", price: 279, cat: "pasta", img: "images/food/Creamy_Alfredo.jpg", rating: 4.4 },
    { id: 5, name: "Chicken Burger", desc: "Crispy chicken, lettuce, mayo", price: 199, cat: "burger", img: "images/food/Chicken_Burger.jpg", rating: 4.5 },
    { id: 6, name: "Veg Burger", desc: "Spiced patty, tomato, cheese", price: 169, cat: "burger", img: "images/food/Veg_Burger.jpg", rating: 4.3 },
    { id: 7, name: "Cold Coffee", desc: "Iced coffee with cream", price: 129, cat: "drinks", img: "images/food/Cold_Coffee.jpg", rating: 4.6 },
    { id: 8, name: "Choco Brownie", desc: "Warm brownie, chocolate drizzle", price: 149, cat: "desserts", img: "images/food/Choco_Brownie.jpg", rating: 4.8 },
  ];
  // Coupons: percent off the subtotal, or flat amount off with a minimum order
  const coupons = {
    FAST10: { label: "10% off", off: (sub) => Math.round(sub * 0.1), min: 0 },
    SAVE50: { label: "₹50 off", off: () => 50, min: 400 },
  };
  const FREE_DELIVERY_ABOVE = 500, DELIVERY_FEE = 40;

  const $ = (s) => document.querySelector(s);
  const money = (n) => "₹" + n.toLocaleString("en-IN");

  const state = { category: "all", query: "", cart: {}, coupon: null };

  // ---------- Menu: render + filter + search ----------
  function renderMenu() {
    const q = state.query.trim().toLowerCase();
    const list = dishes.filter((d) =>
      (state.category === "all" || d.cat === state.category) &&
      (!q || (d.name + " " + d.desc + " " + d.cat).toLowerCase().includes(q)));

    $("#grid").innerHTML = list.length
      ? list.map((d) => `
        <article class="card">
          <div class="card__img"><img src="${d.img}" alt="${d.name}" loading="lazy"></div>
          <span class="card__rating">★ ${d.rating}</span>
          <h3>${d.name}</h3>
          <p>${d.desc}</p>
          <div class="card__foot">
            <strong>${money(d.price)}</strong>
            <button class="add" data-id="${d.id}" aria-label="Add ${d.name} to cart">+</button>
          </div>
        </article>`).join("")
      : '<p class="grid__empty">No food matches your search. Try another word or category.</p>';
  }

 
  function totals() {
    const sub = Object.entries(state.cart).reduce((s, [id, qty]) => s + dishes.find((d) => d.id == id).price * qty, 0);
    const c = state.coupon && coupons[state.coupon];
    const discount = c && sub >= c.min ? Math.min(c.off(sub), sub) : 0;
    const delivery = sub === 0 || sub - discount >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    return { sub, discount, delivery, total: sub - discount + delivery };
  }

  function renderCart() {
    const ids = Object.keys(state.cart);
    const count = ids.reduce((n, id) => n + state.cart[id], 0);
    $("#cartCount").textContent = count;
    $("#placeOrder").disabled = count === 0;

    $("#cartItems").innerHTML = ids.length
      ? ids.map((id) => {
          const d = dishes.find((x) => x.id == id);
          return `<div class="line">
            <img class="line__icon" src="${d.img}" alt="">
            <div><div class="line__name">${d.name}</div><div class="line__price">${money(d.price)} each</div></div>
            <div class="qty">
              <button data-act="dec" data-id="${id}" aria-label="Remove one ${d.name}">−</button>
              <span aria-live="polite">${state.cart[id]}</span>
              <button data-act="inc" data-id="${id}" aria-label="Add one ${d.name}">+</button>
            </div></div>`;
        }).join("")
      : '<p class="drawer__empty">Your cart is empty.<br>Add something tasty!</p>';

    const t = totals();
    $("#subtotal").textContent = money(t.sub);
    $("#discount").textContent = "−" + money(t.discount);
    $("#delivery").textContent = t.delivery ? money(t.delivery) : "Free";
    $("#total").textContent = money(t.total);
  }

  function changeQty(id, delta) {
    const next = (state.cart[id] || 0) + delta;
    if (next <= 0) delete state.cart[id]; else state.cart[id] = next;
    renderCart();
  }

  // ---------- Drawer open/close ----------
  function setDrawer(open) {
    $("#drawer").classList.toggle("is-open", open);
    $("#drawer").setAttribute("aria-hidden", String(!open));
    $("#overlay").hidden = !open;
    if (open) $("#closeCart").focus(); else $("#cartBtn").focus();
  }

  // ---------- Coupons ----------
  function applyCoupon(code) {
    const msg = $("#couponMsg");
    code = code.trim().toUpperCase();
    if (!code) { msg.textContent = "Enter a coupon code."; return; }
    const c = coupons[code];
    if (!c) { state.coupon = null; msg.textContent = "Sorry, that code isn't valid."; }
    else if (totals().sub < c.min) { state.coupon = null; msg.textContent = `${code} needs an order of at least ${money(c.min)}.`; }
    else { state.coupon = code; msg.textContent = `${code} applied: ${c.label}.`; }
    $("#coupon").value = code;
    renderCart();
  }

  // ---------- Init: wire up events ----------
  function init() {
    $("#year").textContent = new Date().getFullYear();
    renderMenu();
    renderCart();

    $("#chips").addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      state.category = chip.dataset.cat;
      document.querySelectorAll(".chip").forEach((c) => {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
      renderMenu();
    });

    $("#search").addEventListener("input", (e) => {
      state.query = e.target.value;
      renderMenu();
      if (state.query) location.hash === "#menu" || $("#menu").scrollIntoView({ behavior: "smooth" });
    });

    $("#grid").addEventListener("click", (e) => {
      const btn = e.target.closest(".add");
      if (!btn) return;
      changeQty(btn.dataset.id, 1);
      btn.textContent = "✓";
      setTimeout(() => { btn.textContent = "+"; }, 700);   // brief "added" feedback
    });

    $("#cartItems").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (btn) changeQty(btn.dataset.id, btn.dataset.act === "inc" ? 1 : -1);
    });

    // Mobile menu: open/close the dropdown links
    function setMenu(open) {
      $("#mainNav").classList.toggle("is-open", open);
      $("#menuBtn").classList.toggle("is-open", open);
      $("#menuBtn").setAttribute("aria-expanded", String(open));
      $("#menuBtn").setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    $("#menuBtn").addEventListener("click", () => setMenu(!$("#mainNav").classList.contains("is-open")));
    $("#mainNav").addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });  // close after tapping a link

    $("#cartBtn").addEventListener("click", () => setDrawer(true));
    $("#closeCart").addEventListener("click", () => setDrawer(false));
    $("#overlay").addEventListener("click", () => setDrawer(false));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { setMenu(false); if ($("#drawer").classList.contains("is-open")) setDrawer(false); }
    });

    $("#couponForm").addEventListener("submit", (e) => { e.preventDefault(); applyCoupon($("#coupon").value); });

    // Offer buttons: apply a code, or scroll to the menu
    document.querySelectorAll(".offer .btn").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.scroll) { $(b.dataset.scroll).scrollIntoView({ behavior: "smooth" }); return; }
      $("#coupon").value = b.dataset.code;
      setDrawer(true);
      applyCoupon(b.dataset.code);
    }));

    // Place order: save the cart in localStorage, then go to the payment page
    $("#placeOrder").addEventListener("click", () => {
      const t = totals();
      const items = Object.keys(state.cart).map((id) => {
        const d = dishes.find((x) => x.id == id);
        return { name: d.name, img: d.img, price: d.price, qty: state.cart[id] };
      });
      localStorage.setItem("goPending", JSON.stringify({ items, ...t }));
      location.href = "payment.html";
    });
  }

  init();
})();
