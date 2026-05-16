const express      = require("express");
const path         = require("path");
const { cargarDatos } = require("./storage");

const router = express.Router();

// Servir el dashboard
router.use(express.static(path.join(__dirname, "../dashboard")));

// GET /api/historial — últimos N registros
router.get("/api/historial", (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 50;
    const datos  = cargarDatos();
    res.json(datos.slice(-limite).reverse());
  } catch (err) {
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

// GET /api/resumen/:reservaId — resumen de una reserva
router.get("/api/resumen/:reservaId", (req, res) => {
  try {
    const datos = cargarDatos().filter(d => d.reserva_id === req.params.reservaId);

    if (datos.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const resumen = {
      reserva_id:       datos[0].reserva_id,
      arrendatario:     datos[0].arrendatario,
      total_lecturas:   datos.length,
      km_totales:       Math.max(...datos.map(d => d.km_recorridos)),
      velocidad_maxima: Math.max(...datos.map(d => d.velocidad_kmh)),
      total_alertas:    datos.filter(d => d.alerta_zona).length,
      inicio:           datos[0].timestamp,
      ultima_lectura:   datos[datos.length - 1].timestamp,
    };

    res.json(resumen);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener resumen" });
  }
});

module.exports = router;