document.addEventListener('DOMContentLoaded', () => {
    const order = JSON.parse(localStorage.getItem('lastOrder'));
    
    if (!order) {
        window.location.href = '../../index.html';
        return;
    }

    // Display order details
    document.getElementById('orderNumber').textContent = order.id;
    document.getElementById('orderDate').textContent = new Date(order.date).toLocaleDateString();
    
    // Display shipping address
    document.getElementById('shippingAddress').innerHTML = `
        ${order.customer.firstName} ${order.customer.lastName}<br>
        ${order.customer.address}<br>
        ${order.customer.city}, ${order.customer.postalCode}<br>
        ${order.customer.country}
    `;

    // Display ordered items
    const confirmationItems = document.getElementById('confirmationItems');
    confirmationItems.innerHTML = order.items.map(item => `
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
    `).join('');

    // Display totals
    const subtotal = order.items.reduce((sum, item) => {
        const price = item.onSale ? item.discountedPrice : item.price;
        return sum + (price * item.quantity);
    }, 0);

    const shipping = 10; // Fixed shipping cost

    document.getElementById('confirmationSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('confirmationShipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('confirmationTotal').textContent = `$${order.total.toFixed(2)}`;

    // Clear order from localStorage after displaying
    localStorage.removeItem('lastOrder');
});