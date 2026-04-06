function createProductCard(product) {
  const image = product.image_url || "https://via.placeholder.com/400x500?text=No+Image";
  const price = Number(product.price || 0).toLocaleString("en-IN");

  return `
    <div class="product-card">
      <img src="${image}" alt="${product.name}">
      <div class="product-category">${product.category || "Jewellery"}</div>
      <h3>${product.name}</h3>
      <div class="price">₹${price}</div>
      <div class="product-actions">
        <a href="product.html?id=${product.id}" class="view-btn">View</a>
        <button class="gold-btn" onclick="addToCart('${product.id}')">Add to Cart</button>
      </div>
    </div>
  `;
}

function renderProducts(products, containerId = "products-container") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  if (!products || products.length === 0) {
    container.innerHTML = `<div class="empty-message">No products found.</div>`;
    return;
  }

  products.forEach(product => {
    container.innerHTML += createProductCard(product);
  });
}
