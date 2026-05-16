let ws;
let historial = [];
let mapa     = null;
let marcador = null;

function iniciarMapa(lat, lng) {
    mapa = L.map("mapa", {
        zoomControl: true,
    }).setView([lat, lng], 16);

    // Tema oscuro de CARTO
    L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
        maxZoom: 20,
    }).addTo(mapa);

    // Marcador personalizado azul
    const icono = L.divIcon({
        className: "",
        html: `<div style="
        width: 14px; height: 14px;
        background: #3b9eff;
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(59,158,255,0.8);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });

    marcador = L.marker([lat, lng], { icon: icono }).addTo(mapa);

    // Botón centrar (flecha) arriba a la derecha
    const BtnCentrar = L.Control.extend({
        options: { position: "topright" },
        onAdd: function () {
        const btn = L.DomUtil.create("button");
        btn.innerHTML = "↗";
        btn.title = "Centrar en vehículo";
        btn.className = "btn-centrar";
        btn.onclick = function () {
            if (marcador) mapa.setView(marcador.getLatLng(), 16);
        };
        return btn;
        },
    });

    new BtnCentrar().addTo(mapa);
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