// DOM Elements
const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
const navLinks = document.querySelector(".nav-links")
const productsGrid = document.getElementById("productsGrid")
const cartCount = document.querySelector(".cart-count")
const loading = document.querySelector(".loading")
const searchInput = document.getElementById("searchInput")
const categoryFilter = document.getElementById("categoryFilter")
const cartModal = document.getElementById("cartModal")
const cartItems = document.getElementById("cartItems")
const cartEmpty = document.getElementById("cartEmpty")
const cartTotal = document.getElementById("cartTotal")
const checkoutBtn = document.querySelector(".checkout-btn")
const closeCartBtn = document.querySelector(".close-cart")
const cartBtn = document.querySelector(".cart-btn")
const genderFilter = document.getElementById("genderFilter")
const genreFilter = document.getElementById("genreFilter")

// State
let cart = []
let products = []
let filteredProducts = []

// Toggle mobile menu
mobileMenuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active")

  // Toggle hamburger animation
  mobileMenuBtn.classList.toggle("active")
  const spans = mobileMenuBtn.querySelectorAll("span")
  if (mobileMenuBtn.classList.contains("active")) {
    spans[0].style.transform = "rotate(45deg) translate(5px, 5px)"
    spans[1].style.opacity = "0"
    spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)"
  } else {
    spans[0].style.transform = "none"
    spans[1].style.opacity = "1"
    spans[2].style.transform = "none"
  }
})

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (
    navLinks.classList.contains("active") &&
    !e.target.closest(".nav-links") &&
    !e.target.closest(".mobile-menu-btn")
  ) {
    navLinks.classList.remove("active")
    mobileMenuBtn.classList.remove("active")
    const spans = mobileMenuBtn.querySelectorAll("span")
    spans[0].style.transform = "none"
    spans[1].style.opacity = "1"
    spans[2].style.transform = "none"
  }
})

// Toggle cart modal
cartBtn.addEventListener("click", () => {
  cartModal.classList.add("active")
  updateCartDisplay()
})

// Close cart modal
closeCartBtn.addEventListener("click", () => {
  cartModal.classList.remove("active")
})

// Close cart modal when clicking outside
cartModal.addEventListener("click", (e) => {
  if (e.target === cartModal) {
    cartModal.classList.remove("active")
  }
})

// Fetch products from Rainy Days API
async function fetchProducts() {
  try {
    loading.style.display = "flex"
    const response = await fetch("https://v2.api.noroff.dev/rainy-days")
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }
    
    const responseData = await response.json()
    console.log("API Response structure:", Object.keys(responseData))
    
    // Extract products from the API response (data property contains the products)
    products = responseData.data || []
    
    if (products.length === 0) {
      console.error("No products found in the API response")
      productsGrid.innerHTML = '<p class="error-message">No products available at this time. Please check back later.</p>'
      return
    }
    
    console.log(`Loaded ${products.length} products`)
    if (products.length > 0) {
      console.log("Sample product data structure:", Object.keys(products[0]))
      console.log("Sample product:", products[0])
      
      // Verify that required properties exist
      const requiredProps = ["id", "title", "description", "gender", "sizes", "baseColor", 
                          "price", "discountedPrice", "onSale", "image", "tags", "favorite"]
      
      const missingProps = requiredProps.filter(prop => !(prop in products[0]))
      if (missingProps.length > 0) {
        console.warn("Missing properties in product data:", missingProps)
      }
    }
    
    filteredProducts = [...products]

    // Populate category filter based on unique tags
    populateCategories(products)
    
    // Populate genre filter based on product data
    populateGenreFilter(products)
    
    // Add reset filters button
    addResetFiltersButton()
    
    // Display all products
    displayProducts(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    productsGrid.innerHTML = '<p class="error-message">Error loading products. Please try again later.</p>'
  } finally {
    loading.style.display = "none"
  }
}

// Populate category filter based on unique tags
function populateCategories(products) {
  // Clear existing options except "All Categories"
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  // Extract unique tags from all products
  const allTags = products.flatMap(product => product.tags || [])
  // Filter out non-clothing categories if needed (like "womens", "mens" that might overlap with gender)
  const uniqueTags = [...new Set(allTags)].filter(tag => 
    tag !== "mens" && tag !== "womens" && tag !== "unisex"
  )

  console.log("Available category tags:", uniqueTags)

  // Add each unique tag as an option
  uniqueTags.forEach((tag) => {
    const option = document.createElement("option")
    option.value = tag
    // Format tag name for display (capitalize first letter)
    option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1)
    categoryFilter.appendChild(option)
  })
}

// Populate genre filter based on products data
function populateGenreFilter(products) {
  // Clear existing options except "All Genres"
  while (genreFilter.options.length > 1) {
    genreFilter.remove(1);
  }

  // Look for words related to genres in titles, descriptions, and tags
  const genreKeywords = new Set()
  
  products.forEach(product => {
    // Look for common genre keywords in title and description
    const text = (product.title + " " + product.description).toLowerCase()
    
    // Add common keywords we find
    const keywords = ["casual", "sports", "hiking", "outdoor", "winter", "rain", "mountain"]
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        genreKeywords.add(keyword)
      }
    })
    
    // Also check tags for potential genres
    if (product.tags) {
      product.tags.forEach(tag => {
        if (!["jacket", "womens", "mens", "unisex"].includes(tag.toLowerCase())) {
          genreKeywords.add(tag.toLowerCase())
        }
      })
    }
  })
  
  console.log("Detected genre keywords:", [...genreKeywords])
  
  // Add each detected genre as an option
  const sortedGenres = [...genreKeywords].sort()
  sortedGenres.forEach(genre => {
    const option = document.createElement("option")
    option.value = genre
    option.textContent = genre.charAt(0).toUpperCase() + genre.slice(1)
    genreFilter.appendChild(option)
  })
}

// Filter products based on search, category, gender, and genre
function filterProducts() {
  const searchTerm = searchInput.value.toLowerCase()
  const category = categoryFilter.value.toLowerCase()
  const gender = genderFilter.value
  const genre = genreFilter.value.toLowerCase() // Make sure it's lowercase for comparison

  console.log("Filtering products with:", {
    searchTerm,
    category,
    gender,
    genre,
    totalProducts: products.length
  })

  // If all filters are at their default values, show all products
  if (searchTerm === "" && category === "all" && gender === "all" && genre === "all") {
    filteredProducts = [...products]
    console.log("All filters at default - showing all products:", filteredProducts.length)
    displayProducts(filteredProducts)
    return
  }

  filteredProducts = products.filter((product) => {
    // Match search term in title or description
    const matchesSearch =
      searchTerm === "" || // Empty search matches everything
      product.title.toLowerCase().includes(searchTerm) || 
      (product.description && product.description.toLowerCase().includes(searchTerm))
    
    // Match category (tag)
    let matchesCategory = category === "all"
    
    if (!matchesCategory && product.tags) {
      matchesCategory = product.tags.some(tag => tag.toLowerCase() === category)
    }
    
    // Match gender (exact match from API)
    const matchesGender = 
      gender === "all" || 
      (gender === "men" && product.gender === "Male") ||
      (gender === "women" && product.gender === "Female") ||
      (gender === "unisex" && product.gender === "Unisex")
    
    // Match genre in title, description or tags (improved to be more flexible)
    let matchesGenre = genre === "all" 
    
    if (!matchesGenre) {
      // Check in title
      const titleMatch = product.title.toLowerCase().includes(genre)
      
      // Check in description
      const descMatch = product.description && product.description.toLowerCase().includes(genre)
      
      // Check in tags - look for partial matches within tags
      const tagMatch = product.tags && product.tags.some(tag => 
        tag.toLowerCase().includes(genre) || genre.includes(tag.toLowerCase())
      )
      
      matchesGenre = titleMatch || descMatch || tagMatch
    }

    // Debug filter matches when filters are active
    if (searchTerm !== "" || category !== "all" || gender !== "all" || genre !== "all") {
      console.log(`Product ${product.title}: Search: ${matchesSearch}, Category: ${matchesCategory}, Gender: ${matchesGender}, Genre: ${matchesGenre}`)
    }

    return matchesSearch && matchesCategory && matchesGender && matchesGenre
  })

  console.log(`Filtered to ${filteredProducts.length} products`)
  displayProducts(filteredProducts)
}

// Search input event listener with special handling for empty search
searchInput.addEventListener("input", (event) => {
  console.log("Search input changed:", event.target.value)
  filterProducts()
})

// Reset all filters and show all products
function resetFilters() {
  searchInput.value = ""
  categoryFilter.value = "all"
  genderFilter.value = "all"
  genreFilter.value = "all"
  
  filteredProducts = [...products]
  displayProducts(filteredProducts)
}

// Add a reset filters button
function addResetFiltersButton() {
  const filtersContainer = document.querySelector(".filters")
  
  // Check if button already exists
  if (!document.getElementById("resetFiltersBtn")) {
    const resetButton = document.createElement("button")
    resetButton.id = "resetFiltersBtn"
    resetButton.className = "reset-filters-btn"
    resetButton.textContent = "Reset Filters"
    resetButton.addEventListener("click", resetFilters)
    
    filtersContainer.appendChild(resetButton)
    
    // Add style for the reset button
    const style = document.createElement("style")
    style.textContent = `
      .reset-filters-btn {
        padding: 0.75rem 1rem;
        background-color: var(--text-light);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: var(--transition);
      }
      .reset-filters-btn:hover {
        background-color: var(--primary-color);
      }
    `
    document.head.appendChild(style)
  }
}

// Category filter event listener
categoryFilter.addEventListener("change", () => {
  console.log("Category changed to:", categoryFilter.value)
  filterProducts()
})

// Gender filter event listener
genderFilter.addEventListener("change", () => {
  console.log("Gender changed to:", genderFilter.value)
  filterProducts()
})

// Genre filter event listener
genreFilter.addEventListener("change", () => {
  console.log("Genre changed to:", genreFilter.value)
  
  // If changing back to "all", make sure we update the filtered products
  if (genreFilter.value === "all") {
    console.log("Genre reset to All Genres, recalculating filters")
  }
  
  filterProducts()
})

// Display products in the grid
function displayProducts(products) {
  console.log(`Displaying ${products.length} products`)
  
  if (!products || products.length === 0) {
    productsGrid.className = ""
    productsGrid.innerHTML = '<p class="no-products">No products found. Try a different search or category.</p>'
    return
  }

  productsGrid.className = "products-grid"
  
  try {
    productsGrid.innerHTML = products
      .map(
        (product) => `
      <div class="product-card" data-id="${product.id}">
        <div class="product-image-container">
          <img src="${product.image.url}" alt="${product.image.alt}" class="product-image">
          <img src="${product.image.url}" alt="${product.image.alt}" class="environment-img">
          <div class="product-attributes">
            ${product.sizes.map(size => `<span>${size}</span>`).join('')}
          </div>
        </div>
        <div class="product-info">
          <div class="product-category">${product.gender} · ${product.baseColor}</div>
          <h3 class="product-title">${product.title}</h3>
          <p class="product-price">
            ${product.onSale 
              ? `<span class="original-price">$${product.price.toFixed(2)}</span> $${product.discountedPrice.toFixed(2)}` 
              : `$${product.price.toFixed(2)}`}
          </p>
          <button class="add-to-cart" onclick="addToCart('${product.id}')">
            Add to Cart
          </button>
        </div>
      </div>
    `,
      )
      .join("")
  } catch (error) {
    console.error("Error displaying products:", error)
    console.error("Error details:", error)
    if (products.length > 0) {
      console.error("First product object:", products[0])
    }
    productsGrid.innerHTML = '<p class="error-message">Error displaying products. Please try again later.</p>'
  }
}

// Add product to cart
function addToCart(productId) {
  const product = products.find((p) => p.id === productId)
  if (!product) return

  const existingItem = cart.find((item) => item.id === productId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      ...product,
      quantity: 1,
    })
  }

  updateCartCount()

  // Animation feedback
  const button = event.target
  const originalText = button.textContent
  button.textContent = "Added!"
  button.style.backgroundColor = "var(--success-color)"

  setTimeout(() => {
    button.textContent = originalText
    button.style.backgroundColor = "var(--primary-color)"
  }, 1000)
}

// Update cart count
function updateCartCount() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  cartCount.textContent = totalItems

  // Enable/disable checkout button
  checkoutBtn.disabled = totalItems === 0
}

// Update cart display
function updateCartDisplay() {
  if (cart.length === 0) {
    cartItems.style.display = "none"
    cartEmpty.style.display = "block"
    cartTotal.textContent = "$0.00"
    return
  }

  cartItems.style.display = "flex"
  cartEmpty.style.display = "none"

  cartItems.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.image.url}" alt="${item.image.alt}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">
          ${item.onSale 
            ? `$${item.discountedPrice.toFixed(2)}` 
            : `$${item.price.toFixed(2)}`}
        </div>
      </div>
      <div class="cart-item-quantity">
        <button class="quantity-btn" onclick="updateItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
        <span class="quantity-value">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
        <button class="remove-item" onclick="removeFromCart('${item.id}')">×</button>
      </div>
    </div>
  `,
    )
    .join("")

  // Calculate and display total
  const total = cart.reduce((sum, item) => {
    const itemPrice = item.onSale ? item.discountedPrice : item.price
    return sum + itemPrice * item.quantity
  }, 0)
  
  cartTotal.textContent = `$${total.toFixed(2)}`
}

// Update item quantity
function updateItemQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId)
    return
  }

  const item = cart.find((item) => item.id === productId)
  if (item) {
    item.quantity = newQuantity
    updateCartCount()
    updateCartDisplay()
  }
}

// Remove item from cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId)
  updateCartCount()
  updateCartDisplay()
}

// Newsletter form submission
const newsletterForm = document.querySelector(".newsletter-form")
newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const email = e.target.querySelector("input").value

  // Create a success message
  const successMessage = document.createElement("div")
  successMessage.className = "success-message"
  successMessage.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <p>Thank you for subscribing with: ${email}</p>
  `

  // Replace form with success message
  newsletterForm.parentNode.replaceChild(successMessage, newsletterForm)

  // Reset form (for future use if needed)
  e.target.reset()
})

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()

    const targetId = this.getAttribute("href")
    const targetElement = document.querySelector(targetId)

    if (targetElement) {
      // Close mobile menu if open
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active")
        mobileMenuBtn.classList.remove("active")
        const spans = mobileMenuBtn.querySelectorAll("span")
        spans[0].style.transform = "none"
        spans[1].style.opacity = "1"
        spans[2].style.transform = "none"
      }

      // Close cart modal if open
      if (cartModal.classList.contains("active")) {
        cartModal.classList.remove("active")
      }

      // Scroll to target
      window.scrollTo({
        top: targetElement.offsetTop - 70, // Account for fixed header
        behavior: "smooth",
      })
    }
  })
})

// Initialize the page
fetchProducts()

