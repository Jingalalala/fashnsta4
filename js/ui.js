function formatPrice(p){
  return `₹${Number(p || 0).toLocaleString("en-IN")}`;
}

function normalizeProduct(p = {}) {
  return {
    id: p.id,
    name: p.name || p.title || "Untitled Product",
    price: Number(p.price || 0),
    sale_price: p.sale_price ?? p.salePrice ?? null,
    oldprice: p.oldprice ?? p.sale_price ?? p.salePrice ?? null,
    image_url: p.image_url || p.image || p.imageUrl || 'assets/images/placeholder.jpg',
    description: p.description || p.desc || '',
    category: p.category || p.cat || 'Fashnsta Edit',
    stock: p.stock || p.qty || 0,
    badge: p.badge || '',
    featured: !!p.featured
  };
}

function productCard(rawProduct){
  const p = normalizeProduct(rawProduct);
  return `
    <div class="product-card">
      <a href="product.html?id=${p.id}">
        <div class="product-media">
          ${p.badge ? `<span class="tag">${p.badge}</span>` : ""}
          <img src="${p.image_url}" alt="${p.name}" loading="lazy" onerror="this.src='assets/images/placeholder.jpg'">
        </div>
        <div class="product-info">
          <p class="product-title">${p.name}</p>
          <p class="product-meta">${p.category}</p>
          <div class="price-row">
            <span class="price">${formatPrice(p.sale_price || p.price)}</span>
            ${(p.oldprice && Number(p.oldprice) > Number(p.sale_price || p.price)) ? `<span class="old-price">${formatPrice(p.oldprice)}</span>` : ""}
          </div>
        </div>
      </a>
      <div class="product-actions">
        <button class="btn gold full" onclick='addToCartById("${p.id}")'>Add to Cart</button>
      </div>
    </div>`;
}

function renderProducts(products){
  const grid = document.getElementById("productGrid");
  if(!grid) return;
  if(!products || !products.length){
    grid.innerHTML = `<p style="text-align:center;padding:40px;">No products found.</p>`;
    return;
  }
  grid.innerHTML = products.map(productCard).join("");
}
