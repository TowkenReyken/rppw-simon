// Abrir el formulario modal para agregar producto
function abrirFormulario() {
    const modal = document.getElementById("modalProducto");
    modal.style.display = "flex";
    cargarCategorias(document.getElementById("categoria"));
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
    const selectCategoria = document.getElementById("editar-categoria");

    // Cargar categorías y luego seleccionar la correcta
    cargarCategorias(selectCategoria).then(() => {
        // Obtener los datos del producto desde la tarjeta
        const productoCard = document.querySelector(`.producto-card[data-id='${productId}']`);
        const nombre = productoCard.dataset.nombre;
        const precio = productoCard.dataset.precio;
        const descuento = productoCard.dataset.descuento;
        const stock = productoCard.dataset.stock;
        const categoriaNombre = productoCard.dataset.categoria; // OJO: es el nombre, no el id
        const imagen = productoCard.dataset.imagen;

        // Llenar los campos del formulario con los datos del producto
        document.getElementById("editar-nombre").value = nombre;
        document.getElementById("editar-precio").value = precio;
        document.getElementById("editar-descuento").value = descuento;
        document.getElementById("editar-stock").value = stock;
        document.getElementById("editar-imagen").value = imagen;

        // Seleccionar la opción correcta en el select por nombre
        for (let option of selectCategoria.options) {
            if (option.textContent === categoriaNombre) {
                selectCategoria.value = option.value;
                break;
            }
        }

        // Guardar el ID del producto en un atributo del formulario
        document.getElementById("formEditarProducto").dataset.productId = productId;
    });
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
        const response = await fetch('/src/categorias.php');
        const categorias = await response.json();

        selectElement.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecciona una categoría';
        selectElement.appendChild(defaultOption);

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
    const categoria_id = form.querySelector("[id$='categoria']").value;
    const imagen = form.querySelector("[id$='imagen']").value.trim();

    if (!nombre || isNaN(precio) || !categoria_id || !imagen || isNaN(stock)) {
        alert("Todos los campos son obligatorios y deben ser válidos");
        return;
    }

    const producto = { nombre, precio, descuento, stock, categoria_id, imagen };

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto),
        });

        const result = await response.json();

        if (response.ok) {
            mostrarNotificacion(method === 'POST' ? 'Producto agregado correctamente' : 'Producto actualizado correctamente');
            setTimeout(() => location.reload(), 1000);
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
    } catch (error) {
        console.error("Error al enviar el formulario:", error);
        alert(`Error: ${error.message}`);
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

function obtenerCategoriaIdPorNombre(nombre) {
    const categorias = [
        "Frutas", "Verduras", "Carnes", "Lácteos", "Panadería", "Enlatados", "Bebidas",
        "Limpieza", "Cuidado Personal", "Mascotas", "Dulces", "Condimentos y Especias",
        "Legumbres", "Cereales y Granola", "Pastas"
    ];
    // Los IDs deben coincidir con los de tu base de datos
    const ids = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,16];
    const idx = categorias.indexOf(nombre);
    return idx !== -1 ? ids[idx] : null;
}

function mostrarNotificacion(mensaje, esError = false) {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${esError ? 'error' : 'exito'}`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 3000);
}

// Agrega este CSS para las notificaciones
const style = document.createElement('style');
style.textContent = `
.notificacion {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1000;
}
.notificacion.show {
    transform: translateX(0);
}
.notificacion.exito {
    background-color: #27ae60;
}
.notificacion.error {
    background-color: #e74c3c;
}
`;
document.head.appendChild(style);