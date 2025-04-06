document.addEventListener("DOMContentLoaded", () => {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const productId = urlParams.get("id")
  const productType = urlParams.get("type")

  // Initialize UI elements
  const mainImage = document.querySelector(".main-image")
  const thumbnailContainer = document.querySelector(".thumbnail-images")
  const productTitle = document.querySelector(".product-title")
  const productDescription = document.querySelector(".product-description")
  const currentPrice = document.querySelector(".current-price")
  const originalPrice = document.querySelector(".original-price")
  const discountBadge = document.querySelector(".discount-badge")
  const addToCartBtn = document.querySelector(".add-to-cart-btn")
  const quantityInput = document.querySelector(".quantity-input")
  const minusBtn = document.querySelector(".quantity-btn.minus")
  const plusBtn = document.querySelector(".quantity-btn.plus")
  const productAttributes = document.querySelector(".product-attributes")
  const relatedProductsGrid = document.querySelector(".related-products .products-grid")
  const productDetailContainer = document.querySelector(".product-detail")

  // Store the current product data
  let currentProduct = null

  // Show loading spinner
  function showLoading(element, message = "Loading...") {
    // Check if element exists
    if (!element) {
      // If element doesn't exist, append to body instead
      element = document.body
    }

    // Create spinner if it doesn't exist
    const loadingEl = document.createElement("div")
    loadingEl.className = "product-loading"
    loadingEl.innerHTML = `
      <div class="spinner"></div>
      <p>${message}</p>
    `
    element.appendChild(loadingEl)
    return loadingEl
  }

  // Hide loading spinner
  function hideLoading(loadingElement) {
    if (loadingElement && loadingElement.parentNode) {
      loadingElement.parentNode.removeChild(loadingElement)
    }
  }

  // Show error message
  function showError(message, duration = 3000) {
    // Create error popup if it doesn't exist
    let errorPopup = document.getElementById("errorPopup")
    if (!errorPopup) {
      errorPopup = document.createElement("div")
      errorPopup.id = "errorPopup"
      errorPopup.className = "error-popup"
      document.body.appendChild(errorPopup)
    }

    errorPopup.textContent = message
    errorPopup.classList.add("active")

    // Hide after duration
    setTimeout(() => {
      errorPopup.classList.remove("active")
    }, duration)
  }

  // Fetch product details
  async function fetchProductDetails() {
    // Get the container element, fallback to body if not found
    const container = document.querySelector(".product-detail-page") || document.body
    const loadingElement = showLoading(container, "Loading product details...")

    try {
      const response = await fetch(getApiEndpoint(productType))
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`)
      }

      const data = await response.json()
      currentProduct = data.data.find((item) => item.id === productId)

      if (!currentProduct) {
        throw new Error(`Product with ID ${productId} not found`)
      }

      // Update page title and product info
      updateProductDisplay(currentProduct)

      // Setup add to cart button
      if (addToCartBtn) {
        addToCartBtn.addEventListener("click", () => {
          const quantity = Number.parseInt(quantityInput?.value || "1")

          // Ensure the button stays visible
          addToCartBtn.style.display = "block"

          // Use the global addToCart function from cart.js
          window.addToCart(currentProduct.id, productType, quantity)
        })
      }

      // Fetch and display related products
      await fetchRelatedProducts(data.data, currentProduct)
    } catch (error) {
      showError(`Error loading product: ${error.message}`)
      showErrorMessage()
    } finally {
      hideLoading(loadingElement)
    }
  }

  // Fetch related products based on current product
  async function fetchRelatedProducts(allProducts, currentProduct) {
    // Get the container element, fallback to body if not found
    const container = document.querySelector(".related-products") || document.body
    const loadingElement = showLoading(container, "Loading related products...")

    try {
      // Filter products to get related ones (same category, different ID)
      let relatedProducts = allProducts.filter((product) => product.id !== currentProduct.id)

      // Sort by relevance - products with similar attributes first
      if (productType === "jackets") {
        // For jackets, prioritize same gender and color
        relatedProducts.sort((a, b) => {
          const aScore =
            (a.gender === currentProduct.gender ? 2 : 0) + (a.baseColor === currentProduct.baseColor ? 1 : 0)
          const bScore =
            (b.gender === currentProduct.gender ? 2 : 0) + (b.baseColor === currentProduct.baseColor ? 1 : 0)
          return bScore - aScore
        })
      } else if (productType === "movies" || productType === "games") {
        // For movies and games, prioritize same genre
        relatedProducts.sort((a, b) => {
          const aScore = a.genre === currentProduct.genre ? 2 : 0
          const bScore = b.genre === currentProduct.genre ? 2 : 0
          return bScore - aScore
        })
      }

      // Limit to 4 related products
      relatedProducts = relatedProducts.slice(0, 4)

      // Display the related products
      displayRelatedProducts(relatedProducts)
    } catch (error) {
      showError(`Error loading related products: ${error.message}`)
      // Hide related products section if there's an error
      const relatedSection = document.querySelector(".related-products")
      if (relatedSection) {
        relatedSection.style.display = "none"
      }
    } finally {
      hideLoading(loadingElement)
    }
  }

  function updateProductDisplay(product) {
    if (!product) return

    document.title = `${product.title} | The Shop`

    // Add null checks for all DOM elements
    if (productTitle) productTitle.textContent = product.title

    // Update main image
    if (mainImage) {
      mainImage.innerHTML = `
        <img src="${product.image.url}" alt="${product.image.alt || product.title}">
      `
    }

    // Update price information
    if (currentPrice && originalPrice && discountBadge) {
      if (product.onSale && product.discountedPrice < product.price) {
        currentPrice.textContent = `$${product.discountedPrice.toFixed(2)}`
        originalPrice.textContent = `$${product.price.toFixed(2)}`
        discountBadge.textContent = "Sale"
        discountBadge.style.display = "inline-block"
      } else {
        currentPrice.textContent = `$${product.price.toFixed(2)}`
        originalPrice.textContent = ""
        discountBadge.style.display = "none"
      }
    }

    // Update description
    if (productDescription) {
      productDescription.innerHTML = `<p>${product.description}</p>`
    }

    // Update attributes
    updateProductAttributes(product)
  }

  function getApiEndpoint(type) {
    switch (type) {
      case "jackets":
        return "https://v2.api.noroff.dev/rainy-days"
      case "movies":
        return "https://v2.api.noroff.dev/square-eyes"
      case "games":
        return "https://v2.api.noroff.dev/gamehub"
      default:
        throw new Error("Invalid product type")
    }
  }

  function updateProductAttributes(product) {
    if (!productAttributes || !product) return

    switch (productType) {
      case "jackets":
        productAttributes.innerHTML = `
          <div class="attribute">
            <span class="label">Gender:</span>
            <span class="value">${product.gender}</span>
          </div>
          <div class="attribute">
            <span class="label">Color:</span>
            <span class="value">${product.baseColor}</span>
          </div>
          ${
            product.sizes
              ? `
              <div class="attribute">
                <span class="label">Sizes:</span>
                <div class="sizes">
                  ${product.sizes.map((size) => `<span class="size">${size}</span>`).join("")}
                </div>
              </div>
              `
              : ""
          }
        `
        break

      case "movies":
        productAttributes.innerHTML = `
          <div class="attribute">
            <span class="label">Genre:</span>
            <span class="value">${product.genre || "N/A"}</span>
          </div>
          <div class="attribute">
            <span class="label">Rating:</span>
            <span class="value">${product.rating || "N/A"}</span>
          </div>
          <div class="attribute">
            <span class="label">Released:</span>
            <span class="value">${product.released || "N/A"}</span>
          </div>
        `
        break

      case "games":
        productAttributes.innerHTML = `
          <div class="attribute">
            <span class="label">Genre:</span>
            <span class="value">${product.genre || "N/A"}</span>
          </div>
          <div class="attribute">
            <span class="label">Age Rating:</span>
            <span class="value">${product.ageRating || "N/A"}</span>
          </div>
          <div class="attribute">
            <span class="label">Released:</span>
            <span class="value">${product.released || "N/A"}</span>
          </div>
        `
        break
    }
  }

  // Display related products in the grid
  function displayRelatedProducts(products) {
    if (!relatedProductsGrid || products.length === 0) {
      // Hide related products section if there are no products
      const relatedSection = document.querySelector(".related-products")
      if (relatedSection) {
        relatedSection.style.display = "none"
      }
      return
    }

    // Show related products section
    const relatedSection = document.querySelector(".related-products")
    if (relatedSection) {
      relatedSection.style.display = "block"
    }

    // Generate HTML for related products - fixed hover effect by removing environment-img
    relatedProductsGrid.innerHTML = products
      .map(
        (product) => `
        <div class="product-card">
          <a href="?id=${product.id}&type=${productType}" class="product-link">
            <div class="product-image-container">
              <img src="${product.image.url}" alt="${product.image.alt || product.title}" class="product-image">
            </div>
            <div class="product-info">
              <h3 class="product-title">${product.title}</h3>
              <p class="product-price">
                ${
                  product.onSale && product.discountedPrice < product.price
                    ? `<span class="original-price">$${product.price.toFixed(2)}</span> $${product.discountedPrice.toFixed(2)}`
                    : `$${product.price.toFixed(2)}`
                }
              </p>
            </div>
          </a>
          <button class="add-to-cart" onclick="window.addToCart('${product.id}', '${productType}')">
            Add to Cart
          </button>
        </div>
      `,
      )
      .join("")
  }

  function showErrorMessage() {
    // Create a fallback error message
    const errorHTML = `
      <div class="error-message">
        <p>Sorry, we couldn't find this product.</p>
        <a href="../index.html" class="cta-button-small">Return to Shop</a>
      </div>
    `

    // Try to insert it into the product detail container
    if (productDetailContainer) {
      productDetailContainer.innerHTML = errorHTML
    } else {
      // If product detail container doesn't exist, create a new container
      const mainElement = document.querySelector("main") || document.body
      const errorContainer = document.createElement("div")
      errorContainer.className = "container"
      errorContainer.innerHTML = errorHTML
      mainElement.appendChild(errorContainer)
    }
  }

  // Quantity controls
  if (minusBtn && quantityInput) {
    minusBtn.addEventListener("click", () => {
      const newValue = Math.max(1, Number.parseInt(quantityInput.value) - 1)
      quantityInput.value = newValue
    })
  }

  if (plusBtn && quantityInput) {
    plusBtn.addEventListener("click", () => {
      const newValue = Math.min(99, Number.parseInt(quantityInput.value) + 1)
      quantityInput.value = newValue
    })
  }

  if (quantityInput) {
    quantityInput.addEventListener("change", () => {
      let value = Number.parseInt(quantityInput.value)
      value = Math.max(1, Math.min(99, value || 1))
      quantityInput.value = value
    })
  }

  // Add styles for error popup and loading indicator
  const style = document.createElement("style")
  style.textContent = `
    .error-popup {
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #e53e3e;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 9999;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transform: translateX(120%);
      transition: transform 0.3s ease;
    }
    
    .error-popup.active {
      transform: translateX(0);
    }
    
    .product-loading {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 9999;
    }
    
    .product-loading .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: var(--primary-color);
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 1rem;
    }
    
    .product-loading p {
      font-weight: 500;
    }
    
    .error-message {
      text-align: center;
      padding: 3rem;
      margin: 2rem auto;
      max-width: 600px;
      background-color: #f8f9fa;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .error-message p {
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
      color: #666;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `
  document.head.appendChild(style)

  // Initialize page
  if (productId && productType) {
    try {
      fetchProductDetails()
    } catch (error) {
      showError(`Error showing product: ${error.message}`)
      showErrorMessage()
    }
  } else {
    showErrorMessage()
  }
})

