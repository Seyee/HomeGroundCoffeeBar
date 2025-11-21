document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {

        // change active underline
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // show/hide tables
        const tab = this.getAttribute("data-tab");

        if (tab === "users") {
            document.getElementById("users-table").style.display = "table";
            document.getElementById("orders-table").style.display = "none";
        } else {
            document.getElementById("users-table").style.display = "none";
            document.getElementById("orders-table").style.display = "table";
        }
    });
});

    function updateUsers() {
        const rows = document.querySelectorAll("#users-table tbody tr").length;
        document.getElementById("total-accounts").textContent = rows;
    }

    updateUsers();

    function updateOrders() {
        const rows = document.querySelectorAll("#orders-table tbody tr").length;
        document.getElementById("total-orders").textContent = rows;
    }

    updateOrders();