let currentStep = 1;

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('personalInfoForm')) return;

    loadCartItems();
    updateStepIndicator();
    updateNavigationButtons();

    document.getElementById('nextBtn').addEventListener('click', function () {
        if (currentStep === 1) {
            if (!validatePersonalInfo()) return;
            currentStep = 2;
            showStep(2);
        } else if (currentStep === 2) {
            processOrder();
        }
    });

    document.getElementById('backBtn').addEventListener('click', function () {
        if (currentStep === 2) {
            currentStep = 1;
            showStep(1);
        } else {
            window.location.href = '/Home/Menu';
        }
    });
});

function loadCartItems() {
    const cartItemsContainer = document.getElementById('checkoutCartItems');

    fetch('/Account/GetCart')
    .then(res => res.json())
    .then(cart => {
        if (!cart || cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="checkout-cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="checkout-item-info">
                    <div>${item.name}</div>
                    <div>Qty: ${item.quantity}</div>
                    <div>₱${item.price * item.quantity}</div>
                </div>
            </div>
        `).join('');

        calculateTotals(cart);
    });
}

function calculateTotals(cart) {
    const basketPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 50;
    const orderTotal  = basketPrice + deliveryFee;
    const points      = Math.floor(orderTotal * 0.05);

    document.getElementById('basketPrice').textContent  = `₱${basketPrice}`;
    document.getElementById('deliveryFee').textContent  = `₱${deliveryFee}`;
    document.getElementById('orderTotal').textContent   = `₱${orderTotal}`;
    document.getElementById('pointsEarned').textContent = `+${points} pts`;
}

function showStep(step) {
    document.querySelectorAll('.form-section').forEach(f => f.classList.remove('active'));

    if (step === 1) document.getElementById('personalInfoForm').classList.add('active');
    if (step === 2) document.getElementById('paymentForm').classList.add('active');

    updateStepIndicator();
    updateNavigationButtons();
}

function updateStepIndicator() {
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 <= currentStep);
    });
}

function updateNavigationButtons() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!backBtn || !nextBtn) return;

    backBtn.innerHTML = currentStep === 1
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
           </svg> Back to Menu`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
           </svg> Back`;

    nextBtn.innerHTML = currentStep === 2
        ? `Place Order <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
           </svg>`
        : `Next <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
               <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
           </svg>`;
}

function validatePersonalInfo() {

    const fullName      = document.getElementById('fullName').value.trim();
    const email         = document.getElementById('email').value.trim();
    const streetAddress = document.getElementById('streetAddress').value.trim();
    const state         = document.getElementById('state').value.trim();
    const city          = document.getElementById('city').value.trim();
    const zipCode       = document.getElementById('zipCode').value.trim();


    if (!fullName || !email || !streetAddress || !state || !city || !zipCode) {
        alert('Please fill in all required fields.');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    return true;
}

function processOrder() {
    fetch('/Account/GetCart')
    .then(res => res.json())
    .then(cart => {
        if (!cart || cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const payload = {
            fullName:      document.getElementById('fullName').value.trim(),
            streetAddress: document.getElementById('streetAddress').value.trim(),
            state:         document.getElementById('state').value.trim(),
            city:          document.getElementById('city').value.trim(),
            zipCode:       document.getElementById('zipCode').value.trim(),
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
            deliveryNotes: document.getElementById('deliveryNotes').value.trim()
        };

        fetch('/Home/SubmitOrder', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('lastOrderId',      data.orderId);
                localStorage.setItem('lastPointsEarned', data.pointsEarned);
                window.location.href = '/Home/Receipt';
            } else {
                alert('Order failed: ' + data.message);
            }
        });
    });
}