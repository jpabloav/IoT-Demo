const express  = require("express");
const http     = require("http");
const cors     = require("cors");
const { WebSocketServer } = require("ws");
const routes        = require("./routes");
const { iniciarMQTT } = require("./mqtt");

const HTTP_PORT = 3000;

// Express
const app    = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(routes);

// WebSocket
const wss = new WebSocketServer({ server });

function broadcast(data) {
  const mensaje = JSON.stringify(data);
  wss.clients.forEach((cliente) => {
    if (cliente.readyState === 1) cliente.send(mensaje);
  });
}

wss.on("connection", (ws) => {
  console.log("🖥️  Dashboard conectado");
  ws.on("close", () => console.log("🖥️  Dashboard desconectado"));
});

// MQTT 
iniciarMQTT(broadcast);

// Arrancar servidor
server.listen(HTTP_PORT, () => {
  console.log(`\n🚀 Servidor en http://localhost:${HTTP_PORT}`);
  console.log(`📊 Dashboard: http://localhost:${HTTP_PORT}/index.html`);
  console.log(`🗃️  Historial: http://localhost:${HTTP_PORT}/api/historial`);
  console.log(`📋 Resumen:   http://localhost:${HTTP_PORT}/api/resumen/RES-001\n`);
});