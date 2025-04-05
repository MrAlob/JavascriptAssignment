let cart = []

function initializeCart() {
  const savedCart = localStorage.getItem("cart")
  if (savedCart) {
    cart = JSON.parse(savedCart)
    updateCartDisplay()
  }
}

// Cart functions
window.addToCart = (productId, productType, quantity = 1) => {
  fetch(getApiEndpoint(productType))
    .then((response) => response.json())
    .then((data) => {
      const product = data.data.find((p) => p.id === productId)
      if (!product) {
        console.error(`Product with ID ${productId} not found`)
        return
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
      const addToCartBtn = document.querySelector(".add-to-cart-btn")
      if (addToCartBtn) {
        addToCartBtn.textContent = "Added to Cart!"
        setTimeout(() => {
          addToCartBtn.textContent = "Add to Cart"
        }, 2000)
      }
    })
    .catch((error) => {
      console.error("Error adding to cart:", error)
      // Show error message to user
      const addToCartBtn = document.querySelector(".add-to-cart-btn")
      if (addToCartBtn) {
        const originalText = addToCartBtn.textContent
        addToCartBtn.textContent = "Error adding to cart"
        setTimeout(() => {
          addToCartBtn.textContent = originalText
        }, 2000)
      }
    })
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
})

