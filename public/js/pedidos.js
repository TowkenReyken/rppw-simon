document.addEventListener('DOMContentLoaded', async () => {
    // Elementos del DOM
    const pedidosList = document.getElementById('pedidos-list');
    const filterStatus = document.getElementById('filter-status');
    const filterValidation = document.getElementById('filter-validation');
    
    // Modales
    const modalProductos = document.getElementById('modal-productos');
    const modalComprobante = document.getElementById('modal-comprobante');
    const modalMotivo = document.getElementById('modal-motivo');
    const modalConfirmar = document.getElementById('modal-confirmar');
    
    // Variables de estado
    let pedidosData = [];
    let pedidoIdMotivo = null;
    let currentAction = null;
    
    // Inicializar la aplicación
    initModals();
    await cargarPedidos();
    setupEventListeners();
    
    // Función para inicializar los modales
    function initModals() {
        // Cerrar modales al hacer clic en la X
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                closeBtn.closest('.modal').style.display = 'none';
            });
        });
        
        // Cerrar modales al hacer clic fuera del contenido
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // Formulario de motivo
        document.getElementById('form-motivo').addEventListener('submit', async (e) => {
            e.preventDefault();
            const motivo = document.getElementById('motivo-input').value;
            
            if (motivo && pedidoIdMotivo) {
                try {
                    await fetch(`/api/pedidos/${pedidoIdMotivo}/validar`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ validacion: false, motivo }),
                    });
                    
                    modalMotivo.style.display = 'none';
                    document.getElementById('motivo-input').value = '';
                    await cargarPedidos();
                    
                    showMessage('Pedido marcado como no válido', 'success');
                } catch (error) {
                    console.error('Error al validar pedido:', error);
                    showMessage('Error al marcar el pedido como no válido', 'error');
                }
            }
        });
        
        // Confirmación de acciones
        document.getElementById('confirm-action').addEventListener('click', async () => {
            if (currentAction) {
                try {
                    await currentAction.action();
                    modalConfirmar.style.display = 'none';
                    await cargarPedidos();
                    showMessage(currentAction.successMessage, 'success');
                } catch (error) {
                    console.error('Error al ejecutar acción:', error);
                    showMessage(currentAction.errorMessage || 'Error al realizar la acción', 'error');
                }
            }
        });
        
        document.getElementById('cancel-action').addEventListener('click', () => {
            modalConfirmar.style.display = 'none';
        });
    }
    
    // Función para configurar event listeners
    function setupEventListeners() {
        // Filtros
        filterStatus.addEventListener('change', filtrarPedidos);
        filterValidation.addEventListener('change', filtrarPedidos);
        
        // Delegación de eventos para los botones de los pedidos
        pedidosList.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            const pedidoItem = btn.closest('.pedido-item');
            if (!pedidoItem) return;
            
            const pedidoId = pedidoItem.dataset.id;
            const pedido = pedidosData.find(p => p.id == pedidoId);
            
            // Ver productos
            if (btn.classList.contains('btn-ver-productos')) {
                try {
                    const productos = JSON.parse(btn.dataset.productos);
                    mostrarProductos(productos, pedido);
                } catch (error) {
                    console.error('Error al mostrar productos:', error);
                    showMessage('Error al mostrar los productos', 'error');
                }
            }
            
            // Ver comprobante
            if (btn.classList.contains('btn-ver-comprobante')) {
                const comprobantePath = btn.dataset.comprobante;
                if (comprobantePath) {
                    mostrarComprobante(comprobantePath);
                } else {
                    showMessage('No hay comprobante disponible', 'warning');
                }
            }
            
            // Cambiar estado
            if (btn.classList.contains('btn-estado')) {
                const estadoActual = pedido.estado;
                let nuevoEstado;
                let mensaje;

                if (estadoActual === 'Pendiente' && pedido.validacion === true) {
                    nuevoEstado = 'En progreso';
                    mensaje = '¿Estás seguro de que deseas cambiar el estado a "En progreso"?';
                } else if (estadoActual === 'En progreso') {
                    nuevoEstado = 'Completado';
                    mensaje = '¿Estás seguro de que deseas marcar el pedido como completado?';
                } else if (estadoActual === 'Pendiente' && pedido.validacion !== true) {
                    showMessage('El pedido debe ser validado antes de cambiar su estado', 'warning');
                    return;
                }

                if (nuevoEstado) {
                    confirmAction({
                        message: mensaje,
                        action: () => fetch(`/api/pedidos/${pedidoId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ estado: nuevoEstado }),
                        }),
                        successMessage: `Estado del pedido actualizado a "${nuevoEstado}"`,
                        errorMessage: 'Error al actualizar el estado del pedido'
                    });
                }
            }
            
            // Validar pedido
            if (btn.classList.contains('btn-validar')) {
                confirmAction({
                    message: '¿Estás seguro de que deseas validar este pedido?',
                    action: async () => {
                        const response = await fetch(`/api/pedidos/${pedidoId}/validar`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ validacion: true })
                        });
                        if (!response.ok) throw new Error('Error al validar el pedido');
                    },
                    successMessage: 'Pedido validado exitosamente',
                    errorMessage: 'Error al validar el pedido'
                });
            }
            
            // No validar pedido
            if (btn.classList.contains('btn-no-validar')) {
                pedidoIdMotivo = pedidoId;
                modalMotivo.style.display = 'flex';
            }
            
            // Eliminar pedido
            if (btn.classList.contains('btn-cancelar')) {
                confirmAction({
                    message: '¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.',
                    action: () => fetch(`/api/pedidos/${pedidoId}`, {
                        method: 'DELETE'
                    }),
                    successMessage: 'Pedido eliminado correctamente',
                    errorMessage: 'Error al eliminar el pedido'
                });
            }
        });
    }
    
    // Función para mostrar mensajes
    function showMessage(text, type) {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-exclamation-circle'}"></i>
            ${text}
        `;
        
        const container = document.querySelector('.pedidos-container');
        container.insertBefore(message, container.firstChild);
        
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }
    
    // Función para confirmar acciones
    function confirmAction({ message, action, successMessage, errorMessage }) {
        document.getElementById('confirm-message').textContent = message;
        currentAction = { action, successMessage, errorMessage };
        modalConfirmar.style.display = 'flex';
    }
    
    // Función para cargar pedidos
    async function cargarPedidos() {
        try {
            const response = await fetch('/api/pedidos');
            pedidosData = await response.json();
            renderPedidos(pedidosData);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            pedidosList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar los pedidos</h3>
                    <p>No se pudieron cargar los pedidos. Por favor, intenta nuevamente.</p>
                </div>
            `;
        }
    }
    
    // Función para filtrar pedidos
    function filtrarPedidos() {
        const statusFilter = filterStatus.value;
        const validationFilter = filterValidation.value;
        
        const filtered = pedidosData.filter(pedido => {
            const statusMatch = statusFilter === 'all' || pedido.estado === statusFilter;
            
            let validationMatch = true;
            if (validationFilter === 'valid') {
                validationMatch = pedido.validacion === true;
            } else if (validationFilter === 'invalid') {
                validationMatch = pedido.validacion === false;
            } else if (validationFilter === 'pending') {
                validationMatch = pedido.validacion === null;
            }
            
            return statusMatch && validationMatch;
        });
        
        renderPedidos(filtered);
    }
    
    // Función para renderizar pedidos
    function renderPedidos(pedidos) {
if (pedidos.length === 0) {
            pedidosList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No hay pedidos</h3>
                    <p>No se encontraron pedidos con los filtros seleccionados.</p>
                </div>
            `;
            return;
        }
        
        pedidosList.innerHTML = pedidos.map(pedido => {
            const estadoClass = `estado-${pedido.estado.toLowerCase().replace(' ', '-')}`;
            const validacionClass = pedido.validacion === true ? 'valid' : 
                                  pedido.validacion === false ? 'invalid' : 'pending';
            
            const verComprobanteBtn = pedido.comprobante_path 
                ? `<button class="btn btn-primary btn-sm btn-ver-comprobante" data-comprobante="${pedido.comprobante_path}">
                       <i class="fas fa-file-alt"></i> Ver Comprobante
                   </button>` 
                : '';
            
            // Botones de validación
            let validacionButtons = '';
            if (pedido.validacion === null) {
                validacionButtons = `
                    <div class="validacion-actions">
                        <button class="btn btn-success btn-sm btn-validar" data-id="${pedido.id}">
                            <i class="fas fa-check-circle"></i> Válido
                        </button>
                        <button class="btn btn-danger btn-sm btn-no-validar" data-id="${pedido.id}">
                            <i class="fas fa-times-circle"></i> No Válido
                        </button>
                    </div>
                `;
            } else if (pedido.validacion === false) {
                validacionButtons = `
                    <div class="validacion-actions">
                        <button class="btn btn-danger btn-sm btn-cancelar" data-id="${pedido.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                `;
            }
            
            // Determinar el botón de estado según la validación y el estado actual
            const estadoButton = pedido.estado !== 'Completado' 
                ? `<button class="btn btn-warning btn-sm btn-estado" 
                    ${pedido.validacion !== true && pedido.estado === 'Pendiente' ? 'disabled' : ''}>
                    <i class="fas fa-sync-alt"></i> 
                    ${pedido.estado === 'Pendiente' ? 'Pasar a En Progreso' : 'Completar Pedido'}
                   </button>`
                : '';
            
            return `
                <div class="pedido-item ${estadoClass}" data-id="${pedido.id}">
                    <div class="pedido-info">
                        <p><strong>Cliente:</strong> ${pedido.cliente_nombre}</p>
                        <p><strong>Dirección:</strong> ${pedido.cliente_direccion}</p>
                        <p><strong>Método de Pago:</strong> ${pedido.metodo_pago}</p>
                        <p><strong>Estado:</strong> ${pedido.estado}</p>
                        <p><strong>Validación:</strong> 
                            <span class="validation-status ${validacionClass}">
                                ${pedido.validacion === null ? 'Pendiente' : 
                                  pedido.validacion ? 'Válido' : 'No válido'}
                            </span>
                        </p>
                        <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
                    </div>
                    <div class="pedido-actions">
                        <button class="btn btn-primary btn-sm btn-ver-productos" 
                                data-productos='${JSON.stringify(pedido.productos)}'>
                            <i class="fas fa-box-open"></i> Productos
                        </button>
                        ${verComprobanteBtn}
                        ${estadoButton}
                        ${validacionButtons}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Función para mostrar productos en modal
    function mostrarProductos(productos, pedido) {
        const productosList = document.querySelector('#modal-productos .productos-list');
        let total = 0;
        
        productosList.innerHTML = '';
        
        if (!productos || productos.length === 0) {
            productosList.innerHTML = '<p class="no-productos">No hay productos disponibles</p>';
            document.getElementById('modal-productos').style.display = 'flex';
            return;
        }

        // Agregar información del cliente
        productosList.innerHTML = `
            <div class="cliente-info">
                <h3>Información del Cliente:</h3>
                <p><strong>Correo:</strong> ${pedido.correo_usuario}</p>
                <p><strong>Teléfono:</strong> ${pedido.tel_usuario}</p>
            </div>
            <hr>
        `;

        productos.forEach(producto => {
            const precio = parseFloat(producto.precio || producto.price);
            const cantidad = parseInt(producto.quantity);
            const descuento = parseInt(producto.descuento || producto.discount) || 0;
            
            const precioUnitario = precio - (precio * (descuento / 100));
            const subtotal = precioUnitario * cantidad;
            total += subtotal;

            productosList.innerHTML += `
                <div class="producto-item">
                    <div class="producto-info">
                        <p><strong>${producto.nombre || producto.title}</strong></p>
                        <p>Cantidad: ${cantidad}</p>
                        <p>Precio unitario: $${precioUnitario.toFixed(2)}</p>
                        ${descuento > 0 ? `<p>Descuento: ${descuento}%</p>` : ''}
                    </div>
                    <div class="producto-total">
                        $${subtotal.toFixed(2)}
                    </div>
                </div>
            `;
        });

        productosList.innerHTML += `
            <div class="producto-item total-row">
                <div class="producto-info"><strong>Total:</strong></div>
                <div class="producto-total"><strong>$${total.toFixed(2)}</strong></div>
            </div>
        `;

        document.getElementById('modal-productos').style.display = 'flex';
    }
    
    // Función para mostrar comprobante en modal
    function mostrarComprobante(comprobantePath) {
        const comprobanteViewer = document.querySelector('#modal-comprobante .comprobante-viewer');
        const downloadBtn = document.querySelector('#modal-comprobante .btn-download');
        
        if (!comprobantePath) {
            comprobanteViewer.innerHTML = '<p class="no-comprobante">No hay comprobante disponible</p>';
            downloadBtn.style.display = 'none';
            document.getElementById('modal-comprobante').style.display = 'flex';
            return;
        }
    
        const extension = comprobantePath.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(extension);
        
        comprobanteViewer.innerHTML = isImage 
            ? `<img src="${comprobantePath}" alt="Comprobante de pago">` 
            : `<iframe src="${comprobantePath}" width="100%" height="500px"></iframe>`;
        
        downloadBtn.href = comprobantePath;
        downloadBtn.download = `comprobante-${Date.now()}.${extension}`;
        downloadBtn.style.display = 'inline-block';
        
        document.getElementById('modal-comprobante').style.display = 'flex';
    }
});