import type { ReactElement } from 'react';
import { Circle, G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { illustration as c } from '@/theme';
import type { LayerId } from '@/types/content';

/** All drawings share this coordinate space. */
export const VIEW_W = 300;
export const VIEW_H = 600;

export interface Hotspot {
  partId: string;
  /** Position in drawing coordinates. */
  x: number;
  y: number;
}

export interface LayerDef {
  id: LayerId;
  hotspots: Hotspot[];
  Drawing: () => ReactElement;
}

/** The empty chassis. It always stays on screen, under every layer. */
export function FrameDrawing() {
  return (
    <G>
      <Rect x={3} y={140} width={8} height={70} rx={3} fill={c.frameDetail} />
      <Rect x={289} y={120} width={8} height={46} rx={3} fill={c.frameDetail} />
      <Rect x={10} y={10} width={280} height={580} rx={38} fill={c.frame} />
      <Rect x={22} y={22} width={256} height={556} rx={28} fill={c.frameInner} />
      <Rect x={60} y={80} width={180} height={150} rx={10} fill={c.frameDetail} />
      <Rect x={60} y={260} width={180} height={200} rx={10} fill={c.frameDetail} />
      <Rect x={60} y={490} width={180} height={60} rx={10} fill={c.frameDetail} />
    </G>
  );
}

function BackCover() {
  return (
    <G>
      <Rect x={10} y={10} width={280} height={580} rx={38} fill={c.backCover} />
      <Rect
        x={17}
        y={17}
        width={266}
        height={566}
        rx={32}
        fill="none"
        stroke={c.backCoverEdge}
        strokeWidth={2}
      />
      <Rect x={34} y={34} width={120} height={150} rx={28} fill={c.backCoverEdge} />
      <Circle cx={94} cy={78} r={30} fill={c.lensRing} />
      <Circle cx={94} cy={78} r={18} fill={c.lens} />
      <Circle cx={88} cy={72} r={5} fill={c.lensGlint} />
      <Circle cx={94} cy={142} r={30} fill={c.lensRing} />
      <Circle cx={94} cy={142} r={18} fill={c.lens} />
      <Circle cx={88} cy={136} r={5} fill={c.lensGlint} />
    </G>
  );
}

function Battery() {
  return (
    <G>
      <Rect x={36} y={258} width={228} height={208} rx={14} fill={c.battery} />
      <Rect
        x={42}
        y={264}
        width={216}
        height={196}
        rx={10}
        fill="none"
        stroke={c.batteryEdge}
        strokeWidth={2}
      />
      <SvgText x={150} y={350} fontSize={34} fontWeight="700" fill={c.batteryLabel} textAnchor="middle">
        Li-ion
      </SvgText>
      <Rect x={66} y={448} width={36} height={40} rx={5} fill={c.pullTab} />
      <Rect x={198} y={448} width={36} height={40} rx={5} fill={c.pullTab} />
      <Rect x={196} y={236} width={46} height={26} rx={4} fill={c.connector} />
    </G>
  );
}

function Mainboard() {
  return (
    <G>
      <Rect x={30} y={30} width={240} height={226} rx={18} fill={c.board} />
      <Rect x={222} y={240} width={48} height={236} rx={10} fill={c.board} />
      <Rect x={34} y={34} width={232} height={218} rx={15} fill="none" stroke={c.boardEdge} strokeWidth={2} />
      <Rect x={44} y={44} width={100} height={132} rx={12} fill={c.lensRing} />
      <Circle cx={94} cy={78} r={24} fill={c.lens} />
      <Circle cx={94} cy={142} r={24} fill={c.lens} />
      <Rect x={160} y={48} width={94} height={92} rx={8} fill={c.shield} stroke={c.shieldEdge} strokeWidth={2} />
      <Rect x={186} y={72} width={42} height={42} rx={4} fill={c.chip} />
      <Rect x={50} y={192} width={92} height={50} rx={6} fill={c.shield} stroke={c.shieldEdge} strokeWidth={2} />
      <Rect x={160} y={156} width={60} height={32} rx={4} fill={c.chip} />
      <Rect x={196} y={210} width={46} height={26} rx={4} fill={c.connector} />
      <Rect x={232} y={290} width={28} height={70} rx={4} fill={c.shield} stroke={c.shieldEdge} strokeWidth={2} />
      <Rect x={232} y={386} width={28} height={40} rx={4} fill={c.chip} />
    </G>
  );
}

function ChargingFlex() {
  return (
    <G>
      <Rect x={40} y={480} width={220} height={92} rx={10} fill={c.flex} stroke={c.flexEdge} strokeWidth={2} />
      <Rect x={44} y={240} width={20} height={250} rx={4} fill={c.flex} stroke={c.flexEdge} strokeWidth={2} />
      <Rect x={36} y={226} width={46} height={26} rx={4} fill={c.connector} />
      <Rect x={112} y={546} width={76} height={30} rx={13} fill={c.port} />
      <Rect x={126} y={558} width={48} height={6} rx={3} fill={c.flex} />
      {[78, 92, 106].map((y) => (
        <Line key={y} x1={204} x2={244} y1={y + 420} y2={y + 420} stroke={c.speaker} strokeWidth={4} strokeLinecap="round" />
      ))}
      <Circle cx={68} cy={530} r={8} fill={c.port} />
    </G>
  );
}

function Display() {
  return (
    <G>
      <Rect x={22} y={22} width={256} height={556} rx={28} fill={c.display} />
      <Rect x={40} y={44} width={220} height={510} rx={14} fill={c.displayShield} />
      {[120, 200, 280, 360, 440, 520].map((y) => (
        <Line key={y} x1={56} x2={244} y1={y} y2={y} stroke={c.displayLine} strokeWidth={1.5} />
      ))}
      <Rect x={120} y={500} width={60} height={46} rx={4} fill={c.flex} stroke={c.flexEdge} strokeWidth={2} />
    </G>
  );
}

/** Ordered from the outside of the phone inward. */
export const LAYERS: LayerDef[] = [
  { id: 'back-cover', Drawing: BackCover, hotspots: [{ partId: 'back-cover', x: 190, y: 340 }] },
  { id: 'battery', Drawing: Battery, hotspots: [{ partId: 'battery', x: 150, y: 400 }] },
  {
    id: 'mainboard',
    Drawing: Mainboard,
    hotspots: [
      { partId: 'rear-camera', x: 94, y: 110 },
      { partId: 'mainboard', x: 207, y: 94 },
    ],
  },
  { id: 'charging-flex', Drawing: ChargingFlex, hotspots: [{ partId: 'charging-flex', x: 150, y: 515 }] },
  { id: 'display', Drawing: Display, hotspots: [{ partId: 'display', x: 150, y: 300 }] },
];
