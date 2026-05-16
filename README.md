# DriveShare — Demo IoT

## Resumen

Demo de telemetría IoT que muestra cómo un dispositivo instalado en un vehículo envía datos en tiempo real (GPS, velocidad, temperatura) a través de MQTT hacia un servidor Node.js, que luego expone la información a un dashboard web.

Este repositorio contiene un simulador de dispositivo, la lógica del servidor y una interfaz web de monitoreo pensada para uso educativo y demostraciones.

## Arquitectura

Simulador (Python) → Broker MQTT (Mosquitto) → Servidor (Node.js + WebSocket) → Dashboard (HTML/CSS/JS)

## Estructura del proyecto

```
IoT-Demo/
├─ simulator/
│  └─ device_simulator.py      # Simulador del dispositivo (publica por MQTT)
├─ server/
│  ├─ index.js                 # Servidor Express + WS
│  ├─ mqtt.js                  # Conexión y manejo MQTT
│  ├─ routes.js                # Endpoints REST
│  ├─ storage.js               # Persistencia en telemetria.json
│  └─ package.json
└─ dashboard/
   ├─ index.html               # Interfaz web
   ├─ style.css                # Estilos del dashboard
   ├─ app.js                   # Lógica frontend (WebSocket, mapa)
   └─ config.js                # URLs y constantes del dashboard
```

## Requisitos

- Node.js 18+
- Python 3.8+
- Mosquitto (opcional, para pruebas locales)

## Instalación rápida

1. Instalar dependencias del servidor:

```bash
cd server
npm install
```

2. (Opcional) Instalar dependencia para el simulador:

```bash
pip install paho-mqtt
```

## Ejecución

Abrir tres terminales o pestañas:

- Terminal A — Servidor:

```bash
cd server
node index.js
```

- Terminal B — Simulador:

```bash
cd simulator
python device_simulator.py
```

- Terminal C — Dashboard:

Abrir en el navegador: http://localhost:3000/index.html

Si todo está correcto, el servidor mostrará mensajes de conexión al broker MQTT y el dashboard recibirá telemetría en tiempo real.

## Endpoints principales

- `GET /api/historial` — Últimas lecturas (por defecto 50)
- `GET /api/historial?limite=N` — Últimas N lecturas
- `GET /api/resumen/:reservaId` — Resumen para una reserva

## Formato de telemetría

Ejemplo del mensaje publicado por el simulador:

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

## Configuración

- Editar valores en `server` y `simulator` según su entorno (puertos, broker MQTT).
- Ajustes del dashboard en `dashboard/config.js` (URLs y reconexión).

## Contribuir

Pull requests y issues son bienvenidos. Mantén las contribuciones pequeñas y documentadas.

## Autor

Juan Pablo Avalos — Componente Individual
