/** The only place colors are defined, so dark mode can be added later. */
export const colors = {
  background: '#FAF5EC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1E8D8',
  border: '#E3D7C2',
  text: '#2A211A',
  textMuted: '#6B5E51',
  accent: '#C8440A',
  accentPressed: '#A33607',
  accentSoft: '#FBE3D3',
  onAccent: '#FFFFFF',
  warning: '#7A4B00',
  warningBg: '#FFF1D6',
  warningBorder: '#E0A030',
  danger: '#A3211A',
  dangerBg: '#FBE4E1',
  dangerBorder: '#E08A82',
  success: '#256B42',
  successBg: '#E0F2E6',
  disabled: '#D8CDBB',
  backdrop: 'rgba(42, 33, 26, 0.55)',
};

/** Colors used only by the SVG phone drawing. */
export const illustration = {
  frame: '#5B5148',
  frameInner: '#857A6E',
  frameDetail: '#6E6359',
  backCover: '#E9DCC6',
  backCoverEdge: '#CDBDA2',
  lensRing: '#3A332D',
  lens: '#15181C',
  lensGlint: '#7D8A99',
  battery: '#3D4148',
  batteryEdge: '#23262B',
  batteryLabel: '#F4C95D',
  pullTab: '#E8590C',
  board: '#1F5C4A',
  boardEdge: '#154236',
  shield: '#BFC4C9',
  shieldEdge: '#8E959C',
  chip: '#23262B',
  connector: '#D9B44A',
  flex: '#D98A2B',
  flexEdge: '#A9661A',
  port: '#23262B',
  speaker: '#5B5148',
  display: '#2F343B',
  displayShield: '#474D56',
  displayLine: '#5D6470',
  hotspot: '#E8590C',
  hotspotCore: '#FFFFFF',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };

/** Large targets: students may have tools in hand. */
export const touch = { min: 56, compact: 48 };

export const fonts = {
  heading: 'BarlowCondensed_700Bold',
};

export const type = {
  display: { fontFamily: fonts.heading, fontSize: 46, lineHeight: 50, color: colors.text },
  h1: { fontFamily: fonts.heading, fontSize: 34, lineHeight: 38, color: colors.text },
  h2: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 30, color: colors.text },
  h3: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 26, color: colors.text },
  body: { fontSize: 17, lineHeight: 25, color: colors.text },
  small: { fontSize: 15, lineHeight: 21, color: colors.textMuted },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '700', color: colors.text },
} as const;
