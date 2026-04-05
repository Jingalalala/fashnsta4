function formatPrice(p){
  return `₹${Number(p || 0).toLocaleString("en-IN")}`;
}

function productCard(p){
  return `
    <div class="product-card">
      <a href="product.html?id=${p.id}">
        <div class="product-media">
          ${p.badge ? `<span class="tag">${p.badge}</span>` : ""}
          <img src="${p.image_url || p.image || 'assets/images/placeholder.jpg'}" alt="${p.name}">
        </div>

        <div class="product-info">
          <p class="product-title">${p.name || "Untitled Product"}</p>
          <p class="product-meta">${p.category || 'Fashnsta Edit'}</p>

          <div class="price-row">
            <span class="price">${formatPrice(p.sale_price || p.price)}</span>
            ${(p.sale_price && p.price && Number(p.sale_price) < Number(p.price))
              ? `<span class="old-price">${formatPrice(p.price)}</span>`
              : ""}
          </div>
        </div>
      </a>

      <div class="product-actions">
        <button class="btn gold full" onclick='addToCartById("${p.id}")'>Add to Cart</button>
      </div>
    </div>
  `;
}

function renderProducts(products){
  const grid = document.getElementById("productGrid");
  if(!grid) return;

  if(!products || products.length === 0){
    grid.innerHTML = `<p style="text-align:center;padding:40px;">No products found.</p>`;
    return;
  }

  grid.innerHTML = products.map(productCard).join("");
}
