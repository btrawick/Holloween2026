const houses = [
  {
    id: 1,
    address: "Bickerswerf 19, Amsterdam",
    label: "Bickerswerf 19",
    note: "Test Halloween house",
    // Approximate map position for prototype.
    lat: 52.38682,
    lng: 4.88358
  },
  {
    id: 2,
    address: "Realengracht 164, Amsterdam",
    label: "Realengracht 164",
    note: "Test Halloween house",
    // Approximate map position for prototype.
    lat: 52.39005,
    lng: 4.88705
  }
];

const map = L.map("map", {
  zoomControl: true
}).setView([52.38845, 4.8854], 15);

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

const bounds = [];

houses.forEach((house) => {
  const marker = L.marker([house.lat, house.lng], { icon: pumpkinIcon }).addTo(map);
  marker.bindPopup(`<strong>🎃 ${house.label}</strong><br><span>${house.note}</span>`);
  bounds.push([house.lat, house.lng]);
});

const route = L.polyline(bounds, {
  color: "#ff7a1a",
  weight: 6,
  opacity: 0.94,
  dashArray: "2, 11",
  lineCap: "round"
}).addTo(map);

map.fitBounds(route.getBounds(), {
  padding: [70, 70]
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
