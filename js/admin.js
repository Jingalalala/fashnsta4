/*******************************
 * FASHNTA ADMIN PANEL - ROLE BASED
 *******************************/


const supabase = window.sb;
// =============================
// STORAGE KEYS
// =============================
const ADMIN_SESSION_KEY = "fashnta_admin_logged_in";
const ADMIN_USER_KEY = "fashnta_admin_user";
const ADMIN_ROLE_KEY = "fashnta_admin_role";
const ORDERS_KEY = "fashnta_orders";

// =============================
// DOM
// =============================
const loginScreen = document.getElementById("adminLoginScreen");
const adminPanel = document.getElementById("adminPanel");
const adminUidInput = document.getElementById("adminUid");
const adminPasswordInput = document.getElementById("adminPassword");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminLoginError = document.getElementById("adminLoginError");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const ordersTableBody = document.getElementById("ordersTableBody");
const searchOrders = document.getElementById("searchOrders");
const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");

const totalOrdersEl = document.getElementById("totalOrders");
const pendingOrdersEl = document.getElementById("pendingOrders");
const shippedOrdersEl = document.getElementById("shippedOrders");
const deliveredOrdersEl = document.getElementById("deliveredOrders");
const loggedInAdmin = document.getElementById("loggedInAdmin");

// =============================
// INIT
// =============================
document.addEventListener("DOMContentLoaded", async () => {
  await checkAdminSession();

  adminLoginBtn?.addEventListener("click", handleAdminLogin);
  adminLogoutBtn?.addEventListener("click", handleAdminLogout);
  refreshOrdersBtn?.addEventListener("click", renderOrders);
  searchOrders?.addEventListener("input", renderOrders);

  adminPasswordInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleAdminLogin();
  });

  adminUidInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleAdminLogin();
  });
});

// =============================
// AUTH HELPERS
// =============================
function getCurrentRole() {
  return localStorage.getItem(ADMIN_ROLE_KEY) || "staff";
}

function getCurrentUser() {
  return localStorage.getItem(ADMIN_USER_KEY) || "Admin";
}

function canDeleteOrders() {
  return ["owner"].includes(getCurrentRole());
}

function canUpdateOrders() {
  return ["owner", "manager", "staff"].includes(getCurrentRole());
}

// =============================
// LOGIN
// =============================
async function handleAdminLogin() {
  try {
    const username = adminUidInput?.value.trim();
    const password = adminPasswordInput?.value.trim();

    adminLoginError.textContent = "";

    if (!username || !password) {
      adminLoginError.textContent = "Enter username and password";
      return;
    }

    const email = `${username}@fashnta.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data?.user) {
      adminLoginError.textContent = error?.message || "Invalid Username or Password";
      return;
    }

    const { data: adminUser, error: roleError } = await supabase
      .from("admin_users")
      .select("username, role, email")
      .eq("email", email)
      .single();

    if (roleError || !adminUser) {
      adminLoginError.textContent = "Admin access not assigned";
      await supabase.auth.signOut();
      return;
    }

    localStorage.setItem(ADMIN_SESSION_KEY, "true");
    localStorage.setItem(ADMIN_USER_KEY, adminUser.username || username);
    localStorage.setItem(ADMIN_ROLE_KEY, adminUser.role || "staff");

    showAdminPanel();
    await renderOrders();
  } catch (err) {
    console.error("Login error:", err);
    adminLoginError.textContent = "Login failed. Try again.";
  }
}

// =============================
// LOGOUT
// =============================
async function handleAdminLogout() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Logout warning:", err);
  }

  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  localStorage.removeItem(ADMIN_ROLE_KEY);

  window.location.href = "index.html";
}

// =============================
// SESSION CHECK
// =============================
async function checkAdminSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data || !data.session) {
      showLoginScreen();
      return;
    }

    const user = data.session.user;
    const email = user.email;

    const { data: adminUser, error: roleError } = await supabase
      .from("admin_users")
      .select("username, role, email")
      .eq("email", email)
      .single();

    if (roleError || !adminUser) {
      await supabase.auth.signOut();
      showLoginScreen();
      return;
    }

    localStorage.setItem(ADMIN_SESSION_KEY, "true");
    localStorage.setItem(ADMIN_USER_KEY, adminUser.username || "Admin");
    localStorage.setItem(ADMIN_ROLE_KEY, adminUser.role || "staff");

    showAdminPanel();
    await renderOrders();
  } catch (err) {
    console.error("Session check error:", err);
    showLoginScreen();
  }
}

// =============================
// UI
// =============================
function showAdminPanel() {
  loginScreen?.classList.add("hidden");
  adminPanel?.classList.remove("hidden");

  if (loggedInAdmin) {
    loggedInAdmin.textContent = `Logged in as: ${getCurrentUser()} (${getCurrentRole()})`;
  }
}

function showLoginScreen() {
  adminPanel?.classList.add("hidden");
  loginScreen?.classList.remove("hidden");
}

// =============================
// ORDER DATA
// =============================
async function getOrders() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Supabase orders fetch failed, using localStorage:", err);

    const localOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(localOrders) ? localOrders : [];
  }
}

function saveOrdersLocal(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// =============================
// RENDER ORDERS
// =============================
async function renderOrders() {
  if (!ordersTableBody) return;

  const query = searchOrders?.value?.toLowerCase() || "";
  const orders = await getOrders();

  const filtered = orders.filter((order) => {
    return (
      String(order.order_id || order.orderId || "").toLowerCase().includes(query) ||
      String(order.customer_name || order.customerName || order.name || "").toLowerCase().includes(query) ||
      String(order.product_name || order.productName || order.product || "").toLowerCase().includes(query) ||
      String(order.status || "").toLowerCase().includes(query)
    );
  });

  ordersTableBody.innerHTML = "";

  if (!filtered.length) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">No orders found</td>
      </tr>
    `;
    updateStats([]);
    return;
  }

  filtered.forEach((order) => {
    const orderId = order.order_id || order.orderId || "N/A";
    const customer = order.customer_name || order.customerName || order.name || "N/A";
    const product = order.product_name || order.productName || order.product || "N/A";
    const total = order.total || order.amount || 0;
    const status = order.status || "Pending";

    const updateDisabled = canUpdateOrders() ? "" : "disabled";
    const deleteDisabled = canDeleteOrders() ? "" : "disabled";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${orderId}</td>
      <td>${customer}</td>
      <td>${product}</td>
      <td>₹${total}</td>
      <td>${status}</td>
      <td>
        <select ${updateDisabled} onchange="updateOrderStatus('${orderId}', this.value)">
          <option value="Pending" ${status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Shipped" ${status === "Shipped" ? "selected" : ""}>Shipped</option>
          <option value="Delivered" ${status === "Delivered" ? "selected" : ""}>Delivered</option>
          <option value="Cancelled" ${status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </td>
      <td>
        <button class="action-btn" ${deleteDisabled} onclick="deleteOrder('${orderId}')">
          Delete
        </button>
      </td>
    `;

    ordersTableBody.appendChild(row);
  });

  updateStats(orders);
}

// =============================
// STATS
// =============================
function updateStats(orders) {
  if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
  if (pendingOrdersEl) pendingOrdersEl.textContent = orders.filter(o => (o.status || "Pending") === "Pending").length;
  if (shippedOrdersEl) shippedOrdersEl.textContent = orders.filter(o => o.status === "Shipped").length;
  if (deliveredOrdersEl) deliveredOrdersEl.textContent = orders.filter(o => o.status === "Delivered").length;
}

// =============================
// UPDATE ORDER STATUS
// =============================
async function updateOrderStatus(orderId, newStatus) {
  if (!canUpdateOrders()) {
    alert("You do not have permission to update orders.");
    return;
  }

  try {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("order_id", orderId);

    if (error) throw error;

    await renderOrders();
  } catch (err) {
    console.warn("Supabase update failed, trying localStorage:", err);

    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    const updated = orders.map(order => {
      const id = order.order_id || order.orderId;
      if (id === orderId) {
        return { ...order, status: newStatus };
      }
      return order;
    });

    saveOrdersLocal(updated);
    await renderOrders();
  }
}

// =============================
// DELETE ORDER
// =============================
async function deleteOrder(orderId) {
  if (!canDeleteOrders()) {
    alert("Only owner can delete orders.");
    return;
  }

  const confirmDelete = confirm(`Delete order ${orderId}?`);
  if (!confirmDelete) return;

  try {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("order_id", orderId);

    if (error) throw error;

    await renderOrders();
  } catch (err) {
    console.warn("Supabase delete failed, trying localStorage:", err);

    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    const updated = orders.filter(order => {
      const id = order.order_id || order.orderId;
      return id !== orderId;
    });

    saveOrdersLocal(updated);
    await renderOrders();
  }
}
