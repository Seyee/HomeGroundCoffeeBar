document.addEventListener('DOMContentLoaded', function() {
    const scrollBtn = document.getElementById('ScrollTopLink');
    
    if (scrollBtn) {
        scrollBtn.addEventListener('click', function(e) {
            e.preventDefault();
            

            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });
    }
});


//CATEGORY
// Get all category items and product cards
const categoryItems = document.querySelectorAll('.category-item');
const productCards = document.querySelectorAll('.product-card');
const menuCurrent = document.querySelector('.menu-current');

// Modal elements
const modal = document.getElementById('productModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const closeBtn = document.querySelector('.close');

// Add click event to each category item
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
            menuCurrent.textContent = 'Cold Drinks';
        } else if (selectedCategory === 'cold') {
            menuCurrent.textContent = 'Hot Drinks';
        } else if (selectedCategory === 'burger') {
            menuCurrent.textContent = 'Burgers';
        }
        
        // Filter products
        productCards.forEach(card => {
            const productId = card.getAttribute('id');
            
            if (selectedCategory === 'all') {
                // Show all products
                card.style.display = '';
            } else if (productId === selectedCategory) {
                // Show matching products
                card.style.display = '';
            } else {
                // Hide non-matching products
                card.style.display = 'none';
            }
        });
    });
});

// Add click event to product cards for modal
productCards.forEach(card => {
    card.addEventListener('click', function() {
        const img = this.querySelector('img');
        const title = this.querySelector('p').textContent;
        const price = this.getAttribute('data-price');
        const imageSrc = img.getAttribute('src');
        
        // Set modal content
        modalImage.src = imageSrc;
        modalTitle.textContent = title;
        modalPrice.textContent = price;
        
        // Show modal
        modal.style.display = 'block';
    });
});

// Close modal when clicking X
closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});




// Cart state management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeScrollButton();
    initializeCategoryFilter();
    initializeProductModal();
    updateCartButton();
});

// Scroll to top functionality
function initializeScrollButton() {
    const scrollBtn = document.getElementById('ScrollTopLink');
    
    if (scrollBtn) {
        scrollBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });
    }
}

// Category filter functionality
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
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Initialize product modal with quantity selector
function initializeProductModal() {
    const modal = document.getElementById('productModal');
    const closeBtn = modal.querySelector('.close');
    const addToCartBtn = modal.querySelector('.add-to-cart-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    // Create quantity controls if they don't exist
    let quantityContainer = modal.querySelector('.quantity-selector');
    if (!quantityContainer) {
        quantityContainer = document.createElement('div');
        quantityContainer.className = 'quantity-selector';
        quantityContainer.innerHTML = `
            <label>Quantity:</label>
            <div class="quantity-controls">
                <button class="qty-btn qty-decrease">-</button>
                <input type="number" class="qty-input" value="1" min="1" max="99">
                <button class="qty-btn qty-increase">+</button>
            </div>
        `;
        
        // Insert before modal buttons
        const modalBtnContainer = modal.querySelector('.modal-btn');
        modalBtnContainer.parentNode.insertBefore(quantityContainer, modalBtnContainer);
    }
    
    const qtyInput = quantityContainer.querySelector('.qty-input');
    const decreaseBtn = quantityContainer.querySelector('.qty-decrease');
    const increaseBtn = quantityContainer.querySelector('.qty-increase');
    
    // Quantity controls
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

    if (isNaN(value) || value < 1) value = 1;
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
    
    // Close modal function
    const closeModal = () => {
        modal.style.display = 'none';
        qtyInput.value = 1; // Reset quantity
    };
    
    // Close button
    closeBtn.onclick = closeModal;
    
    // Close when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
    
    // Product card click handlers
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
            modal.style.display = 'block';
        });
    });
    
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
        
        closeModal();
    };
}

// Update cart button visibility and count
function updateCartButton() {
    let cartBtn = document.getElementById('cartButton');
    
    // Create cart button if it doesn't exist
    if (!cartBtn) {
        cartBtn = document.createElement('button');
        cartBtn.id = 'cartButton';
        cartBtn.className = 'cart-button';
        cartBtn.innerHTML = `
            <span class="cart-icon">🛒</span>
            <span class="cart-count">0</span>
        `;
        cartBtn.onclick = openCart;
        document.body.appendChild(cartBtn);
    }
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = cartBtn.querySelector('.cart-count');
    cartCount.textContent = totalItems;
    
    // Show/hide cart button based on items
    if (totalItems > 0) {
        cartBtn.style.display = 'flex';
    } else {
        cartBtn.style.display = 'none';
    }
}

// Add item to cart
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

// Show notification
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

// Open cart modal
function openCart() {
    let cartModal = document.getElementById('cartModal');
    
    // Create cart modal if it doesn't exist
    if (!cartModal) {
        cartModal = document.createElement('div');
        cartModal.id = 'cartModal';
        cartModal.className = 'modal';
        cartModal.innerHTML = `
            <div class="modal-content cart-modal-content">
                <div class="cart-header">
                    <h2>Your Cart</h2>
                    <span class="close cart-close">&times;</span>
                </div>
                <div class="cart-items"></div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span class="total-amount">₱0</span>
                    </div>
                    <button class="checkout-btn">Proceed to Checkout</button>
                </div>
            </div>
        `;
        document.body.appendChild(cartModal);
        
        // Close button
        cartModal.querySelector('.cart-close').onclick = () => {
            cartModal.style.display = 'none';
        };
        
        // Close when clicking outside cart modal
        cartModal.onclick = (event) => {
            if (event.target === cartModal) {
                cartModal.style.display = 'none';
            }
        };
        
        // Checkout button
        cartModal.querySelector('.checkout-btn').onclick = () => {
            alert('Checkout functionality coming soon!');
        };
    }
    
    // Populate cart items
    updateCartModal(cartModal);
    cartModal.style.display = 'block';
}

// Update cart modal content
function updateCartModal(cartModal) {
    const cartItems = cartModal.querySelector('.cart-items');
    const totalAmount = cartModal.querySelector('.total-amount');
    
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
                <button onclick="decreaseQuantity(${index})">-</button>
                <input type="number" class="cart-input" value="${item.quantity}" min="1" max="99">
                <button onclick="increaseQuantity(${index})">+</button>
            </div>
            <button class="remove-item" onclick="removeItem(${index})">✕</button>
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