function formatPrice(p){
  return `₹${Number(p || 0).toLocaleString("en-IN")}`;
}

function normalizeProduct(p) {
  return {
    id: p.id,
    name: p.name || "Untitled",
    price: p.price || 0,
    sale_price: p.oldprice || null,
    image_url: p.image || 'https://via.placeholder.com/300x300?text=No+Image',
    category: p.category || "Fashnsta",
    badge: p.badge || ""
  };
}

function productCard(raw){
  const p = normalizeProduct(raw);

  return `
    <div class="product-card">
      <a href="product.html?id=${p.id}">
        <img src="${p.image_url}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.category}</p>

        <div>
          <strong>${formatPrice(p.price)}</strong>
          ${p.sale_price ? `<span style="text-decoration:line-through;">${formatPrice(p.sale_price)}</span>` : ""}
        </div>
      </a>

      <button onclick='addToCartById("${p.id}")'>Add to Cart</button>
    </div>
  `;
}

function renderProducts(products){
  const grid = document.getElementById("productGrid");
  if(!grid) return;

  grid.innerHTML = products.map(productCard).join("");
}
