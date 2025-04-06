document.addEventListener("DOMContentLoaded", () => {
    // Show loading spinner
    function showLoading(element, message = "Loading...") {
      // Create spinner if it doesn't exist
      const loadingEl = document.createElement("div")
      loadingEl.className = "confirmation-loading"
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
          
          .confirmation-loading {
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
          
          .confirmation-loading .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid rgba(0, 0, 0, 0.1);
              border-radius: 50%;
              border-top-color: var(--primary-color);
              animation: spin 1s ease-in-out infinite;
              margin-bottom: 1rem;
          }
          
          .confirmation-loading p {
              font-weight: 500;
          }
          
          @keyframes spin {
              to {
                  transform: rotate(360deg);
              }
          }
      `
    document.head.appendChild(style)
  
    // Show loading indicator
    const loadingElement = showLoading(document.body, "Loading order details...")
  
    try {
      const order = JSON.parse(localStorage.getItem("lastOrder"))
  
      if (!order) {
        window.location.href = "../../index.html"
        return
      }
  
      // Display order details
      document.getElementById("orderNumber").textContent = order.id
      document.getElementById("orderDate").textContent = new Date(order.date).toLocaleDateString()
  
      // Display shipping address
      document.getElementById("shippingAddress").innerHTML = `
              ${order.customer.firstName} ${order.customer.lastName}<br>
              ${order.customer.address}<br>
              ${order.customer.city}, ${order.customer.postalCode}<br>
              ${order.customer.country}
          `
  
      // Display ordered items
      const confirmationItems = document.getElementById("confirmationItems")
      confirmationItems.innerHTML = order.items
        .map(
          (item) => `
              <div class="confirmation-item">
                  <img src="${item.image.url}" alt="${item.image.alt}">
                  <div class="confirmation-item-details">
                      <h4>${item.title}</h4>
                      <p>Quantity: ${item.quantity}</p>
                  </div>
                  <div class="confirmation-item-price">
                      $${((item.onSale ? item.discountedPrice : item.price) * item.quantity).toFixed(2)}
                  </div>
              </div>
          `,
        )
        .join("")
  
      // Display totals
      const subtotal = order.items.reduce((sum, item) => {
        const price = item.onSale ? item.discountedPrice : item.price
        return sum + price * item.quantity
      }, 0)
  
      const shipping = 10 // Fixed shipping cost
  
      document.getElementById("confirmationSubtotal").textContent = `$${subtotal.toFixed(2)}`
      document.getElementById("confirmationShipping").textContent = `$${shipping.toFixed(2)}`
      document.getElementById("confirmationTotal").textContent = `$${order.total.toFixed(2)}`
  
      // Clear order from localStorage after displaying
      localStorage.removeItem("lastOrder")
    } catch (error) {
      showError(`Error loading order details: ${error.message}`)
  
      // Create a fallback error message in the page
      const confirmationContent = document.querySelector(".confirmation-content")
      if (confirmationContent) {
        confirmationContent.innerHTML = `
                  <div class="error-message">
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <h1>Error Loading Order</h1>
                      <p>We couldn't load your order details. Please try again or contact customer support.</p>
                      <a href="../../index.html" class="cta-button">Return to Shop</a>
                  </div>
              `
      }
    } finally {
      // Hide loading indicator
      hideLoading(loadingElement)
    }
  })
  
  