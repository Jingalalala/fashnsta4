// -------------------------
// INIT
// -------------------------
const db = window.supabaseClient;

if (!db) {
  console.error("Supabase client not found. Check js/supabase.js path and config.");
  alert("Supabase not connected. Check js/supabase.js");
}

// -------------------------
// DOM
// -------------------------
const loginScreen = document.getElementById("loginScreen");
const adminApp = document.getElementById("adminApp");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginMsg = document.getElementById("loginMsg");

const pageTitle = document.getElementById("pageTitle");
const navButtons = document.querySelectorAll(".nav-btn");
const tabSections = document.querySelectorAll(".tab-section");

const productForm = document.getElementById("productForm");
const resetProductBtn = document.getElementById("resetProductBtn");
const globalSearch = document.getElementById("globalSearch");
const exportOrdersBtn = document.getElementById("exportOrdersBtn");

// Dashboard
const totalRevenueEl = document.getElementById("totalRevenue");
const totalOrdersEl = document.getElementById("totalOrders");
const pendingOrdersEl = document.getElementById("pendingOrders");
const totalProductsEl = document.getElementById("totalProducts");

// Reports
const todayRevenueEl = document.getElementById("todayRevenue");
const deliveredOrdersEl = document.getElementById("deliveredOrders");
const cancelledOrdersEl = document.getElementById("cancelledOrders");
const avgOrderValueEl = document.getElementById("avgOrderValue");
const salesSummaryEl = document.getElementById("salesSummary");

// Tables
const productsTable = document.getElementById("productsTable");
const ordersTable = document.getElementById("ordersTable");
const recentOrdersTable = document.getElementById("recentOrdersTable");

let allProducts = [];
let allOrders = [];

// -------------------------
// LOGIN
// -------------------------
loginBtn?.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  loginMsg.textContent = "";

  if (!email || !password) {
    loginMsg.textContent = "Enter email and password.";
    return;
  }

  const { data, error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMsg.textContent = error.message;
    return;
  }

  const isAdmin = await checkAdmin(data.user.email);

  if (!isAdmin) {
    await db.auth.signOut();
    loginMsg.textContent = "Access denied. Not admin.";
    return;
  }

  showAdmin();
});

logoutBtn?.addEventListener("click", async () => {
  await db.auth.signOut();
  location.reload();
});

async function checkAdmin(email) {
  const { data, error } = await db
    .from("admin_users")
    .select("*")
    .eq("email", email)
    .single();

  return !!data && !error;
}

async function initAuth() {
  const { data } = await db.auth.getSession();
  const user = data?.session?.user;

  if (!user) return;

  const isAdmin = await checkAdmin(user.email);
  if (isAdmin) {
    showAdmin();
  }
}

function showAdmin() {
  loginScreen.classList.add("hidden");
  adminApp.classList.remove("hidden");
  loadAllData();
}

// -------------------------
// NAVIGATION
// -------------------------
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;
    pageTitle.textContent = btn.textContent;

    tabSections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
  });
});

// -------------------------
// LOAD ALL
// -------------------------
async function loadAllData() {
  await Promise.all([
    loadDashboard(),
    loadProducts(),
    loadOrders(),
    loadReports()
  ]);
}

// -------------------------
// DASHBOARD
// -------------------------
async function loadDashboard() {
  const { data: orders } = await db
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: products } = await db
    .from("products")
    .select("*");

  allOrders = orders || [];
  allProducts = products || [];

  const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalOrders = allOrders.length;
  const pendingOrders = allOrders.filter(o => o.status === "Pending").length;
  const totalProducts = allProducts.length;

  totalRevenueEl.textContent = `₹${totalRevenue.toFixed(2)}`;
  totalOrdersEl.textContent = totalOrders;
  pendingOrdersEl.textContent = pendingOrders;
  totalProductsEl.textContent = totalProducts;

  renderRecentOrders(allOrders.slice(0, 5));
}

function renderRecentOrders(orders) {
  if (!orders.length) {
    recentOrdersTable.innerHTML = "<p>No recent orders.</p>";
    return;
  }

  recentOrdersTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Order #</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td>${order.order_number || "-"}</td>
            <td>${order.customer_name || "-"}</td>
            <td>₹${Number(order.total || 0).toFixed(2)}</td>
            <td>${order.status || "-"}</td>
            <td>${formatDate(order.created_at)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// -------------------------
// PRODUCTS
// -------------------------
productForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("productId").value;

  const payload = {
    name: document.getElementById("productName").value.trim(),
    slug: document.getElementById("productSlug").value.trim(),
    description: document.getElementById("productDescription").value.trim(),
    price: Number(document.getElementById("productPrice").value || 0),
    sale_price: Number(document.getElementById("productSalePrice").value || 0),
    category: document.getElementById("productCategory").value.trim(),
    image_url: document.getElementById("productImage").value.trim(),
    stock: Number(document.getElementById("productStock").value || 0),
    sku: document.getElementById("productSKU").value.trim(),
    status: document.getElementById("productStatus").value,
    featured: document.getElementById("productFeatured").checked,
    best_seller: document.getElementById("productBestSeller").checked
  };

  let result;

  if (id) {
    result = await db.from("products").update(payload).eq("id", id);
  } else {
    result = await db.from("products").insert([payload]);
  }

  if (result.error) {
    alert("Error: " + result.error.message);
    return;
  }

  alert("Product saved successfully!");
  resetProductForm();
  await loadProducts();
  await loadDashboard();
  await loadReports();
});

resetProductBtn?.addEventListener("click", resetProductForm);

function resetProductForm() {
  productForm.reset();
  document.getElementById("productId").value = "";
}

async function loadProducts() {
  const { data, error } = await db
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    productsTable.innerHTML = "<p>Failed to load products.</p>";
    return;
  }

  allProducts = data || [];
  renderProducts(allProducts);
}

function renderProducts(products) {
  if (!products.length) {
    productsTable.innerHTML = "<p>No products found.</p>";
    return;
  }

  productsTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(product => `
          <tr>
            <td>${product.name || "-"}</td>
            <td>${product.category || "-"}</td>
            <td>₹${Number(product.price || 0).toFixed(2)}</td>
            <td>${product.stock || 0}</td>
            <td>${product.status || "-"}</td>
            <td>
              <button class="action-btn edit-btn" onclick="editProduct('${product.id}')">Edit</button>
              <button class="action-btn delete-btn" onclick="deleteProduct('${product.id}')">Delete</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

window.editProduct = function(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;

  document.getElementById("productId").value = p.id || "";
  document.getElementById("productName").value = p.name || "";
  document.getElementById("productSlug").value = p.slug || "";
  document.getElementById("productDescription").value = p.description || "";
  document.getElementById("productPrice").value = p.price || "";
  document.getElementById("productSalePrice").value = p.sale_price || "";
  document.getElementById("productCategory").value = p.category || "";
  document.getElementById("productImage").value = p.image_url || "";
  document.getElementById("productStock").value = p.stock || "";
  document.getElementById("productSKU").value = p.sku || "";
  document.getElementById("productStatus").value = p.status || "active";
  document.getElementById("productFeatured").checked = !!p.featured;
  document.getElementById("productBestSeller").checked = !!p.best_seller;

  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
};

window.deleteProduct = async function(id) {
  const ok = confirm("Delete this product?");
  if (!ok) return;

  const { error } = await db.from("products").delete().eq("id", id);

  if (error) {
    alert("Delete failed: " + error.message);
    return;
  }

  await loadProducts();
  await loadDashboard();
  await loadReports();
};

// -------------------------
// ORDERS
// -------------------------
async function loadOrders() {
  const { data, error } = await db
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    ordersTable.innerHTML = "<p>Failed to load orders.</p>";
    return;
  }

  allOrders = data || [];
  renderOrders(allOrders);
}

function renderOrders(orders) {
  if (!orders.length) {
    ordersTable.innerHTML = "<p>No orders found.</p>";
    return;
  }

  ordersTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Order #</th>
          <th>Customer</th>
          <th>Phone</th>
          <th>Total</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td>${order.order_number || "-"}</td>
            <td>${order.customer_name || "-"}</td>
            <td>${order.phone || "-"}</td>
            <td>₹${Number(order.total || 0).toFixed(2)}</td>
            <td>${order.payment_method || "-"}</td>
            <td>
              <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                ${["Pending","Confirmed","Packed","Shipped","Out for Delivery","Delivered","Cancelled"].map(status => `
                  <option value="${status}" ${order.status === status ? "selected" : ""}>${status}</option>
                `).join("")}
              </select>
            </td>
            <td>${formatDate(order.created_at)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

window.updateOrderStatus = async function(id, status) {
  const { error } = await db
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    alert("Failed to update order status.");
    return;
  }

  await loadOrders();
  await loadDashboard();
  await loadReports();
};

// -------------------------
// REPORTS
// -------------------------
async function loadReports() {
  const { data: orders } = await db.from("orders").select("*");
  const all = orders || [];

  const today = new Date().toISOString().slice(0, 10);

  const todayOrders = all.filter(o =>
    (o.created_at || "").slice(0, 10) === today
  );

  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const delivered = all.filter(o => o.status === "Delivered").length;
  const cancelled = all.filter(o => o.status === "Cancelled").length;
  const totalRevenue = all.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const avgOrderValue = all.length ? totalRevenue / all.length : 0;

  todayRevenueEl.textContent = `₹${todayRevenue.toFixed(2)}`;
  deliveredOrdersEl.textContent = delivered;
  cancelledOrdersEl.textContent = cancelled;
  avgOrderValueEl.textContent = `₹${avgOrderValue.toFixed(2)}`;

  salesSummaryEl.innerHTML = `
    <p><strong>Total Revenue:</strong> ₹${totalRevenue.toFixed(2)}</p>
    <p><strong>Total Orders:</strong> ${all.length}</p>
    <p><strong>Delivered Orders:</strong> ${delivered}</p>
    <p><strong>Cancelled Orders:</strong> ${cancelled}</p>
    <p><strong>Average Order Value:</strong> ₹${avgOrderValue.toFixed(2)}</p>
  `;
}

// -------------------------
// SEARCH
// -------------------------
globalSearch?.addEventListener("input", () => {
  const query = globalSearch.value.trim().toLowerCase();

  const filteredProducts = allProducts.filter(p =>
    (p.name || "").toLowerCase().includes(query) ||
    (p.category || "").toLowerCase().includes(query) ||
    (p.sku || "").toLowerCase().includes(query)
  );

  const filteredOrders = allOrders.filter(o =>
    (o.order_number || "").toLowerCase().includes(query) ||
    (o.customer_name || "").toLowerCase().includes(query) ||
    (o.phone || "").toLowerCase().includes(query)
  );

  renderProducts(filteredProducts);
  renderOrders(filteredOrders);
});

// -------------------------
// EXPORT CSV
// -------------------------
exportOrdersBtn?.addEventListener("click", async () => {
  const { data: orders, error } = await db
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !orders?.length) {
    alert("No orders to export.");
    return;
  }

  const headers = [
    "Order Number",
    "Customer Name",
    "Phone",
    "Email",
    "Total",
    "Payment Method",
    "Status",
    "Date"
  ];

  const rows = orders.map(o => [
    o.order_number || "",
    o.customer_name || "",
    o.phone || "",
    o.email || "",
    o.total || 0,
    o.payment_method || "",
    o.status || "",
    formatDate(o.created_at)
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "orders-report.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// -------------------------
// HELPERS
// -------------------------
function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
}

// -------------------------
// INIT
// -------------------------
initAuth();
