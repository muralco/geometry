/* eslint-disable @typescript-eslint/no-shadow */

import { Angle } from './angle';
import { DEFAULT_PRECISION, EPSILON } from './const';
import { Size } from './external-types';
import { NonZero } from './non-zero';

/**
 * Represents a point/vector in 2D space.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * A set of utility functions for working with points.
 * It's useful to work with points like math objects without splitting them into
 * `x` and `y` components, and then assembling them back.
 *
 * Can be used like:
 * ```
 * const center = Point.add(leftTop, Point.scale(Point.fromSize(size), 0.5));
 * ```
 *
 * or, to make it more readable:
 * ```
 * const { add, scale, fromSize } = Point;
 * const center = add(leftTop, scale(fromSize(size), 0.5));
 * ```
 */
export namespace Point {
  /**
   * Returns a distance between the point and the origin (0, 0).
   *
   * Length of the point can sound confusing, but we don't have different types
   * for Vector and Point. Using `Point` in both cases. So, this function returns
   * the vector length.
   */
  export function length(point: Point): number {
    return Math.sqrt(lengthSquared(point));
  }

  /**
   * Calculates the squared length of the point.
   *
   * Can be useful for performance reasons when you don't need the actual length,
   * but just need to compare lengths.
   */
  export function lengthSquared(point: Point): number {
    return point.x * point.x + point.y * point.y;
  }

  /**
   * Calculates the distance between two points.
   */
  export function distance(a: Point, b: Point): number {
    return Math.sqrt(distanceSquared(a, b));
  }

  /**
   * Calculates the squared distance between two points.
   *
   * This is useful for performance reasons when you don't need the actual distance,
   * but just need to compare distances.
   */
  export function distanceSquared(a: Point, b: Point): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  /**
   * Checks if the point is non-zero.
   * It's using EPSILON to avoid floating point precision issues.
   */
  export function isNonZero<P extends Point>(point: P): point is P & NonZero {
    return lengthSquared(point) > EPSILON * EPSILON;
  }

  /**
   * Returns a sum of points. X and Y components are added separately.
   */
  export function add(initial: Point, ...points: Point[]): Point {
    const result = { x: initial.x, y: initial.y };
    points.forEach(({ x, y }: Point) => {
      result.x += x;
      result.y += y;
    });

    return result;
  }

  /**
   * Multiplies points component-wise.
   */
  export function mul(initial: Point, ...points: Point[]): Point {
    const result = { x: initial.x, y: initial.y };

    points.forEach(({ x, y }: Point) => {
      result.x *= x;
      result.y *= y;
    });

    return result;
  }

  /**
   * Subtracts the second point from the first point.
   */
  export function sub(a: Point, b: Point): Point {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  /**
   * Invert sign of each component of the point.
   */
  export function neg(point: Point): Point {
    return { x: -point.x, y: -point.y };
  }

  /**
   * Multiplies the coordinates by the given factors.
   * If `sy` is not provided, it defaults to `sx`, effectively scaling uniformly.
   */
  export function scale(point: Point, sx: number, sy = sx): Point {
    return { x: point.x * sx, y: point.y * sy };
  }

  /**
   * Normalizes the point to a unit vector.
   * This transformation keeps the direction of the point, but sets its length to 1.
   * Use `isNonZero` to ensure that the point is not zero before calling this function.
   */
  export function normalize(point: Point & NonZero): Point {
    return scale(point, 1 / length(point));
  }

  /**
   * Calculates the dot product of two points.
   * r = length(a) * length(b) * cos(angle)
   */
  export function dot(a: Point, b: Point): number {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * Linearly interpolates between two points.
   */
  export function lerp(a: Point, b: Point, t: number): Point {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
  }

  /**
   * Returns a point with coordinates (0, 0).
   */
  export function zero(): Point {
    return { x: 0, y: 0 };
  }

  /**
   * Checks if two points are exactly equal.
   */
  export function equals(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
  }

  /**
   * Checks if two points are almost equal within a given precision.
   * @param a
   * @param b
   * @param precision - The number of decimal places to consider for equality. Defaults to 2.
   */
  export function almostEquals(
    a: Point,
    b: Point,
    precision = DEFAULT_PRECISION,
  ): boolean {
    const d = 10 ** -precision;
    return Math.abs(a.x - b.x) < d && Math.abs(a.y - b.y) < d;
  }

  /**
   * Rounds the point to the specified precision.
   * @param x
   * @param y
   * @param precision - The number of decimal places to round to. Defaults to 2.
   */
  export function round({ x, y }: Point, precision = DEFAULT_PRECISION): Point {
    const m = 10 ** precision;
    const im = 1 / m;
    return {
      x: Math.round(x * m) * im,
      y: Math.round(y * m) * im,
    };
  }

  /**
   * Creates a point from a size object.
   * `width` gets assigned to `x` and `height` to `y`.
   * @param height
   * @param width
   */
  export function fromSize({ height, width }: Size): Point {
    return {
      x: width,
      y: height,
    };
  }

  /**
   * Creates a point from any object with `left` and `top` properties.
   */
  export function fromLeftTop({
    left,
    top,
  }: {
    left: number;
    top: number;
  }): Point {
    return {
      x: left,
      y: top,
    };
  }

  export function clone({ x, y }: Point): Point {
    return { x, y };
  }

  /**
   * Calculates angle between the positive X axis and the vector represented by the point.
   */
  export function azimuth(vector: Point): Angle {
    return Angle.normalize(Angle.fromRadians(Math.atan2(vector.y, vector.x)));
  }

  /**
   * In place methods that mutate the argument to avoid extra allocations.
   * Can be useful for processing large arrays of points or in performance-critical code.
   */
  export namespace inPlace {
    /**
     * Adds points to the initial point in place.
     * This function mutates the first argument.
     */
    export function add(initial: Point, ...points: Point[]): void {
      points.forEach((point: Point) => {
        initial.x += point.x;
        initial.y += point.y;
      });
    }

    /**
     * Multiplies points component-wise in place.
     * This function mutates the first argument.
     */
    export function mul(initial: Point, ...points: Point[]): void {
      points.forEach((point: Point) => {
        initial.x *= point.x;
        initial.y *= point.y;
      });
    }

    /**
     * Subtracts the second point from the first point in place.
     * This function mutates the first argument.
     */
    export function sub(a: Point, b: Point): void {
      a.x -= b.x;
      a.y -= b.y;
    }

    /**
     * Inverts the sign of each component of the point in place.
     * This function mutates the argument.
     */
    export function neg(point: Point): void {
      point.x = -point.x;
      point.y = -point.y;
    }

    /**
     * Scales the point by the given factors in place.
     * This function mutates the argument.
     */
    export function scale(point: Point, sx: number, sy = sx): void {
      point.x *= sx;
      point.y *= sy;
    }

    /**
     * Normalizes the point to a unit vector in place.
     * This function mutates the argument.
     */
    export function normalize(point: Point & NonZero): void {
      scale(point, 1 / length(point));
    }

    /**
     * Rounds the point to the specified precision in place.
     * This function mutates the argument.
     */
    export function round(point: Point, precision = DEFAULT_PRECISION): void {
      const m = 10 ** precision;
      const im = 1 / m;
      point.x = Math.round(point.x * m) * im;
      point.y = Math.round(point.y * m) * im;
    }
  }
}
