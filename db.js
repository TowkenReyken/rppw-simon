const sql = require('mssql');

const config = {
  user: 'Towken',
  password: 'Nathiel_Chris_Prime',
  server: 'TOWKENREYKEN', 
  database: 'dbppw-simon',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Conexión a la base de datos establecida');
    return pool;
  })
  .catch(err => {
    console.error('❌ Error al conectar a la base de datos:', err);
    throw err;
  });

// Función para asegurar la conexión
const conectarDB = async () => {
  try {
    await poolPromise;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    throw error;
  }
};

module.exports = { sql, poolPromise, conectarDB };