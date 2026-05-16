import paho.mqtt.client as mqtt
import json
import time
import random
import math

# ─── Configuración ────────────────────────────────────────────────────────────
BROKER_HOST = "localhost"
BROKER_PORT = 1883
TOPIC       = "driveshare/vehiculo/ABC-123/telemetria"
INTERVALO   = 3  # segundos entre cada envío

RESERVA = {
    "reserva_id":   "RES-001",
    "vehiculo_id":  "ABC-123",
    "arrendatario": "Erik Huaroc",
    "propietario":  "Juan Pablo",
    "modelo":       "Toyota Corolla 2022",
}

LAT_BASE           = -12.0464
LNG_BASE           = -77.0428
RADIO_PERMITIDO_KM = 15.0

# ─── Estado del vehículo ──────────────────────────────────────────────────────
class EstadoVehiculo:
    def __init__(self):
        self.lat           = LAT_BASE
        self.lng           = LNG_BASE
        self.velocidad     = 0.0
        self.motor         = True
        self.temp_motor    = 85.0
        self.km_recorridos = 0.0
        self.fuera_de_zona = False

    def actualizar(self):
        self.lat += random.uniform(-0.002, 0.002)
        self.lng += random.uniform(-0.002, 0.002)

        cambio         = random.uniform(-10, 10)
        self.velocidad = max(0, min(80, self.velocidad + cambio))
        self.temp_motor = 80 + (self.velocidad / 80) * 20 + random.uniform(-2, 2)
        self.km_recorridos += (self.velocidad * INTERVALO) / 3600

        dist = self._distancia_km(LAT_BASE, LNG_BASE, self.lat, self.lng)
        self.fuera_de_zona = dist > RADIO_PERMITIDO_KM

    def _distancia_km(self, lat1, lng1, lat2, lng2):
        R    = 6371
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        a    = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    def a_dict(self):
        return {
            **RESERVA,
            "timestamp":       time.strftime("%Y-%m-%dT%H:%M:%S"),
            "gps":             {"lat": round(self.lat, 6), "lng": round(self.lng, 6)},
            "velocidad_kmh":   round(self.velocidad, 1),
            "motor_encendido": self.motor,
            "temp_motor_c":    round(self.temp_motor, 1),
            "km_recorridos":   round(self.km_recorridos, 2),
            "alerta_zona":     self.fuera_de_zona,
        }

# ─── Callbacks MQTT ───────────────────────────────────────────────────────────
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✅ Conectado al broker MQTT en {BROKER_HOST}:{BROKER_PORT}")
        print(f"📡 Publicando en topic: {TOPIC}")
        print(f"🚗 Vehículo: {RESERVA['modelo']} | Reserva: {RESERVA['reserva_id']}\n")
    else:
        print(f"❌ Error de conexión. Código: {rc}")

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    cliente = mqtt.Client(client_id="simulador-ABC-123")
    cliente.on_connect = on_connect

    try:
        cliente.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    except ConnectionRefusedError:
        print("❌ No se pudo conectar al broker.")
        print("   Asegúrate de que Mosquitto esté corriendo.")
        return

    cliente.loop_start()
    vehiculo = EstadoVehiculo()

    print("Presiona Ctrl+C para detener.\n")
    try:
        while True:
            vehiculo.actualizar()
            datos   = vehiculo.a_dict()
            payload = json.dumps(datos)
            cliente.publish(TOPIC, payload, qos=1)

            alerta = " ⚠️  FUERA DE ZONA" if datos["alerta_zona"] else ""
            print(
                f"[{datos['timestamp']}] "
                f"GPS({datos['gps']['lat']}, {datos['gps']['lng']}) | "
                f"{datos['velocidad_kmh']} km/h | "
                f"Temp: {datos['temp_motor_c']}°C | "
                f"Km: {datos['km_recorridos']}"
                f"{alerta}"
            )
            time.sleep(INTERVALO)

    except KeyboardInterrupt:
        print("\n🛑 Simulador detenido.")
    finally:
        cliente.loop_stop()
        cliente.disconnect()

if __name__ == "__main__":
    main()