document.addEventListener('DOMContentLoaded', () => {
    const btnCartIcon = document.querySelector('.container-cart-icon');
    const containerCartProducts = document.querySelector('.container-cart-products');
    const rowProduct = document.querySelector('.row-product');
    const totalPagar = document.querySelector('.total-pagar');
    const countProducts = document.getElementById('contador-productos');
    const cartEmpty = document.querySelector('.cart-empty');
    const cartTotal = document.querySelector('.cart-total');

    let allProducts = [];

    if (btnCartIcon) {
        btnCartIcon.addEventListener('click', () => {
            containerCartProducts.classList.toggle('hidden-cart');
            console.log('Carrito toggled');
        });
    }

    // Función para actualizar el carrito en la interfaz
    function updateCart() {
        console.log('Actualizando carrito...', allProducts);

        if (allProducts.length === 0) {
            cartEmpty.classList.remove('hidden');
            rowProduct.classList.add('hidden');
            cartTotal.classList.add('hidden');
        } else {
            cartEmpty.classList.add('hidden');
            rowProduct.classList.remove('hidden');
            cartTotal.classList.remove('hidden');
        }

        rowProduct.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        allProducts.forEach(product => {
            const finalPrice = product.price - (product.price * (product.discount / 100));
            const productDiv = document.createElement('div');
            productDiv.classList.add('cart-product');
            productDiv.innerHTML = `
                <div class="info-cart-product">
                    <span class="cantidad-producto-carrito">${product.quantity}x</span>
                    <p class="titulo-producto-carrito">${product.title}</p>
                    <span class="precio-producto-carrito">$${(finalPrice * product.quantity).toFixed(2)}</span>
                    <div class="cantidad-controls">
                        <button class="btn-decrement" data-title="${product.title}">-</button>
                        <span class="cantidad">${product.quantity}</span>
                        <button class="btn-increment" data-title="${product.title}">+</button>
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-close" data-title="${product.title}">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            `;
            rowProduct.appendChild(productDiv);
            total += finalPrice * product.quantity;
            totalItems += product.quantity;
        });

        totalPagar.innerText = `$${total.toFixed(2)}`;
        countProducts.innerText = totalItems;
    }

    window.agregarProductoAlCarrito = function(productCard) {
        const title = productCard.querySelector('h3').textContent;
        const priceText = productCard.querySelector('.precio').textContent;
        const price = parseFloat(priceText.replace('$', '').split(" ")[0]);
        const quantityElement = productCard.querySelector('.cantidad');
        let quantity = quantityElement ? parseInt(quantityElement.textContent) : 1;
        const discount = parseFloat(productCard.getAttribute('data-descuento')) || 0;

        const existingProduct = allProducts.find(product => product.title === title);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            allProducts.push({ title, price, discount, quantity });
        }

        console.log('Producto agregado:', title);
        updateCart();
    };

    rowProduct.addEventListener('click', (e) => {
        const title = e.target.dataset.title;
        const product = allProducts.find(product => product.title === title);
        if (!product) return;

        if (e.target.classList.contains('btn-increment')) {
            product.quantity += 1;
        } else if (e.target.classList.contains('btn-decrement')) {
            product.quantity -= 1;
            if (product.quantity <= 0) {
                allProducts = allProducts.filter(p => p.title !== title);
            }
        }
        updateCart();
    });

    rowProduct.addEventListener('click', (e) => {
        if (e.target.classList.contains('icon-close')) {
            const title = e.target.dataset.title;
            allProducts = allProducts.filter(product => product.title !== title);
            updateCart();
        }
    });
});
