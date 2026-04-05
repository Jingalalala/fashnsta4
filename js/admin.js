// ==========================
// USERS (EDIT HERE)
// ==========================
const USERS = [
  { uid: "admin", pass: "admin123", role: "owner" },
  { uid: "staff", pass: "staff123", role: "staff" }
];

// ==========================
// LOGIN
// ==========================
function login() {
  const u = document.getElementById("uid").value;
  const p = document.getElementById("pass").value;

  const user = USERS.find(x => x.uid === u && x.pass === p);

  if (!user) {
    document.getElementById("err").innerText = "Wrong login";
    return;
  }

  localStorage.setItem("admin", JSON.stringify(user));
  showAdmin();
}

// ==========================
// LOGOUT
// ==========================
function logout() {
  localStorage.removeItem("admin");
  location.href = "index.html";
}

// ==========================
// SHOW ADMIN
// ==========================
function showAdmin() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("adminPanel").classList.remove("hidden");

  const user = JSON.parse(localStorage.getItem("admin"));
  document.getElementById("who").innerText =
    `Logged in as ${user.uid} (${user.role})`;

  render();
}

// ==========================
// LOAD SESSION
// ==========================
window.onload = () => {
  if (localStorage.getItem("admin")) {
    showAdmin();
  }
};

// ==========================
// ORDERS
// ==========================
function getOrders() {
  return JSON.parse(localStorage.getItem("orders") || "[]");
}

function saveOrders(o) {
  localStorage.setItem("orders", JSON.stringify(o));
}

// ==========================
// RENDER
// ==========================
function render() {
  const tbody = document.getElementById("orders");
  const search = document.getElementById("search").value.toLowerCase();

  const orders = getOrders().filter(o =>
    JSON.stringify(o).toLowerCase().includes(search)
  );

  tbody.innerHTML = "";

  orders.forEach(o => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${o.name}</td>
      <td>${o.product}</td>
      <td>${o.status}</td>
      <td>
        <select onchange="update('${o.id}', this.value)">
          <option ${o.status==="Pending"?"selected":""}>Pending</option>
          <option ${o.status==="Shipped"?"selected":""}>Shipped</option>
          <option ${o.status==="Delivered"?"selected":""}>Delivered</option>
        </select>
      </td>
      <td>
        <button onclick="del('${o.id}')">X</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// UPDATE
// ==========================
function update(id, status) {
  let orders = getOrders();
  orders = orders.map(o => o.id === id ? { ...o, status } : o);
  saveOrders(orders);
  render();
}

// ==========================
// DELETE
// ==========================
function del(id) {
  const user = JSON.parse(localStorage.getItem("admin"));

  if (user.role !== "owner") {
    alert("Only owner can delete");
    return;
  }

  let orders = getOrders();
  orders = orders.filter(o => o.id !== id);
  saveOrders(orders);
  render();
}
