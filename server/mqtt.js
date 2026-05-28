// Este módulo: recibe telemetría desde los clientes (subscribe)
// y publica configuración al broker (publish)
const mqtt             = require("mqtt");
const { guardarDato }  = require("./storage");

const MQTT_BROKER      = "mqtt://localhost:1883";
const MQTT_TOPIC       = "driveshare/vehiculo/+/telemetria";
const MQTT_TOPIC_CONFIG = "driveshare/vehiculo/ABC-123/config";

const RADIO_PERMITIDO_KM = 15;

let broadcast = null;

function iniciarMQTT(broadcastFn) {
  broadcast = broadcastFn;

  const cliente = mqtt.connect(MQTT_BROKER);

  cliente.on("connect", () => {
    console.log("✅ Conectado al broker MQTT");

    // Suscribirse a telemetría
    cliente.subscribe(MQTT_TOPIC, { qos: 1 });
    console.log(`📡 Suscrito al topic: ${MQTT_TOPIC}`);

    // Envío: el servidor publica la configuración del geo-fence al broker.
    // retain:true hace que el simulador la reciba aunque se conecte después.
    const config = JSON.stringify({ radio_permitido_km: RADIO_PERMITIDO_KM });
    cliente.publish(MQTT_TOPIC_CONFIG, config, { qos: 1, retain: true });
    console.log(`⚙️  Config publicada: radio_permitido_km = ${RADIO_PERMITIDO_KM} km`);
  });

  cliente.on("error", (err) => {
    console.error("❌ Error MQTT:", err.message);
  });

  cliente.on("message", (topic, buffer) => {
    try {
      // Recepción: aquí llegan los mensajes MQTT publicados por el simulador o dispositivos reales
      const datos = JSON.parse(buffer.toString());

      // Procesamiento: se guarda la telemetría y se reenvía al frontend
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