# Holloween2026

Mobile-first prototype for a neighborhood Halloween walking route across Amsterdam's Westelijke Eilanden.

## Prototype features

- Interactive Leaflet / OpenStreetMap map
- Two test Halloween houses
- Pumpkin map markers
- Simple route preview between stops
- Mobile-friendly stop cards

## Test addresses

1. Bickerswerf 19, Amsterdam
2. Realengracht 164, Amsterdam

> The coordinates currently in `app.js` are approximate prototype positions and should be replaced with verified geocoded coordinates before public launch.

## Run locally

Because this is a static prototype, you can open `index.html` directly or serve the folder with any simple local web server.

For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Next steps

- Verify exact house coordinates
- Add a proper walking route along streets and bridges
- Add house submission / admin workflow
- Add opening times and accessibility notes
- Add "start route" navigation
