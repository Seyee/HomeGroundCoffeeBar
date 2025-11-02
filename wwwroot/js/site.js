document.addEventListener('DOMContentLoaded', function() {
    const scrollBtn = document.getElementById('ScrollTopLink');
    
    if (scrollBtn) {
        scrollBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Force scroll to top
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });
    }
});