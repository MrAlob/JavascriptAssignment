document.addEventListener('DOMContentLoaded', () => {
    // Get the product ID and type from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const productType = urlParams.get('type');

    if (!productId || !productType) {
        window.location.href = '../index.html';
        return;
    }

    // Get API endpoint based on product type
    const getApiEndpoint = () => {
        switch (productType) {
            case 'jackets':
                return 'https://v2.api.noroff.dev/rainy-days';
            case 'movies':
                return 'https://v2.api.noroff.dev/square-eyes';
            case 'games':
                return 'https://v2.api.noroff.dev/gamehub';
            default:
                throw new Error('Invalid product type');
        }
    };

    // Fetch product details
    fetch(getApiEndpoint())
        .then(response => {
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const product = data.data.find(item => item.id === productId);
            if (!product) {
                throw new Error('Product not found');
            }

            // Update page title and metadata
            document.title = `${product.title} | The Shop`;

            // Update main product information
            document.querySelector('h1.product-title').textContent = product.title;
            document.querySelector('.product-meta .product-category').textContent = 
                product.genre || product.category || productType;
            document.querySelector('.product-meta .product-id').textContent = `ID: ${product.id}`;

            // Update price information
            const currentPrice = document.querySelector('.current-price');
            const originalPrice = document.querySelector('.original-price');
            const discountBadge = document.querySelector('.discount-badge');

            if (product.onSale && product.discountedPrice < product.price) {
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

            // Update product attributes based on type
            const attributesContainer = document.querySelector('.product-attributes');
            if (productType === 'jackets') {
                attributesContainer.innerHTML = `
                    <div class="attribute">
                        <span class="label">Gender:</span>
                        <span class="value">${product.gender || 'Unisex'}</span>
                    </div>
                    <div class="attribute">
                        <span class="label">Color:</span>
                        <span class="value">${product.baseColor || 'N/A'}</span>
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
            } else if (productType === 'movies') {
                attributesContainer.innerHTML = `
                    <div class="attribute">
                        <span class="label">Genre:</span>
                        <span class="value">${product.genre || 'N/A'}</span>
                    </div>
                    <div class="attribute">
                        <span class="label">Rating:</span>
                        <span class="value">${product.rating || 'N/A'}</span>
                    </div>
                    <div class="attribute">
                        <span class="label">Released:</span>
                        <span class="value">${product.released || 'N/A'}</span>
                    </div>
                `;
            } else if (productType === 'games') {
                attributesContainer.innerHTML = `
                    <div class="attribute">
                        <span class="label">Genre:</span>
                        <span class="value">${product.genre || 'N/A'}</span>
                    </div>
                    <div class="attribute">
                        <span class="label">Age Rating:</span>
                        <span class="value">${product.ageRating || 'N/A'}</span>
                    </div>
                    <div class="attribute">
                        <span class="label">Released:</span>
                        <span class="value">${product.released || 'N/A'}</span>
                    </div>
                `;
            }

            // Update product images
            const mainImageContainer = document.querySelector('.main-image');
            const thumbnailContainer = document.querySelector('.thumbnail-images');

            mainImageContainer.innerHTML = `
                <img src="${product.image.url}" alt="${product.image.alt || product.title}" class="product-image">
            `;

            // Handle multiple images if available
            if (product.images && product.images.length > 0) {
                thumbnailContainer.innerHTML = product.images
                    .map((img, index) => `
                        <img src="${img.url}" 
                             alt="${img.alt || `${product.title} view ${index + 1}`}"
                             onclick="updateMainImage('${img.url}', '${img.alt}')"
                             class="${index === 0 ? 'active' : ''}">
                    `).join('');
            }

            // Set up add to cart button
            const addToCartBtn = document.querySelector('.add-to-cart-btn');
            addToCartBtn.dataset.productId = product.id;
            addToCartBtn.dataset.productType = productType;
            
            // Add click event for add to cart button
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(document.querySelector('.quantity-input').value);
                if (typeof addToCart === 'function') {
                    addToCart(product.id, productType);
                }
            });

            // Fetch and display related products
            displayRelatedProducts(data.data, product.id, productType);
        })
        .catch(error => {
            console.error('Error:', error);
            document.querySelector('.product-detail').innerHTML = `
                <div class="error-message">
                    <p>Sorry, we couldn't find this product. ${error.message}</p>
                    <a href="../index.html" class="cta-button-small">Return to Shop</a>
                </div>
            `;
        });
});

// Function to update main image when clicking thumbnails
function updateMainImage(url, alt) {
    const mainImage = document.querySelector('.main-image img');
    mainImage.src = url;
    mainImage.alt = alt;

    // Update active thumbnail
    document.querySelectorAll('.thumbnail-images img').forEach(img => {
        img.classList.toggle('active', img.src === url);
    });
}

// Function to display related products
function displayRelatedProducts(allProducts, currentProductId, productType) {
    const relatedProducts = allProducts
        .filter(product => product.id !== currentProductId)
        .slice(0, 4);

    const relatedProductsGrid = document.querySelector('.related-products .products-grid');
    
    relatedProductsGrid.innerHTML = relatedProducts
        .map(product => `
            <div class="product-card">
                <a href="?id=${product.id}&type=${productType}" class="product-link">
                    <div class="product-image-container">
                        <img src="${product.image.url}" alt="${product.image.alt}" class="product-image">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <p class="product-price">
                            ${product.onSale 
                                ? `<span class="original-price">$${product.price.toFixed(2)}</span>
                                   $${product.discountedPrice.toFixed(2)}`
                                : `$${product.price.toFixed(2)}`}
                        </p>
                    </div>
                </a>
            </div>
        `).join('');
}