const productDetails=document.getElementById("productDetails");
const relatedGrid=document.getElementById("relatedGrid");

function normalizeProductPage(data={}){
  return {
    id: data.id,
    name: data.name || data.title || "Untitled Product",
    price: Number(data.price || 0),
    oldprice: data.oldprice ?? data.sale_price ?? data.salePrice ?? null,
    image: data.image_url || data.image || data.imageUrl || 'assets/images/placeholder.jpg',
    description: data.description || data.desc || 'Luxury-crafted statement piece for elevated everyday styling.',
    category: data.category || data.cat || 'Fashnsta Edit'
  };
}

async function initProductPage(){
  updateCart();
  const params=new URLSearchParams(window.location.search);
  const productId=params.get("id");
  if(!productId){ productDetails.innerHTML=`<div class="luxury-card">Product not found</div>`; return; }
  const productRaw=await fetchProductById(productId);
  if(!productRaw){ productDetails.innerHTML=`<div class="luxury-card">Product not found</div>`; return; }
  const product = normalizeProductPage(productRaw);
  renderSingleProduct(product);
  const all=await fetchProducts();
  allProductsCache=all || [];
  if(relatedGrid) relatedGrid.innerHTML=(all || []).filter(p=>String(p.id)!==String(product.id)).slice(0,4).map(productCard).join("");
}

function renderSingleProduct(product){
  productDetails.innerHTML=`<div class="product-layout"><div class="product-main-image luxury-card"><img src="${product.image}" alt="${product.name}" onerror="this.src='assets/images/placeholder.jpg'"></div><div class="product-copy"><p class="eyebrow">${product.category}</p><h1>${product.name}</h1><div class="price-row"><span class="price">₹${Number(product.price||0).toLocaleString("en-IN")}</span>${product.oldprice?`<span class="old-price">₹${Number(product.oldprice).toLocaleString("en-IN")}</span>`:""}</div><p class="muted">${product.description}</p><div class="product-badges"><span>Premium Finish</span><span>Tarnish Resistant</span><span>Gift Ready</span></div><div class="product-cta-group"><button class="btn gold" onclick='addToCartById("${product.id}")'>Add to Cart</button><a href="checkout.html" class="btn ghost">Buy Now</a></div></div></div>`;
}
initProductPage();
