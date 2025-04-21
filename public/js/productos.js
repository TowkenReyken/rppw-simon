// Abrir el formulario modal
function abrirFormulario() {
    const modal = document.getElementById("modalProducto");
    modal.style.display = "flex";
}

// Cerrar el formulario modal
function cerrarFormulario() {
    const modal = document.getElementById("modalProducto");
    modal.style.display = "none";
}

// Cerrar el modal al hacer clic fuera del contenido
window.onclick = function (event) {
    const modal = document.getElementById("modalProducto");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Asegurar que el modal esté oculto al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    const modal = document.getElementById("modalProducto");
    modal.style.display = "none"; // Ocultar el modal al cargar

    // Cargar categorías dinámicamente
    const categoriaSelect = document.getElementById("categoria");
    try {
        const response = await fetch('http://localhost:3001/src/categorias.php'); // Nueva ruta para obtener categorías
        const categorias = await response.json();

        categorias.forEach(categoria => {
            const option = document.createElement("option");
            option.value = categoria.id;
            option.textContent = categoria.nombre;
            categoriaSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }

    // Manejar el envío del formulario
    const form = document.getElementById("formProducto");
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Evitar el comportamiento predeterminado del formulario

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
});