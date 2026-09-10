/** Spanish country name (lowercase, no accents needed for lookup) -> ISO 3166-1 alpha-3. */
const ISO3_BY_NAME: Record<string, string> = {
  albania: 'ALB', alemania: 'DEU', andorra: 'AND', angola: 'AGO', argelia: 'DZA',
  argentina: 'ARG', armenia: 'ARM', australia: 'AUS', austria: 'AUT', azerbaiyan: 'AZE',
  belgica: 'BEL', belice: 'BLZ', bielorrusia: 'BLR', bolivia: 'BOL', bosnia: 'BIH',
  'bosnia y herzegovina': 'BIH', botsuana: 'BWA', brasil: 'BRA', brunei: 'BRN', bulgaria: 'BGR',
  camboya: 'KHM', camerun: 'CMR', canada: 'CAN', catar: 'QAT', chile: 'CHL',
  china: 'CHN', chipre: 'CYP', colombia: 'COL', 'corea del sur': 'KOR', 'corea del norte': 'PRK',
  'costa de marfil': 'CIV', 'costa rica': 'CRI', croacia: 'HRV', cuba: 'CUB', dinamarca: 'DNK',
  ecuador: 'ECU', egipto: 'EGY', 'el salvador': 'SLV', 'emiratos arabes unidos': 'ARE',
  eslovaquia: 'SVK', eslovenia: 'SVN', espana: 'ESP', 'estados unidos': 'USA', estonia: 'EST',
  etiopia: 'ETH', filipinas: 'PHL', finlandia: 'FIN', francia: 'FRA', georgia: 'GEO',
  ghana: 'GHA', grecia: 'GRC', groenlandia: 'GRL', guatemala: 'GTM', honduras: 'HND',
  hungria: 'HUN', india: 'IND', indonesia: 'IDN', irak: 'IRQ', iran: 'IRN', irlanda: 'IRL',
  islandia: 'ISL', israel: 'ISR', italia: 'ITA', jamaica: 'JAM', japon: 'JPN', jordania: 'JOR',
  kazajistan: 'KAZ', kenia: 'KEN', kirguistan: 'KGZ', kuwait: 'KWT', laos: 'LAO', letonia: 'LVA',
  libano: 'LBN', liberia: 'LBR', libia: 'LBY', liechtenstein: 'LIE', lituania: 'LTU',
  luxemburgo: 'LUX', macedonia: 'MKD', madagascar: 'MDG', malasia: 'MYS', malta: 'MLT',
  marruecos: 'MAR', mauricio: 'MUS', mexico: 'MEX', moldavia: 'MDA', monaco: 'MCO',
  mongolia: 'MNG', montenegro: 'MNE', mozambique: 'MOZ', myanmar: 'MMR', namibia: 'NAM',
  nepal: 'NPL', nicaragua: 'NIC', nigeria: 'NGA', noruega: 'NOR', 'nueva zelanda': 'NZL',
  oman: 'OMN', 'paises bajos': 'NLD', holanda: 'NLD', pakistan: 'PAK', panama: 'PAN',
  papua: 'PNG', paraguay: 'PRY', peru: 'PER', polonia: 'POL', portugal: 'PRT',
  'republica dominicana': 'DOM', 'republica checa': 'CZE', ruanda: 'RWA', rumania: 'ROU',
  rusia: 'RUS', 'arabia saudita': 'SAU', senegal: 'SEN', serbia: 'SRB', singapur: 'SGP',
  sudafrica: 'ZAF', 'sri lanka': 'LKA', suecia: 'SWE', suiza: 'CHE', tailandia: 'THA',
  taiwan: 'TWN', tanzania: 'TZA', tunez: 'TUN', turquia: 'TUR', ucrania: 'UKR',
  uganda: 'UGA', uruguay: 'URY', uzbekistan: 'UZB', venezuela: 'VEN', vietnam: 'VNM',
  yemen: 'YEM', zambia: 'ZMB', zimbabue: 'ZWE', 'reino unido': 'GBR', inglaterra: 'GBR',
  escocia: 'GBR',
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

export function iso3ForCountryName(name: string): string | null {
  return ISO3_BY_NAME[normalize(name)] ?? null;
}
