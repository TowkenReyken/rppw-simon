document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});

let productos = [
    { nombre: "Arroz", precio: 500, descuento: 10, imagen: "/img/temporal-arroz.avif" },
    { nombre: "Refresco", precio: 400, descuento: 5, imagen: "/img/temporal-refresco.jpg" }
];

// Función para calcular el precio con descuento
function calcularPrecioDescuento(precio, descuento) {
    return (precio - (precio * (descuento / 100))).toFixed(2);
}

// Función para cargar los productos en la página
function cargarProductos() {
    const productosGrid = document.getElementById("productosGrid");
    productosGrid.innerHTML = "";

    productos.forEach((producto, index) => {
        const productoHTML = `
            <div class="producto-card">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p class="precio">
                    ${producto.descuento > 0 ? `<span class="precio-antiguo">$${producto.precio}</span>` : ""}
                    $${calcularPrecioDescuento(producto.precio, producto.descuento)}
                </p>
            </div>
        `;
        productosGrid.innerHTML += productoHTML;
    });
}

// Abrir formulario modal
function abrirFormulario() {
    document.getElementById("modalProducto").style.display = "block";
}

// Cerrar formulario modal
function cerrarFormulario() {
    document.getElementById("modalProducto").style.display = "none";
}

// Agregar producto desde el formulario
document.getElementById("formProducto").addEventListener("submit", (event) => {
    event.preventDefault();

    let nombre = document.getElementById("nombre").value;
    let precio = parseFloat(document.getElementById("precio").value);
    let descuento = parseFloat(document.getElementById("descuento").value);
    let imagen = document.getElementById("imagen").value;

    productos.push({ nombre, precio, descuento, imagen });

    cargarProductos();
    cerrarFormulario();
});
