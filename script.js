// DOM Elements
const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
const navLinks = document.querySelector(".nav-links")
const productsGrid = document.getElementById("productsGrid")
const searchInput = document.getElementById("searchInput")
const categoryFilter = document.getElementById("categoryFilter")
const cartModal = document.getElementById("cartModal")
const closeCartBtn = document.querySelector(".close-cart")
const cartBtn = document.querySelector(".cart-btn")
const genderFilter = document.getElementById("genderFilter")
const genreFilter = document.getElementById("genreFilter")

// State
let products = []
let filteredProducts = []
let movies = []
let games = []
let allProducts = [] // New variable to store all products from all categories

// Add new state variables for pagination
let currentDisplayPage = 1
const productsPerPage = 8

// Show loading spinner
function showLoading(element, message = "Loading...") {
  // Check if element exists
  if (!element) return null

  // Use existing loading element if it exists
  let loadingEl = document.querySelector(".loading")
  if (!loadingEl) {
    loadingEl = document.createElement("div")
    loadingEl.className = "loading"
    loadingEl.innerHTML = `
      <div class="spinner"></div>
      <p>${message}</p>
    `
    element.appendChild(loadingEl)
  } else {
    const messageEl = loadingEl.querySelector("p")
    if (messageEl) {
      messageEl.textContent = message
    }
    loadingEl.style.display = "flex"
  }
  return loadingEl
}

// Hide loading spinner
function hideLoading(loadingElement) {
  if (loadingElement) {
    loadingElement.style.display = "none"
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

// Toggle mobile menu
if (mobileMenuBtn && navLinks) {
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
}

// Close mobile menu when clicking outside
if (navLinks) {
  document.addEventListener("click", (e) => {
    if (
      navLinks.classList.contains("active") &&
      !e.target.closest(".nav-links") &&
      !e.target.closest(".mobile-menu-btn")
    ) {
      navLinks.classList.remove("active")
      if (mobileMenuBtn) {
        mobileMenuBtn.classList.remove("active")
        const spans = mobileMenuBtn.querySelectorAll("span")
        spans[0].style.transform = "none"
        spans[1].style.opacity = "1"
        spans[2].style.transform = "none"
      }
    }
  })
}

// Fetch all product data - jackets, movies, and games
async function fetchAllProducts() {
  // Check if we're on a page that needs products
  if (!productsGrid) return

  const productsSection = document.querySelector(".products-section")
  if (!productsSection) return

  try {
    const loadingElement = showLoading(productsSection, "Loading products...")

    // Fetch all three types of products in parallel
    const [jacketsData, moviesData, gamesData] = await Promise.all([
      fetchData("https://v2.api.noroff.dev/rainy-days"),
      fetchData("https://v2.api.noroff.dev/square-eyes"),
      fetchData("https://v2.api.noroff.dev/gamehub"),
    ])

    // Store products by category
    products = jacketsData.data || []
    movies = moviesData.data || []
    games = gamesData.data || []

    // Add category property to each product
    products.forEach((item) => (item.productCategory = "jackets"))
    movies.forEach((item) => (item.productCategory = "movies"))
    games.forEach((item) => (item.productCategory = "games"))

    // Combine all products
    allProducts = [...products, ...movies, ...games]

    // Set up filters
    setupFilters()

    // Show all products initially
    filteredProducts = [...allProducts]
    displayProducts(filteredProducts)
    addProductCountIndicator(filteredProducts.length)
  } catch (error) {
    showError(`Error fetching products: ${error.message}`)
    if (productsGrid) {
      productsGrid.innerHTML = '<p class="error-message">Error loading products. Please try again later.</p>'
    }
  } finally {
    hideLoading(document.querySelector(".loading"))
  }
}

// Set up filters based on loaded data
function setupFilters() {
  // Only run if we have the necessary elements
  if (!categoryFilter && !genreFilter && !genderFilter) return

  // Set up product category filter (main category filter)
  populateMainCategoryFilter()

  // Set up secondary filters based on the default category (all)
  updateSecondaryFilters("all")

  // Add reset button
  addResetFiltersButton()
}

// Set up the main category filter (Jackets, Movies, Games)
function populateMainCategoryFilter() {
  if (!categoryFilter) return

  // Clear existing options except "All Categories"
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1)
  }

  // Add main product categories
  const mainCategories = [
    { value: "jackets", label: "Jackets" },
    { value: "movies", label: "Movies" },
    { value: "games", label: "Games" },
  ]

  mainCategories.forEach((cat) => {
    const option = document.createElement("option")
    option.value = cat.value
    option.textContent = cat.label
    categoryFilter.appendChild(option)
  })

  // Add change event listener to category filter
  categoryFilter.addEventListener("change", function () {
    const selectedCategory = this.value
    updateSecondaryFilters(selectedCategory)
    filterProducts()
  })
}

// Update secondary filters based on selected main category
function updateSecondaryFilters(selectedCategory) {
  if (!genreFilter || !genderFilter) return

  const genderFilterContainer = document.querySelector(".gender-filter")
  const genreFilterContainer = document.querySelector(".genre-filter")

  // Create or get the second genre filter for movies/games
  let secondGenreFilter = document.getElementById("secondGenreFilter")
  let secondGenreFilterContainer = document.querySelector(".second-genre-filter")

  if (!secondGenreFilterContainer) {
    // Create the second genre filter container if it doesn't exist
    secondGenreFilterContainer = document.createElement("div")
    secondGenreFilterContainer.className = "second-genre-filter"

    const select = document.createElement("select")
    select.id = "secondGenreFilter"
    select.innerHTML = '<option value="all">All</option>'

    secondGenreFilterContainer.appendChild(select)

    // Add it after the first genre filter
    const filtersContainer = document.querySelector(".filters")
    if (filtersContainer) {
      const resetBtn = document.getElementById("resetFiltersBtn")
      if (resetBtn) {
        filtersContainer.insertBefore(secondGenreFilterContainer, resetBtn)
      } else {
        filtersContainer.appendChild(secondGenreFilterContainer)
      }
    }

    // Add event listener for the new filter
    const selectElement = document.getElementById("secondGenreFilter")
    if (selectElement) {
      selectElement.addEventListener("change", () => {
        filterProducts()
      })
    }

    // Add styles for the new filter
    const style = document.createElement("style")
    style.textContent = `
      .second-genre-filter {
        width: 200px;
      }
      .second-genre-filter select {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        font-family: inherit;
        background-color: white;
        appearance: none;
        background-image:
        url("data:image/svg+xml; charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 -5 16 16' fill='none' stroke='%23b4b4b4' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='11 2 13 4 15 2'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 1rem center;
      }
    `
    document.head.appendChild(style)
  }

  secondGenreFilter = document.getElementById("secondGenreFilter")

  // Reset all filters
  while (genreFilter.options.length > 1) {
    genreFilter.remove(1)
  }

  if (secondGenreFilter) {
    while (secondGenreFilter.options.length > 1) {
      secondGenreFilter.remove(1)
    }
  }

  // Handle display of filter sections based on category
  if (selectedCategory === "all" || selectedCategory === "jackets") {
    // Show gender filter, hide second genre filter
    if (genderFilterContainer) genderFilterContainer.style.display = "block"
    if (genreFilterContainer) genreFilterContainer.style.display = "block"
    if (secondGenreFilterContainer) secondGenreFilterContainer.style.display = "none"

    // Update genre filter for jackets
    genreFilter.options[0].textContent = "All Styles"
    genreFilter.setAttribute("title", "Filter by style")

    // Populate with jacket styles/genres
    if (selectedCategory === "jackets") {
      populateJacketGenres(products)
    } else {
      populateJacketGenres(products)
    }
  } else if (selectedCategory === "movies") {
    // Show both genre filters, hide gender filter
    if (genderFilterContainer) genderFilterContainer.style.display = "none"
    if (genreFilterContainer) genreFilterContainer.style.display = "block"
    if (secondGenreFilterContainer) secondGenreFilterContainer.style.display = "block"

    // Update first genre filter for movies - now for actual genres
    genreFilter.options[0].textContent = "All Movie Genres"
    genreFilter.setAttribute("title", "Filter by movie genre")

    // Populate with movie genres
    populateMovieGenres(movies)

    // Update second genre filter for movie ratings
    if (secondGenreFilter) {
      secondGenreFilter.options[0].textContent = "All Ratings"
      secondGenreFilter.setAttribute("title", "Filter by rating")

      // Populate with movie ratings
      populateMovieRatings(movies, secondGenreFilter)
    }
  } else if (selectedCategory === "games") {
    // Show both genre filters, hide gender filter
    if (genderFilterContainer) genderFilterContainer.style.display = "none"
    if (genreFilterContainer) genreFilterContainer.style.display = "block"
    if (secondGenreFilterContainer) secondGenreFilterContainer.style.display = "block"

    // Update first genre filter for games - now for actual genres
    genreFilter.options[0].textContent = "All Game Genres"
    genreFilter.setAttribute("title", "Filter by game genre")

    // Populate with game genres
    populateGameGenres(games)

    // Update second genre filter for game age ratings
    if (secondGenreFilter) {
      secondGenreFilter.options[0].textContent = "All Age Ratings"
      secondGenreFilter.setAttribute("title", "Filter by age rating")

      // Populate with game age ratings
      populateGameAgeRatings(games, secondGenreFilter)
    }
  }
}

// New function to populate movie genres
function populateMovieGenres(movieProducts) {
  if (!genreFilter) return

  const genres = new Set()

  movieProducts.forEach((movie) => {
    if (movie.genre) {
      genres.add(movie.genre)
    }
  })

  // Add each genre as an option
  const sortedGenres = [...genres].sort()
  sortedGenres.forEach((genre) => {
    const option = document.createElement("option")
    option.value = genre.toLowerCase()
    option.textContent = genre
    genreFilter.appendChild(option)
  })
}

// New function to populate game genres
function populateGameGenres(gameProducts) {
  if (!genreFilter) return

  const genres = new Set()

  gameProducts.forEach((game) => {
    if (game.genre) {
      genres.add(game.genre)
    }
  })

  // Add each genre as an option
  const sortedGenres = [...genres].sort()
  sortedGenres.forEach((genre) => {
    const option = document.createElement("option")
    option.value = genre.toLowerCase()
    option.textContent = genre
    genreFilter.appendChild(option)
  })
}

// Update the movie ratings function to handle and standardize ratings
function populateMovieRatings(movieProducts, selectElement) {
  if (!selectElement) return

  // Use a Map to store standardized ratings (floor to whole numbers)
  const ratings = new Map()

  movieProducts.forEach((movie) => {
    if (movie.rating) {
      // Convert rating string to a number if possible
      let ratingValue

      // Try to parse the rating as a number
      const parsedRating = Number.parseFloat(movie.rating)
      if (!isNaN(parsedRating)) {
        // Round down to a whole number
        ratingValue = Math.floor(parsedRating)
      } else {
        // For non-numeric ratings, just store as is
        ratingValue = movie.rating
      }

      // Store the standardized rating in the map with the original rating as value
      ratings.set(ratingValue.toString(), movie.rating)
    }
  })

  // Create predefined ratings from 5-10 for movies
  const predefinedRatings = [5, 6, 7, 8, 9, 10]

  // Add each rating as an option, ensuring we have options 5-10
  predefinedRatings.forEach((rating) => {
    const option = document.createElement("option")
    option.value = rating.toString()
    option.textContent = rating.toString()
    selectElement.appendChild(option)
  })
}

// Update to use the passed select element
function populateGameAgeRatings(gameProducts, selectElement) {
  if (!selectElement) return

  const platforms = new Set()

  gameProducts.forEach((game) => {
    if (game.ageRating) {
      platforms.add(game.ageRating)
    }
  })

  // Add each platform as an option
  const sortedPlatforms = [...platforms].sort()
  sortedPlatforms.forEach((platform) => {
    if (platform && platform.trim() !== "") {
      const option = document.createElement("option")
      option.value = platform.toLowerCase()
      option.textContent = platform
      selectElement.appendChild(option)
    }
  })
}

// Filter products based on search, category, gender, and genre
function filterProducts() {
  if (!searchInput || !categoryFilter || !genderFilter || !genreFilter) return

  const searchTerm = searchInput.value.toLowerCase()
  const mainCategory = categoryFilter.value.toLowerCase()
  const gender = genderFilter.value
  const genre = genreFilter.value.toLowerCase()
  const secondGenreFilter = document.getElementById("secondGenreFilter")
  const secondGenre = secondGenreFilter ? secondGenreFilter.value.toLowerCase() : "all"

  // Get the container element
  const productsSection = document.querySelector(".products-section")
  if (!productsSection) return

  // Show loading indicator
  const loadingElement = showLoading(productsSection, "Filtering products...")

  try {
    // Reset to first page when applying filters
    currentDisplayPage = 1

    // Start with all products or the selected category
    let currentProducts = []
    if (mainCategory === "all") {
      currentProducts = [...allProducts]
    } else if (mainCategory === "jackets") {
      currentProducts = [...products]
    } else if (mainCategory === "movies") {
      currentProducts = [...movies]
    } else if (mainCategory === "games") {
      currentProducts = [...games]
    }

    // If all filters are at their default values and we're showing a specific category,
    // just show all products from that category
    if (searchTerm === "" && gender === "all" && genre === "all" && secondGenre === "all") {
      filteredProducts = [...currentProducts]
      displayProducts(filteredProducts)
      return
    }

    // Filter the products
    filteredProducts = currentProducts.filter((product) => {
      // Match search term in title or description
      const matchesSearch =
        searchTerm === "" ||
        product.title.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))

      // Match gender - only applies to jackets
      const matchesGender =
        gender === "all" ||
        product.productCategory !== "jackets" || // Always match if not jackets
        (gender === "men" && product.gender === "Male") ||
        (gender === "women" && product.gender === "Female") ||
        (gender === "unisex" && product.gender === "Unisex")

      // Match genre - different handling for different product types
      let matchesGenre = genre === "all"

      if (!matchesGenre) {
        if (product.productCategory === "jackets") {
          // For jackets, check title, description, tags
          const titleMatch = product.title.toLowerCase().includes(genre)
          const descMatch = product.description && product.description.toLowerCase().includes(genre)
          const tagMatch =
            product.tags &&
            product.tags.some((tag) => tag.toLowerCase().includes(genre) || genre.includes(tag.toLowerCase()))
          matchesGenre = titleMatch || descMatch || tagMatch
        } else if (product.productCategory === "movies") {
          // For movies, check genre
          matchesGenre = product.genre && product.genre.toLowerCase() === genre
        } else if (product.productCategory === "games") {
          // For games, check genre
          matchesGenre = product.genre && product.genre.toLowerCase() === genre
        }
      }

      // Match second genre (used for ratings in movies/games)
      let matchesSecondGenre = secondGenre === "all"

      if (!matchesSecondGenre) {
        if (product.productCategory === "movies") {
          // For movies, check if the rating starts with the selected value
          // This will match, for example, "6" with "6.5", "6.7", etc.
          if (product.rating) {
            // Try to parse the rating as a number
            const parsedRating = Number.parseFloat(product.rating)
            if (!isNaN(parsedRating)) {
              // Check if the floor of the rating equals the selected value
              const flooredRating = Math.floor(parsedRating).toString()
              matchesSecondGenre = flooredRating === secondGenre
            } else {
              // For non-numeric ratings, try direct match
              matchesSecondGenre = product.rating.toLowerCase() === secondGenre
            }
          }
        } else if (product.productCategory === "games") {
          // For games, check age rating
          matchesSecondGenre = product.ageRating && product.ageRating.toLowerCase() === secondGenre
        }
      }

      return matchesSearch && matchesGender && matchesGenre && matchesSecondGenre
    })

    displayProducts(filteredProducts)
  } catch (error) {
    showError(`Error filtering products: ${error.message}`)
  } finally {
    hideLoading(loadingElement)
  }
}

// Add product count indicator
function addProductCountIndicator(count) {
  // Check if we're on a page that needs this
  if (!productsGrid) return

  // Create or update product count indicator
  let countIndicator = document.getElementById("productCountIndicator")

  if (!countIndicator) {
    countIndicator = document.createElement("div")
    countIndicator.id = "productCountIndicator"
    countIndicator.className = "product-count"

    // Insert after the filters container
    const filtersContainer = document.querySelector(".filters")
    if (filtersContainer) {
      filtersContainer.parentNode.insertBefore(countIndicator, filtersContainer.nextSibling)
    }

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
  const startIndex = (currentDisplayPage - 1) * productsPerPage + 1
  const endIndex = Math.min(startIndex + productsPerPage - 1, count)

  // Update the count with pagination info
  countIndicator.textContent = `Showing ${startIndex}-${endIndex} of ${count} products`
}

// Reset all filters and show all products
function resetFilters() {
  if (!searchInput || !categoryFilter || !genderFilter || !genreFilter) return

  searchInput.value = ""
  categoryFilter.value = "all"
  genderFilter.value = "all"
  genreFilter.value = "all"

  // Reset second genre filter if it exists
  const secondGenreFilter = document.getElementById("secondGenreFilter")
  if (secondGenreFilter) {
    secondGenreFilter.value = "all"
  }

  // Reset to first page when filters are reset
  currentDisplayPage = 1

  // Show all products
  filteredProducts = [...allProducts]
  updateSecondaryFilters("all")
  displayProducts(filteredProducts)
}

// Add a reset filters button
function addResetFiltersButton() {
  const filtersContainer = document.querySelector(".filters")
  if (!filtersContainer) return

  // Check if button already exists
  if (!document.getElementById("resetFiltersBtn")) {
    const resetButton = document.createElement("button")
    resetButton.id = "resetFiltersBtn"
    resetButton.className = "reset-filters-btn"
    resetButton.textContent = "Reset Filters"

    // Add click event with animation feedback
    resetButton.addEventListener("click", (e) => {
      // Visual feedback - change color temporarily
      e.target.style.backgroundColor = "var(--primary-hover)" // Gray color on click

      // Reset all filters
      resetFilters()

      // Return to original color after a short delay
      setTimeout(() => {
        e.target.style.backgroundColor = "var(--primary-color)" // Back to black
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

// Add event listeners for filters
if (searchInput) {
  searchInput.addEventListener("input", filterProducts)
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", () => {
    filterProducts()
  })
}

if (genderFilter) {
  genderFilter.addEventListener("change", () => {
    filterProducts()
  })
}

if (genreFilter) {
  genreFilter.addEventListener("change", () => {
    filterProducts()
  })
}

// Display products in the grid with pagination
function displayProducts(products) {
  if (!productsGrid) return

  // Update the product count indicator
  const countIndicator = document.getElementById("productCountIndicator")
  if (countIndicator) {
    const startIndex = (currentDisplayPage - 1) * productsPerPage + 1
    const endIndex = Math.min(startIndex + productsPerPage - 1, products.length)
    countIndicator.textContent = `Showing ${startIndex}-${endIndex} of ${products.length} products`
  }

  if (!products || products.length === 0) {
    productsGrid.className = ""
    productsGrid.innerHTML = '<p class="no-products">No products found. Try a different search or category.</p>'

    // Hide pagination if no products
    document.getElementById("paginationControls")?.remove()
    return
  }

  // Calculate total pages
  const totalPages = Math.ceil(products.length / productsPerPage)

  // Ensure current page is valid
  if (currentDisplayPage < 1) currentDisplayPage = 1
  if (currentDisplayPage > totalPages) currentDisplayPage = totalPages

  // Calculate start and end index for current page
  const startIndex = (currentDisplayPage - 1) * productsPerPage
  const endIndex = Math.min(startIndex + productsPerPage, products.length)

  // Get products for current page
  const productsToShow = products.slice(startIndex, endIndex)

  productsGrid.className = "products-grid"

  try {
    // Generate HTML for each product based on its type
    productsGrid.innerHTML = productsToShow
      .map((product) => {
        if (product.productCategory === "jackets") {
          return `
            <div class="product-card" data-id="${product.id}" data-category="jackets">
              <a href="product/index.html?id=${product.id}&type=jackets" class="product-link">
                <div class="product-image-container">
                  <img src="${product.image.url}" alt="${product.image.alt}" class="product-image">
                  <img src="${product.image.url}" alt="${product.image.alt}" class="environment-img">
                </div>
                <div class="product-info">
                  <div class="product-category">Jacket · ${product.gender} · ${product.baseColor}</div>
                  <h3 class="product-title">${product.title}</h3>
                  <p class="product-price">
                    ${
                      product.onSale
                        ? `<span class="original-price">$${product.price.toFixed(2)}</span> $${product.discountedPrice.toFixed(2)}`
                        : `$${product.price.toFixed(2)}`
                    }
                  </p>
                </div>
              </a>
              <button class="add-to-cart" onclick="addToCart('${product.id}', 'jackets')">
                Add to Cart
              </button>
            </div>
          `
        } else if (product.productCategory === "movies") {
          return `
            <div class="product-card" data-id="${product.id}" data-category="movies">
              <a href="product/index.html?id=${product.id}&type=movies" class="product-link">
                <div class="product-image-container">
                  <img src="${product.image.url}" alt="${product.image.alt}" class="product-image">
                  <img src="${product.image.url}" alt="${product.image.alt}" class="environment-img">
                  <div class="product-attributes">
                    <span>${product.genre || "No genre"}</span>
                    <span>${product.released || "Unknown"}</span>
                    <span>${product.rating ? `Rating: ${product.rating}` : "No rating"}</span>
                  </div>
                </div>
                <div class="product-info">
                  <div class="product-category">Movie · ${product.genre || "Unknown genre"}</div>
                  <h3 class="product-title">${product.title}</h3>
                  <p class="product-price">$${product.price.toFixed(2)}</p>
                </div>
              </a>
              <button class="add-to-cart" onclick="addToCart('${product.id}', 'movies')">
                Add to Cart
              </button>
            </div>
          `
        } else if (product.productCategory === "games") {
          return `
            <div class="product-card" data-id="${product.id}" data-category="games">
              <a href="product/index.html?id=${product.id}&type=games" class="product-link">
                <div class="product-image-container">
                  <img src="${product.image.url}" alt="${product.image.alt}" class="product-image">
                  <img src="${product.image.url}" alt="${product.image.alt}" class="environment-img">
                  <div class="product-attributes">
                    <span>${product.genre || "No genre"}</span>
                    <span>${product.released || "Unknown"}</span>
                    <span>${product.ageRating || "All ages"}</span>
                  </div>
                </div>
                <div class="product-info">
                  <div class="product-category">Game · ${product.genre || "Unknown genre"}</div>
                  <h3 class="product-title">${product.title}</h3>
                  <p class="product-price">$${product.price.toFixed(2)}</p>
                </div>
              </a>
              <button class="add-to-cart" onclick="addToCart('${product.id}', 'games')">
                Add to Cart
              </button>
            </div>
          `
        }
      })
      .join("")

    // Create or update pagination controls
    createPaginationControls(products.length, totalPages)
  } catch (error) {
    showError(`Error displaying products: ${error.message}`)
    productsGrid.innerHTML = '<p class="error-message">Error displaying products. Please try again later.</p>'
  }
}

// Create pagination controls
function createPaginationControls(totalProducts, totalPages) {
  // Check if we're on a page that needs pagination
  if (!productsGrid) return

  // Remove existing pagination if any
  let paginationControls = document.getElementById("paginationControls")
  if (paginationControls) {
    paginationControls.remove()
  }

  // Create new pagination controls
  paginationControls = document.createElement("div")
  paginationControls.id = "paginationControls"
  paginationControls.className = "pagination-controls"

  // Add styles for pagination
  if (!document.getElementById("paginationStyles")) {
    const style = document.createElement("style")
    style.id = "paginationStyles"
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
    `
    document.head.appendChild(style)
  }

  // Create previous button
  const prevBtn = document.createElement("button")
  prevBtn.className = "pagination-btn"
  prevBtn.textContent = "Previous"
  prevBtn.disabled = currentDisplayPage <= 1
  prevBtn.addEventListener("click", () => {
    if (currentDisplayPage > 1) {
      currentDisplayPage--
      displayProducts(filteredProducts)
      // Scroll to products section
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
    }
  })

  // Create next button
  const nextBtn = document.createElement("button")
  nextBtn.className = "pagination-btn"
  nextBtn.textContent = "Next"
  nextBtn.disabled = currentDisplayPage >= totalPages
  nextBtn.addEventListener("click", () => {
    if (currentDisplayPage < totalPages) {
      currentDisplayPage++
      displayProducts(filteredProducts)
      // Scroll to products section
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
    }
  })

  // Create page info
  const pageInfo = document.createElement("span")
  pageInfo.className = "pagination-info"
  pageInfo.textContent = `Page ${currentDisplayPage} of ${totalPages}`

  // Append elements to pagination controls
  paginationControls.appendChild(prevBtn)
  paginationControls.appendChild(pageInfo)
  paginationControls.appendChild(nextBtn)

  // Append pagination controls to the container
  const container = productsGrid.closest(".container")
  if (container) {
    const newsletter = container.querySelector(".newsletter")
    if (newsletter) {
      container.insertBefore(paginationControls, newsletter)
    } else {
      container.appendChild(paginationControls)
    }
  }
}

// Add a helper function for populating jacket genres
function populateJacketGenres(jacketProducts) {
  if (!genreFilter) return

  const genreKeywords = new Set()

  jacketProducts.forEach((product) => {
    // Look for common genre keywords in title and description
    const text = (product.title + " " + (product.description || "")).toLowerCase()

    // Add common keywords we find
    const keywords = ["casual", "sports", "hiking", "outdoor", "winter", "rain", "mountain"]
    keywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        genreKeywords.add(keyword)
      }
    })

    // Also check tags for potential genres
    if (product.tags) {
      product.tags.forEach((tag) => {
        if (!["jacket", "womens", "mens", "unisex"].includes(tag.toLowerCase())) {
          genreKeywords.add(tag.toLowerCase())
        }
      })
    }
  })

  // Add each detected genre as an option
  const sortedGenres = [...genreKeywords].sort()
  sortedGenres.forEach((genre) => {
    const option = document.createElement("option")
    option.value = genre
    option.textContent = genre.charAt(0).toUpperCase() + genre.slice(1)
    genreFilter.appendChild(option)
  })
}

// Helper function to fetch data
async function fetchData(endpoint) {
  try {
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    throw new Error(`Error fetching data: ${error.message}`)
  }
}

// Newsletter form submission
const newsletterForm = document.querySelector(".newsletter-form")
if (newsletterForm) {
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
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()

    const targetId = this.getAttribute("href")
    const targetElement = document.querySelector(targetId)

    if (targetElement) {
      // Close mobile menu if open
      if (navLinks && navLinks.classList.contains("active")) {
        navLinks.classList.remove("active")
        if (mobileMenuBtn) {
          mobileMenuBtn.classList.remove("active")
          const spans = mobileMenuBtn.querySelectorAll("span")
          spans[0].style.transform = "none"
          spans[1].style.opacity = "1"
          spans[2].style.transform = "none"
        }
      }

      // Close cart modal if open
      if (cartModal && cartModal.classList.contains("active")) {
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

// Add styles for error popup
const errorStyle = document.createElement("style")
errorStyle.textContent = `
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
`
document.head.appendChild(errorStyle)

// Initialize the page - only if we're on the main page with products
document.addEventListener("DOMContentLoaded", () => {
  // Only run fetchAllProducts if we're on a page with the products grid
  if (document.getElementById("productsGrid")) {
    fetchAllProducts()
  }
})

