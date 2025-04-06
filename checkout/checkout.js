document.addEventListener("DOMContentLoaded", () => {
  const orderItems = document.getElementById("orderItems")
  const subtotalElement = document.getElementById("subtotal")
  const shippingElement = document.getElementById("shipping")
  const totalElement = document.getElementById("total")
  const checkoutForm = document.getElementById("checkoutForm")

  // Show loading spinner
  function showLoading(element, message = "Loading...") {
    // Create spinner if it doesn't exist
    let loadingEl = element.querySelector(".loading-indicator")
    if (!loadingEl) {
      loadingEl = document.createElement("div")
      loadingEl.className = "loading-indicator"
      loadingEl.innerHTML = `
        <div class="spinner"></div>
        <p>${message}</p>
      `
      element.appendChild(loadingEl)
    }
    loadingEl.style.display = "flex"
  }

  // Hide loading spinner
  function hideLoading(element) {
    const loadingEl = element.querySelector(".loading-indicator")
    if (loadingEl) {
      loadingEl.style.display = "none"
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

  // Display cart items in order summary
  function displayOrderSummary() {
    const cart = JSON.parse(localStorage.getItem("cart")) || []

    if (cart.length === 0) {
      window.location.href = "../index.html#products"
      return
    }

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => {
      const price = item.onSale ? item.discountedPrice : item.price
      return sum + price * item.quantity
    }, 0)

    const shipping = 10 // Fixed shipping cost
    const total = subtotal + shipping

    // Display totals
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`
    shippingElement.textContent = `$${shipping.toFixed(2)}`
    totalElement.textContent = `$${total.toFixed(2)}`

    // Display order items
    orderItems.innerHTML = cart
      .map(
        (item) => `
            <div class="order-item">
                <img src="${item.image.url}" alt="${item.image.alt}" class="order-item-image">
                <div class="order-item-details">
                    <h4 class="order-item-title">${item.title}</h4>
                    <p class="order-item-price">$${(item.onSale ? item.discountedPrice : item.price).toFixed(2)} × ${item.quantity}</p>
                </div>
            </div>
        `,
      )
      .join("")
  }

  // Process order with loading indicator and error handling
  async function processOrder(e) {
    e.preventDefault()

    // Show loading state
    const submitBtn = checkoutForm.querySelector('button[type="submit"]')
    const originalBtnText = submitBtn.textContent
    submitBtn.textContent = "Processing..."
    submitBtn.disabled = true
    showLoading(document.querySelector(".checkout-page"), "Processing your order...")

    try {
      // Get cart items and calculate total
      const cart = JSON.parse(localStorage.getItem("cart")) || []

      if (cart.length === 0) {
        throw new Error("Your cart is empty")
      }

      // Create a basic order object with minimal information
      const subtotal = cart.reduce((sum, item) => {
        const price = item.onSale ? item.discountedPrice : item.price
        return sum + price * item.quantity
      }, 0)
      const shipping = 10
      const total = subtotal + shipping

      // Simulate network delay (remove in production)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a simple order object
      const order = {
        id: `ORD${Date.now()}`,
        date: new Date().toISOString(),
        customer: {
          firstName: document.getElementById("firstName")?.value || "Guest",
          lastName: document.getElementById("lastName")?.value || "User",
          address: document.getElementById("address")?.value || "123 Main St",
          city: document.getElementById("city")?.value || "Anytown",
          postalCode: document.getElementById("postalCode")?.value || "12345",
          country: document.getElementById("country")?.value || "NO",
        },
        items: cart,
        total: total,
      }

      // Store order in localStorage
      localStorage.setItem("lastOrder", JSON.stringify(order))

      // Clear cart
      localStorage.removeItem("cart")

      // Redirect to confirmation page
      window.location.href = "confirmation/index.html"
    } catch (error) {
      // Show error message
      showError(`Error processing order: ${error.message}`)

      // Reset button state
      submitBtn.disabled = false
      submitBtn.textContent = originalBtnText
      hideLoading(document.querySelector(".checkout-page"))
    }
  }

  // Simplified form submission with loading indicator
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", processOrder)
  }

  // Initialize page
  displayOrderSummary()

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
    
    .loading-indicator {
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
    
    .loading-indicator .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: var(--primary-color);
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 1rem;
    }
    
    .loading-indicator p {
      font-weight: 500;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `
  document.head.appendChild(style)
})

