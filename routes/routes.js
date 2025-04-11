const express = require('express');
const router = express.Router();
const supabase = require('../supabase').default; // Importar correctamente la instancia

// Ruta para agregar productos (POST)
router.post("/productos", async (req, res) => {
  const { nombre, precio, descuento, categoria, imagen } = req.body;

  if (!nombre || !precio || !categoria || !imagen) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const { error } = await supabase
      .from('productos')
      .insert([
        { nombre, precio, descuento: descuento || 0, categoria, imagen }
      ]);

    if (error) throw error;

    res.json({ message: "✅ Producto agregado exitosamente" });
  } catch (error) {
    console.error("❌ Error al insertar producto:", error.message);
    res.status(500).json({ error: `Error interno del servidor: ${error.message}` });
  }
});

// Ruta para obtener productos (GET)
router.get("/productos", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error.message);
    res.status(500).json({ error: `Error al obtener productos: ${error.message}` });
  }
});

module.exports = router;
