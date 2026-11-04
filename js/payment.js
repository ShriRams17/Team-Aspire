// Payment page (demo): reads the cart saved by the main page, "pays", then goes to tracking.
const money = (n) => "₹" + n.toLocaleString("en-IN");
const order = JSON.parse(localStorage.getItem("goPending") || "null");

// No cart? Go back to the shop.
if (!order) location.href = "index.html";

// Show the order summary
document.getElementById("summary").innerHTML =
  order.items.map((i) => `<div class="row"><span><img class="thumb" src="${i.img}" alt=""> ${i.name} × ${i.qty}</span><span>${money(i.price * i.qty)}</span></div>`).join("") +
  `<div class="row"><span>Discount</span><span>−${money(order.discount)}</span></div>` +
  `<div class="row"><span>Delivery</span><span>${order.delivery ? money(order.delivery) : "Free"}</span></div>` +
  `<div class="row total"><span>Total</span><span>${money(order.total)}</span></div>`;

// Show only the box for the chosen payment method
document.querySelectorAll("[name=method]").forEach((radio) => {
  radio.addEventListener("change", () => {
    document.getElementById("upiBox").hidden = radio.value !== "upi";
    document.getElementById("cardBox").hidden = radio.value !== "card";
    document.getElementById("codBox").hidden = radio.value !== "cod";
  });
});

// Check the form, then "pay"
document.getElementById("payForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const method = document.querySelector("[name=method]:checked").value;
  const error = document.getElementById("error");
  error.textContent = "";

  if (method === "upi" && !/^[\w.\-]+@[\w]+$/.test(document.getElementById("upi").value.trim())) {
    error.textContent = "Enter a valid UPI ID, like name@upi";
    return;
  }
  if (method === "card") {
    const digits = document.getElementById("cardNo").value.replace(/\s/g, "");
    if (!/^\d{16}$/.test(digits)) { error.textContent = "Card number must be 16 digits."; return; }
    if (!/^\d{2}\/\d{2}$/.test(document.getElementById("exp").value)) { error.textContent = "Expiry must look like 08/28."; return; }
    if (!/^\d{3}$/.test(document.getElementById("cvv").value)) { error.textContent = "CVV must be 3 digits."; return; }
  }

  // Pretend to process the payment for 1.5 seconds
  const btn = document.getElementById("payBtn");
  btn.disabled = true;
  btn.textContent = "Processing...";
  setTimeout(() => {
    order.id = "GO" + Math.floor(1000 + Math.random() * 9000);
    order.method = method;
    order.placedAt = Date.now();
    localStorage.setItem("goOrder", JSON.stringify(order));
    localStorage.removeItem("goPending");
    location.href = "track.html";
  }, 1500);
});
