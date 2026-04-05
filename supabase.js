let allProductsCache = [];

function getCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("category");
}

async function loadProducts(){
  try {
    const products = await fetchProducts();
    allProductsCache = products || [];

    const selectedCategory = getCategoryFromURL();

    if (selectedCategory) {
      const filtered = allProductsCache.filter(p =>
        (p.category || "").toLowerCase().includes(selectedCategory.toLowerCase())
      );
      renderProducts(filtered);
    } else {
      renderProducts(allProductsCache);
    }

    updateCart();
  } catch (err) {
    console.error("Failed to load products:", err);
    const grid = document.getElementById("productGrid");
    if (grid) grid.innerHTML = `<p style="text-align:center;padding:40px;color:red;">Failed to load products.</p>`;
  }
}

loadProducts();
