async function loadFeaturedProducts() {
  const featuredContainer = document.getElementById("featured-products");
  if (!featuredContainer) return;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Featured products error:", error);
    featuredContainer.innerHTML = `<div class="empty-message">Unable to load featured products.</div>`;
    return;
  }

  renderProducts(data, "featured-products");
}

async function loadShopProducts() {
  const shopContainer = document.getElementById("products-container");
  if (!shopContainer) return;

  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const collection = params.get("collection");

  const titleEl = document.getElementById("shop-title");
  const subtitleEl = document.getElementById("shop-subtitle");

  let query = supabase.from("products").select("*");

  if (category) {
    query = query.eq("category", category);
    if (titleEl) titleEl.textContent = category.replace("-", " ").toUpperCase();
    if (subtitleEl) subtitleEl.textContent = `Showing products in ${category.replace("-", " ")}.`;
  }

  if (collection) {
    query = query.eq("collection", collection);
    if (titleEl) titleEl.textContent = collection
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());

    if (subtitleEl) subtitleEl.textContent = `Showing products from the ${collection.replace(/-/g, " ")} collection.`;
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Shop products error:", error);
    shopContainer.innerHTML = `<div class="empty-message">Unable to load products.</div>`;
    return;
  }

  renderProducts(data, "products-container");
}

document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedProducts();
  loadShopProducts();
});
