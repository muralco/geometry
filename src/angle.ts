declare const tag: unique symbol;

/**
 * Represents an angle in radians.
 *
 * This type is tagged to ensure that it is distinct from regular numbers,
 * and has a value in correct units (radians).
 */
export type Angle = number & { [tag]: true };

export namespace Angle {
  export function fromDegrees(degrees: number): Angle {
    return (degrees * (Math.PI / 180)) as Angle;
  }

  export function fromRadians(radians: number): Angle {
    return radians as Angle;
  }

  export function toRadians(angle: Angle): number {
    return angle;
  }

  export function toDegrees(radians: Angle): number {
    return radians * (180 / Math.PI);
  }

  export function normalize(angle: Angle): Angle {
    const a = angle % (2 * Math.PI);
    return (a >= 0 ? a : a + 2 * Math.PI) as Angle;
  }

  export function add(a: Angle, b: Angle): Angle {
    return normalize((a + b) as Angle);
  }

  export function sub(a: Angle, b: Angle): Angle {
    return normalize((a - b) as Angle);
  }
}
