export type BodyKind = "sun" | "rocky" | "earth" | "gas" | "ice";

export type BodyDef = {
  id: string;
  nameJa: string;
  nameEn: string;
  kind: BodyKind;
  parent?: string;
  radius: number;
  orbitRadius: number;
  period: number;
  phase: number;
  inclination: number;
  tilt: number;
  spin: number;
  polarIce: number;
  colors: [string, string, string];
  atmosphere?: string;
  clouds?: number;
  rings?: { inner: number; outer: number };
  typeJa: string;
  distance: string;
  periodLabel: string;
  diameter: string;
  mass: string;
  moonsLabel: string;
  blurb: string;
};

/** Seconds for one Earth revolution at 1× simulation speed. */
export const EARTH_PERIOD = 24;

export const BODIES: BodyDef[] = [
  {
    id: "sun",
    nameJa: "太陽",
    nameEn: "Sun",
    kind: "sun",
    radius: 4.6,
    orbitRadius: 0,
    period: 1,
    phase: 0,
    inclination: 0,
    tilt: 0.13,
    spin: 0.07,
    polarIce: 0,
    colors: ["#fff1c2", "#ffb347", "#ff6b2b"],
    typeJa: "恒星",
    distance: "—",
    periodLabel: "—",
    diameter: "139万 km",
    mass: "33万 地球質量",
    moonsLabel: "惑星 8",
    blurb:
      "太陽系の中心にあるG型主系列星。核融合で光と熱を生み、惑星の軌道を束ねている。",
  },
  {
    id: "mercury",
    nameJa: "水星",
    nameEn: "Mercury",
    kind: "rocky",
    radius: 0.42,
    orbitRadius: 9.2,
    period: EARTH_PERIOD * 0.241,
    phase: 0.6,
    inclination: 0.12,
    tilt: 0.001,
    spin: 0.18,
    polarIce: 0.08,
    colors: ["#8a8178", "#c4b7a8", "#5c5550"],
    typeJa: "岩石惑星",
    distance: "0.39 AU",
    periodLabel: "88 日",
    diameter: "4,879 km",
    mass: "0.055 地球質量",
    moonsLabel: "なし",
    blurb: "最も内側の惑星。大気はほぼなく、昼夜の温度差が数百度に達する。",
  },
  {
    id: "venus",
    nameJa: "金星",
    nameEn: "Venus",
    kind: "rocky",
    radius: 0.92,
    orbitRadius: 13.2,
    period: EARTH_PERIOD * 0.615,
    phase: 2.1,
    inclination: 0.059,
    tilt: 3.1,
    spin: -0.04,
    polarIce: 0,
    colors: ["#e6d3a3", "#c9a66b", "#8d6b3c"],
    atmosphere: "#ead7a0",
    clouds: 0.72,
    typeJa: "岩石惑星",
    distance: "0.72 AU",
    periodLabel: "225 日",
    diameter: "12,104 km",
    mass: "0.82 地球質量",
    moonsLabel: "なし",
    blurb: "厚い二酸化炭素の雲に覆われ、表面は鉛が溶けるほど暑い。自転は逆行。",
  },
  {
    id: "earth",
    nameJa: "地球",
    nameEn: "Earth",
    kind: "earth",
    radius: 1,
    orbitRadius: 18,
    period: EARTH_PERIOD,
    phase: 0.35,
    inclination: 0,
    tilt: 0.41,
    spin: 0.85,
    polarIce: 1,
    colors: ["#1d4e89", "#2f7d4a", "#c2b280"],
    atmosphere: "#7ec8ff",
    clouds: 0.38,
    typeJa: "岩石惑星",
    distance: "1.00 AU",
    periodLabel: "365.25 日",
    diameter: "12,742 km",
    mass: "1.00 地球質量",
    moonsLabel: "1（月）",
    blurb: "液体の水と生命が確認されている唯一の惑星。酸素を含む青い大気を持つ。",
  },
  {
    id: "moon",
    nameJa: "月",
    nameEn: "Moon",
    kind: "rocky",
    parent: "earth",
    radius: 0.27,
    orbitRadius: 2.55,
    period: EARTH_PERIOD / 13.4,
    phase: 1.2,
    inclination: 0.09,
    tilt: 0.12,
    spin: (Math.PI * 2) / (EARTH_PERIOD / 13.4),
    polarIce: 0.12,
    colors: ["#9a958c", "#d0cbc2", "#5e5a54"],
    typeJa: "衛星",
    distance: "38.4万 km（地球から）",
    periodLabel: "27.3 日",
    diameter: "3,475 km",
    mass: "0.012 地球質量",
    moonsLabel: "—",
    blurb: "地球の唯一の自然衛星。潮汐ロックにより、常に同じ面を地球に向けている。",
  },
  {
    id: "mars",
    nameJa: "火星",
    nameEn: "Mars",
    kind: "rocky",
    radius: 0.53,
    orbitRadius: 24.2,
    period: EARTH_PERIOD * 1.881,
    phase: 4.2,
    inclination: 0.032,
    tilt: 0.44,
    spin: 0.82,
    polarIce: 0.85,
    colors: ["#b85c38", "#e07a4d", "#6e3b28"],
    atmosphere: "#e8b48a",
    typeJa: "岩石惑星",
    distance: "1.52 AU",
    periodLabel: "687 日",
    diameter: "6,779 km",
    mass: "0.11 地球質量",
    moonsLabel: "2",
    blurb: "酸化鉄で赤く見える大地。巨大な峡谷と火山、極冠の氷を持つ。",
  },
  {
    id: "jupiter",
    nameJa: "木星",
    nameEn: "Jupiter",
    kind: "gas",
    radius: 2.65,
    orbitRadius: 40,
    period: EARTH_PERIOD * 4.8,
    phase: 1.7,
    inclination: 0.023,
    tilt: 0.05,
    spin: 1.7,
    polarIce: 0,
    colors: ["#d9c3a0", "#c47a4a", "#a33a2a"],
    atmosphere: "#e8d2b0",
    typeJa: "ガス惑星",
    distance: "5.20 AU",
    periodLabel: "11.86 年",
    diameter: "14.0万 km",
    mass: "318 地球質量",
    moonsLabel: "95+",
    blurb: "太陽系最大の惑星。縞模様の大気と、数百年続く大赤斑の嵐が特徴。",
  },
  {
    id: "saturn",
    nameJa: "土星",
    nameEn: "Saturn",
    kind: "gas",
    radius: 2.2,
    orbitRadius: 54.5,
    period: EARTH_PERIOD * 6.4,
    phase: 5.1,
    inclination: 0.043,
    tilt: 0.47,
    spin: 1.45,
    polarIce: 0,
    colors: ["#e6d6b0", "#cbb88a", "#a89268"],
    atmosphere: "#efe0c0",
    rings: { inner: 1.45, outer: 2.35 },
    typeJa: "ガス惑星",
    distance: "9.58 AU",
    periodLabel: "29.45 年",
    diameter: "11.6万 km",
    mass: "95 地球質量",
    moonsLabel: "146+",
    blurb: "氷と岩の輪を持つ。密度は水より低く、仮想の海に浮かぶとされる。",
  },
  {
    id: "uranus",
    nameJa: "天王星",
    nameEn: "Uranus",
    kind: "ice",
    radius: 1.45,
    orbitRadius: 68,
    period: EARTH_PERIOD * 8.4,
    phase: 0.9,
    inclination: 0.014,
    tilt: 1.71,
    spin: 0.95,
    polarIce: 0,
    colors: ["#9fd9d4", "#6bb8bc", "#cfeeea"],
    atmosphere: "#b7ebe6",
    rings: { inner: 1.55, outer: 1.85 },
    typeJa: "氷惑星",
    distance: "19.2 AU",
    periodLabel: "84 年",
    diameter: "5.07万 km",
    mass: "15 地球質量",
    moonsLabel: "28",
    blurb: "横倒しに近い自転軸を持つ。メタンが大気を青緑に染めている。",
  },
  {
    id: "neptune",
    nameJa: "海王星",
    nameEn: "Neptune",
    kind: "ice",
    radius: 1.4,
    orbitRadius: 82,
    period: EARTH_PERIOD * 10.2,
    phase: 3.4,
    inclination: 0.031,
    tilt: 0.49,
    spin: 0.98,
    polarIce: 0,
    colors: ["#2f5fbf", "#4f8ad4", "#163a86"],
    atmosphere: "#6ea8ff",
    typeJa: "氷惑星",
    distance: "30.1 AU",
    periodLabel: "165 年",
    diameter: "4.92万 km",
    mass: "17 地球質量",
    moonsLabel: "16",
    blurb: "太陽系で最も外側の惑星。超音速の風と、暗い大暗斑と呼ばれる嵐がある。",
  },
];

export const SELECTABLE = BODIES;
export const PRIMARY_BODIES = BODIES.filter((b) => !b.parent);

export function getBodyDef(id: string): BodyDef | undefined {
  return BODIES.find((b) => b.id === id);
}

export const OVERVIEW_CAMERA = {
  position: [0, 42, 100] as const,
  target: [0, 0, 0] as const,
};
