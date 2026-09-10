export interface Projection {
  lonMin: number;
  latMax: number;
  scaleX: number;
  scaleY: number;
  padL: number;
  padT: number;
}

/** Fits a set of [lon, lat] points into a W x H box without distorting shape. */
export function computeProjection(
  lonLatPoints: [number, number][],
  width: number,
  height: number,
  pad: { l: number; r: number; t: number; b: number },
): Projection {
  const lons = lonLatPoints.map((p) => p[0]);
  const lats = lonLatPoints.map((p) => p[1]);
  const lonMin = Math.min(...lons);
  const lonMax = Math.max(...lons);
  const latMin = Math.min(...lats);
  const latMax = Math.max(...lats);
  const cosLat = Math.cos((((latMin + latMax) / 2) * Math.PI) / 180);
  const usableW = width - pad.l - pad.r;
  const usableH = height - pad.t - pad.b;
  let scaleY = usableH / (latMax - latMin);
  let scaleX = scaleY * cosLat;
  if (scaleX * (lonMax - lonMin) > usableW) {
    scaleX = usableW / (lonMax - lonMin);
    scaleY = scaleX / cosLat;
  }
  const padL = pad.l + (usableW - scaleX * (lonMax - lonMin)) / 2;
  const padT = pad.t + (usableH - scaleY * (latMax - latMin)) / 2;
  return { lonMin, latMax, scaleX, scaleY, padL, padT };
}

export function project(lon: number, lat: number, proj: Projection): [number, number] {
  return [proj.padL + (lon - proj.lonMin) * proj.scaleX, proj.padT + (proj.latMax - lat) * proj.scaleY];
}
