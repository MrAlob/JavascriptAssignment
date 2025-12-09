# The Shop - JavaScript 1 Assignment

A fully functional e-commerce website built with vanilla HTML, CSS, and JavaScript as part of my Frontend Development studies.

Link to live demo: https://js1assignment.netlify.app

## Quick Start

Getting started is incredibly simple! No complex setup, no build tools, no package managers required.

### Just Download and Open

1. **Download** this project to your computer
2. **Navigate** to the project folder
3. **Double-click** `index.html` to open it in your web browser

That's it! The website will run locally in your browser immediately.

---

## About This Project

This project was created as my **JavaScript 1 assignment** during my Frontend Development studies. It demonstrates fundamental JavaScript concepts, DOM manipulation, and modern web development practices using only vanilla technologies.

### What I Learned & Implemented

- **DOM Manipulation**: Dynamic content rendering and interactive elements
- **Event Handling**: User interactions, form submissions, and navigation
- **Local Storage**: Persistent shopping cart and user preferences
- **API Integration**: Fetching and displaying data from external APIs
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **State Management**: Managing application state without frameworks
- **Error Handling**: Graceful handling of network requests and user errors

---

## Features

### Core E-commerce Functionality
- **Product Browsing**: Browse products from multiple categories (fashion, movies, games)
- **Advanced Search & Filtering**: Search by name, filter by category, gender, and genre
- **Product Details**: Detailed product pages with image galleries and descriptions
- **Shopping Cart**: Add/remove items, adjust quantities, persistent cart storage
- **Checkout Process**: Complete order form with validation and confirmation

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Loading States**: Visual feedback during data fetching
- **Interactive Navigation**: Smooth scrolling and mobile-friendly menu
- **Newsletter Signup**: Email subscription functionality
- **Modal Windows**: Cart overlay and product quick views

### Technical Features
- **Multiple API Integration**: Combines data from several APIs for a richer product catalog
- **Pagination**: Efficient loading of large product catalogs
- **Form Validation**: Client-side validation for checkout and contact forms
- **Cross-page State**: Cart persistence across page navigation
- **SEO Friendly**: Semantic HTML structure with proper meta tags

---

## Project Structure

```
JavascriptAssignment/
├── index.html                 # Main homepage
├── styles.css                 # Global styles and responsive design
├── script.js                  # Main JavaScript functionality
├── about.html                 # About page
├── contact.html               # Contact page
├── privacy.html               # Privacy policy
├── terms.html                 # Terms and conditions
├── js/
│   └── cart.js               # Shopping cart functionality
├── product/
│   ├── index.html            # Product detail page
│   └── product.js            # Product page JavaScript
├── checkout/
│   ├── index.html            # Checkout page
│   ├── checkout.js           # Checkout functionality
│   └── confirmation/
│       ├── index.html        # Order confirmation
│       └── confirmation.js   # Confirmation logic
└── README.md                 # This file
```

---

## Technologies Used

### Frontend
- **HTML5**: Semantic markup and accessibility features
- **CSS3**: Modern styling with Grid, Flexbox, and custom properties
- **Vanilla JavaScript**: ES6+ features, async/await, modules

### APIs & Data Sources
- **Local Storage**: Client-side data persistence

### Design & UX
- **Google Fonts**: Poppins font family
- **SVG Icons**: Scalable vector graphics for UI elements
- **CSS Variables**: Consistent theming and easy customization
- **Mobile-First**: Responsive design principles

---

## Key Learning Objectives Achieved

1. **JavaScript Fundamentals**
   - Variables, functions, and scope
   - Arrays and objects manipulation
   - Conditional statements and loops

2. **DOM Manipulation**
   - Selecting and modifying elements
   - Creating dynamic content
   - Event listeners and handlers

3. **Asynchronous JavaScript**
   - Fetch API for HTTP requests
   - Promises and async/await
   - Error handling with try/catch

4. **Local Storage**
   - Saving and retrieving data
   - JSON serialization/deserialization
   - Data persistence across sessions

5. **Form Handling**
   - Input validation
   - Form submission prevention
   - Dynamic form feedback

---

## Lessons Learned

- **Modular Thinking**: Splitting logic by page forced me to plan shared utilities early, keeping each script focused on its own responsibilities while reusing storage helpers and UI formatters.
- **Real-World Data Handling**: Normalizing responses from multiple APIs taught me how to guard against inconsistent schemas, missing fields, and rate limits without breaking the UI.
- **Resilience Through Validation**: Building thorough form validation highlighted the value of layered feedback (inline messages, disabled buttons, summaries) to guide users instead of simply rejecting submissions.
- **Performance Awareness**: Implementing search and filtering with large product lists encouraged me to debounce inputs and minimize unnecessary DOM updates to stay responsive on low-powered devices.


---

## Code Highlights

### Dynamic Product Loading
```javascript
// Fetch products from multiple APIs
async function fetchProducts() {
  try {
    const [storeResponse, moviesData, gamesData] = await Promise.all([
      fetch('https://fakestoreapi.com/products'),
      fetchMovies(),
      fetchGames()
    ]);
    // Process and combine data...
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}
```

### Shopping Cart Management
```javascript
// Add item to cart with localStorage persistence
function addToCart(product, quantity = 1) {
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
}
```

### Responsive Search and Filtering
```javascript
// Real-time search functionality
function filterProducts() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;
  const selectedGender = genderFilter.value;
  
  filteredProducts = allProducts.filter(product => {
    return product.title.toLowerCase().includes(searchTerm) &&
           (selectedCategory === 'all' || product.category === selectedCategory) &&
           (selectedGender === 'all' || product.gender === selectedGender);
  });
  
  displayProducts(filteredProducts);
}
```

---


## Assignment Context

This project was developed as part of my **JavaScript 1 course** in my Frontend Development program. The assignment requirements included:

- ✅ Build a functional web application using vanilla JavaScript
- ✅ Implement API integration and data fetching
- ✅ Create interactive user interfaces with DOM manipulation
- ✅ Demonstrate understanding of JavaScript fundamentals
- ✅ Apply responsive design principles
- ✅ Handle user input and form validation
- ✅ Implement local data storage

The project showcases practical application of core JavaScript concepts in a real-world scenario, demonstrating both technical skills and user experience considerations.

---

## License

This project is for educational purposes as part of my Frontend Development studies.

---
