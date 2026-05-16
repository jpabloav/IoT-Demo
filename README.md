markdown# 🚗 DriveShare — Demo IoT

Demo de telemetría IoT para la plataforma DriveShare, un sistema de alquiler de vehículos entre particulares. Simula un dispositivo instalado en un auto que envía datos en tiempo real (GPS, velocidad, temperatura) durante una reserva activa.

---

## 🏗️ Arquitectura
Simulador Python → Broker MQTT → Servidor Node.js → Dashboard Web
(dispositivo IoT)   (Mosquitto)    (Express + WS)    (HTML/CSS/JS)

---

## 📁 Estructura del proyecto
Demo-Individual/
├── simulator/
│   └── device_simulator.py   # Simula el dispositivo IoT del vehículo
├── server/
│   ├── index.js              # Arranca el servidor
│   ├── mqtt.js               # Lógica de conexión MQTT
│   ├── routes.js             # Endpoints REST
│   ├── storage.js            # Lectura y escritura de datos
│   ├── telemetria.json       # Base de datos (generado automáticamente)
│   └── package.json          # Dependencias Node.js
└── dashboard/
├── index.html            # Interfaz principal
├── style.css             # Estilos
├── app.js                # Lógica del dashboard
└── config.js             # Configuración (URLs, constantes)

---

## ✅ Requisitos previos

| Herramienta | Versión recomendada | Descarga |
|-------------|-------------------|---------|
| Node.js     | 18 o superior     | https://nodejs.org |
| Python      | 3.8 o superior    | https://python.org |
| Mosquitto   | 2.x               | https://mosquitto.org/download |

---

## ⚙️ Instalación

### 1. Broker MQTT (Mosquitto)

En Windows, Mosquitto se instala como servicio automáticamente. Verifica que esté corriendo:

```bash
Get-Service mosquitto
# Debe mostrar: Running
```

Si no está corriendo:
```bash
Start-Service mosquitto
```

### 2. Servidor Node.js

```bash
cd server
npm install
```

### 3. Simulador Python

```bash
pip install paho-mqtt
```

---

## 🚀 Cómo correr la demo

Necesitas **3 terminales** abiertas simultáneamente:

### Terminal 1 — Servidor
```bash
cd server
node index.js
```
Deberías ver:
✅ Base de datos lista: telemetria.json
🚀 Servidor en http://localhost:3000
✅ Conectado al broker MQTT
📡 Suscrito al topic: driveshare/vehiculo/+/telemetria

### Terminal 2 — Simulador
```bash
cd simulator
python device_simulator.py
```
Deberías ver:
✅ Conectado al broker MQTT en localhost:1883
🚗 Vehículo: Toyota Corolla 2022 | Reserva: RES-001
[2026-05-14T18:15:27] GPS(-12.045, -77.041) | 6.5 km/h | Temp: 81.3°C | Km: 0.01

### Terminal 3 — Dashboard
Abre en tu browser:
http://localhost:3000/index.html

---

## 🌐 Endpoints disponibles

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/historial` | Últimas 50 lecturas de telemetría |
| GET | `/api/historial?limite=10` | Últimas N lecturas |
| GET | `/api/resumen/RES-001` | Resumen de la reserva RES-001 |

---

## 📡 Datos que envía el dispositivo

Cada 3 segundos el simulador publica en el topic `driveshare/vehiculo/ABC-123/telemetria`:

```json
{
  "reserva_id": "RES-001",
  "vehiculo_id": "ABC-123",
  "arrendatario": "Juan Pérez",
  "propietario": "Pedro López",
  "modelo": "Toyota Corolla 2022",
  "timestamp": "2026-05-14T18:15:27",
  "gps": { "lat": -12.045601, "lng": -77.041781 },
  "velocidad_kmh": 6.5,
  "motor_encendido": true,
  "temp_motor_c": 81.3,
  "km_recorridos": 0.01,
  "alerta_zona": false
}
```

---

## 🔧 Configuración

Para cambiar puertos o URLs edita estos archivos:

- **Servidor:** constantes al inicio de `server/mqtt.js` e `server/index.js`
- **Simulador:** constantes al inicio de `simulator/device_simulator.py`
- **Dashboard:** `dashboard/config.js`

---

## 👤 Autor

Juan Pablo Avalos — Módulo de Pagos  
Curso: Arquitectura de Software  
Universidad de Lima — 2025