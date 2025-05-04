// Abrir el formulario modal para agregar producto
function abrirFormulario() {
    const modal = document.getElementById("modalProducto");
    modal.style.display = "flex";
}

// Cerrar el formulario modal para agregar producto
function cerrarFormulario() {
    const modal = document.getElementById("modalProducto");
    modal.style.display = "none";
}

// Abrir el formulario modal para editar producto
function abrirFormularioEdicion(productId) {
    const modal = document.getElementById("modalEditarProducto");
    modal.style.display = "flex";

    // Obtener los datos del producto desde la tarjeta
    const productoCard = document.querySelector(`.producto-card[data-id='${productId}']`);
    const nombre = productoCard.dataset.nombre;
    const precio = productoCard.dataset.precio;
    const descuento = productoCard.dataset.descuento;
    const stock = productoCard.dataset.stock;
    const categoria = productoCard.dataset.categoria;
    const imagen = productoCard.dataset.imagen;

    // Llenar los campos del formulario con los datos del producto
    document.getElementById("editar-nombre").value = nombre;
    document.getElementById("editar-precio").value = precio;
    document.getElementById("editar-descuento").value = descuento;
    document.getElementById("editar-stock").value = stock;
    document.getElementById("editar-categoria").value = categoria;
    document.getElementById("editar-imagen").value = imagen;

    // Guardar el ID del producto en un atributo del formulario
    document.getElementById("formEditarProducto").dataset.productId = productId;
}

// Cerrar el formulario modal para editar producto
function cerrarFormularioEdicion() {
    const modal = document.getElementById("modalEditarProducto");
    modal.style.display = "none";
}

// Cerrar el modal al hacer clic fuera del contenido
window.onclick = function (event) {
    const modalAgregar = document.getElementById("modalProducto");
    const modalEditar = document.getElementById("modalEditarProducto");
    if (event.target === modalAgregar) {
        modalAgregar.style.display = "none";
    }
    if (event.target === modalEditar) {
        modalEditar.style.display = "none";
    }
};

// Asegurar que los modales estén ocultos al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    const modalAgregar = document.getElementById("modalProducto");
    const modalEditar = document.getElementById("modalEditarProducto");
    modalAgregar.style.display = "none";
    modalEditar.style.display = "none";

    // Eliminar un producto
    document.getElementById("formEditarProducto").addEventListener("click", async (event) => {
        if (event.target.classList.contains("btn-eliminar")) {
            const productId = document.getElementById("formEditarProducto").dataset.productId;

            if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
                return;
            }

            try {
                // Enviar la solicitud DELETE al servidor PHP
                const response = await fetch(`http://localhost:3001/src/productos.php?id=${productId}`, {
                    method: 'DELETE',
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message || "Producto eliminado exitosamente.");
                    cerrarFormularioEdicion();
                    location.reload(); // Recargar la página para reflejar los cambios
                } else {
                    alert(result.error || "Error al eliminar el producto.");
                }
            } catch (error) {
                console.error("Error al eliminar el producto:", error);
                alert("Ocurrió un error al eliminar el producto.");
            }
        }
    });
});

// Manejar la búsqueda y filtrado de productos
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const productosGrid = document.querySelector('.productos-grid');

    // Función para cargar productos
    async function cargarProductos(query = '') {
        try {
            const response = await fetch(`/api/productos?q=${encodeURIComponent(query)}`);
            const productos = await response.json();

            productosGrid.innerHTML = ''; // Limpiar los productos actuales

            if (productos.length === 0) {
                productosGrid.innerHTML = '<p>No se encontraron productos.</p>';
                return;
            }

            productos.forEach(producto => {
                const productoCard = document.createElement('div');
                productoCard.classList.add('producto-card');
                productoCard.dataset.id = producto.id;
                productoCard.dataset.nombre = producto.nombre;
                productoCard.dataset.precio = producto.precio;
                productoCard.dataset.descuento = producto.descuento;
                productoCard.dataset.stock = producto.stock;
                productoCard.dataset.categoria = producto.categoria;
                productoCard.dataset.imagen = producto.imagen;

                productoCard.innerHTML = `
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p class="precio">Precio: $${(producto.precio - (producto.precio * (producto.descuento / 100))).toFixed(2)}</p>
                    <p class="categoria">Categoría: ${producto.categoria}</p>
                    <button class="btn-add-cart">Agregar al carrito</button>
                `;

                productosGrid.appendChild(productoCard);
            });
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    // Manejar la búsqueda en el formulario
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            cargarProductos(query); // Actualizar dinámicamente los productos
        }
    });

    // Cargar productos automáticamente si hay un término de búsqueda en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        cargarProductos(query);
    }
});

// Botón "Agregar al carrito"
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.producto-card .btn-add-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.producto-card');
            const id = productCard.dataset.id;
            const title = productCard.dataset.nombre;
            const price = parseFloat(productCard.dataset.precio);
            const discount = parseFloat(productCard.dataset.descuento) || 0;

            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            const existingProduct = carrito.find(product => product.id === id);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                carrito.push({ id, title, price, discount, quantity: 1 });
            }

            localStorage.setItem('carrito', JSON.stringify(carrito));
        });
    });

    // Botón "Editar producto"
    document.querySelectorAll('.producto-card .btn-edit-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('.producto-card').dataset.id;
            abrirFormularioEdicion(productId);
        });
    });
});

async function cargarCategorias(selectElement) {
    try {
        const response = await fetch('http://localhost:3001/src/categorias.php');
        const categorias = await response.json();

        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nombre;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }
}

// Llamar a la función para ambos formularios
document.addEventListener("DOMContentLoaded", () => {
    const categoriaSelectAgregar = document.getElementById("categoria");
    const categoriaSelectEditar = document.getElementById("editar-categoria");

    cargarCategorias(categoriaSelectAgregar);
    cargarCategorias(categoriaSelectEditar);
});

async function manejarFormularioProducto(event, url, method) {
    event.preventDefault();

    const form = event.target;
    const nombre = form.querySelector("[id$='nombre']").value.trim();
    const precio = parseFloat(form.querySelector("[id$='precio']").value);
    const descuento = parseInt(form.querySelector("[id$='descuento']").value) || 0;
    const stock = parseInt(form.querySelector("[id$='stock']").value);
    const categoria_id = parseInt(form.querySelector("[id$='categoria']").value);
    const imagen = form.querySelector("[id$='imagen']").value.trim();
    const metodo_calculo = form.querySelector("[id$='metodo_calculo']").value;

    if (!nombre || !precio || !categoria_id || !imagen || !stock || !metodo_calculo) {
        alert("Todos los campos son obligatorios");
        return;
    }

    const producto = { nombre, precio, descuento, stock, categoria_id, imagen, metodo_calculo };

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto),
        });

        if (response.ok) {
            alert("Operación exitosa");
            location.reload();
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (error) {
        console.error("Error al enviar el formulario:", error);
        alert("Ocurrió un error al enviar el formulario.");
    }
}

// Asignar eventos a los formularios
document.getElementById("formProducto").addEventListener("submit", (event) => {
    manejarFormularioProducto(event, "/api/productos", "POST");
});

document.getElementById("formEditarProducto").addEventListener("submit", (event) => {
    const productId = event.target.dataset.productId;
    manejarFormularioProducto(event, `/api/productos/${productId}`, "PUT");
});