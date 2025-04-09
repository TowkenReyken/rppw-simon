const express = require('express');
const router = express.Router();
const { sql, poolPromise, conectarDB } = require('../db');

conectarDB();

// Ruta para agregar productos (POST)
router.post("/productos", async (req, res) => {
  const { nombre, precio, descuento, categoria, imagen } = req.body;

  if (!nombre || !precio || !categoria || !imagen) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input("nombre", sql.VarChar, nombre)
      .input("precio", sql.Decimal, precio)
      .input("descuento", sql.Int, descuento || 0)
      .input("categoria", sql.VarChar, categoria)
      .input("imagen", sql.VarChar, imagen)
      .query(`
          INSERT INTO productos (nombre, precio, descuento, categoria, imagen)
          VALUES (@nombre, @precio, @descuento, @categoria, @imagen)
      `);

    res.json({ message: "✅ Producto agregado exitosamente" });
  } catch (error) {
    console.error("❌ Error al insertar producto:", error.message);
    res.status(500).json({ error: `Error interno del servidor: ${error.message}` });
  }
});

// Ruta para obtener productos (GET)
router.get("/productos", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM productos");
    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error.message);
    res.status(500).json({ error: `Error al obtener productos: ${error.message}` });
  }
});

module.exports = router;
