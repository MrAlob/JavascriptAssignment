let cart = []

function initializeCart() {
  const savedCart = localStorage.getItem("cart")
  if (savedCart) {
    cart = JSON.parse(savedCart)
    updateCartDisplay()
  }
}

// Show loading spinner
function showLoading(element) {
  // Create spinner if it doesn't exist
  let spinner = element.querySelector(".spinner-container")
  if (!spinner) {
    spinner = document.createElement("div")
    spinner.className = "spinner-container"
    spinner.innerHTML = `
      <div class="spinner"></div>
    `
    element.appendChild(spinner)
  }
  spinner.style.display = "flex"
}

// Hide loading spinner
function hideLoading(element) {
  const spinner = element.querySelector(".spinner-container")
  if (spinner) {
    spinner.style.display = "none"
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

// Cart functions
window.addToCart = async (productId, productType, quantity = 1) => {
  const addToCartBtn =
    document.querySelector(".add-to-cart-btn") || document.querySelector(`[data-id="${productId}"] .add-to-cart`)

  // Store the original button text and style
  let originalText = ""
  let originalStyle = {}

  if (addToCartBtn) {
    originalText = addToCartBtn.textContent
    originalStyle = {
      backgroundColor: addToCartBtn.style.backgroundColor,
      display: addToCartBtn.style.display || "block",
    }

    // Update button to "Adding..." state
    addToCartBtn.textContent = "Adding..."
    addToCartBtn.style.backgroundColor = "#666" // Darker color while adding

    // Create a loading indicator next to the button instead of inside it
    const loadingIndicator = document.createElement("div")
    loadingIndicator.className = "button-loading-indicator"
    loadingIndicator.innerHTML = '<div class="spinner-small"></div>'
    addToCartBtn.parentElement.appendChild(loadingIndicator)
  }

  try {
    const response = await fetch(getApiEndpoint(productType))
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`)
    }

    const data = await response.json()
    const product = data.data.find((p) => p.id === productId)

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`)
    }

    const existingItem = cart.find((item) => item.id === productId)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        ...product,
        productType,
        quantity,
      })
    }

    // Save and update UI
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartDisplay()

    // Show success message
    if (addToCartBtn) {
      addToCartBtn.textContent = "Added to Cart!"
      addToCartBtn.style.backgroundColor = "#48bb78" // Success green color

      // Revert back to original state after 2 seconds
      setTimeout(() => {
        addToCartBtn.textContent = originalText
        addToCartBtn.style.backgroundColor = originalStyle.backgroundColor || ""
      }, 2000)
    }
  } catch (error) {
    showError(`Error adding to cart: ${error.message}`)

    // Reset button
    if (addToCartBtn) {
      addToCartBtn.textContent = "Error adding to cart"
      addToCartBtn.style.backgroundColor = "#e53e3e" // Error red color

      // Revert back to original state after 2 seconds
      setTimeout(() => {
        addToCartBtn.textContent = originalText
        addToCartBtn.style.backgroundColor = originalStyle.backgroundColor || ""
      }, 2000)
    }
  } finally {
    if (addToCartBtn) {
      // Remove the loading indicator
      const loadingIndicator = addToCartBtn.parentElement.querySelector(".button-loading-indicator")
      if (loadingIndicator) {
        loadingIndicator.remove()
      }

      // Ensure button is visible
      addToCartBtn.style.display = "block"
    }
  }
}

function updateCartDisplay() {
  // Update cart count badge
  const cartCountElements = document.querySelectorAll(".cart-count")
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  cartCountElements.forEach((element) => {
    element.textContent = totalItems
    // Show/hide count based on items
    element.style.display = totalItems > 0 ? "flex" : "none"
  })

  // Update cart modal if it exists
  const cartItems = document.getElementById("cartItems")
  const cartEmpty = document.getElementById("cartEmpty")
  const cartTotal = document.getElementById("cartTotal")
  const checkoutBtn = document.querySelector(".checkout-btn")

  if (cartItems && cartEmpty && cartTotal && checkoutBtn) {
    if (cart.length === 0) {
      cartItems.style.display = "none"
      cartEmpty.style.display = "block"
      cartTotal.textContent = "$0.00"
      checkoutBtn.setAttribute("disabled", "true")
      checkoutBtn.style.pointerEvents = "none"
    } else {
      cartItems.style.display = "block"
      cartEmpty.style.display = "none"

      // Update cart items
      cartItems.innerHTML = cart
        .map(
          (item) => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image.url}" alt="${item.image.alt}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <div class="cart-item-price">
                            $${(item.onSale ? item.discountedPrice : item.price).toFixed(2)} × ${item.quantity}
                        </div>
                    </div>
                    <button onclick="removeFromCart('${item.id}')" class="remove-item">&times;</button>
                </div>
            `,
        )
        .join("")

      // Update total
      const total = cart.reduce((sum, item) => {
        const price = item.onSale ? item.discountedPrice : item.price
        return sum + price * item.quantity
      }, 0)

      cartTotal.textContent = `$${total.toFixed(2)}`
      checkoutBtn.removeAttribute("disabled")
      checkoutBtn.style.pointerEvents = "auto"
    }
  }
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId)
  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartDisplay()
}

// Helper function to get API endpoint
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

// Call initializeCart when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeCart)

// Initialize cart display when DOM loads
document.addEventListener("DOMContentLoaded", () => {
  updateCartDisplay()

  // Set up cart modal functionality
  const cartBtn = document.querySelector(".cart-btn")
  const cartModal = document.getElementById("cartModal")
  const closeCartBtn = document.querySelector(".close-cart")

  if (cartBtn && cartModal && closeCartBtn) {
    cartBtn.addEventListener("click", () => {
      cartModal.classList.add("active")
      updateCartDisplay()
    })

    closeCartBtn.addEventListener("click", () => {
      cartModal.classList.remove("active")
    })

    // Close modal when clicking outside
    cartModal.addEventListener("click", (e) => {
      if (e.target === cartModal) {
        cartModal.classList.remove("active")
      }
    })
  }

  // Fix checkout button navigation
  const checkoutBtn = document.querySelector(".checkout-btn")
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "checkout/index.html"
    })
  }

  // Add styles for error popup and spinner
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
    
    .spinner-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.7);
      z-index: 10;
    }
    
    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: var(--primary-color);
      animation: spin 1s ease-in-out infinite;
    }

    .button-loading-indicator {
      display: inline-flex;
      align-items: center;
      margin-left: 5px;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: var(--primary-color);
      animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `
  document.head.appendChild(style)
})

