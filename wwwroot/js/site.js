import * as utils from "./utils.js";


// GLOBAL Modal elements
const modal = document.querySelector('.modal');
const modalItem = document.querySelectorAll(".modal-item");
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const closeBtn = document.querySelector('.close');

const profileBtn = document.querySelector(".profile-pic");
const profileMenu = document.getElementById("profileMenu");

// GLOBAL VARIABLE
let currentStep = 1;

// Close modal when clicking X
closeBtn.addEventListener('click', function() {
    modal.classList.remove("show"); 
    modalItem.forEach(m => m.classList.remove("show"));
});

if (profileMenu) { 
    profileBtn.addEventListener("click", function () {
        profileMenu.classList.toggle("show");
    });
}

// Close modal/dropdowns when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.classList.remove("show");
        modalItem.forEach(m => m.classList.remove("show"));
    }
});


// PBI
const Page = {
    home: function () {
        utils.debug("Page", "Home");

        function initializeScrollButton() {
            const scrollBtn = document.getElementById('ScrollTopLink');
            
            scrollBtn.addEventListener('click', function(e) {
                e.preventDefault();
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
            });
        }

        initializeScrollButton(); // SCROLLING UP

        
    },

    menu: function () {
        utils.debug("Page", "Menu");

        // VARIABLES
        const qtyInput = document.querySelector('.qty-input');

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let cartBtn = document.getElementById('cartButton');

        function initializeCategoryFilter() {
            const categoryItems = document.querySelectorAll('.category-item');
            const productCards = document.querySelectorAll('.product-card');
            const menuCurrent = document.querySelector('.menu-current');
            
            categoryItems.forEach(item => {
                item.addEventListener('click', function() {
                    // Remove active class from all items
                    categoryItems.forEach(cat => cat.classList.remove('active'));
                    
                    // Add active class to clicked item
                    this.classList.add('active');
                    
                    // Get selected category
                    const selectedCategory = this.getAttribute('data-category');
                    
                    // Update the menu current text
                    if (selectedCategory === 'all') {
                        menuCurrent.textContent = 'Sip & Bites';
                    } else if (selectedCategory === 'hot') {
                        menuCurrent.textContent = 'Hot Drinks';
                    } else if (selectedCategory === 'cold') {
                        menuCurrent.textContent = 'Cold Drinks';
                    } else if (selectedCategory === 'burger') {
                        menuCurrent.textContent = 'Burgers';
                    }
                    
                    // Filter products
                    productCards.forEach(card => {
                        const productId = card.getAttribute('id');
                        
                        if (selectedCategory === 'all' || productId === selectedCategory) {
                            card.classList.remove("hide");
                        } else {
                            card.classList.add("hide");
                        }
                    });
                });
            });
        }

        function updateCartButton() {
            utils.debug("Is User Logged in?", window.isLoggedIn);
            utils.debug("User Id", window.userId);

            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const cartCount = cartBtn.querySelector('.cart-count');

            cartCount.textContent = totalItems;

            if (totalItems > 0) {
                cartBtn.classList.add("show"); //THIS SHOW THE CART MODAL
            } else {
                cartBtn.classList.remove("show");
            }
        }

        function addToCart(product, quantity = 1) {
            const existingItem = cart.find(item => item.name === product.name);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity
                });
            }
            
            // Save to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartButton();
            
            // Show success message
            const itemText = quantity > 1 ? `${quantity} items` : 'Item';
            showNotification(`${itemText} added to cart!`);
        }

        // Open cart modal
        function openCart() {
            modal.classList.add("show");
            let cartModal = document.getElementById('cartModal');
            
            // Populate cart items
            updateCartModal(cartModal);
            cartModal.classList.add("show");

            // Close button
            cartModal.querySelector('.cart-close').onclick = () => {
                modal.classList.remove("show");
                cartModal.classList.remove("show");
            };
            
            // Close when clicking outside cart modal
            cartModal.onclick = (event) => {
                if (event.target === cartModal) {
                    modal.classList.remove("show");
                    cartModal.classList.remove("show");
                }
            };
            cartModal.querySelector('.checkout-btn').onclick = () => {
            window.location.href = '/Home/Checkout';
            };
        }

        function openProductModal() {
            const productModal = document.getElementById("productModal");

            modal.classList.add("show");
            productModal.classList.add("show");
        }

        // Update cart modal content
        function updateCartModal(cartModal) {
            const cartItems = document.querySelector('.cart-items');
            const totalAmount = document.querySelector('.total-amount');
            
            // Unnecessary na to, di mo den naman dinidisplay si cart pag 0 eh
            if (cart.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
                totalAmount.textContent = '₱0';
                return;
            }
            
            cartItems.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h3>${item.name}</h3>
                        <p class="cart-item-price">₱${item.price}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button id="cartDecreaseQuantityBtn" data-btn-id="${index}">-</button>
                        <input type="number" class="cart-input" value="${item.quantity}" min="1" max="99">
                        <button id="cartIncreaseQuantityBtn" data-btn-id="${index}">+</button>
                    </div>
                    <button class="remove-item" data-item-id="${index}">✕</button>
                </div>
            `).join('');
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            totalAmount.textContent = `₱${total}`;
        }

        // Cart manipulation functions
        function increaseQuantity(index) {
            cart[index].quantity++;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartButton();
            openCart(); // Refresh cart modal
        }

        function decreaseQuantity(index) {
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
            } else {
                cart.splice(index, 1);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartButton();
            openCart(); // Refresh cart modal
        }

        function removeItem(index) {
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartButton();
            openCart(); // Refresh cart modal
        }
        
        initializeCategoryFilter();

        // THIS CHECKS IF USER IS LOGGED IN, THEN DISPLAY CART
        if (window.isLoggedIn) {
            updateCartButton();
        }

        cartBtn.addEventListener("click", function () {
            openCart();
        });

        // PRODUCT MODAL QUANTITY CONTROLS
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        const decreaseBtn = document.querySelector('.qty-decrease');
        const increaseBtn = document.querySelector('.qty-increase');
        
        decreaseBtn.onclick = (e) => {
            e.stopPropagation();
            let value = parseInt(qtyInput.value);
            if (value > 1) {
                qtyInput.value = value - 1;
            }
        };

        qtyInput.oninput = () => {
            let value = qtyInput.value;

            // Allow empty temporarily so the user can type freely
            if (value === "") return;

            value = parseInt(value);

            if (isNaN(value) || value < 1) value = 1; // This avoid letting the user input the value `0`
            if (value > 99) value = 99;

            qtyInput.value = value;
        };

        increaseBtn.onclick = (e) => {
            e.stopPropagation();
            let value = parseInt(qtyInput.value);
            if (value < 99) {
                qtyInput.value = value + 1;
            }
        };
        
        // Add to cart button
        addToCartBtn.onclick = () => {
            const quantity = parseInt(qtyInput.value);
            const product = {
                name: modal.dataset.productName,
                price: parseInt(modal.dataset.productPrice),
                image: modal.dataset.productImage
            };
            
            // Add with quantity
            addToCart(product, quantity);
        };

        // CART MODAL QUANTITY CONTROLS
        document.addEventListener("click", function (e) {
            if (e.target.id === "cartDecreaseQuantityBtn") {
                utils.debug("Cart btn", "decrease");

                const btnId = e.target.dataset.btnId;
                decreaseQuantity(btnId);
            }

            if (e.target.id === "cartIncreaseQuantityBtn") {
                utils.debug("Cart btn", "increase");

                const btnId = e.target.dataset.btnId;
                increaseQuantity(btnId);
            }

        });

        // Add this inside initializeProductModal(), after addToCartBtn.onclick
        const orderNowBtn = modal.querySelector('.order-btn');

        orderNowBtn.onclick = (e) => {
            e.stopPropagation();

            if (!window.isLoggedIn) {
                window.location.href = "/Home/Signin";
                return;
            }

            const quantity = parseInt(qtyInput.value);
            const product = {
                name: modal.dataset.productName,
                price: parseInt(modal.dataset.productPrice),
                image: modal.dataset.productImage
            };

            addToCart(product, quantity);

            modal.classList.remove("show");

            window.location.href = '/Home/Checkout';
        };
    
        
        const closeBtn = document.querySelector(".remove-item");
        if (closeBtn) {
            utils.debug("Cart", " Hello");
            closeBtn.addEventListener("click", function () {
                const itemId = closeBtn.dataset.item.id;
                utils.debug("Cart Item", itemId);
                removeItem(itemId);
            });
        }

        //CATEGORY
        // Get all category items and product cards
        const categoryItems = document.querySelectorAll('.category-item');
        const productCards = document.querySelectorAll('.product-card');
        const menuCurrent = document.querySelector('.menu-current');

        productCards.forEach(card => {
            card.addEventListener('click', function() {
                const img = this.querySelector('img');
                const name = this.querySelector('p').textContent;
                const price = this.getAttribute('data-price');
                const imageSrc = img.getAttribute('src');
                
                // Set modal content
                document.getElementById('modalImage').src = imageSrc;
                document.getElementById('modalTitle').textContent = name;
                document.getElementById('modalPrice').textContent = price;
                
                // Store current product data
                modal.dataset.productName = name;
                modal.dataset.productPrice = price;
                modal.dataset.productImage = imageSrc;
                
                // Reset quantity and show modal
                qtyInput.value = 1;
                openProductModal();
            });
        });


    },

    location: function () {
        utils.debug("Page", "Location");

        const storeCards = document.querySelectorAll('.store-card');
        storeCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateX(-30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateX(0)';
            }, 200 * (index + 1));
        });

        // Add entrance animation to contact info
        const contactInfo = document.querySelector('.contact-info');
        if (contactInfo) {
            contactInfo.style.opacity = '0';
            contactInfo.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                contactInfo.style.transition = 'all 0.6s ease';
                contactInfo.style.opacity = '1';
                contactInfo.style.transform = 'translateY(0)';
            }, 600);
        }

        // Add ripple effect on store card click
        storeCards.forEach(card => {
            card.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });

        
        // Add ripple effect styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .store-card {
                position: relative;
                overflow: hidden;
            }
            
            .store-card.active {
                background: rgba(97, 76, 58, 0.25);
                border-color: #614c3a;
                box-shadow: 0 0 20px rgba(97, 76, 58, 0.5);
            }
            
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(228, 209, 185, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // LCOATION PAGE
        // Store locations data
        const locations = {
            store1: {
                lat: 14.441571582745448,
                lng: 120.95271528109014,
                name: '13 Azucena Street',
                zoom: 17
            },
            store2: {
                lat: 14.389405670070746,
                lng: 120.9397815099245,
                name: 'Servida Building Anabu',
                zoom: 17
            }
        };

        
        function focusLocation(lat, lng, storeId) {
            const iframe = document.getElementById('googleMap');

            // 🔥 This URL works with dynamic coordinates
            const newSrc = `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;

            iframe.src = newSrc;

            // Switch active store visually
            const allCards = document.querySelectorAll('.store-card');
            allCards.forEach(card => card.classList.remove('active'));
            event.currentTarget.classList.add('active');

            // Smooth scroll (mobile)
            if (window.innerWidth <= 1024) {
                document.querySelector('.map-container').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    },

    aboutUs: function () {
        utils.debug("Page", "About Us");
    },

    checkout: function () {
        utils.debug("Page", "Checkout");

        // Go back to previous step
        function goBack() {
            if (currentStep === 2) {
                currentStep = 1;
                showStep(1);
            } else if (currentStep === 1) {
                // Go back to menu
                window.location.href = '/Home/Menu';
            }
        }
        
        // Update navigation buttons
        function updateNavigationButtons() {
            const backBtn = document.getElementById('backBtn');
            const nextBtn = document.getElementById('nextBtn');
            
            if (currentStep === 1) {
                backBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Back to Menu
                `;
            } else {
                backBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Back
                `;
            }
            
            if (currentStep === 2) {
                nextBtn.innerHTML = `
                    Place Order
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                `;
            } else {
                nextBtn.innerHTML = `
                    Next
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                `;
            }
        }


        // Calculate order totals
        function calculateTotals(cart) {
            const basketPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const deliveryFee = 50;
            const discount = 0;
            const orderTotal = basketPrice + deliveryFee - discount;
            
            document.getElementById('basketPrice').textContent = `₱${basketPrice}`;
            document.getElementById('deliveryFee').textContent = `₱${deliveryFee}`;
            document.getElementById('discount').textContent = `₱${discount}`;
            document.getElementById('orderTotal').textContent = `₱${orderTotal}`;
        }

        // Load cart items from localStorage
        function loadCartItems() {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const cartItemsContainer = document.getElementById('checkoutCartItems');
            
            if (cart === null) {
                cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty. Add items to proceed.</p>';
                document.getElementById('basketPrice').textContent = '₱0';
                document.getElementById('orderTotal').textContent = '₱50';
                return;
            } else {
                // Render cart items
                cartItemsContainer.innerHTML = cart.map(item => `
                    <div class="checkout-cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="checkout-item-info">
                            <div class="checkout-item-name">${item.name}</div>
                            <div class="checkout-item-quantity">Qty: ${item.quantity}</div>
                            <div class="checkout-item-price">₱${item.price * item.quantity}</div>
                        </div>
                    </div>
                `).join('');
                
            }

            // Calculate totals
            calculateTotals(cart);
        }

        loadCartItems();
        updateStepIndicator();
        updateNavigationButtons();
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const page = document.body.dataset.page;

    if (Page[page]) {
        Page[page]();
    }
});


    // Show notification POP UYP
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Go to next step
    /*function showStep(step) {
        const personalForm = document.getElementById("personalInfoForm");
        const paymentForm = document.getElementById("paymentForm");

        // Step Indicators
        const steps = document.querySelectorAll(".step");

        // Reset forms
        personalForm.classList.remove("active");
        paymentForm.classList.remove("active");

        // Reset step indicator
        steps.forEach(s => s.classList.remove("active"));

        if (step === 1) {
            personalForm.classList.add("active");
            steps[0].classList.add("active");
        }

        if (step === 2) {
            paymentForm.classList.add("active");
            steps[1].classList.add("active");
        }

        
    }*/

    // Show specific step
    function showStep(step) {
        // Hide all forms
        document.querySelectorAll('.form-section').forEach(form => {
            form.classList.remove('active');
        });
        
        // Show selected form
        if (step === 1) {
            document.getElementById('personalInfoForm').classList.add('active');
        } else if (step === 2) {
            document.getElementById('paymentForm').classList.add('active');
        }
        
        updateStepIndicator();
        updateNavigationButtons();
    }

    // Update step indicator
    function updateStepIndicator() {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            if (index + 1 <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // Validate personal info form
    function validatePersonalInfo() {
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const streetAddress = document.getElementById('streetAddress').value.trim();
        const state = document.getElementById('state').value.trim();
        const city = document.getElementById('city').value.trim();
        const zipCode = document.getElementById('zipCode').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        
        if (!fullName || !email || !streetAddress || !state || !city || !zipCode || !phoneNumber) {
            alert('Please fill in all required fields.');
            return false;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return false;
        }
        
        return true;
    }

    // Save personal info to localStorage
    function savePersonalInfo() {
        const personalInfo = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            streetAddress: document.getElementById('streetAddress').value.trim(),
            state: document.getElementById('state').value.trim(),
            city: document.getElementById('city').value.trim(),
            zipCode: document.getElementById('zipCode').value.trim(),
            phoneNumber: document.getElementById('phoneNumber').value.trim()
        };
        
        localStorage.setItem('checkoutPersonalInfo', JSON.stringify(personalInfo));
    }

    // Save payment method
    function savePaymentMethod() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const deliveryNotes = document.getElementById('deliveryNotes').value.trim();
        
        localStorage.setItem('paymentMethod', paymentMethod);
        localStorage.setItem('deliveryNotes', deliveryNotes);
    }

    // Process order
    function processOrder() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const personalInfo = JSON.parse(localStorage.getItem('checkoutPersonalInfo'));
        const paymentMethod = localStorage.getItem('paymentMethod');
        const deliveryNotes = localStorage.getItem('deliveryNotes');

        if(cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const order = {
            orderNumber: 'ORD-' + Date.now(),
            personalInfo: personalInfo,
            items: cart,
            paymentMethod: paymentMethod,
            deliveryNotes: deliveryNotes,
            basketPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            deliveryFee: 50,  // fixed or calculated
            discount: 0,
            orderTotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 50,
            orderDate: new Date().toISOString()
        };

        // Save order to localStorage
        localStorage.setItem('lastOrder', JSON.stringify({
        items: JSON.parse(localStorage.getItem('cart')) || [],
        orderTotal: total + 50,
        points: result.pointsEarned
    }));

        // Clear cart
        localStorage.removeItem('cart');

        // Redirect to receipt page
        window.location.href = '/Home/Receipt';
    }


    // Load saved personal info if available (for returning customers)
    window.addEventListener('load', function() {
        const savedInfo = JSON.parse(localStorage.getItem('checkoutPersonalInfo'));
        if (savedInfo) {
            document.getElementById('fullName').value = savedInfo.fullName || '';
            document.getElementById('email').value = savedInfo.email || '';
            document.getElementById('streetAddress').value = savedInfo.streetAddress || '';
            document.getElementById('state').value = savedInfo.state || '';
            document.getElementById('city').value = savedInfo.city || '';
            document.getElementById('zipCode').value = savedInfo.zipCode || '';
            document.getElementById('phoneNumber').value = savedInfo.phoneNumber || '';
        }
    });





