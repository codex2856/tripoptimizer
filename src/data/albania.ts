import type { CountryData, DriveMatrix } from './types';

const driveHours: DriveMatrix = {
  tirana: { durres: 0.5, shkoder: 1.5, berat: 2.5, vlore: 2.5, gjirokaster: 4, sarande: 4, ksamil: 4.25 },
  durres: { tirana: 0.5, shkoder: 2, berat: 2, vlore: 2, gjirokaster: 4, sarande: 4.25, ksamil: 4.5 },
  shkoder: { tirana: 1.5, durres: 2, berat: 3.5, vlore: 3.5, gjirokaster: 5.5, sarande: 5.5, ksamil: 5.75 },
  berat: { tirana: 2.5, durres: 2, shkoder: 3.5, vlore: 1.5, gjirokaster: 2, sarande: 2.5, ksamil: 2.75 },
  vlore: { tirana: 2.5, durres: 2, shkoder: 3.5, berat: 1.5, gjirokaster: 2, sarande: 2, ksamil: 2.25 },
  gjirokaster: { tirana: 4, durres: 4, shkoder: 5.5, berat: 2, vlore: 2, sarande: 0.75, ksamil: 1 },
  sarande: { tirana: 4, durres: 4.25, shkoder: 5.5, berat: 2.5, vlore: 2, gjirokaster: 0.75, ksamil: 0.25 },
  ksamil: { tirana: 4.25, durres: 4.5, shkoder: 5.75, berat: 2.75, vlore: 2.25, gjirokaster: 1, sarande: 0.25 },
};

export const albania: CountryData = {
  id: 'albania',
  name: 'Albania',
  hubCityId: 'tirana',
  travelNote:
    'Las carreteras de Albania son sinuosas (mucha montaña) y el tráfico en Tirana y en la costa (sobre todo en temporada alta) puede ser denso. Los tiempos de manejo son estimados y conviene sumar un margen de 20-30%.',
  cities: [
    {
      id: 'tirana',
      name: 'Tirana',
      types: ['capital'],
      coords: [41.3275, 19.8187],
      wikiTitle: 'Tirana',
      blurb:
        'Capital colorida y caótica, buena base de llegada/salida. Plaza Skanderbeg, el barrio Blloku y el teleférico Dajti para vistas rápidas.',
      nightsRecommended: [1, 1],
      isHub: true,
      restaurants: [
        { name: 'Oda', cuisine: 'Tradicional albanesa', price: '$$', note: 'Ambiente rústico, buena entrada a la gastronomía local.' },
        { name: 'Era Restaurant', cuisine: 'Albanesa moderna', price: '$$', note: 'Cocina local con toque contemporáneo, cerca del centro.' },
        { name: 'Padam Garden', cuisine: 'Internacional/café', price: '$', note: 'Buen brunch y café en jardín, en Blloku.' },
      ],
    },
    {
      id: 'durres',
      name: 'Durrës',
      types: ['coastal-city'],
      coords: [41.3231, 19.4414],
      wikiTitle: 'Durrës',
      blurb: 'Ciudad portuaria a 30 min de Tirana, con anfiteatro romano. Útil como parada corta, no imprescindible.',
      nightsRecommended: [0, 1],
      restaurants: [
        { name: 'Torra Restaurant', cuisine: 'Mariscos', price: '$$', note: 'Pescado fresco frente al mar.' },
      ],
    },
    {
      id: 'shkoder',
      name: 'Shkodër',
      types: ['history', 'nature'],
      coords: [42.0683, 19.5126],
      wikiTitle: 'Shkodër',
      blurb: 'Ciudad junto al lago, con el castillo de Rozafa. Punto de entrada a los Alpes albaneses (Theth, Valbonë).',
      nightsRecommended: [1, 2],
      restaurants: [
        { name: 'Tradita G&T', cuisine: 'Tradicional albanesa', price: '$$', note: 'Museo-restaurante con platos típicos del norte.' },
      ],
    },
    {
      id: 'berat',
      name: 'Berat',
      types: ['history'],
      coords: [40.7058, 19.9522],
      wikiTitle: 'Berat',
      blurb:
        'La "ciudad de las mil ventanas", Patrimonio UNESCO. Castillo habitado, casas otomanas apiladas sobre el río Osum. Ideal para 1 día completo o una noche.',
      nightsRecommended: [1, 1],
      restaurants: [
        { name: 'Homemade Food Voffa', cuisine: 'Casera albanesa', price: '$', note: 'Comida casera sencilla cerca del casco antiguo.' },
        { name: 'Tek Lili', cuisine: 'Tradicional', price: '$$', note: 'Terraza con vista al castillo, buen lugar para cenar.' },
      ],
    },
    {
      id: 'vlore',
      name: 'Vlorë',
      types: ['coastal-city', 'beach'],
      coords: [40.4667, 19.4833],
      wikiTitle: 'Vlorë',
      blurb: 'Puerta a la Riviera albanesa. Playas urbanas y punto de paso obligado hacia el sur por el paso de Llogara.',
      nightsRecommended: [0, 1],
      attractions: [
        { name: 'Paso de Llogara', note: 'Mirador de montaña sobre el mar, parada corta en la ruta hacia el sur.', wikiTitle: 'Llogara Pass', extraHours: 0.5 },
      ],
      restaurants: [
        { name: 'Bar Lungomare', cuisine: 'Mariscos/mediterránea', price: '$$', note: 'Frente al malecón, buen pescado.' },
      ],
    },
    {
      id: 'gjirokaster',
      name: 'Gjirokastër',
      types: ['history'],
      coords: [40.0758, 20.1389],
      wikiTitle: 'Gjirokastër',
      blurb:
        'Ciudad de piedra Patrimonio UNESCO, cuna de Enver Hoxha e Ismail Kadare. Castillo enorme y bazar otomano. Muy cerca del Ojo Azul.',
      nightsRecommended: [1, 1],
      attractions: [
        { name: 'Syri i Kaltër (Ojo Azul)', note: 'Manantial de agua turquesa, parada corta camino a la costa.', wikiTitle: 'Blue Eye (Albania)', extraHours: 0.75 },
      ],
      restaurants: [
        { name: 'Taverna Kuka', cuisine: 'Tradicional albanesa', price: '$$', note: 'Clásico del casco histórico, buenos qofte.' },
        { name: 'Odaja', cuisine: 'Tradicional', price: '$$', note: 'Terraza con vista al valle de Drino.' },
      ],
    },
    {
      id: 'sarande',
      name: 'Sarandë',
      types: ['coastal-city', 'beach'],
      coords: [39.8756, 20.0053],
      wikiTitle: 'Sarandë',
      blurb: 'Ciudad costera animada, buena vida nocturna y ferry a Corfú. Base alternativa a Ksamil, con más ambiente de ciudad.',
      nightsRecommended: [0, 2],
      attractions: [
        { name: 'Butrint', note: 'Ruinas grecorromanas Patrimonio UNESCO, muy cerca de Ksamil.', wikiTitle: 'Butrint', extraHours: 1 },
      ],
      restaurants: [
        { name: 'Living Room', cuisine: 'Mediterránea', price: '$$', note: 'Vista al mar, buena para cenar viendo el atardecer.' },
      ],
    },
    {
      id: 'ksamil',
      name: 'Ksamil',
      types: ['beach'],
      coords: [39.7683, 20.0022],
      wikiTitle: 'Ksamil',
      blurb:
        'Las playas más fotografiadas de Albania, con pequeñas islas a las que se llega nadando o en bote. Ideal para relajarse varios días.',
      nightsRecommended: [2, 5],
      attractions: [
        { name: 'Butrint', note: 'Ruinas grecorromanas Patrimonio UNESCO, a 15-20 min.', wikiTitle: 'Butrint', extraHours: 0.75 },
      ],
      restaurants: [
        { name: 'Bar Restorant Guvat', cuisine: 'Mariscos', price: '$$', note: 'Restaurante-cueva junto al mar, muy popular.' },
        { name: 'Joni', cuisine: 'Mariscos/albanesa', price: '$$', note: 'Pescado fresco, terraza frente a las islas.' },
      ],
    },
  ],
  driveHours,
  outline: [
    [20.590247, 41.855404], [20.463175, 41.515089], [20.605182, 41.086226], [21.02004, 40.842727],
    [20.99999, 40.580004], [20.674997, 40.435], [20.615, 40.110007], [20.150016, 39.624998],
    [19.98, 39.694993], [19.960002, 39.915006], [19.406082, 40.250773], [19.319059, 40.72723],
    [19.40355, 41.409566], [19.540027, 41.719986], [19.371769, 41.877548], [19.304486, 42.195745],
    [19.738051, 42.688247], [19.801613, 42.500093], [20.0707, 42.58863], [20.283755, 42.32026],
    [20.52295, 42.21787], [20.590247, 41.855404],
  ],
};
