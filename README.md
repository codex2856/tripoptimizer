# Trip Optimizer

Planificador de itinerarios de viaje. Eliges un país, cuántos días tienes y qué lugar no te
quieres perder (por ejemplo, la playa), y la app arma la ruta con menos manejo/backtracking,
un mapa interactivo, ciudades recomendadas con fotos y restaurantes, y un itinerario día a día.

Actualmente incluye datos curados de **Albania** (ciudades, tiempos de manejo reales entre
ellas, restaurantes sugeridos). La estructura de datos (`src/data/types.ts`) está pensada para
agregar más países fácilmente.

## Cómo funciona el algoritmo de ruta

`src/lib/itinerary.ts` arma la ruta con un heurístico de inserción más barata (*cheapest
insertion*) partiendo siempre de la ciudad prioritaria del usuario, y usando el costo marginal
de cada ciudad adicional para decidir si entra con noche completa, como parada de paso (sin
pernoctar) o si no alcanza el tiempo. También arma el calendario día a día, respetando el
máximo de horas de manejo por día y reservando la última noche en la ciudad de llegada cuando
el vuelo de salida es temprano.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

Usa [Leaflet](https://leafletjs.com/) + OpenStreetMap para el mapa y la
[API REST de Wikipedia](https://en.wikipedia.org/api/rest_v1/) para traer una foto de cada
lugar en tiempo real (sin necesidad de curar imágenes a mano).
