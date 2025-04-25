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

    // Cargar categorías dinámicamente
    const categoriaSelectAgregar = document.getElementById("categoria");
    const categoriaSelectEditar = document.getElementById("editar-categoria");
    try {
        const response = await fetch('http://localhost:3001/src/categorias.php'); // Nueva ruta para obtener categorías
        const categorias = await response.json();

        categorias.forEach(categoria => {
            const optionAgregar = document.createElement("option");
            optionAgregar.value = categoria.id;
            optionAgregar.textContent = categoria.nombre;
            categoriaSelectAgregar.appendChild(optionAgregar);

            const optionEditar = document.createElement("option");
            optionEditar.value = categoria.id;
            optionEditar.textContent = categoria.nombre;
            categoriaSelectEditar.appendChild(optionEditar);
        });
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }

    // Manejar el envío del formulario para agregar producto
    const formAgregar = document.getElementById("formProducto");
    formAgregar.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Obtener los datos del formulario
        const nombre = document.getElementById("nombre").value.trim();
        const precio = parseFloat(document.getElementById("precio").value);
        const descuento = parseInt(document.getElementById("descuento").value) || 0;
        const stock = parseInt(document.getElementById("stock").value);
        const categoria_id = parseInt(document.getElementById("categoria").value);
        const imagen = document.getElementById("imagen").value.trim();

        // Validar los datos
        if (!nombre || !precio || !categoria_id || !imagen || !stock) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        // Crear el objeto del producto
        const producto = { nombre, precio, descuento, stock, categoria_id, imagen };

        try {
            // Enviar los datos al servidor PHP
            const response = await fetch('http://localhost:3001/src/productos.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(producto),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || "Producto agregado exitosamente.");
                cerrarFormulario();
                location.reload(); // Recargar la página para mostrar el nuevo producto
            } else {
                alert(result.error || "Error al agregar el producto.");
            }
        } catch (error) {
            console.error("Error al enviar el producto:", error);
            alert("Ocurrió un error al agregar el producto.");
        }
    });

    // Manejar el envío del formulario para editar producto
    const formEditar = document.getElementById("formEditarProducto");
    formEditar.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Obtener los datos del formulario
        const productId = event.target.dataset.productId;
        const nombre = document.getElementById("editar-nombre").value.trim();
        const precio = parseFloat(document.getElementById("editar-precio").value);
        const descuento = parseInt(document.getElementById("editar-descuento").value) || 0;
        const stock = parseInt(document.getElementById("editar-stock").value);
        const categoria_id = parseInt(document.getElementById("editar-categoria").value);
        const imagen = document.getElementById("editar-imagen").value.trim();

        // Validar los datos
        if (!nombre || !precio || !categoria_id || !imagen || !stock) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        // Crear el objeto del producto
        const producto = { id: productId, nombre, precio, descuento, stock, categoria_id, imagen };

        try {
            // Enviar los datos al servidor PHP para actualizar el producto
            const response = await fetch(`http://localhost:3001/src/productos.php?id=${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(producto),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || "Producto actualizado exitosamente.");
                cerrarFormularioEdicion();
                location.reload(); // Recargar la página para mostrar los cambios
            } else {
                alert(result.error || "Error al actualizar el producto.");
            }
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            alert("Ocurrió un error al actualizar el producto.");
        }
    });

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

    // Función para filtrar productos
    function filtrarProductos(query) {
        const productos = document.querySelectorAll('.producto-card');
        productos.forEach(producto => {
            const nombre = producto.dataset.nombre.toLowerCase();
            const categoria = producto.dataset.categoria.toLowerCase();

            if (nombre.includes(query) || categoria.includes(query)) {
                producto.style.display = 'flex'; // Mostrar producto
            } else {
                producto.style.display = 'none'; // Ocultar producto
            }
        });
    }

    // Manejar la búsqueda al enviar el formulario
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const searchQuery = searchInput.value.trim().toLowerCase();
        filtrarProductos(searchQuery);
    });

    // Limpiar la búsqueda y mostrar todos los productos
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() === '') {
            const productos = document.querySelectorAll('.producto-card');
            productos.forEach(producto => {
                producto.style.display = 'flex'; // Mostrar todos los productos
            });
        }
    });

    // Ejecutar el filtrado automáticamente si hay un término de búsqueda en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    if (searchQuery) {
        searchInput.value = searchQuery; // Mantener el valor en el campo de búsqueda
        filtrarProductos(searchQuery.toLowerCase());
    }
});