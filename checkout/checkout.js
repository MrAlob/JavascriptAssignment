document.addEventListener("DOMContentLoaded", () => {
  const orderItems = document.getElementById("orderItems")
  const subtotalElement = document.getElementById("subtotal")
  const shippingElement = document.getElementById("shipping")
  const totalElement = document.getElementById("total")
  const checkoutForm = document.getElementById("checkoutForm")

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

  // Simplified form submission with no validation
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Get cart items and calculate total
    const cart = JSON.parse(localStorage.getItem("cart")) || []

    // Create a basic order object with minimal information
    const subtotal = cart.reduce((sum, item) => {
      const price = item.onSale ? item.discountedPrice : item.price
      return sum + price * item.quantity
    }, 0)
    const shipping = 10
    const total = subtotal + shipping

    // Create a simple order object
    const order = {
      id: `ORD${Date.now()}`,
      date: new Date().toISOString(),
      customer: {
        firstName: "Guest",
        lastName: "User",
        address: "123 Main St",
        city: "Anytown",
        postalCode: "12345",
        country: "NO",
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
  })

  // Initialize page
  displayOrderSummary()
})

