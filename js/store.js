let cart=JSON.parse(localStorage.getItem("cart"))||[];let allProductsCache=[];
function saveCart(){localStorage.setItem("cart",JSON.stringify(cart));}
function updateCart(){const el=document.getElementById("cartCount");if(el)el.textContent=cart.reduce((s,i)=>s+i.qty,0);}
function addToCartById(productId){const p=allProductsCache.find(x=>String(x.id)===String(productId));if(!p)return showToast("Product unavailable");const ex=cart.find(i=>String(i.id)===String(productId));if(ex)ex.qty+=1;else cart.push({id:p.id,qty:1});saveCart();updateCart();showToast("Added to cart");}
function getDetailedCart(){return cart.map(i=>{const p=allProductsCache.find(x=>String(x.id)===String(i.id));return p?{...p,qty:i.qty}:null;}).filter(Boolean);}
function getCartTotals(){const d=getDetailedCart();const subtotal=d.reduce((s,i)=>s+(Number(i.price||0)*i.qty),0);const shipping=subtotal>1499||subtotal===0?0:99;return{subtotal,shipping,total:subtotal+shipping};}
function showToast(msg){const t=document.getElementById("toast");if(!t)return;t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200);}
updateCart();
