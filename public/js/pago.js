document.addEventListener('DOMContentLoaded', () => {
    const tablaProductos = document.getElementById('tabla-productos');
    const totalPago = document.getElementById('total-pago');
    const btnConfirmarPago = document.getElementById('btn-confirmar-pago');

    // Obtener los productos del carrito desde localStorage
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let total = 0;

    // Mostrar los productos en la tabla
    carrito.forEach(producto => {
        const finalPrice = producto.price - (producto.price * (producto.discount / 100));
        const totalProducto = finalPrice * producto.quantity;
        total += totalProducto;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.title}</td>
            <td>${producto.quantity}</td>
            <td>$${finalPrice.toFixed(2)}</td>
            <td>$${totalProducto.toFixed(2)}</td>
        `;
        tablaProductos.appendChild(row);
    });

    // Mostrar el total a pagar
    totalPago.textContent = `$${total.toFixed(2)}`;

    // Confirmar la compra
    btnConfirmarPago.addEventListener('click', () => {
        alert('¡Compra confirmada! Gracias por tu compra.');
        localStorage.removeItem('carrito'); // Vaciar el carrito
        window.location.href = '/'; // Redirigir al inicio
    });
});