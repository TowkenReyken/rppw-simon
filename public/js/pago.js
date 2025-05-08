document.addEventListener('DOMContentLoaded', () => {
    const tablaProductos = document.getElementById('tabla-productos');
    const totalPago = document.getElementById('total-pago');
    const btnConfirmarPago = document.getElementById('btn-confirmar-pago');
    const modal = document.getElementById('modal-confirmar');
    const closeModal = modal.querySelector('.close');
    const btnCancelar = modal.querySelector('.btn-cancelar');
    const metodoPagoSelect = document.getElementById('metodo-pago');
    const comprobanteContainer = document.getElementById('comprobante-container');
    const form = document.getElementById('confirmar-compra-form');

    // Cargar carrito desde localStorage
    let carrito = cargarCarrito();
    if (carrito.length === 0) {
        mostrarMensaje('Tu carrito está vacío', 'error');
        return;
    }

    // Mostrar productos y calcular total
    const total = mostrarProductosYCalcularTotal(carrito, tablaProductos);
    totalPago.textContent = `$${total.toFixed(2)}`;

    // Event listeners
    btnConfirmarPago.addEventListener('click', () => modal.style.display = 'flex');
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        form.reset();
    });
    btnCancelar.addEventListener('click', () => {
        modal.style.display = 'none';
        form.reset();
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            form.reset();
        }
    });
    metodoPagoSelect.addEventListener('change', () => {
        if (metodoPagoSelect.value === 'Transferencia') {
            comprobanteContainer.style.display = 'block';
            comprobanteContainer.classList.add('visible');
        } else {
            comprobanteContainer.style.display = 'none';
            comprobanteContainer.classList.remove('visible');
        }
    });

    // Validación en tiempo real
    const inputs = form.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
        });

        input.addEventListener('blur', () => {
            validateInput(input);
        });
    });

    function validateInput(input) {
        const validationMessage = input.parentElement.querySelector('.validation-message') 
            || document.createElement('div');
        
        validationMessage.className = 'validation-message';

        if (!input.value.trim()) {
            validationMessage.textContent = 'Este campo es requerido';
            validationMessage.classList.add('visible');
            input.parentElement.appendChild(validationMessage);
        } else {
            validationMessage.classList.remove('visible');
        }
    }

    // Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await procesarPago();
    });
});

function cargarCarrito() {
    try {
        return JSON.parse(localStorage.getItem('carrito')) || [];
    } catch (error) {
        console.error('Error al leer el carrito:', error);
        mostrarMensaje('Error al cargar el carrito de compras', 'error');
        return [];
    }
}

function mostrarProductosYCalcularTotal(carrito, tablaElement) {
    let total = 0;
    tablaElement.innerHTML = '';

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
        tablaElement.appendChild(row);
    });

    return total;
}

async function procesarPago() {
    const clienteNombre = document.getElementById('cliente-nombre').value.trim();
    const clienteDireccion = document.getElementById('cliente-direccion').value.trim();
    const clienteCorreo = document.getElementById('cliente-correo').value.trim();
    const clienteTelefono = document.getElementById('cliente-telefono').value.trim();
    const metodoPago = document.getElementById('metodo-pago').value;
    const comprobante = document.getElementById('comprobante').files[0];

    // Validaciones
    if (!clienteNombre || !clienteDireccion || !clienteCorreo || !clienteTelefono) {
        mostrarMensaje('Por favor complete todos los campos obligatorios', 'error');
        return;
    }

    if (metodoPago === 'Transferencia' && !comprobante) {
        mostrarMensaje('Por favor sube el comprobante de transferencia', 'error');
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

            if (!uploadResponse.ok) throw new Error(await uploadResponse.text());
            const uploadData = await uploadResponse.json();
            comprobantePath = uploadData.filePath;
        } catch (error) {
            console.error('Error al subir comprobante:', error);
            mostrarMensaje('Error al subir el comprobante', 'error');
            return;
        }
    }

    await confirmarCompra(clienteNombre, clienteDireccion, clienteCorreo, clienteTelefono, metodoPago, comprobantePath);
}

async function confirmarCompra(clienteNombre, clienteDireccion, clienteCorreo, clienteTelefono, metodoPago, comprobantePath) {
    const carrito = cargarCarrito();
    if (carrito.length === 0) {
        mostrarMensaje('No hay productos en el carrito', 'error');
        return;
    }

    try {
        const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliente_nombre: clienteNombre,
                cliente_direccion: clienteDireccion,
                correo_usuario: clienteCorreo,
                tel_usuario: clienteTelefono,
                metodo_pago: metodoPago,
                productos: carrito,
                comprobante_path: comprobantePath
            }),
        });

        if (!response.ok) {
            throw new Error('Error al procesar el pedido');
        }

        // Éxito
        localStorage.removeItem('carrito');
        mostrarMensaje('¡Compra confirmada! Redirigiendo...', 'success');
        
        // Cambiamos la redirección a la página de productos
        setTimeout(() => window.location.href = '/productos', 2000);
    } catch (error) {
        console.error('Error al confirmar compra:', error);
        mostrarMensaje(error.message || 'Ocurrió un error al confirmar la compra', 'error');
    }
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.createElement('div');
    mensaje.className = `mensaje ${tipo}`;
    mensaje.textContent = texto;
    
    document.body.appendChild(mensaje);
    
    setTimeout(() => {
        mensaje.style.opacity = '0';
        setTimeout(() => mensaje.remove(), 500);
    }, 3000);
}