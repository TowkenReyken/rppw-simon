document.addEventListener('DOMContentLoaded', () => {
    // Navegación
    const links = document.querySelectorAll('.admin-sidebar nav a');
    const sections = document.querySelectorAll('.admin-section');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                    if (targetId === 'usuarios') {
                        cargarUsuarios();
                    }
                }
            });
        });
    });

    // Cargar datos iniciales
    cargarEstadisticas();
    inicializarGraficos();

    async function cargarEstadisticas() {
        try {
            const response = await fetch('/api/admin/estadisticas');
            const data = await response.json();

            document.getElementById('total-pedidos').textContent = data.totalPedidos;
            document.getElementById('total-productos').textContent = data.totalProductos;
            document.getElementById('total-usuarios').textContent = data.totalUsuarios;
            document.getElementById('ventas-mes').textContent = `$${data.ventasMes.toFixed(2)}`;

            // Actualizar gráfico de productos por categoría
            actualizarGraficoProductos(data.productosPorCategoria);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    }

    function inicializarGraficos() {
        // Gráfico de ventas
        const ventasCtx = document.getElementById('ventas-chart').getContext('2d');
        new Chart(ventasCtx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Ventas Mensuales',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
                    borderColor: '#3498db',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Gráfico de productos
        const productosCtx = document.getElementById('productos-chart').getContext('2d');
        new Chart(productosCtx, {
            type: 'bar',
            data: {
                labels: ['Frutas', 'Verduras', 'Carnes', 'Lácteos', 'Bebidas'],
                datasets: [{
                    label: 'Productos por Categoría',
                    data: [45, 39, 28, 35, 42],
                    backgroundColor: '#2ecc71'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function actualizarGraficoProductos(datos) {
        const chartElement = document.getElementById('productos-chart');
        const existingChart = Chart.getChart(chartElement);
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = chartElement.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.map(d => d.categoria),
                datasets: [{
                    label: 'Productos por Categoría',
                    data: datos.map(d => parseInt(d.cantidad)),
                    backgroundColor: [
                        '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e74c3c',
                        '#1abc9c', '#34495e', '#e67e22', '#16a085', '#c0392b',
                        '#27ae60', '#2980b9', '#8e44ad', '#f39c12', '#d35400'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                barThickness: 30, // Aumentar el grosor de las barras
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Productos por Categoría',
                        font: {
                            size: 18
                        },
                        padding: 20
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            drawBorder: true,
                            drawOnChartArea: true,
                            drawTicks: true,
                        },
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 14
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: 10
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 20,
                        right: 30,
                        top: 20,
                        bottom: 20
                    }
                }
            }
        });
    }

    async function cargarUsuarios() {
        try {
            const response = await fetch('/api/usuarios');
            const usuarios = await response.json();
            const tbody = document.getElementById('users-list');

            tbody.innerHTML = usuarios.map(usuario => `
                <tr>
                    <td>${usuario.nombre}</td>
                    <td>${usuario.correo}</td>
                    <td>${usuario.direccion || '-'}</td>
                    <td>${usuario.telefono || '-'}</td>
                    <td>
                        <select class="role-select" data-user-id="${usuario.id}" data-current-role="${usuario.rol}">
                            <option value="admin" ${usuario.rol === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="cliente" ${usuario.rol === 'cliente' ? 'selected' : ''}>Cliente</option>
                        </select>
                    </td>
                </tr>
            `).join('');

            // Agregar event listeners a los selectores de rol
            document.querySelectorAll('.role-select').forEach(select => {
                select.addEventListener('change', async (e) => {
                    const userId = e.target.dataset.userId;
                    const newRole = e.target.value;
                    const currentRole = e.target.dataset.currentRole;

                    if (newRole !== currentRole) {
                        if (confirm(`¿Estás seguro de cambiar el rol del usuario a ${newRole}?`)) {
                            try {
                                const response = await fetch(`/api/usuarios/${userId}/rol`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ rol: newRole })
                                });

                                if (response.ok) {
                                    e.target.dataset.currentRole = newRole;
                                    showMessage('Rol actualizado correctamente', 'success');
                                } else {
                                    e.target.value = currentRole;
                                    showMessage('Error al actualizar el rol', 'error');
                                }
                            } catch (error) {
                                console.error('Error:', error);
                                e.target.value = currentRole;
                                showMessage('Error al actualizar el rol', 'error');
                            }
                        } else {
                            e.target.value = currentRole;
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    }

    window.eliminarUsuario = async (id) => {
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                const response = await fetch(`/api/usuarios/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await cargarUsuarios();
                    showMessage('Usuario eliminado exitosamente', 'success');
                } else {
                    showMessage('Error al eliminar usuario', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error al eliminar usuario', 'error');
            }
        }
    };
});