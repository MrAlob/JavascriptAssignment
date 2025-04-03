document.addEventListener('DOMContentLoaded', () => {
    // Get the product ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = '../index.html';
        return;
    }

    // Fetch product details
    fetch('https://api.noroff.dev/api/v1/rainy-days/' + productId)
        .then(response => response.json())
        .then(product => {
            // Update page title
            document.title = `${product.title} | The Shop`;

            // Update breadcrumb
            document.querySelector('.breadcrumb .product-title').textContent = product.title;
            document.querySelector('.breadcrumb .product-category').textContent = product.category || 'Clothing';

            // Update main product information
            document.querySelector('h1.product-title').textContent = product.title;
            document.querySelector('.product-meta .product-category').textContent = product.category || 'Clothing';

            // Update price information
            const currentPrice = document.querySelector('.current-price');
            const originalPrice = document.querySelector('.original-price');
            const discountBadge = document.querySelector('.discount-badge');

            if (product.discountedPrice && product.discountedPrice < product.price) {
                currentPrice.textContent = `$${product.discountedPrice.toFixed(2)}`;
                originalPrice.textContent = `$${product.price.toFixed(2)}`;
                discountBadge.textContent = 'Sale';
                discountBadge.style.display = 'inline-block';
            } else {
                currentPrice.textContent = `$${product.price.toFixed(2)}`;
                originalPrice.textContent = '';
                discountBadge.style.display = 'none';
            }

            // Update product description
            document.querySelector('.product-description').innerHTML = `
                <p>${product.description}</p>
            `;

            // Update product attributes
            document.querySelector('.product-attributes').innerHTML = `
                <div class="attribute">
                    <span class="label">Gender:</span>
                    <span class="value">${product.gender || 'Unisex'}</span>
                </div>
                <div class="attribute">
                    <span class="label">Category:</span>
                    <span class="value">${product.category || 'Clothing'}</span>
                </div>
                ${product.sizes ? `
                    <div class="attribute">
                        <span class="label">Available Sizes:</span>
                        <div class="sizes">
                            ${product.sizes.map(size => `
                                <span class="size">${size}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            `;

            // Update main product image
            const mainImageContainer = document.querySelector('.main-image');
            mainImageContainer.innerHTML = `
                <img src="${product.image.url}" alt="${product.title}" class="product-image">
            `;

            // Set up add to cart button
            const addToCartBtn = document.querySelector('.add-to-cart-btn');
            addToCartBtn.dataset.productId = product.id;
            
            // Add click event for add to cart button
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(document.querySelector('.quantity-input').value);
                const productToAdd = {
                    id: product.id,
                    title: product.title,
                    price: product.discountedPrice || product.price,
                    image: product.image,
                    quantity: quantity
                };
                
                // Use the addToCart function from main script.js
                if (typeof addToCart === 'function') {
                    addToCart(productToAdd);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching product:', error);
            document.querySelector('.product-detail').innerHTML = `
                <div class="error-message">
                    <p>Sorry, we couldn't find this product.</p>
                    <a href="../index.html" class="cta-button-small">Return to Shop</a>
                </div>
            `;
        });

    // Set up quantity selector
    const quantityInput = document.querySelector('.quantity-input');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');

    minusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });

    plusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 99) {
            quantityInput.value = currentValue + 1;
        }
    });
});