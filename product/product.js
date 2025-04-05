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
  
    // Store the current product data
    let currentProduct = null
  
    // Fetch product details
    async function fetchProductDetails() {
      try {
        const response = await fetch(getApiEndpoint(productType))
        if (!response.ok) throw new Error(`Failed to fetch product: ${response.status}`)
  
        const data = await response.json()
        currentProduct = data.data.find((item) => item.id === productId)
  
        if (!currentProduct) throw new Error(`Product with ID ${productId} not found`)
  
        // Update page title and product info
        updateProductDisplay(currentProduct)
  
        // Setup add to cart button
        addToCartBtn.addEventListener("click", () => {
          const quantity = Number.parseInt(quantityInput.value)
          // Use the global addToCart function from cart.js
          window.addToCart(currentProduct.id, productType, quantity)
        })
  
        // Fetch and display related products
        fetchRelatedProducts(data.data, currentProduct)
      } catch (error) {
        console.error(`Error loading product: ${error.message}`)
        showErrorMessage()
      }
    }
  
    // Fetch related products based on current product
    async function fetchRelatedProducts(allProducts, currentProduct) {
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
        console.error("Error fetching related products:", error)
        // Hide related products section if there's an error
        const relatedSection = document.querySelector(".related-products")
        if (relatedSection) {
          relatedSection.style.display = "none"
        }
      }
    }
  
    function updateProductDisplay(product) {
      document.title = `${product.title} | The Shop`
      productTitle.textContent = product.title
  
      // Update main image
      mainImage.innerHTML = `
              <img src="${product.image.url}" alt="${product.image.alt || product.title}">
          `
  
      // Update price information
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
  
      // Update description
      productDescription.innerHTML = `<p>${product.description}</p>`
  
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
  
      // Generate HTML for related products
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
      document.querySelector(".product-detail").innerHTML = `
              <div class="error-message">
                  <p>Sorry, we couldn't find this product.</p>
                  <a href="../index.html" class="cta-button-small">Return to Shop</a>
              </div>
          `
    }
  
    // Quantity controls
    minusBtn.addEventListener("click", () => {
      const newValue = Math.max(1, Number.parseInt(quantityInput.value) - 1)
      quantityInput.value = newValue
    })
  
    plusBtn.addEventListener("click", () => {
      const newValue = Math.min(99, Number.parseInt(quantityInput.value) + 1)
      quantityInput.value = newValue
    })
  
    quantityInput.addEventListener("change", () => {
      let value = Number.parseInt(quantityInput.value)
      value = Math.max(1, Math.min(99, value || 1))
      quantityInput.value = value
    })
  
    // Initialize page
    if (productId && productType) {
      fetchProductDetails()
    } else {
      showErrorMessage()
    }
  })
  
  