import type { HitZone, IdentifyTarget } from '@/types/content';

import { LAYERS } from './layers';

/** Extra reach around parts on the top layer, in drawing units, for imprecise taps. */
const TOP_LAYER_REACH = 14;

function distanceTo(zone: HitZone, x: number, y: number): number {
  const dx = Math.max(zone.x - x, 0, x - (zone.x + zone.w));
  const dy = Math.max(zone.y - y, 0, y - (zone.y + zone.h));
  return Math.hypot(dx, dy);
}

/** Finds the part with the smallest zone near the tap, so small parts beat the board they sit on. */
function smallestWithin(
  targets: IdentifyTarget[],
  x: number,
  y: number,
  reach: number,
): IdentifyTarget | null {
  let best: IdentifyTarget | null = null;
  let bestArea = Infinity;
  for (const target of targets) {
    for (const zone of target.zones) {
      const zoneArea = zone.w * zone.h;
      if (distanceTo(zone, x, y) <= reach && zoneArea < bestArea) {
        best = target;
        bestArea = zoneArea;
      }
    }
  }
  return best;
}

/**
 * Works out which part a tap landed on, given how many layers are off the phone.
 * Parts on the top layer win over anything showing through from further in.
 */
export function findTappedPart(
  targets: IdentifyTarget[],
  removedCount: number,
  x: number,
  y: number,
): IdentifyTarget | null {
  const layers = LAYERS.slice(removedCount).map((layer) =>
    targets.filter((target) => target.layer === layer.id),
  );
  const [top, ...deeper] = layers;
  const hit = smallestWithin(top ?? [], x, y, TOP_LAYER_REACH);
  if (hit) return hit;
  for (const layer of deeper) {
    const below = smallestWithin(layer, x, y, 0);
    if (below) return below;
  }
  return null;
}
