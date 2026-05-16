window.currentStep = 1;

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('personalInfoForm')) return;

    loadCartItems();
    updateStepIndicator();
    updateNavigationButtons();

    document.getElementById('nextBtn').onclick = function () {
        console.log('nextBtn onclick, currentStep:', window.currentStep);
        if (window.currentStep === 1) {
            if (!validatePersonalInfo()) return;
            window.currentStep = 2;
            showStep(2);
        } else if (window.currentStep === 2) {
            processOrder();
        }
    };

    document.getElementById('backBtn').onclick = function () {
        if (window.currentStep === 2) {
            window.currentStep = 1;
            showStep(1);
        } else {
            window.location.href = '/Home/Menu';
        }
    };
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
        step.classList.toggle('active', index + 1 <= window.currentStep);
    });
}

function updateNavigationButtons() {
    const backBtnText = document.getElementById('backBtnText');
    const nextBtnText = document.getElementById('nextBtnText');

    if (!backBtnText || !nextBtnText) return;

    backBtnText.textContent = window.currentStep === 1 ? 'Back to Menu' : 'Back';
    nextBtnText.textContent = window.currentStep === 2 ? 'Place Order' : 'Next';
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
 console.log('processOrder called');
    console.log('paymentMethod selected:', document.querySelector('input[name="paymentMethod"]:checked')?.value);
    

    fetch('/Account/GetCart')
    .then(res => res.json())
    .then(cart => {
        console.log('cart:', cart);

        const payload = {
            fullName:      document.getElementById('fullName').value.trim(),
            streetAddress: document.getElementById('streetAddress').value.trim(),
            state:         document.getElementById('state').value.trim(),
            city:          document.getElementById('city').value.trim(),
            zipCode:       document.getElementById('zipCode').value.trim(),
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
            deliveryNotes: document.getElementById('deliveryNotes').value.trim()
        };

        console.log('payload:', payload);

        fetch('/Home/SubmitOrder', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        })
        .then(res => {
            console.log('SubmitOrder status:', res.status);
            return res.json();
        })
        .then(data => {
            console.log('SubmitOrder data:', data);
            console.log('redirectUrl:', data.redirectUrl);

            if (data.success) {
                localStorage.setItem('lastOrderId', data.orderId);

                if (data.redirectUrl) {
                    console.log('Redirecting to:', data.redirectUrl);
                    window.location.href = data.redirectUrl;
                } else {
                    console.log('No redirectUrl, going to Receipt');
                    window.location.href = '/Home/Receipt';
                }
            } else {
                alert('Order failed: ' + data.message);
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);
        });
    });
}