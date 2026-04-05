async function loadProducts() {
  try {
    const products = await fetchProducts();
    allProductsCache = products || [];
    renderProducts(allProductsCache);
    updateCart();
  } catch (err) {
    console.error("Failed to load products:", err);
    const grid = document.getElementById("productGrid");
    if (grid) {
      grid.innerHTML = `<p style="text-align:center;padding:40px;color:red;">Failed to load products.</p>`;
    }
  }
}

loadProducts();
