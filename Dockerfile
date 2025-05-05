# Dockerfile
# Usa una imagen oficial de Node.js con Debian
FROM node:18

# Instala PHP CLI y herramientas para compilar módulos nativos
RUN apt-get update \
    && apt-get install -y \
        php \
        php-cli \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instala "concurrently" de forma global para ejecutar múltiples procesos
RUN npm install -g concurrently

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de definición de dependencias y los instala
COPY package*.json ./
RUN npm install --production=false

# Copia el resto del código de la aplicación
COPY . .

# Excluye archivos innecesarios en la construcción (define .dockerignore también)
# Exponer el puerto de Node.js para Render
EXPOSE 3000

# Comando por defecto: levanta PHP (en src/) y Node.js simultáneamente
CMD ["concurrently", "php -S 0.0.0.0:3001 -t src", "node server.js"]
