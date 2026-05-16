let ws;
let historial = [];
let mapa     = null;
let marcador = null;

function iniciarMapa(lat, lng) {
  mapa = L.map("mapa").setView([lat, lng], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(mapa);
  marcador = L.marker([lat, lng]).addTo(mapa);
}

function actualizarMapa(lat, lng) {
  if (!mapa) {
    iniciarMapa(lat, lng);
  } else {
    marcador.setLatLng([lat, lng]);
    mapa.setView([lat, lng]);
  }
}

function conectar() {
    ws = new WebSocket(CONFIG.WS_URL);

    ws.onopen = () => {
        document.getElementById("badge-estado").textContent = "En línea";
        document.getElementById("badge-estado").className   = "badge online";
    };

    ws.onclose = () => {
        document.getElementById("badge-estado").textContent = "Sin conexión";
        document.getElementById("badge-estado").className   = "badge offline";
        setTimeout(conectar, CONFIG.RECONNECT_MS);
    };

    ws.onerror = () => {
        document.getElementById("badge-estado").textContent = "Error de conexión";
        document.getElementById("badge-estado").className   = "badge offline";
        document.getElementById("tabla-historial").innerHTML = `
        <tr><td colspan="6" style="color:#ef4444;text-align:center">
            ⚠️ No se pudo conectar al servidor. Reintentando...
        </td></tr>
        `;
    };

    ws.onmessage = (event) => {
        try {
        const msg = JSON.parse(event.data);
        if (msg.tipo === "telemetria") actualizarDashboard(msg.datos);
        } catch (err) {
        console.error("Mensaje inválido recibido:", err);
        }
    };
}

function actualizarDashboard(d) {
    document.getElementById("timestamp").textContent        = "Última actualización: " + d.timestamp;
    document.getElementById("val-reserva").textContent      = d.reserva_id;
    document.getElementById("val-vehiculo").textContent     = d.modelo;
    document.getElementById("val-arrendatario").textContent = d.arrendatario;
    document.getElementById("val-propietario").textContent  = d.propietario;
    document.getElementById("val-velocidad").textContent    = d.velocidad_kmh;
    document.getElementById("val-temp").textContent         = d.temp_motor_c;
    document.getElementById("val-km").textContent           = d.km_recorridos;
    document.getElementById("val-gps").textContent          = `${d.gps.lat}, ${d.gps.lng}`;
    actualizarMapa(d.gps.lat, d.gps.lng);

    const motor = document.getElementById("val-motor");
    motor.innerHTML = `<span class="dot ${d.motor_encendido ? 'on' : 'off'}"></span>${d.motor_encendido ? "Encendido" : "Apagado"}`;

    const cardAlerta = document.getElementById("card-alerta");
    const valZona    = document.getElementById("val-zona");
    if (d.alerta_zona) {
        cardAlerta.classList.add("alerta");
        valZona.innerHTML = '<span class="zona-alerta">Fuera de zona</span>';
    } else {
        cardAlerta.classList.remove("alerta");
        valZona.innerHTML = '<span class="zona-ok">Dentro de zona</span>';
    }

    historial.unshift(d);
    if (historial.length > CONFIG.MAX_HISTORIAL) historial.pop();

    document.getElementById("tabla-historial").innerHTML = historial.map(h => `
        <tr>
        <td>${h.timestamp}</td>
        <td>${h.velocidad_kmh} km/h</td>
        <td>${h.temp_motor_c}°C</td>
        <td>${h.km_recorridos} km</td>
        <td><span class="dot ${h.motor_encendido ? 'on' : 'off'}"></span>${h.motor_encendido ? "ON" : "OFF"}</td>
        <td class="${h.alerta_zona ? 'zona-alerta' : 'zona-ok'}">${h.alerta_zona ? "Fuera" : "Dentro"}</td>
        </tr>
    `).join("");
}

conectar();