// -------------------------
// INIT
// -------------------------
const db = window.supabaseClient;

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
    loginMsg.textContent = "Access denied.";
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
  if (isAdmin) showAdmin();
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
  const { data: orders } = await db.from("orders").select("*");
  const { data: products } = await db.from("products").select("*");

  const totalRevenue = (orders || []).reduce((s, o) => s + Number(o.total || 0), 0);

  totalRevenueEl.textContent = `₹${totalRevenue.toFixed(2)}`;
  totalOrdersEl.textContent = orders?.length || 0;
  pendingOrdersEl.textContent = orders?.filter(o => o.status === "Pending").length || 0;
  totalProductsEl.textContent = products?.length || 0;

  renderRecentOrders((orders || []).slice(0, 5));
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
          <th>Order</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>${o.order_number}</td>
            <td>${o.customer_name}</td>
            <td>₹${Number(o.total).toFixed(2)}</td>
            <td>${o.status}</td>
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
    name: document.getElementById("productName").value,
    price: Number(document.getElementById("productPrice").value),
    stock: Number(document.getElementById("productStock").value)
  };

  let res;
  if (id) {
    res = await db.from("products").update(payload).eq("id", id);
  } else {
    res = await db.from("products").insert([payload]);
  }

  if (res.error) return alert(res.error.message);

  alert("Saved!");
  productForm.reset();
  loadProducts();
  loadDashboard();
});

async function loadProducts() {
  const { data } = await db.from("products").select("*");

  if (!data?.length) {
    productsTable.innerHTML = "<p>No products</p>";
    return;
  }

  productsTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
          <th>Stock</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${data.map(p => `
          <tr>
            <td>${p.name}</td>
            <td>₹${p.price}</td>
            <td>${p.stock}</td>
            <td>
              <button onclick="deleteProduct('${p.id}')">Delete</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

window.deleteProduct = async (id) => {
  await db.from("products").delete().eq("id", id);
  loadProducts();
};

// -------------------------
// ORDERS
// -------------------------
async function loadOrders() {
  const { data } = await db.from("orders").select("*");

  if (!data?.length) {
    ordersTable.innerHTML = "<p>No orders</p>";
    return;
  }

  ordersTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(o => `
          <tr>
            <td>${o.order_number}</td>
            <td>${o.customer_name}</td>
            <td>₹${o.total}</td>
            <td>${o.status}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// -------------------------
// REPORTS
// -------------------------
async function loadReports() {
  const { data } = await db.from("orders").select("*");

  const total = (data || []).reduce((s, o) => s + Number(o.total || 0), 0);

  todayRevenueEl.textContent = `₹${total}`;
  deliveredOrdersEl.textContent = data?.filter(o => o.status === "Delivered").length || 0;
  cancelledOrdersEl.textContent = data?.filter(o => o.status === "Cancelled").length || 0;
  avgOrderValueEl.textContent = `₹${(total / (data?.length || 1)).toFixed(2)}`;
}

// -------------------------
// EXPORT CSV
// -------------------------
exportOrdersBtn?.addEventListener("click", async () => {
  const { data } = await db.from("orders").select("*");

  if (!data?.length) return alert("No orders");

  const csv = data.map(o =>
    `${o.order_number},${o.customer_name},${o.total},${o.status}`
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "orders.csv";
  a.click();
});

// -------------------------
initAuth();
