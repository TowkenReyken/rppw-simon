# 🛒 Supermercado Simón - Plataforma Web

## 📝 Descripción
Plataforma web para el Supermercado Simón que permite a los clientes ver el catálogo de productos, realizar pedidos y gestionar entregas. Incluye un panel de administración para gestionar usuarios.

## 🚀 Características Principales

### 👥 Para Clientes
- Catálogo de productos con búsqueda y filtros
- Carrito de compras
- Sistema de registro e inicio de sesión
- Proceso de pago con validación de comprobantes
- Seguimiento de pedidos
- Información en sorteos

### 👨‍💼 Para Administradores
- Panel de administración
- Gestión de productos (CRUD)
- Gestión de pedidos
- Gestión de usuarios
- Estadísticas de categorias de productos
- Control de sorteos

## 🛠️ Tecnologías Utilizadas
- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript
  - EJS (plantillas)
  - Chart.js (gráficos)
  - SwiperJS (carrusel)

- **Backend:**
  - Node.js
  - Express.js
  - PHP
  - PostgreSQL (Supabase)

- **Herramientas:**
  - JWT (autenticación)
  - Bcrypt (encriptación)
  - Multer (manejo de archivos)
  - Nodemailer (envío de correos)

## 📦 Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/TowkenReyken/rppw-simon.git
cd ppw-simon
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
Crear archivo `.env` con las siguientes variables:
```env
user=tu_usuario_db
password=tu_password_db
host=tu_host_db
db_port=tu_puerto_db
dbname=tu_nombre_db
JWT_SECRET=tu_jwt_secret
EMAIL_USER=tu_email
EMAIL_PASS=tu_email_password
```

4. **Iniciar la aplicación:**
```bash
npm start
```

## 🚀 Uso

### Cliente
1. Navegar a la página principal
2. Explorar productos por categorías
3. Agregar productos al carrito
4. Realizar el proceso de pago
5. Seguir estado del pedido

### Administrador
1. Acceder al panel de administración
2. Gestionar productos y categorías
3. Procesar pedidos
4. Administrar usuarios
5. Ver estadísticas

## 📱 Responsive Design
- Diseño adaptable a diferentes dispositivos
- Optimizado para móviles, tablets y escritorio
- Interfaces intuitivas y accesibles

## 🔒 Seguridad
- Autenticación con JWT
- Encriptación de contraseñas
- Validación de roles
- Protección de rutas
- Manejo seguro de archivos

## 👥 Contribución
1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia
Este proyecto está bajo la Licencia ISC.

## ✉️ Contacto
- Email: contacto@supermercadosimon.com
- Teléfono: 809-724-5830
- Dirección: Calle Pedro Infante No 39, Cristo Rey, Santiago

## 🙏 Agradecimientos
- Equipo de desarrollo
- Contribuidores
- Comunidad de usuarios