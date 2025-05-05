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

    // Función para cargar pedidos
    async function cargarPedidos() {
        try {
            const response = await fetch('/api/pedidos');
            const pedidos = await response.json();

            pedidosList.innerHTML = '';
            pedidos.forEach(pedido => {
                const pedidoDiv = document.createElement('div');
                pedidoDiv.classList.add('pedido-item');
                if (pedido.estado === 'Completado') {
                    pedidoDiv.style.backgroundColor = '#d3d3d3';
                }

                // Botones de validación
                let validacionButtons = '';
                if (pedido.validacion === null) {
                    validacionButtons = `
                        <div class="validacion-actions">
                            <button class="btn-validar" data-id="${pedido.id}">Válido</button>
                            <button class="btn-no-validar" data-id="${pedido.id}">No Válido</button>
                        </div>
                    `;
                } else if (pedido.validacion === true && pedido.estado !== 'Completado') {
                    validacionButtons = `
                        <button class="btn-desvalidar" data-id="${pedido.id}">Desvalidar</button>
                    `;
                }

                pedidoDiv.innerHTML = `
                    <div class="pedido-info">
                        <p><strong>Cliente:</strong> ${pedido.cliente_nombre}</p>
                        <p><strong>Dirección:</strong> ${pedido.cliente_direccion}</p>
                        <p><strong>Método de Pago:</strong> ${pedido.metodo_pago}</p>
                        <p><strong>Validación:</strong> ${pedido.validacion === null ? 'Pendiente' : pedido.validacion ? 'Válido' : 'No Válido'}</p>
                    </div>
                    <div class="pedido-actions">
                        <button class="btn-ver-productos" data-productos='${JSON.stringify(pedido.productos)}'>Ver Productos</button>
                        ${pedido.validacion === true ? `<button class="btn-estado" data-id="${pedido.id}" data-estado="${pedido.estado}">${pedido.estado === 'En progreso' ? 'Completar Pedido' : 'Completado'}</button>` : ''}
                        ${validacionButtons}
                    </div>
                `;
                pedidosList.appendChild(pedidoDiv);
            });
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
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

    // Función para validar un pedido
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

            modalConfirmar.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="document.getElementById('modal-confirmar').style.display='none'">&times;</span>
                    <h2>¿Estás seguro de que deseas marcar este pedido como No Válido?</h2>
                    <button id="confirmar-no-validar" class="btn-cancelar-confirmar">Confirmar</button>
                    <button id="cancelar-no-validar" class="btn-cancelar-cancelar">Cancelar</button>
                </div>
            `;
            modalConfirmar.style.display = 'flex';

            document.getElementById('confirmar-no-validar').addEventListener('click', async () => {
                try {
                    await fetch(`/api/pedidos/${id}`, { method: 'DELETE' });
                    modalConfirmar.style.display = 'none';
                    cargarPedidos();
                } catch (error) {
                    console.error('Error al eliminar pedido:', error);
                }
            });

            document.getElementById('cancelar-no-validar').addEventListener('click', () => {
                modalConfirmar.style.display = 'none';
            });
        }

        if (e.target.classList.contains('btn-desvalidar')) {
            const id = e.target.dataset.id;

            try {
                await fetch(`/api/pedidos/${id}/validar`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ validacion: null }),
                });
                cargarPedidos();
            } catch (error) {
                console.error('Error al desvalidar pedido:', error);
            }
        }
    });

    // Función para cancelar un pedido
    pedidosList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-cancelar')) {
            const id = e.target.dataset.id;

            modalConfirmar.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="document.getElementById('modal-confirmar').style.display='none'">&times;</span>
                    <h2>¿Estás seguro de que deseas cancelar este pedido?</h2>
                    <button id="confirmar-cancelar" class="btn-cancelar-confirmar">Confirmar</button>
                    <button id="cancelar-cancelar" class="btn-cancelar-cancelar">Cancelar</button>
                </div>
            `;
            modalConfirmar.style.display = 'flex';

            document.getElementById('confirmar-cancelar').addEventListener('click', async () => {
                try {
                    await fetch(`/api/pedidos/${id}`, { method: 'DELETE' });
                    modalConfirmar.style.display = 'none';
                    cargarPedidos();
                } catch (error) {
                    console.error('Error al cancelar pedido:', error);
                }
            });

            document.getElementById('cancelar-cancelar').addEventListener('click', () => {
                modalConfirmar.style.display = 'none';
            });
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
        if (e.target.classList.contains('btn-ver-comprobante')) {
            const comprobantePath = e.target.dataset.comprobante;
            const modalComprobante = document.createElement('div');
            modalComprobante.classList.add('modal');
            modalComprobante.innerHTML = `
                <div class="modal-content">
                    <span class="close" onclick="this.parentElement.parentElement.style.display='none'">&times;</span>
                    <h2>Comprobante de Transferencia</h2>
                    <iframe src="${comprobantePath}" width="100%" height="500px"></iframe>
                </div>
            `;
            document.body.appendChild(modalComprobante);
            modalComprobante.style.display = 'flex';
        }
    });

    // Cargar pedidos al iniciar
    cargarPedidos();
});