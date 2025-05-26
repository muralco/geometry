import { DEFAULT_PRECISION, EPSILON } from './consts';

export interface Point {
  x: number;
  y: number;
}

export namespace Point {
  export function length(point: Point): number {
    return Math.sqrt(lengthSquared(point));
  }

  export function lengthSquared(point: Point): number {
    return point.x * point.x + point.y * point.y;
  }

  export function distance(a: Point, b: Point): number {
    return Math.sqrt(distanceSquared(a, b));
  }

  export function distanceSquared(a: Point, b: Point): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  export function add(a: Point, b: Point): Point {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  export function sub(a: Point, b: Point): Point {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  export function mul(a: Point, b: Point): Point {
    return { x: a.x * b.x, y: a.y * b.y };
  }

  export function div(a: Point, b: Point): Point {
    return { x: a.x / b.x, y: a.y / b.y };
  }

  export function neg(point: Point): Point {
    return { x: -point.x, y: -point.y };
  }

  export function scale(point: Point, sx: number, sy = sx): Point {
    return { x: point.x * sx, y: point.y * sy };
  }

  export function normalize(point: Point): Point {
    const l = length(point);

    return l > EPSILON ? scale(point, 1 / l) : zero();
  }

  export function dot(a: Point, b: Point): number {
    return a.x * b.x + a.y * b.y;
  }

  export function zero(): Point {
    return { x: 0, y: 0 };
  }

  export function equals(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
  }

  export function almostEquals(
    a: Point,
    b: Point,
    precision = DEFAULT_PRECISION,
  ): boolean {
    const d = 10 ** -precision;
    return Math.abs(a.x - b.x) < d && Math.abs(a.y - b.y) < d;
  }

  export function round({ x, y }: Point, precision = DEFAULT_PRECISION): Point {
    const m = 10 ** precision;
    const im = 1 / m;
    return {
      x: Math.round(x * m) * im,
      y: Math.round(y * m) * im,
    };
  }

  // In place methods that can mutate the argument to avoid extra allocations
  export function addInPlace(a: Point, b: Point): void {
    a.x += b.x;
    a.y += b.y;
  }

  export function subInPlace(a: Point, b: Point): void {
    a.x -= b.x;
    a.y -= b.y;
  }

  export function mulInPlace(a: Point, b: Point): void {
    a.x *= b.x;
    a.y *= b.y;
  }

  export function divInPlace(a: Point, b: Point): void {
    a.x /= b.x;
    a.y /= b.y;
  }

  export function negInPlace(point: Point): void {
    point.x = -point.x;
    point.y = -point.y;
  }

  export function scaleInPlace(point: Point, sx: number, sy = sx): void {
    point.x *= sx;
    point.y *= sy;
  }

  export function normalizeInPlace(point: Point): void {
    const l = length(point);

    if (l > EPSILON) {
      scaleInPlace(point, 1 / l);
    } else {
      point.x = 0;
      point.y = 0;
    }
  }

  export function roundInPlace(
    point: Point,
    precision = DEFAULT_PRECISION,
  ): void {
    const m = 10 ** precision;
    const im = 1 / m;
    point.x = Math.round(point.x * m) * im;
    point.y = Math.round(point.y * m) * im;
  }
}
