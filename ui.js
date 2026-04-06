async function fetchProducts(){const {data,error}=await window.supabaseClient.from("products").select("*").order("created_at",{ascending:false});if(error){console.error(error);return [];}return data||[];}
async function fetchProductById(id){const {data,error}=await window.supabaseClient.from("products").select("*").eq("id",id).single();if(error){console.error(error);return null;}return data;}
async function createOrder(payload){const {data,error}=await window.supabaseClient.from("orders").insert([payload]).select().single();if(error){console.error(error);throw error;}return data;}
function renderProducts(products) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  products.forEach(product => {
    const card = `
      <div class="product-card">
        <img src="${product.image_url}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>₹${product.price}</p>
        <button onclick="addToCart('${product.id}')">Add to Cart</button>
        <a href="product.html?id=${product.id}">View</a>
      </div>
    `;
    container.innerHTML += card;
  });
}
