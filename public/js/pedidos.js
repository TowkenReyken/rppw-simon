document.addEventListener('DOMContentLoaded', async () => {
    const pedidosList = document.getElementById('pedidos-list');
    const modalProductos = document.createElement('div');
    modalProductos.id = 'modal-productos';
    modalProductos.classList.add('modal');
    document.body.appendChild(modalProductos);

    const modalConfirmar = document.createElement('div');
    modalConfirmar.id = 'modal-confirmar';
    modalConfirmar.classList.add('modal');
    document.body.appendChild(modalConfirmar);

    const modalMotivo = document.createElement('div');
    modalMotivo.id = 'modal-motivo';
    modalMotivo.classList.add('modal');
    modalMotivo.innerHTML = `
        <div class="modal-content">
            <span id="close-motivo" class="close">&times;</span>
            <h2>Indica el motivo</h2>
            <form id="form-motivo">
                <textarea id="motivo-input" placeholder="Escribe el motivo aquí..." required></textarea>
                <button type="submit" class="btn-enviar-motivo">Enviar</button>
            </form>
        </div>
    `;
    document.body.appendChild(modalMotivo);

    let pedidoIdMotivo = null;

    // Función para cargar pedidos
    async function cargarPedidos() {
        try {
            const response = await fetch('/api/pedidos');
            const pedidos = await response.json();

            pedidosList.innerHTML = '';
            pedidos.forEach(pedido => {
                const pedidoDiv = document.createElement('div');
                pedidoDiv.classList.add('pedido-item');

                // Estilo para pedidos completados
                if (pedido.estado === 'Completado') {
                    pedidoDiv.style.backgroundColor = '#e8f5e9'; // Verde claro
                }

                // Botón "Ver Comprobante" (solo si existe)
                const verComprobanteBtn = pedido.comprobante_path 
                    ? `<button class="btn-ver-comprobante" data-comprobante="${pedido.comprobante_path}">
                        <i class="fas fa-file-invoice"></i> Ver Comprobante
                       </button>`
                    : '';

                // Botones de validación
                let validacionButtons = '';
                if (pedido.validacion === null) {
                    validacionButtons = `
                        <div class="validacion-actions">
                            <button class="btn-validar" data-id="${pedido.id}">
                                <i class="fas fa-check-circle"></i> Válido
                            </button>
                            <button class="btn-no-validar" data-id="${pedido.id}">
                                <i class="fas fa-times-circle"></i> No Válido
                            </button>
                        </div>
                    `;
                } else if (pedido.validacion === false) {
                    validacionButtons = `
                        <div class="validacion-actions">
                            <button class="btn-cancelar" data-id="${pedido.id}">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    `;
                }

                // Botón de estado (solo si está validado)
                const estadoButton = pedido.validacion === true 
                    ? `<button class="btn-estado" data-id="${pedido.id}" data-estado="${pedido.estado}">
                        ${pedido.estado === 'En progreso' 
                            ? '<i class="fas fa-check"></i> Completar Pedido' 
                            : '<i class="fas fa-clipboard-check"></i> Completado'}
                       </button>`
                    : '';

                pedidoDiv.innerHTML = `
                    <div class="pedido-info">
                        <p><strong>Cliente:</strong> ${pedido.cliente_nombre}</p>
                        <p><strong>Dirección:</strong> ${pedido.cliente_direccion}</p>
                        <p><strong>Método de Pago:</strong> ${pedido.metodo_pago}</p>
                        <p><strong>Estado:</strong> ${pedido.estado}</p>
                        <p><strong>Validación:</strong> 
                            ${pedido.validacion === null 
                                ? '<span class="badge badge-warning">Pendiente</span>' 
                                : pedido.validacion 
                                    ? '<span class="badge badge-success">Válido</span>' 
                                    : '<span class="badge badge-danger">No Válido</span>'}
                        </p>
                        <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
                    </div>
                    <div class="pedido-actions">
                        <button class="btn-ver-productos" data-productos='${JSON.stringify(pedido.productos)}'>
                            <i class="fas fa-box-open"></i> Ver Productos
                        </button>
                        ${verComprobanteBtn}
                        ${estadoButton}
                        ${validacionButtons}
                    </div>
                `;
                pedidosList.appendChild(pedidoDiv);
            });

        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            pedidosList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i> No se pudieron cargar los pedidos. Intenta nuevamente.
                </div>
            `;
        }
    }

    // Función para cambiar el estado del pedido
    pedidosList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-estado')) {
            const id = e.target.dataset.id;
            const nuevoEstado = e.target.dataset.estado === 'En progreso' ? 'Completado' : 'En progreso';

            try {
                await fetch(`/api/pedidos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado: nuevoEstado }),
                });
                cargarPedidos();
            } catch (error) {
                console.error('Error al actualizar estado del pedido:', error);
            }
        }
    });

    // Función para validar o no validar un pedido
    pedidosList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-validar')) {
            const id = e.target.dataset.id;
            try {
                await fetch(`/api/pedidos/${id}/validar`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ validacion: true }),
                });
                cargarPedidos();
            } catch (error) {
                console.error('Error al validar pedido:', error);
            }
        }

        if (e.target.classList.contains('btn-no-validar')) {
            const id = e.target.dataset.id;
            const motivo = prompt("Indica el motivo por el que no se valida el pedido:");
            if (!motivo) return;
            try {
                await fetch(`/api/pedidos/${id}/validar`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ validacion: false, motivo }),
                });
                cargarPedidos();
            } catch (error) {
                console.error('Error al validar pedido:', error);
            }
        }
    });

    // Función para cancelar/eliminar un pedido
    pedidosList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-cancelar')) {
            const id = e.target.dataset.id;
            if (!confirm("¿Estás seguro de que deseas eliminar este pedido?")) return;
            fetch(`/api/pedidos/${id}`, {
                method: 'DELETE'
            }).then(() => cargarPedidos());
        }
    });

    // Función para ver productos del pedido
    pedidosList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-ver-productos')) {
            const productos = JSON.parse(e.target.dataset.productos);
            modalProductos.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="document.getElementById('modal-productos').style.display='none'">&times;</span>
                    <h2>Productos del Pedido</h2>
                    <ul>
                        ${productos.map(producto => `<li>${producto.quantity}x ${producto.title} - $${producto.price}</li>`).join('')}
                    </ul>
                </div>
            `;
            modalProductos.style.display = 'flex';
        }
    });

    // Mostrar comprobante al hacer clic en "Ver Comprobante"
    pedidosList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-ver-comprobante') || 
            e.target.closest('.btn-ver-comprobante')) {
            const button = e.target.classList.contains('btn-ver-comprobante') 
                ? e.target 
                : e.target.closest('.btn-ver-comprobante');
            const comprobantePath = button.dataset.comprobante;
            
            // Verificar el tipo de archivo
            const extension = comprobantePath.split('.').pop().toLowerCase();
            const isPDF = extension === 'pdf';
            const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(extension);

            if (isImage) {
                // Para imágenes: mostrar en modal grande
                const modalComprobante = document.createElement('div');
                modalComprobante.classList.add('modal', 'modal-comprobante');
                modalComprobante.innerHTML = `
                    <div class="modal-content">
                        <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                        <h2>Comprobante de Pago</h2>
                        <div class="comprobante-viewer">
                            <img src="${comprobantePath}" style="max-width: 100%; max-height: 80vh; display: block; margin: 0 auto;">
                        </div>
                    </div>
                `;
                document.body.appendChild(modalComprobante);
                modalComprobante.style.display = 'flex';
            } else {
                // Para PDFs y otros formatos: abrir en nueva pestaña
                window.open(comprobantePath, '_blank');
            }
        }
    });

    // Cargar pedidos al iniciar
    cargarPedidos();
});