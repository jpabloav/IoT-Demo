const mqtt                 = require("mqtt");
const { guargarDato }      = require("./storage");
const { guardarDato }      = require("./storage");

const MQTT_BROKER = "mqtt://localhost:1883";
const MQTT_TOPIC  = "driveshare/vehiculo/+/telemetria";

let broadcast = null;

function iniciarMQTT(broadcastFn) {
  broadcast = broadcastFn;

  const cliente = mqtt.connect(MQTT_BROKER);

  cliente.on("connect", () => {
    console.log("✅ Conectado al broker MQTT");
    cliente.subscribe(MQTT_TOPIC, { qos: 1 });
    console.log(`📡 Suscrito al topic: ${MQTT_TOPIC}`);
  });

  cliente.on("error", (err) => {
    console.error("❌ Error MQTT:", err.message);
  });

  cliente.on("message", (topic, buffer) => {
    try {
      const datos = JSON.parse(buffer.toString());

      guardarDato(datos);
      broadcast({ tipo: "telemetria", datos });

      const alerta = datos.alerta_zona ? " ⚠️  ALERTA ZONA" : "";
      console.log(
        `📥 [${datos.timestamp}] ${datos.vehiculo_id} | ` +
        `${datos.velocidad_kmh} km/h | Temp: ${datos.temp_motor_c}°C${alerta}`
      );
    } catch (err) {
      console.error("❌ Mensaje inválido:", err.message);
    }
  });
}

module.exports = { iniciarMQTT };