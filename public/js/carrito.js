document.addEventListener('DOMContentLoaded', () => {
    const btnCartIcon = document.querySelector('.container-cart-icon');
    const containerCartProducts = document.querySelector('.container-cart-products');
    const rowProduct = document.querySelector('.row-product');
    const totalPagar = document.querySelector('.total-pagar');
    const countProducts = document.getElementById('contador-productos');
    const cartEmpty = document.querySelector('.cart-empty');
    const cartTotal = document.querySelector('.cart-total');

    // Cargar productos desde localStorage
    let allProducts = JSON.parse(localStorage.getItem('carrito')) || [];

    // Mostrar/ocultar el carrito emergente
    btnCartIcon.addEventListener('click', () => {
        containerCartProducts.classList.toggle('hidden-cart');
    });

    // Actualizar el carrito en la interfaz
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

        rowProduct.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        allProducts.forEach(product => {
            const finalPrice = product.price - (product.price * (product.discount / 100));
            const productDiv = document.createElement('div');
            productDiv.classList.add('cart-product');
            productDiv.innerHTML = `
                <div class="info-cart-product">
                    <div class="cantidad-controls">
                        <button class="btn-decrementar" data-id="${product.id}">-</button>
                        <span class="cantidad-producto-carrito">${product.quantity}</span>
                        <button class="btn-incrementar" data-id="${product.id}">+</button>
                    </div>
                    <p class="titulo-producto-carrito">${product.title}</p>
                    <span class="precio-producto-carrito">$${(finalPrice * product.quantity).toFixed(2)}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-close" data-id="${product.id}">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            `;
            rowProduct.appendChild(productDiv);
            total += finalPrice * product.quantity;
            totalItems += product.quantity;
        });

        totalPagar.innerText = `$${total.toFixed(2)}`;
        countProducts.innerText = totalItems;

        // Guardar el carrito en localStorage
        localStorage.setItem('carrito', JSON.stringify(allProducts));
    }

    // Agregar producto al carrito
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.producto-card');
            const id = productCard.dataset.id;
            const title = productCard.dataset.nombre;
            const price = parseFloat(productCard.dataset.precio);
            const discount = parseFloat(productCard.dataset.descuento) || 0;

            const existingProduct = allProducts.find(product => product.id === id);
            if (existingProduct) {
                existingProduct.quantity += 1; // Incrementar cantidad si ya existe
            } else {
                allProducts.push({ id, title, price, discount, quantity: 1 }); // Agregar nuevo producto
            }

            updateCart();
        });
    });

    // Manejar eventos en el carrito
    rowProduct.addEventListener('click', (e) => {
        // Eliminar producto
        if (e.target.classList.contains('icon-close')) {
            const id = e.target.dataset.id;
            allProducts = allProducts.filter(product => product.id !== id);
            updateCart();
        }
        // Aumentar cantidad
        if (e.target.classList.contains('btn-incrementar')) {
            const id = e.target.dataset.id;
            const prod = allProducts.find(product => product.id === id);
            if (prod) {
                prod.quantity += 1;
                updateCart();
            }
        }
        // Disminuir cantidad
        if (e.target.classList.contains('btn-decrementar')) {
            const id = e.target.dataset.id;
            const prod = allProducts.find(product => product.id === id);
            if (prod && prod.quantity > 1) {
                prod.quantity -= 1;
                updateCart();
            }
        }
    });

    // Cargar el carrito al iniciar la página
    updateCart();
});