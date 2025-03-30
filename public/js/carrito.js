document.addEventListener('DOMContentLoaded', () => {
    // Seleccionar elementos del carrito
    const btnCartIcon = document.querySelector('.container-cart-icon');
    const containerCartProducts = document.querySelector('.container-cart-products');
    const rowProduct = document.querySelector('.row-product');
    const totalPagar = document.querySelector('.total-pagar');
    const countProducts = document.getElementById('contador-productos');
    const cartEmpty = document.querySelector('.cart-empty');
    const cartTotal = document.querySelector('.cart-total');

    let allProducts = [];

    // Mostrar/Ocultar el carrito emergente
    if (btnCartIcon) {
        btnCartIcon.addEventListener('click', () => {
            containerCartProducts.classList.toggle('hidden-cart');
        });
    } else {
        console.error("No se encontró el elemento .container-cart-icon");
    }

    // Función para actualizar el carrito en la interfaz
    function updateCart() {
        if (allProducts.length === 0) {
            cartEmpty.classList.remove('hidden');
            rowProduct.classList.add('hidden');
            cartTotal.classList.add('hidden');
        } else {
            cartEmpty.classList.add('hidden');
            rowProduct.classList.remove('hidden');
            cartTotal.classList.remove('hidden');
        }

        // Limpiar el contenedor del carrito
        rowProduct.innerHTML = '';
        let total = 0;
        let totalItems = 0;
        allProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('cart-product');
            productDiv.innerHTML = `
                <div class="info-cart-product">
                    <span class="cantidad-producto-carrito">${product.quantity}</span>
                    <p class="titulo-producto-carrito">${product.title}</p>
                    <span class="precio-producto-carrito">$${(product.price * product.quantity).toFixed(2)}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-close">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            `;
            rowProduct.appendChild(productDiv);
            total += product.price * product.quantity;
            totalItems += product.quantity;
        });
        totalPagar.innerText = `$${total.toFixed(2)}`;
        countProducts.innerText = totalItems;
    }

    // Agregar producto al carrito desde las tarjetas
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.producto-card');
            const title = card.querySelector('h3').textContent;
            const priceText = card.querySelector('.precio').textContent;
            const price = parseFloat(priceText.replace('$', '').trim());
            const quantitySpan = card.querySelector('.cantidad');
            let quantity = quantitySpan ? parseInt(quantitySpan.textContent) : 1;
            
            // Si el producto ya existe, se actualiza la cantidad
            const exists = allProducts.some(product => product.title === title);
            if (exists) {
                allProducts = allProducts.map(product => {
                    if (product.title === title) {
                        product.quantity += quantity;
                    }
                    return product;
                });
            } else {
                allProducts.push({ title, price, quantity });
            }
            updateCart();
        });
    });

    // Controles de cantidad en cada tarjeta
    document.querySelectorAll('.cantidad-controls').forEach(control => {
        const decrementBtn = control.querySelector('.btn-decrement');
        const incrementBtn = control.querySelector('.btn-increment');
        const cantidadSpan = control.querySelector('.cantidad');
        
        decrementBtn.addEventListener('click', () => {
            let qty = parseInt(cantidadSpan.textContent);
            if (qty > 1) {
                cantidadSpan.textContent = --qty;
            }
        });
        
        incrementBtn.addEventListener('click', () => {
            let qty = parseInt(cantidadSpan.textContent);
            cantidadSpan.textContent = ++qty;
        });
    });

    // Eliminar producto del carrito
    rowProduct.addEventListener('click', (e) => {
        if (e.target.classList.contains('icon-close')) {
            const productDiv = e.target.closest('.cart-product');
            const title = productDiv.querySelector('.titulo-producto-carrito').textContent;
            allProducts = allProducts.filter(product => product.title !== title);
            updateCart();
        }
    });

    // Función para simular la compra
    window.realizarCompra = function() {
        if (allProducts.length === 0) {
            alert('El carrito está vacío.');
            return;
        }
        alert('¡Compra realizada con éxito!');
        allProducts = [];
        updateCart();
    };

    // Exponer updateCart para fines de depuración (opcional)
    window.updateCart = updateCart;
});
