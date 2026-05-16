const fs   = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "telemetria.json");

function cargarDatos() {
  if (!fs.existsSync(DB_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (err) {
    console.error("❌ Error leyendo telemetria.json:", err.message);
    return [];
  }
}

function guardarDato(dato) {
  try {
    const datos = cargarDatos();
    datos.push(dato);
    fs.writeFileSync(DB_FILE, JSON.stringify(datos, null, 2));
  } catch (err) {
    console.error("❌ Error guardando dato:", err.message);
  }
}

module.exports = { cargarDatos, guardarDato };