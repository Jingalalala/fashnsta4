const checkoutItems=document.getElementById("checkoutItems");const checkoutForm=document.getElementById("checkoutForm");
async function preloadProducts(){allProductsCache=await fetchProducts();renderCheckoutSummary();updateCart();}
function initPaymentSelector(){const cards=document.querySelectorAll(".payment-card");const hidden=document.getElementById("coPayment");cards.forEach(card=>card.addEventListener("click",()=>{cards.forEach(c=>c.classList.remove("active"));card.classList.add("active");hidden.value=card.dataset.payment;}));}
function renderCheckoutSummary(){if(!checkoutItems)return;const detailed=getDetailedCart();const totals=getCartTotals();checkoutItems.innerHTML=!detailed.length?`<p>Your cart is empty.</p>`:detailed.map(item=>`<div class="summary-item"><img src="${item.image||'assets/images/placeholder.jpg'}"><div><strong>${item.name}</strong><p>${item.qty} × ₹${Number(item.price).toLocaleString("en-IN")}</p></div></div>`).join("");document.getElementById("subtotal").textContent=`₹${totals.subtotal.toLocaleString("en-IN")}`;document.getElementById("shipping").textContent=`₹${totals.shipping.toLocaleString("en-IN")}`;document.getElementById("total").textContent=`₹${totals.total.toLocaleString("en-IN")}`;}
function placeOrder() {
  const customerName = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const paymentMethod = document.getElementById("paymentMethod").value;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!customerName || !phone || !address || cart.length === 0) {
    alert("Please fill all fields and ensure cart is not empty.");
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);
  const shipping = 0;
  const finalTotal = subtotal + shipping;

  const orders = JSON.parse(localStorage.getItem("fashnta_orders")) || [];

  const newOrder = {
    orderId: "FS" + Date.now(),
    customerName,
    phone,
    address,
    paymentMethod,
    total: finalTotal,
    date: new Date().toLocaleString("en-IN"),
    status: "Pending",
    items: cart
  };

  orders.unshift(newOrder);

  localStorage.setItem("fashnta_orders", JSON.stringify(orders));
  localStorage.setItem("latestOrder", JSON.stringify(newOrder));
  localStorage.removeItem("cart");

  alert("Order placed successfully!");
  window.location.href = "invoice.html";
}
if(checkoutForm){checkoutForm.addEventListener("submit",async(e)=>{e.preventDefault();const detailed=getDetailedCart();const totals=getCartTotals();if(!detailed.length)return showToast("Your cart is empty");const payload={name:coName.value.trim(),email:coEmail.value.trim(),phone:coPhone.value.trim(),address:`${coAddress.value.trim()}, ${coCity.value.trim()} - ${coPin.value.trim()}`,customer_city:coCity.value.trim(),customer_pincode:coPin.value.trim(),items:detailed.map(i=>({id:i.id,name:i.name,price:i.price,qty:i.qty,image:i.image})),total:totals.total,payment:coPayment.value,status:"Pending",date:new Date().toLocaleString("en-IN")};try{const order=await createOrder(payload);localStorage.removeItem("cart");cart=[];updateCart();showToast(`Order placed: ${order.order_number||order.id}`);setTimeout(()=>window.location.href=`track.html?order=${order.id}`,1200);}catch(err){console.error(err);showToast("Failed to place order");}});}
preloadProducts();initPaymentSelector();
