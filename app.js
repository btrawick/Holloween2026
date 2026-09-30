const houses = [
  {
    id: 1,
    address: "Bickerswerf 19, Amsterdam",
    label: "Bickerswerf 19",
    note: "Test Halloween house",
    lat: 52.38696,
    lng: 4.89079
  },
  {
    id: 2,
    address: "Realengracht 164, Amsterdam",
    label: "Realengracht 164",
    note: "Test Halloween house",
    lat: 52.38837,
    lng: 4.88908
  }
];

const map = L.map("map", { zoomControl: true }).setView([52.3877, 4.8899], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const pumpkinIcon = L.divIcon({
  className: "pumpkin-marker",
  html: "<div>🎃</div>",
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -40]
});

houses.forEach((house) => {
  const marker = L.marker([house.lat, house.lng], { icon: pumpkinIcon }).addTo(map);
  marker.bindPopup(`<strong>🎃 ${house.label}</strong><br><span>${house.note}</span>`);
});

document.getElementById("stopCount").textContent = `${houses.length} haunted stops`;

const stopsEl = document.getElementById("stops");
houses.forEach((house, index) => {
  const card = document.createElement("article");
  card.className = "stop-card";
  card.innerHTML = `
    <div class="stop-index">${index + 1}</div>
    <strong>🎃 ${house.label}</strong>
    <span>${house.address}</span>
  `;
  stopsEl.appendChild(card);
});

const routeInfo = document.getElementById("routeDistance");

function formatDistance(meters) {
  return meters < 1000
    ? `${Math.round(meters / 10) * 10} m walk`
    : `${(meters / 1000).toFixed(1)} km walk`;
}

function formatDuration(seconds) {
  return `~${Math.max(1, Math.round(seconds / 60))} min`;
}

async function drawWalkingRoute() {
  const coords = houses.map((house) => `${house.lng},${house.lat}`).join(";");
  const endpoint = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Walking route request failed");

    const data = await response.json();
    const route = data.routes?.[0];
    if (!route) throw new Error("No walking route returned");

    const latLngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    L.polyline(latLngs, {
      color: "#241028",
      weight: 11,
      opacity: 0.8,
      lineCap: "round",
      lineJoin: "round"
    }).addTo(map);

    const line = L.polyline(latLngs, {
      color: "#ff7a1a",
      weight: 5,
      opacity: 0.98,
      dashArray: "2, 10",
      lineCap: "round",
      lineJoin: "round"
    }).addTo(map);

    map.fitBounds(line.getBounds(), { padding: [70, 70] });
    routeInfo.textContent = `${formatDistance(route.distance)} · ${formatDuration(route.duration)}`;
  } catch (error) {
    console.error(error);
    const fallback = houses.map((house) => [house.lat, house.lng]);
    const line = L.polyline(fallback, {
      color: "#ff7a1a",
      weight: 5,
      opacity: 0.9,
      dashArray: "2, 10",
      lineCap: "round"
    }).addTo(map);

    map.fitBounds(line.getBounds(), { padding: [70, 70] });
    routeInfo.textContent = "Walking route unavailable · preview shown";
  }
}

drawWalkingRoute();
