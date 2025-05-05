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
        // Crear el modal
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="this.parentElement.parentElement.style.display='none'">&times;</span>
                <h2>Confirmar Compra</h2>
                <form id="confirmar-compra-form">
                    <label for="cliente-nombre">Nombre:</label>
                    <input type="text" id="cliente-nombre" required>
                    
                    <label for="cliente-direccion">Dirección:</label>
                    <input type="text" id="cliente-direccion" required>
                    
                    <label for="metodo-pago">Método de Pago:</label>
                    <select id="metodo-pago" required>
                        <option value="Fisico">Físico</option>
                        <option value="Transferencia">Transferencia</option>
                    </select>
                    
                    <button type="submit">Confirmar</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Manejar el envío del formulario
        document.getElementById('confirmar-compra-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const clienteNombre = document.getElementById('cliente-nombre').value;
            const clienteDireccion = document.getElementById('cliente-direccion').value;
            const metodoPago = document.getElementById('metodo-pago').value;

            confirmarCompra(clienteNombre, clienteDireccion, metodoPago);
        });
    });
});

async function confirmarCompra(clienteNombre, clienteDireccion, metodoPago) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    console.log('Datos enviados:', {
        cliente_nombre: clienteNombre,
        cliente_direccion: clienteDireccion,
        metodo_pago: metodoPago,
        productos: carrito,
    });

    try {
        const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliente_nombre: clienteNombre,
                cliente_direccion: clienteDireccion,
                metodo_pago: metodoPago,
                productos: carrito,
            }),
        });

        if (response.ok) {
            alert('¡Compra confirmada!');
            localStorage.removeItem('carrito');
            window.location.href = '/pedidos';
        } else {
            const error = await response.json();
            alert(`Error al confirmar la compra: ${error.error}`);
        }
    } catch (error) {
        console.error('Error al confirmar compra:', error);
        alert('Ocurrió un error al confirmar la compra.');
    }
}