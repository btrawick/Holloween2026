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
    lat: 52.387282,
    lng: 4.888259
  },
  {
    id: 3,
    address: "Realengracht 170, Amsterdam",
    label: "Realengracht 170",
    note: "Test Halloween house",
    lat: 52.387287,
    lng: 4.888259
  },
  {
    id: 4,
    address: "Realengracht 174, Amsterdam",
    label: "Realengracht 174",
    note: "Test Halloween house",
    lat: 52.387282,
    lng: 4.888259
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

const markerGroup = L.markerClusterGroup({
  showCoverageOnHover: false,
  spiderfyOnMaxZoom: true,
  zoomToBoundsOnClick: true,
  maxClusterRadius: 34,
  disableClusteringAtZoom: 19,
  spiderLegPolylineOptions: {
    weight: 2,
    color: "#ff7a1a",
    opacity: 0.7
  },
  iconCreateFunction(cluster) {
    const count = cluster.getChildCount();
    return L.divIcon({
      html: `<div class="pumpkin-cluster">🎃<span>${count}</span></div>`,
      className: "pumpkin-cluster-wrap",
      iconSize: [50, 50]
    });
  }
});

houses.forEach((house) => {
  const marker = L.marker([house.lat, house.lng], { icon: pumpkinIcon });
  marker.bindPopup(`<strong>🎃 ${house.label}</strong><br><span>${house.note}</span>`);
  markerGroup.addLayer(marker);
});

map.addLayer(markerGroup);

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


const userLocationIcon = L.divIcon({
  className: "user-location-marker",
  html: '<div class="user-location-pulse"><span></span></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

let userMarker;
let userAccuracyCircle;

function showUserLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const latLng = [coords.latitude, coords.longitude];

      if (userMarker) map.removeLayer(userMarker);
      if (userAccuracyCircle) map.removeLayer(userAccuracyCircle);

      userAccuracyCircle = L.circle(latLng, {
        radius: coords.accuracy,
        color: "#69a7ff",
        weight: 1,
        fillColor: "#69a7ff",
        fillOpacity: 0.08
      }).addTo(map);

      userMarker = L.marker(latLng, { icon: userLocationIcon })
        .addTo(map)
        .bindPopup("You are here");
    },
    (error) => {
      console.info("Location permission unavailable:", error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    }
  );
}


const locateButton = document.getElementById("locateMe");

if (locateButton) {
  locateButton.addEventListener("click", () => {
    locateButton.disabled = true;
    locateButton.textContent = "📍 Finding you…";

    if (!navigator.geolocation) {
      locateButton.textContent = "Location unavailable";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latLng = [coords.latitude, coords.longitude];

        if (userMarker) map.removeLayer(userMarker);
        if (userAccuracyCircle) map.removeLayer(userAccuracyCircle);

        userAccuracyCircle = L.circle(latLng, {
          radius: coords.accuracy,
          color: "#69a7ff",
          weight: 1,
          fillColor: "#69a7ff",
          fillOpacity: 0.08
        }).addTo(map);

        userMarker = L.marker(latLng, { icon: userLocationIcon })
          .addTo(map)
          .bindPopup("You are here")
          .openPopup();

        map.setView(latLng, Math.max(map.getZoom(), 17));
        locateButton.textContent = "📍 Location shown";
        locateButton.disabled = false;
      },
      () => {
        locateButton.textContent = "📍 Show my location";
        locateButton.disabled = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  });
}
