let cart = JSON.parse(localStorage.getItem("cart")) || [];
let allProductsCache = [];

function normalizeCartProduct(p = {}) {
  return {
    ...p,
    name: p.name || p.title || "Untitled Product",
    price: Number(p.price || 0),
    image: p.image_url || p.image || p.imageUrl || 'assets/images/placeholder.jpg',
    category: p.category || p.cat || 'Fashnsta Edit',
    description: p.description || p.desc || ''
  };
}

function saveCart(){ localStorage.setItem("cart", JSON.stringify(cart)); }
function updateCart(){ const el=document.getElementById("cartCount"); if(el) el.textContent=cart.reduce((s,i)=>s+Number(i.qty||0),0); }
function showToast(msg){ const t=document.getElementById("toast"); if(!t){ alert(msg); return; } t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200); }

function addToCartById(productId){
  const raw = allProductsCache.find(x=>String(x.id)===String(productId));
  if(!raw) return showToast("Product unavailable");
  const p = normalizeCartProduct(raw);
  const ex = cart.find(i=>String(i.id)===String(productId));
  if(ex) ex.qty += 1;
  else cart.push({id:p.id, qty:1, name:p.name, price:p.price, image:p.image, category:p.category});
  saveCart(); updateCart(); showToast("Added to cart");
}

function getDetailedCart(){
  return cart.map(i=>{
    const raw = allProductsCache.find(x=>String(x.id)===String(i.id));
    const p = raw ? normalizeCartProduct(raw) : i;
    return {...p, qty:Number(i.qty||1)};
  }).filter(Boolean);
}
function getCartTotals(){ const d=getDetailedCart(); const subtotal=d.reduce((s,i)=>s+(Number(i.price||0)*i.qty),0); const shipping=subtotal>1499||subtotal===0?0:99; return {subtotal,shipping,total:subtotal+shipping}; }
updateCart();
