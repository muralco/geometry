/* eslint-disable no-param-reassign */

import { Rect } from '@muralco/types';

// TODO: Move 'Point' to this package from '@muralco/api/widgets'
type Point = { x: number; y: number };

export interface BoundingBox {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
}

export namespace BoundingBox {
  export function empty(): BoundingBox {
    return {
      maxX: -Infinity,
      maxY: -Infinity,
      minX: Infinity,
      minY: Infinity,
    };
  }

  export function isEmpty({ maxX, maxY, minX, minY }: BoundingBox): boolean {
    return minX >= maxX || minY >= maxY;
  }

  export function fromRect({ height, left, top, width }: Rect): BoundingBox {
    return {
      maxX: left + width,
      maxY: top + height,
      minX: left,
      minY: top,
    };
  }

  export function toRect({ maxX, maxY, minX, minY }: BoundingBox): Rect {
    return {
      height: maxY - minY,
      left: minX,
      top: minY,
      width: maxX - minX,
    };
  }

  export function addPoint(bounds: BoundingBox, { x, y }: Point): BoundingBox {
    return {
      maxX: Math.max(bounds.maxX, x),
      maxY: Math.max(bounds.maxY, y),
      minX: Math.min(bounds.minX, x),
      minY: Math.min(bounds.minY, y),
    };
  }

  export function addPointInPlace(bounds: BoundingBox, { x, y }: Point): void {
    bounds.minX = Math.min(bounds.minX, x);
    bounds.minY = Math.min(bounds.minY, y);
    bounds.maxX = Math.max(bounds.maxX, x);
    bounds.maxY = Math.max(bounds.maxY, y);
  }

  export function union(...bounds: BoundingBox[]): BoundingBox {
    return bounds.reduce((acc, { maxX, maxY, minX, minY }) => {
      acc.minX = Math.min(acc.minX, minX);
      acc.minY = Math.min(acc.minY, minY);
      acc.maxX = Math.max(acc.maxX, maxX);
      acc.maxY = Math.max(acc.maxY, maxY);
      return acc;
    }, empty());
  }

  export function round(bounds: BoundingBox, precision = 2): BoundingBox {
    const multiplier = 10 ** precision;
    return {
      maxX: Math.ceil(bounds.maxX * multiplier) / multiplier,
      maxY: Math.ceil(bounds.maxY * multiplier) / multiplier,
      minX: Math.floor(bounds.minX * multiplier) / multiplier,
      minY: Math.floor(bounds.minY * multiplier) / multiplier,
    };
  }
}
