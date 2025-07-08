/**
 * Represents an angle in radians.
 *
 * This type is tagged to ensure that it is distinct from regular numbers,
 * and has a value in correct units (radians).
 */
export type Radians = number & { [Radians.tag]: true };

export function Radians(value: number): Radians {
  return value as Radians;
}

export namespace Radians {
  export declare const tag: unique symbol;

  export function fromDegrees(degrees: number): Radians {
    return (degrees * (Math.PI / 180)) as Radians;
  }

  export function toRadians(angle: Radians): number {
    return angle;
  }

  export function toDegrees(radians: Radians): number {
    return radians * (180 / Math.PI);
  }

  export function normalize(angle: Radians): Radians {
    const a = angle % (2 * Math.PI);
    return (a >= 0 ? a : a + 2 * Math.PI) as Radians;
  }

  export function add(a: Radians, b: Radians): Radians {
    return normalize((a + b) as Radians);
  }

  export function sub(a: Radians, b: Radians): Radians {
    return normalize((a - b) as Radians);
  }
}
