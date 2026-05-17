// ── Tab switching ─────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const tab = this.getAttribute('data-tab');

        if (tab === 'users') {
            document.querySelector('.content').style.display = 'block';
            document.getElementById('orders-section').style.display = 'none';
        } else {
            document.querySelector('.content').style.display = 'none';
            document.getElementById('orders-section').style.display = 'block';
            loadOrders();
        }
    });
});

// ── Counters ──────────────────────────────────────────────────────────────────
function updateUsers() {
    const rows = document.querySelectorAll('#users-table tbody tr').length;
    document.getElementById('total-accounts').textContent = rows;
}
updateUsers();

function updateOrders() {
    const rows = document.querySelectorAll('#orders-tbody tr[data-orderid]').length;
    document.getElementById('total-orders').textContent = rows;
}

// ── Orders ────────────────────────────────────────────────────────────────────
let allOrders = [];
let currentStatus = 'all';
let currentSearch = '';

async function loadOrders() {
    const res  = await fetch('/Admin/GetOrders');
    allOrders  = await res.json();
    renderOrders();
    updateOrders();
}

function renderOrders() {
    const tbody = document.getElementById('orders-tbody');

    let filtered = allOrders;

    if (currentStatus !== 'all') {
        filtered = filtered.filter(o => o.status === currentStatus);
    }

    if (currentSearch.trim()) {
        const q = currentSearch.toLowerCase();
        filtered = filtered.filter(o =>
            o.orderId.toLowerCase().includes(q) ||
            o.fullName.toLowerCase().includes(q) ||
            o.phone.toLowerCase().includes(q)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:#888;">No orders found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(o => `
        <tr class="order-row" data-orderid="${o.orderId}">
            <td style="font-weight:700; color:#CCBEA8;">${o.orderId}</td>
            <td>${o.fullName}</td>
            <td>${o.phone}</td>
            <td>${o.paymentMethod.toUpperCase()}</td>
            <td style="color:#CCBEA8; font-weight:700;">₱${o.total.toFixed(2)}</td>
            <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
            <td>${o.createdAt}</td>
        </tr>
    `).join('');

    // Click to open modal
    document.querySelectorAll('.order-row').forEach(row => {
        row.addEventListener('click', function () {
            const orderId = this.dataset.orderid;
            const order   = allOrders.find(o => o.orderId === orderId);
            if (order) openOrderModal(order);
        });
    });

    updateOrders();
}

// ── Search & Filter ───────────────────────────────────────────────────────────
document.getElementById('orderSearch').addEventListener('input', function () {
    currentSearch = this.value;
    renderOrders();
});

document.querySelectorAll('.status-filter').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.status-filter').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentStatus = this.dataset.status;
        renderOrders();
    });
});

// ── Order Modal ───────────────────────────────────────────────────────────────
let currentOrderId = null;

function openOrderModal(order) {
    currentOrderId = order.orderId;

    document.getElementById('modal-orderId').textContent  = order.orderId;
    document.getElementById('modal-date').textContent     = order.createdAt;
    document.getElementById('modal-name').textContent     = order.fullName;
    document.getElementById('modal-phone').textContent    = order.phone;
    document.getElementById('modal-address').textContent  = order.address;
    document.getElementById('modal-payment').textContent  = order.paymentMethod.toUpperCase();
    document.getElementById('modal-notes').textContent    = order.deliveryNotes || '—';
    document.getElementById('modal-subtotal').textContent = '₱' + order.subtotal.toFixed(2);
    document.getElementById('modal-delivery').textContent = '₱' + order.deliveryFee.toFixed(2);
    document.getElementById('modal-total').textContent    = '₱' + order.total.toFixed(2);
    document.getElementById('modal-points').textContent   = '+' + order.pointsEarned + ' pts';

    // Items
    document.getElementById('modal-items').innerHTML = order.items.map(item => `
        <div class="modal-item-row">
            <img src="${item.image}" alt="${item.productName}" />
            <div class="modal-item-info">
                <div class="modal-item-name">${item.productName}</div>
                <div class="modal-item-qty">x${item.quantity}</div>
            </div>
            <div class="modal-item-price">₱${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');

    // Status select
    const select = document.getElementById('modal-status-select');
    select.value = order.status;

    document.getElementById('statusSaveMsg').style.display = 'none';
    document.getElementById('orderModal').style.display    = 'flex';
}

document.getElementById('closeOrderModal').addEventListener('click', () => {
    document.getElementById('orderModal').style.display = 'none';
});

document.getElementById('orderModal').addEventListener('click', function (e) {
    if (e.target === this) this.style.display = 'none';
});

document.getElementById('saveStatusBtn').addEventListener('click', async () => {
    const newStatus = document.getElementById('modal-status-select').value;

    const res = await fetch('/Admin/UpdateOrderStatus', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId: currentOrderId, status: newStatus })
    });

    if (res.ok) {
        // Update local data
        const order = allOrders.find(o => o.orderId === currentOrderId);
        if (order) order.status = newStatus;

        document.getElementById('statusSaveMsg').style.display = 'block';
        renderOrders();

        setTimeout(() => {
            document.getElementById('statusSaveMsg').style.display = 'none';
        }, 2000);
    }
});