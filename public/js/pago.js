document.addEventListener('DOMContentLoaded', () => {
    const tablaProductos = document.getElementById('tabla-productos');
    const totalPago = document.getElementById('total-pago');
    const btnConfirmarPago = document.getElementById('btn-confirmar-pago');
    const modal = document.getElementById('modal-confirmar');
    const closeModal = document.querySelector('.close');

    // Obtener los productos del carrito desde localStorage
    let carrito = [];
    try {
        carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    } catch (error) {
        console.error('Error al leer el carrito:', error);
        alert('Error al cargar el carrito de compras');
        return;
    }

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
            <td>
                ${producto.discount > 0
                    ? `<span style="text-decoration:line-through;color:#888;">$${producto.price.toFixed(2)}</span>
                       <span style="color:#e74c3c;font-weight:bold;"> $${finalPrice.toFixed(2)}</span>`
                    : `$${producto.price.toFixed(2)}`
                }
            </td>
            <td>
                ${producto.discount > 0 ? `-${producto.discount}%` : '0%'}
            </td>
            <td>$${totalProducto.toFixed(2)}</td>
        `;
        tablaProductos.appendChild(row);
    });

    // Mostrar el total a pagar
    totalPago.textContent = `$${total.toFixed(2)}`;

    // Abrir modal al confirmar pago
    btnConfirmarPago.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // Cerrar modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Mostrar campo de comprobante solo para transferencia
    document.getElementById('metodo-pago').addEventListener('change', function() {
        const comprobanteContainer = document.getElementById('comprobante-container');
        comprobanteContainer.style.display = this.value === 'Transferencia' ? 'block' : 'none';
    });

    // Manejar el envío del formulario
    document.getElementById('confirmar-compra-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const clienteNombre = document.getElementById('cliente-nombre').value;
        const clienteDireccion = document.getElementById('cliente-direccion').value;
        const metodoPago = document.getElementById('metodo-pago').value;
        const comprobante = document.getElementById('comprobante').files[0];

        // Validaciones
        if (!clienteNombre || !clienteDireccion) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        if (metodoPago === 'Transferencia' && !comprobante) {
            alert('Por favor sube el comprobante de transferencia');
            return;
        }

        let comprobantePath = null;
        if (comprobante) {
            try {
                const formData = new FormData();
                formData.append('archivo', comprobante);
                
                const uploadResponse = await fetch('/api/subir-comprobante', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadResponse.ok) {
                    throw new Error('Error al subir comprobante');
                }

                const uploadData = await uploadResponse.json();
                comprobantePath = uploadData.filePath;
            } catch (error) {
                console.error('Error:', error);
                alert('Error al subir el comprobante');
                return;
            }
        }

        await confirmarCompra(clienteNombre, clienteDireccion, metodoPago, comprobantePath);
        modal.style.display = 'none';
    });
});

async function confirmarCompra(clienteNombre, clienteDireccion, metodoPago, comprobantePath) {
    let carrito = [];
    try {
        carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    } catch (error) {
        console.error('Error al leer el carrito:', error);
        alert('Error al confirmar la compra');
        return;
    }
    
    try {
        const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliente_nombre: clienteNombre,
                cliente_direccion: clienteDireccion,
                metodo_pago: metodoPago,
                productos: carrito,
                comprobante_path: comprobantePath
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