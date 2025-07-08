/**
 * Represents an angle in radians.
 *
 * This type is tagged to ensure that it is distinct from regular numbers,
 * and has a value in correct units (radians).
 */
export type Radians = number & { [Radians.tag]: true };

/**
 * Represents an angle in degrees.
 *
 * This type is tagged to ensure that it is distinct from regular numbers,
 * and has a value in correct units (degrees).
 */
export type Degrees = number & { [Degrees.tag]: true };

/**
 * Add a tag to the number to ensure it is treated as an angle in radians.
 */
export function Radians(value: number): Radians {
  return value as Radians;
}

/**
 * Add a tag to the number to ensure it is treated as an angle in degrees.
 */
export function Degrees(value: number): Degrees {
  return value as Degrees;
}

export namespace Radians {
  export declare const tag: unique symbol;

  /**
   * Converts degrees to radians.
   */
  export function fromDegrees(degrees: number): Radians {
    return (degrees * (Math.PI / 180)) as Radians;
  }

  /**
   * Converts radians to degrees.
   */
  export function toDegrees(radians: Radians): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Normalizes an angle in radians to the range [0, 2π).
   *
   * This ensures that angles are always positive and within a full circle.
   */
  export function normalize(angle: Radians): Radians {
    const a = angle % (2 * Math.PI);
    return (a >= 0 ? a : a + 2 * Math.PI) as Radians;
  }

  /**
   * Adds two angles in radians and normalizes the result.
   *
   * This ensures that the resulting angle is within the range [0, 2π).
   */
  export function add(a: Radians, b: Radians): Radians {
    return normalize((a + b) as Radians);
  }

  /**
   * Subtracts one angle in radians from another and normalizes the result.
   *
   * This ensures that the resulting angle is within the range [0, 2π).
   */
  export function sub(a: Radians, b: Radians): Radians {
    return normalize((a - b) as Radians);
  }
}

export namespace Degrees {
  export declare const tag: unique symbol;

  /**
   * Converts radians to degrees.
   */
  export function fromRadians(radians: number): Degrees {
    return (radians * (180 / Math.PI)) as Degrees;
  }

  /**
   * Converts degrees to radians.
   */
  export function toRadians(degrees: Degrees): Radians {
    return (degrees * (Math.PI / 180)) as Radians;
  }

  /**
   * Normalizes an angle in degrees to the range [0, 360).
   */
  export function normalize(angle: Degrees): Degrees {
    const a = angle % 360;
    return (a >= 0 ? a : a + 360) as Degrees;
  }

  /**
   * Adds two angles in degrees and normalizes the result.
   */
  export function add(a: Degrees, b: Degrees): Degrees {
    return normalize((a + b) as Degrees);
  }

  /**
   * Subtracts one angle in degrees from another and normalizes the result.
   */
  export function sub(a: Degrees, b: Degrees): Degrees {
    return normalize((a - b) as Degrees);
  }
}
