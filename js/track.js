// Tracking page (demo): status moves forward automatically every 10 seconds.
const steps = [
  { icon: "✅", name: "Order placed", text: "We got your order." },
  { icon: "👨‍🍳", name: "Preparing", text: "The kitchen is cooking your food." },
  { icon: "🛵", name: "Out for delivery", text: "Your rider is on the way." },
  { icon: "🏠", name: "Delivered", text: "Enjoy your meal!" },
];
const SECONDS_PER_STEP = 10;
let timer;

function showOrder(order) {
  document.getElementById("result").hidden = false;
  document.getElementById("title").textContent = "Order " + order.id;
  document.getElementById("info").textContent =
    order.items.map((i) => i.name + " × " + i.qty).join(", ") + " · Total ₹" + order.total;

  function draw() {
    const current = Math.min(steps.length - 1, Math.floor((Date.now() - order.placedAt) / 1000 / SECONDS_PER_STEP));
    document.getElementById("timeline").innerHTML = steps.map((s, i) => {
      const cls = i < current || current === steps.length - 1 ? "done" : i === current ? "now" : "";
      return `<li class="${cls}"><span class="dot">${s.icon}</span><b>${s.name}</b>${s.text}</li>`;
    }).join("");
    if (current === steps.length - 1) clearInterval(timer);
  }
  draw();
  clearInterval(timer);
  timer = setInterval(draw, 1000);
}

function findOrder(id) {
  const order = JSON.parse(localStorage.getItem("goOrder") || "null");
  const msg = document.getElementById("msg");
  if (order && order.id === id.trim().toUpperCase()) {
    msg.textContent = "";
    showOrder(order);
  } else {
    msg.textContent = "Order not found. Check the ID and try again.";
    document.getElementById("result").hidden = true;
  }
}

document.getElementById("trackForm").addEventListener("submit", (e) => {
  e.preventDefault();
  findOrder(document.getElementById("orderId").value);
});

// If we just came from payment, show the latest order straight away
const last = JSON.parse(localStorage.getItem("goOrder") || "null");
if (last) {
  document.getElementById("orderId").value = last.id;
  showOrder(last);
}
