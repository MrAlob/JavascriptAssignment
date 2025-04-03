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
let movies = []
let games = []

// Add new state variables for pagination
let currentDisplayPage = 1;
const productsPerPage = 8;
let activeCategory = "jackets"; // Default category: jackets, movies, or games

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

// Fetch all product data - jackets, movies, and games
async function fetchAllProducts() {
  try {
    loading.style.display = "flex";
    
    // Fetch all three types of products in parallel
    const [jacketsResponse, moviesResponse, gamesResponse] = await Promise.all([
      fetch("https://v2.api.noroff.dev/rainy-days"),
      fetch("https://v2.api.noroff.dev/square-eyes"),
      fetch("https://v2.api.noroff.dev/gamehub")
    ]);
    
    // Check responses
    if (!jacketsResponse.ok) {
      throw new Error(`Jackets API responded with status: ${jacketsResponse.status}`);
    }
    if (!moviesResponse.ok) {
      throw new Error(`Movies API responded with status: ${moviesResponse.status}`);
    }
    if (!gamesResponse.ok) {
      throw new Error(`Games API responded with status: ${gamesResponse.status}`);
    }
    
    // Parse responses
    const jacketsData = await jacketsResponse.json();
    const moviesData = await moviesResponse.json();
    const gamesData = await gamesResponse.json();
    
    // Store products by category
    products = jacketsData.data || [];
    movies = moviesData.data || [];
    games = gamesData.data || [];
    
    console.log(`Loaded ${products.length} jackets, ${movies.length} movies, and ${games.length} games`);
    
    // Set up category toggle buttons
    setupCategoryToggle();
    
    // Set default category to jackets
    switchCategory("jackets");
    
  } catch (error) {
    console.error("Error fetching products:", error);
    productsGrid.innerHTML = '<p class="error-message">Error loading products. Please try again later.</p>';
  } finally {
    loading.style.display = "none";
  }
}

// Set up category toggle buttons
function setupCategoryToggle() {
  // Add styles for category toggle buttons
  if (!document.getElementById("categoryToggleStyles")) {
    const style = document.createElement("style");
    style.id = "categoryToggleStyles";
    style.textContent = `
      .category-toggle {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      
      .category-toggle-btn {
        background-color: var(--secondary-color);
        color: var(--text-color);
        border: none;
        border-radius: var(--radius-md);
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: var(--transition);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .category-toggle-btn.active {
        background-color: var(--primary-color);
        color: white;
      }
      
      .category-toggle-btn:hover:not(.active) {
        background-color: var(--border-color);
      }
    `;
    document.head.appendChild(style);
  }
  
  // Create toggle container
  const toggleContainer = document.createElement("div");
  toggleContainer.className = "category-toggle";
  
  // Create toggle buttons
  const jacketsBtn = document.createElement("button");
  jacketsBtn.className = "category-toggle-btn active";
  jacketsBtn.textContent = "Jackets";
  jacketsBtn.addEventListener("click", () => switchCategory("jackets"));
  
  const moviesBtn = document.createElement("button");
  moviesBtn.className = "category-toggle-btn";
  moviesBtn.textContent = "Movies";
  moviesBtn.addEventListener("click", () => switchCategory("movies"));
  
  const gamesBtn = document.createElement("button");
  gamesBtn.className = "category-toggle-btn";
  gamesBtn.textContent = "Games";
  gamesBtn.addEventListener("click", () => switchCategory("games"));
  
  // Append buttons to container
  toggleContainer.appendChild(jacketsBtn);
  toggleContainer.appendChild(moviesBtn);
  toggleContainer.appendChild(gamesBtn);
  
  // Insert before the filters
  const filtersContainer = document.querySelector(".filters");
  const productsSection = document.querySelector(".products-section .container h2");
  productsSection.parentNode.insertBefore(toggleContainer, productsSection.nextSibling);
}

// Switch between product categories
function switchCategory(category) {
  activeCategory = category;
  currentDisplayPage = 1; // Reset to first page
  
  // Update active button
  const buttons = document.querySelectorAll(".category-toggle-btn");
  buttons.forEach(btn => {
    if (btn.textContent.toLowerCase() === category) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  
  // Reset filters
  resetFilters();
  
  // Show/hide filters based on category
  const filtersContainer = document.querySelector(".filters");
  if (category === "jackets") {
    filtersContainer.style.display = "flex";
    filteredProducts = [...products];
    populateCategories(products);
    populateGenreFilter(products);
  } else if (category === "movies") {
    filtersContainer.style.display = "flex";
    filteredProducts = [...movies];
    populateCategories(movies);
    populateGenreFilter(movies);
  } else if (category === "games") {
    filtersContainer.style.display = "flex";
    filteredProducts = [...games];
    populateCategories(games);
    populateGenreFilter(games);
  }
  
  // Display the appropriate products
  displayProducts(filteredProducts);
  addProductCountIndicator(filteredProducts.length);
}

// Add product count indicator
function addProductCountIndicator(count) {
  // Create or update product count indicator
  let countIndicator = document.getElementById("productCountIndicator")
  
  if (!countIndicator) {
    countIndicator = document.createElement("div")
    countIndicator.id = "productCountIndicator"
    countIndicator.className = "product-count"
    
    // Insert after the filters container
    const filtersContainer = document.querySelector(".filters")
    filtersContainer.parentNode.insertBefore(countIndicator, filtersContainer.nextSibling)
    
    // Add styles
    const style = document.createElement("style")
    style.textContent = `
      .product-count {
        margin: 1rem 0;
        font-size: 0.9rem;
        color: var(--text-light);
      }
    `
    document.head.appendChild(style)
  }
  
  // Calculate values for current page
  const startIndex = (currentDisplayPage - 1) * productsPerPage + 1;
  const endIndex = Math.min(startIndex + productsPerPage - 1, count);
  
  // Update the count with pagination info
  countIndicator.textContent = `Showing ${startIndex}-${endIndex} of ${count} products`
}

// Populate category filter based on product type
function populateCategories(products) {
  // Clear existing options except "All Categories"
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  if (activeCategory === "jackets") {
    // Extract unique tags from jacket products
    const allTags = products.flatMap(product => product.tags || []);
    const uniqueTags = [...new Set(allTags)].filter(tag => 
      tag !== "mens" && tag !== "womens" && tag !== "unisex"
    );
    
    console.log("Available jacket categories:", uniqueTags);
    
    // Add each unique tag as an option
    uniqueTags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
      categoryFilter.appendChild(option);
    });
    
    // Show gender filter for jackets
    document.querySelector(".gender-filter").style.display = "block";
  } 
  else if (activeCategory === "movies" || activeCategory === "games") {
    // Extract unique genres from movies or games
    const uniqueGenres = [...new Set(products.map(item => item.genre).filter(Boolean))];
    
    console.log(`Available ${activeCategory} genres:`, uniqueGenres);
    
    // Add each unique genre as an option
    uniqueGenres.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre.toLowerCase();
      option.textContent = genre;
      categoryFilter.appendChild(option);
    });
    
    // Hide gender filter for movies and games
    document.querySelector(".gender-filter").style.display = "none";
  }
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
  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value.toLowerCase();
  const gender = genderFilter.value;
  const genre = genreFilter.value.toLowerCase();

  console.log(`Filtering ${activeCategory} with:`, {
    searchTerm,
    category,
    gender,
    genre
  });

  // Reset to first page when applying new filters
  currentDisplayPage = 1;

  // Get the current product set based on active category
  let currentProducts = [];
  if (activeCategory === "jackets") {
    currentProducts = products;
  } else if (activeCategory === "movies") {
    currentProducts = movies;
  } else if (activeCategory === "games") {
    currentProducts = games;
  }

  // If all filters are at their default values, show all products in the category
  if (searchTerm === "" && category === "all" && gender === "all" && genre === "all") {
    filteredProducts = [...currentProducts];
    console.log(`All filters at default - showing all ${activeCategory}:`, filteredProducts.length);
    displayProducts(filteredProducts);
    return;
  }

  filteredProducts = currentProducts.filter((product) => {
    // Match search term in title or description
    const matchesSearch =
      searchTerm === "" ||
      product.title.toLowerCase().includes(searchTerm) || 
      (product.description && product.description.toLowerCase().includes(searchTerm));
    
    // Match category - handle different product types
    let matchesCategory = category === "all";
    if (!matchesCategory) {
      if (activeCategory === "jackets" && product.tags) {
        matchesCategory = product.tags.some(tag => tag.toLowerCase() === category);
      } else if (activeCategory === "movies" || activeCategory === "games") {
        matchesCategory = product.genre && product.genre.toLowerCase() === category;
      }
    }
    
    // Match gender - only applies to jackets
    const matchesGender = 
      gender === "all" || 
      activeCategory !== "jackets" || // Always match if not jackets
      (gender === "men" && product.gender === "Male") ||
      (gender === "women" && product.gender === "Female") ||
      (gender === "unisex" && product.gender === "Unisex");
    
    // Match genre - different handling for different product types
    let matchesGenre = genre === "all";
    
    if (!matchesGenre) {
      if (activeCategory === "jackets") {
        // For jackets, check title, description, tags
        const titleMatch = product.title.toLowerCase().includes(genre);
        const descMatch = product.description && product.description.toLowerCase().includes(genre);
        const tagMatch = product.tags && product.tags.some(tag => 
          tag.toLowerCase().includes(genre) || genre.includes(tag.toLowerCase())
        );
        matchesGenre = titleMatch || descMatch || tagMatch;
      } else if (activeCategory === "movies" || activeCategory === "games") {
        // For movies and games, check genre, title, description
        const genreMatch = product.genre && product.genre.toLowerCase().includes(genre);
        const titleMatch = product.title.toLowerCase().includes(genre);
        const descMatch = product.description && product.description.toLowerCase().includes(genre);
        matchesGenre = genreMatch || titleMatch || descMatch;
      }
    }

    return matchesSearch && matchesCategory && matchesGender && matchesGenre;
  });

  console.log(`Filtered to ${filteredProducts.length} ${activeCategory}`);
  displayProducts(filteredProducts);
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
  
  // Reset to first page when filters are reset
  currentDisplayPage = 1
  
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
    
    // Add click event with animation feedback
    resetButton.addEventListener("click", (e) => {
      // Visual feedback - change color temporarily
      e.target.style.backgroundColor = "var(--primary-hover)"  // Gray color on click
      
      // Reset all filters
      resetFilters()
      
      // Return to original color after a short delay
      setTimeout(() => {
        e.target.style.backgroundColor = "var(--primary-color)"  // Back to black
      }, 300)
    })
    
    filtersContainer.appendChild(resetButton)
    
    // Add style for the reset button
    const style = document.createElement("style")
    style.textContent = `
      .reset-filters-btn {
        padding: 0.75rem 1rem;
        background-color: var(--primary-color);  /* Black - matches Add to Cart */
        color: white;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: var(--transition);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 0.8rem;
        font-weight: 500;
      }
      .reset-filters-btn:hover {
        background-color: var(--primary-hover);  /* Gray on hover */
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

// Display products in the grid with pagination
function displayProducts(products) {
  console.log(`Displaying ${products.length} ${activeCategory}`);
  
  // Update the product count indicator
  const countIndicator = document.getElementById("productCountIndicator");
  if (countIndicator) {
    const startIndex = (currentDisplayPage - 1) * productsPerPage + 1;
    const endIndex = Math.min(startIndex + productsPerPage - 1, products.length);
    countIndicator.textContent = `Showing ${startIndex}-${endIndex} of ${products.length} ${activeCategory}`;
  }
  
  if (!products || products.length === 0) {
    productsGrid.className = "";
    productsGrid.innerHTML = '<p class="no-products">No products found. Try a different search or category.</p>';
    
    // Hide pagination if no products
    document.getElementById("paginationControls")?.remove();
    return;
  }

  // Calculate total pages
  const totalPages = Math.ceil(products.length / productsPerPage);
  
  // Ensure current page is valid
  if (currentDisplayPage < 1) currentDisplayPage = 1;
  if (currentDisplayPage > totalPages) currentDisplayPage = totalPages;
  
  // Calculate start and end index for current page
  const startIndex = (currentDisplayPage - 1) * productsPerPage;
  const endIndex = Math.min(startIndex + productsPerPage, products.length);
  
  // Get products for current page
  const productsToShow = products.slice(startIndex, endIndex);

  productsGrid.className = "products-grid";
  
  try {
    if (activeCategory === "jackets") {
      // Jacket display (existing code)
      productsGrid.innerHTML = productsToShow
        .map(
          (product) => `
        <div class="product-card" data-id="${product.id}">
          <div class="product-image-container">
            <img src="${product.image.url}" alt="${product.image.alt}" class="product-image">
            <img src="${product.image.url}" alt="${product.image.alt}" class="environment-img">
            <div class="product-attributes">
              ${product.sizes ? product.sizes.map(size => `<span>${size}</span>`).join('') : ''}
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
            <button class="add-to-cart" onclick="addToCart('${product.id}', 'jackets')">
              Add to Cart
            </button>
          </div>
        </div>
      `,
        )
        .join("");
    } else if (activeCategory === "movies") {
      // Movie display
      productsGrid.innerHTML = productsToShow
        .map(
          (movie) => `
        <div class="product-card" data-id="${movie.id}">
          <div class="product-image-container">
            <img src="${movie.image.url}" alt="${movie.image.alt}" class="product-image">
            <img src="${movie.image.url}" alt="${movie.image.alt}" class="environment-img">
            <div class="product-attributes">
              <span>${movie.genre}</span>
              <span>${movie.released}</span>
              <span>${movie.rating}</span>
            </div>
          </div>
          <div class="product-info">
            <div class="product-category">Movie · ${movie.genre}</div>
            <h3 class="product-title">${movie.title}</h3>
            <p class="product-price">$${movie.price.toFixed(2)}</p>
            <button class="add-to-cart" onclick="addToCart('${movie.id}', 'movies')">
              Add to Cart
            </button>
          </div>
        </div>
      `,
        )
        .join("");
    } else if (activeCategory === "games") {
      // Game display
      productsGrid.innerHTML = productsToShow
        .map(
          (game) => `
        <div class="product-card" data-id="${game.id}">
          <div class="product-image-container">
            <img src="${game.image.url}" alt="${game.image.alt}" class="product-image">
            <img src="${game.image.url}" alt="${game.image.alt}" class="environment-img">
            <div class="product-attributes">
              <span>${game.genre}</span>
              <span>${game.released}</span>
              <span>${game.ageRating || 'All ages'}</span>
            </div>
          </div>
          <div class="product-info">
            <div class="product-category">Game · ${game.genre}</div>
            <h3 class="product-title">${game.title}</h3>
            <p class="product-price">$${game.price.toFixed(2)}</p>
            <button class="add-to-cart" onclick="addToCart('${game.id}', 'games')">
              Add to Cart
            </button>
          </div>
        </div>
      `,
        )
        .join("");
    }
      
    // Create or update pagination controls
    createPaginationControls(products.length, totalPages);
    
  } catch (error) {
    console.error(`Error displaying ${activeCategory}:`, error);
    console.error("Error details:", error);
    if (products.length > 0) {
      console.error("First product object:", products[0]);
    }
    productsGrid.innerHTML = '<p class="error-message">Error displaying products. Please try again later.</p>';
  }
}

// Create pagination controls
function createPaginationControls(totalProducts, totalPages) {
  // Remove existing pagination if any
  let paginationControls = document.getElementById("paginationControls");
  if (paginationControls) {
    paginationControls.remove();
  }
  
  // Create new pagination controls
  paginationControls = document.createElement("div");
  paginationControls.id = "paginationControls";
  paginationControls.className = "pagination-controls";
  
  // Add styles for pagination
  if (!document.getElementById("paginationStyles")) {
    const style = document.createElement("style");
    style.id = "paginationStyles";
    style.textContent = `
      .pagination-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 2rem 0;
        gap: 1rem;
      }
      
      .pagination-btn {
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        cursor: pointer;
        transition: var(--transition);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .pagination-btn:hover:not(:disabled) {
        background-color: var(--primary-hover);
      }
      
      .pagination-btn:disabled {
        background-color: var(--text-light);
        cursor: not-allowed;
        opacity: 0.7;
      }
      
      .pagination-info {
        font-size: 0.9rem;
        color: var(--text-light);
      }
    `;
    document.head.appendChild(style);
  }
  
  // Create previous button
  const prevBtn = document.createElement("button");
  prevBtn.className = "pagination-btn";
  prevBtn.textContent = "Previous";
  prevBtn.disabled = currentDisplayPage <= 1;
  prevBtn.addEventListener("click", () => {
    if (currentDisplayPage > 1) {
      currentDisplayPage--;
      displayProducts(filteredProducts);
      // Scroll to products section
      document.getElementById("products").scrollIntoView({ behavior: "smooth" });
    }
  });
  
  // Create next button
  const nextBtn = document.createElement("button");
  nextBtn.className = "pagination-btn";
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentDisplayPage >= totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentDisplayPage < totalPages) {
      currentDisplayPage++;
      displayProducts(filteredProducts);
      // Scroll to products section
      document.getElementById("products").scrollIntoView({ behavior: "smooth" });
    }
  });
  
  // Create page info
  const pageInfo = document.createElement("span");
  pageInfo.className = "pagination-info";
  pageInfo.textContent = `Page ${currentDisplayPage} of ${totalPages}`;
  
  // Append elements to pagination controls
  paginationControls.appendChild(prevBtn);
  paginationControls.appendChild(pageInfo);
  paginationControls.appendChild(nextBtn);
  
  // Append pagination controls to the container
  const container = productsGrid.closest(".container");
  container.insertBefore(paginationControls, container.querySelector(".newsletter") || null);
  
  // If no .newsletter, append to the end of container
  if (!container.querySelector(".newsletter")) {
    container.appendChild(paginationControls);
  }
}

// Add product to cart
function addToCart(productId, productType) {
  let product;
  
  // Find the product based on type
  if (productType === "jackets") {
    product = products.find((p) => p.id === productId);
  } else if (productType === "movies") {
    product = movies.find((p) => p.id === productId);
  } else if (productType === "games") {
    product = games.find((p) => p.id === productId);
  }
  
  if (!product) return;

  // Add product type for later identification
  product.productType = productType;

  const existingItem = cart.find((item) => item.id === productId && item.productType === productType);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  updateCartCount();

  // Animation feedback
  const button = event.target;
  const originalText = button.textContent;
  button.textContent = "Added!";
  button.style.backgroundColor = "var(--success-color)";

  setTimeout(() => {
    button.textContent = originalText;
    button.style.backgroundColor = "var(--primary-color)";
  }, 1000);
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
fetchAllProducts();

