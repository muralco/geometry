/* eslint-disable no-param-reassign */
import { Rect } from '@muralco/types';
import { Point } from './types';

// TODO: We should be using `EngineBbox` here but it's not possible to import it
type Bbox = {
  x: number;
  x1: number;
  y: number;
  y1: number;
};

/**
 * Axis-aligned bounding box
 */
export interface Aabb {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
}

export namespace Aabb {
  /**
   * Returns an empty Aabb
   */
  export function empty(): Aabb {
    return {
      maxX: -Infinity,
      maxY: -Infinity,
      minX: Infinity,
      minY: Infinity,
    };
  }

  /**
   * Creates an Aabb from left, top, right, and bottom.
   */
  export function fromLtrb(
    left: number,
    top: number,
    right: number,
    bottom: number,
  ): Aabb {
    return {
      maxX: right,
      maxY: bottom,
      minX: left,
      minY: top,
    };
  }

  /**
   * Creates an Aabb from left, top, width, and height.
   */
  export function fromLtwh(
    left: number,
    top: number,
    width: number,
    height: number,
  ): Aabb {
    return {
      maxX: left + width,
      maxY: top + height,
      minX: left,
      minY: top,
    };
  }

  /**
   * Returns an Aabb that contains all the given points
   */
  export function fromPoints(points: Point[]): Aabb {
    return points.reduce((bounds, p) => {
      addPointInPlace(bounds, p);
      return bounds;
    }, empty());
  }

  /**
   * Checks if the given Aabb is empty
   */
  export function isEmpty({ maxX, maxY, minX, minY }: Aabb): boolean {
    return minX >= maxX || minY >= maxY;
  }

  /**
   * Check if minX is less than maxX and minY is less than maxY
   */
  export function isValid({ maxX, maxY, minX, minY }: Aabb): boolean {
    return minX <= maxX && minY <= maxY;
  }

  /**
   * Creates an Aabb from a Rect
   * Rect is a record with `left`, `top`, `width`, and `height` properties.
   */
  export function fromRect({ height, left, top, width }: Rect): Aabb {
    return {
      maxX: left + width,
      maxY: top + height,
      minX: left,
      minY: top,
    };
  }

  /**
   * Converts provided Aabb to a Rect
   */
  export function toRect({ maxX, maxY, minX, minY }: Aabb): Rect {
    return {
      height: maxY - minY,
      left: minX,
      top: minY,
      width: maxX - minX,
    };
  }

  /**
   * Creates an Aabb from a Bbox
   */
  export function fromBbox({ x, x1, y, y1 }: Bbox): Aabb {
    return {
      maxX: x1,
      maxY: y1,
      minX: x,
      minY: y,
    };
  }

  /*
   * Converts provided Aabb to a Bbox
   */
  export function toBbox({ maxX, maxY, minX, minY }: Aabb): Bbox {
    return {
      x: minX,
      x1: maxX,
      y: minY,
      y1: maxY,
    };
  }

  /**
   * Adds a point to the aabb and returns a new one.
   * Since this functions creates a new object, it's not recommended to use it in a loop.
   * Use `addPointInPlace` instead in such cases.
   */
  export function addPoint(aabb: Aabb, { x, y }: Point): Aabb {
    return {
      maxX: Math.max(aabb.maxX, x),
      maxY: Math.max(aabb.maxY, y),
      minX: Math.min(aabb.minX, x),
      minY: Math.min(aabb.minY, y),
    };
  }

  /**
   * Adds a point to the aabb in place.
   * This function mutates the provided object. Use it in a loop to avoid creating temporary objects.
   */
  export function addPointInPlace(bounds: Aabb, { x, y }: Point): void {
    bounds.minX = Math.min(bounds.minX, x);
    bounds.minY = Math.min(bounds.minY, y);
    bounds.maxX = Math.max(bounds.maxX, x);
    bounds.maxY = Math.max(bounds.maxY, y);
  }

  /**
   * Returns the union of the provided bounds.
   * The result contains every provided aabb.
   */
  export function union(...aabbs: Aabb[]): Aabb {
    return aabbs.reduce((acc, { maxX, maxY, minX, minY }) => {
      acc.minX = Math.min(acc.minX, minX);
      acc.minY = Math.min(acc.minY, minY);
      acc.maxX = Math.max(acc.maxX, maxX);
      acc.maxY = Math.max(acc.maxY, maxY);
      return acc;
    }, empty());
  }

  /**
   * Rounds the bounds to a given precision.
   * The result can't be smaller than the original, but it can be a bit bigger.
   *
   * The precision is the number of decimal places to round to.
   * By default, it rounds to 2 decimal places.
   */
  export function round(aabb: Aabb, precision = 2): Aabb {
    const multiplier = 10 ** precision;
    return {
      maxX: Math.ceil(aabb.maxX * multiplier) / multiplier,
      maxY: Math.ceil(aabb.maxY * multiplier) / multiplier,
      minX: Math.floor(aabb.minX * multiplier) / multiplier,
      minY: Math.floor(aabb.minY * multiplier) / multiplier,
    };
  }

  /**
   * Checks if a `parent` Aabb contains (non-inclusive) a point.
   */
  export function includesPoint(
    { maxX, maxY, minX, minY }: Aabb,
    { x, y }: Point,
  ): boolean {
    return maxX > x && maxY > y && minX < x && minY < y;
  }

  /**
   * Checks if a `parent` Aabb fully contains a `child` Aabb.
   */
  export function includes(parent: Aabb, child: Aabb): boolean {
    return (
      parent.maxX >= child.maxX &&
      parent.maxY >= child.maxY &&
      parent.minX <= child.minX &&
      parent.minY <= child.minY
    );
  }

  /**
   * Checks if one Aabb intersects another.
   */
  export function intersects(a: Aabb, b: Aabb): boolean {
    return (
      a.minX <= b.maxX &&
      a.maxX >= b.minX &&
      a.minY <= b.maxY &&
      a.maxY >= b.minY
    );
  }

  /**
   * Expands the bounds by the given amount (adds padding).
   * The amount can be negative.
   */
  export function expand(
    { maxX, maxY, minX, minY }: Aabb,
    amount: number,
  ): Aabb {
    return {
      maxX: maxX + amount,
      maxY: maxY + amount,
      minX: minX - amount,
      minY: minY - amount,
    };
  }

  /**
   * Returns the intersection of the provided Aabbs.
   */
  export function intersection(...aabbs: Aabb[]): Aabb {
    if (aabbs.length === 0) return empty();
    let { maxX, maxY, minX, minY } = aabbs[0];

    for (let i = 1; i < aabbs.length; i += 1) {
      const aabb = aabbs[i];
      minX = Math.max(minX, aabb.minX);
      minY = Math.max(minY, aabb.minY);
      maxX = Math.min(maxX, aabb.maxX);
      maxY = Math.min(maxY, aabb.maxY);
    }

    return {
      maxX,
      maxY,
      minX,
      minY,
    };
  }

  export function getCenter(aabb: Aabb): Point {
    return {
      x: (aabb.minX + aabb.maxX) / 2,
      y: (aabb.minY + aabb.maxY) / 2,
    };
  }

  export function equals(a: Aabb, b: Aabb): boolean {
    return (
      (!isValid(a) && !isValid(b)) ||
      (a.maxX === b.maxX &&
        a.maxY === b.maxY &&
        a.minX === b.minX &&
        a.minY === b.minY)
    );
  }

  export function width(aabb: Aabb): number {
    return Math.max(0, aabb.maxX - aabb.minX);
  }

  export function height(aabb: Aabb): number {
    return Math.max(0, aabb.maxY - aabb.minY);
  }

  export function area(aabb: Aabb): number {
    return width(aabb) * height(aabb);
  }

  export function clone({ maxX, maxY, minX, minY }: Aabb): Aabb {
    return {
      maxX,
      maxY,
      minX,
      minY,
    };
  }
}
