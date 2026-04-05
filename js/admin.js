/*******************************
 * FASHNTA ADMIN PANEL
 *******************************/

// =============================
// 🔐 CHANGE THESE
// =============================
const ADMIN_UID = "fashnta-admin";
const ADMIN_PASSWORD = "fashnta@2026";

// localStorage keys
const ADMIN_SESSION_KEY = "fashnta_admin_logged_in";
const ORDERS_KEY = "fashnta_orders";

// DOM
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

// =============================
// INIT
// =============================
document.addEventListener("DOMContentLoaded", () => {
  checkAdminSession();

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
// LOGIN
// =============================
function handleAdminLogin() {
  const uid = adminUidInput.value.trim();
  const password = adminPasswordInput.value.trim();

  if (uid === ADMIN_UID && password === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_SESSION_KEY, "true");
    showAdminPanel();
    renderOrders();
  } else {
    adminLoginError.textContent = "Invalid UID or Password";
  }
}

function handleAdminLogout() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.href = "index.html?logout=success";
}

function checkAdminSession() {
  const isLoggedIn = localStorage.getItem(ADMIN_SESSION_KEY) === "true";

  if (isLoggedIn) {
    showAdminPanel();
    renderOrders();
  } else {
    showLoginScreen();
  }
}

function showAdminPanel() {
  loginScreen.classList.add("hidden");
  adminPanel.classList.remove("hidden");
}

function showLoginScreen() {
  loginScreen.classList.remove("admin-hidden");
  adminPanel.classList.add("hidden");
}

// =============================
// ORDERS
// =============================
function getOrders() {
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  return [...orders].reverse(); // latest first
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function renderOrders() {
  const searchValue = searchOrders.value.trim().toLowerCase();
  let orders = getOrders();

  if (searchValue) {
    orders = orders.filter(order =>
      (order.orderNumber || order.orderId || order.order_number || '').toLowerCase().includes(searchValue) ||
      (order.name || order.customerName || '').toLowerCase().includes(searchValue) ||
      (order.phone || '').toLowerCase().includes(searchValue) ||
      (order.productName || (order.items||[]).map(i=>i.name).join(', ') || '').toLowerCase().includes(searchValue)
    );
  }

  updateStats(getOrders());

  if (!orders.length) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="11" class="empty-row">No orders found</td>
      </tr>
    `;
    return;
  }

  ordersTableBody.innerHTML = orders.map((order, index) => `
    <tr>
      <td>${order.orderNumber || order.orderId || order.order_number || "-"}</td>
      <td>${order.name || order.customerName || "-"}</td>
      <td>${order.phone || "-"}</td>
      <td>${order.productName || (order.items||[]).map(i=>i.name).join(", ") || "-"}</td>
      <td>${order.size || (order.items?.[0]?.size) || "-"}</td>
      <td>${order.quantity || (order.items||[]).reduce((s,i)=>s+Number(i.qty||1),0) || 1}</td>
      <td>₹${order.total || 0}</td>
      <td>${order.address || "-"}</td>
      <td>
        <select onchange="updateOrderStatus('${order.orderNumber || order.orderId || order.order_number || order.id}', this.value)" class="status-select">
          <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Processing" ${order.status === "Processing" ? "selected" : ""}>Processing</option>
          <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
          <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
          <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </td>
      <td>${formatDate(order.date)}</td>
      <td>
        <div class="action-buttons">
          <button class="delete-btn" onclick="deleteOrder('${order.orderNumber || order.orderId || order.order_number || order.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function updateOrderStatus(orderNumber, newStatus) {
  const originalOrders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];

  const updatedOrders = originalOrders.map(order => {
    if ((order.orderNumber || order.orderId || order.order_number || order.id) === orderNumber) {
      return { ...order, status: newStatus };
    }
    return order;
  });

  saveOrders(updatedOrders);
  renderOrders();
}

function deleteOrder(orderNumber) {
  const confirmDelete = confirm(`Delete order ${orderNumber}?`);
  if (!confirmDelete) return;

  const originalOrders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  const updatedOrders = originalOrders.filter(order => (order.orderNumber || order.orderId || order.order_number || order.id) !== orderNumber);

  saveOrders(updatedOrders);
  renderOrders();
}

function updateStats(orders) {
  totalOrdersEl.textContent = orders.length;
  pendingOrdersEl.textContent = orders.filter(o => o.status === "Pending").length;
  shippedOrdersEl.textContent = orders.filter(o => o.status === "Shipped").length;
  deliveredOrdersEl.textContent = orders.filter(o => o.status === "Delivered").length;
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString();
}
