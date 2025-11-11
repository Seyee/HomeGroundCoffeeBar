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

