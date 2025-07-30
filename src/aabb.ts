import { DEFAULT_PRECISION } from './const';
import { Bbox, Rect } from './primitives';
import { Matrix } from './matrix';
import { Point } from './point';

interface AabbData {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
}

/**
 * Axis-aligned bounding box.
 * A rectangle defined by its minimum and maximum X and Y coordinates.
 */
export class Aabb {
  private constructor(
    public minX: number,
    public minY: number,
    public maxX: number,
    public maxY: number,
  ) {}

  /**
   * Returns an empty Aabb
   */
  static empty(): Aabb {
    return new Aabb(Infinity, Infinity, -Infinity, -Infinity);
  }

  /**
   * Creates an Aabb from left, top, right, and bottom.
   */
  static fromLtrb(
    left: number,
    top: number,
    right: number,
    bottom: number,
  ): Aabb {
    return new Aabb(left, top, right, bottom);
  }

  /**
   * Creates an Aabb from left, top, width, and height.
   */
  static fromLtwh(
    left: number,
    top: number,
    width: number,
    height: number,
  ): Aabb {
    return new Aabb(left, top, left + width, top + height);
  }

  /**
   * Returns an Aabb that contains all the given points
   */
  static fromPoints(points: Point[]): Aabb {
    const result = Aabb.empty();
    for (const point of points) {
      result.addPointInPlace(point);
    }
    return result;
  }

  /**
   * Creates an Aabb from a single point.
   */
  static fromPoint({ x, y }: Point): Aabb {
    return new Aabb(x, y, x, y);
  }

  /**
   * Checks if the given Aabb is empty
   */
  isEmpty(): boolean {
    const { maxX, maxY, minX, minY } = this;
    return minX >= maxX || minY >= maxY;
  }

  /**
   * Check if minX is less than maxX and minY is less than maxY
   */
  isValid(): boolean {
    const { maxX, maxY, minX, minY } = this;
    return minX <= maxX && minY <= maxY;
  }

  /**
   * Creates an Aabb from a Rect
   * Rect is a record with `left`, `top`, `width`, and `height` properties.
   */
  static fromRect({ height, left, top, width }: Rect): Aabb {
    return new Aabb(left, top, left + width, top + height);
  }

  /**
   * Converts provided Aabb to a Rect
   */
  toRect(): Rect {
    const { maxX, maxY, minX, minY } = this;
    return {
      height: maxY - minY,
      left: minX,
      top: minY,
      width: maxX - minX,
    };
  }

  /**
   * Creates an Aabb from the engine Bbox
   */
  static fromBbox({ x, x1, y, y1 }: Bbox): Aabb {
    return new Aabb(x, y, x1, y1);
  }

  /*
   * Converts provided Aabb to the engine Bbox
   */
  toBbox(): Bbox {
    const { maxX, maxY, minX, minY } = this;
    return {
      x: minX,
      x1: maxX,
      y: minY,
      y1: maxY,
    };
  }

  /**
   * Expands the bounds to include the provided point.
   * Since this functions creates a new object, it's not recommended to use it in a loop.
   * Use `addPointInPlace` instead in such cases.
   */
  addPoint({ x, y }: Point): Aabb {
    return new Aabb(
      Math.min(this.minX, x),
      Math.min(this.minY, y),
      Math.max(this.maxX, x),
      Math.max(this.maxY, y),
    );
  }

  /**
   * Expands the bounds to include the provided point.
   * This function mutates the provided object. Use it in a loop to avoid creating temporary objects.
   */
  addPointInPlace({ x, y }: Point): void {
    this.addXYInPlace(x, y);
  }

  /**
   * Expands the bounds to include the provided x and y coordinates.
   */
  addXYInPlace(x: number, y: number): void {
    this.minX = Math.min(this.minX, x);
    this.minY = Math.min(this.minY, y);
    this.maxX = Math.max(this.maxX, x);
    this.maxY = Math.max(this.maxY, y);
  }

  /**
   * Returns the union of the provided bounds.
   * The result contains every provided aabb.
   */
  static union(...aabbs: Aabb[]): Aabb {
    return aabbs.reduce((acc: Aabb, item: Aabb) => {
      acc.unionInPlace(item);
      return acc;
    }, Aabb.empty());
  }

  union(other: Aabb): Aabb {
    const result = this.clone();
    result.unionInPlace(other);
    return result;
  }

  unionInPlace({ maxX, maxY, minX, minY }: Aabb): void {
    this.minX = Math.min(this.minX, minX);
    this.minY = Math.min(this.minY, minY);
    this.maxX = Math.max(this.maxX, maxX);
    this.maxY = Math.max(this.maxY, maxY);
  }

  /**
   * Rounds the bounds to a given precision.
   * The result can't be smaller than the original, but it can be a bit bigger.
   *
   * The precision is the number of decimal places to round to.
   * By default, it rounds to 2 decimal places.
   */
  round(precision = DEFAULT_PRECISION): Aabb {
    const multiplier = 10 ** precision;
    const demultiplier = 1 / multiplier;
    return new Aabb(
      Math.floor(this.minX * multiplier) * demultiplier,
      Math.floor(this.minY * multiplier) * demultiplier,
      Math.ceil(this.maxX * multiplier) * demultiplier,
      Math.ceil(this.maxY * multiplier) * demultiplier,
    );
  }

  /**
   * Checks if a `parent` Aabb contains (non-inclusive) a point.
   */
  includesPoint({ x, y }: Point): boolean {
    const { maxX, maxY, minX, minY } = this;
    return maxX > x && maxY > y && minX < x && minY < y;
  }

  /**
   * Checks if a `parent` Aabb fully contains a `child` Aabb.
   */
  includes(child: Aabb): boolean {
    return (
      this.maxX >= child.maxX &&
      this.maxY >= child.maxY &&
      this.minX <= child.minX &&
      this.minY <= child.minY
    );
  }

  /**
   * Shifts the bounds by the given amount.
   */
  translate({ x: dx, y: dy }: Point): Aabb {
    return new Aabb(
      this.minX + dx,
      this.minY + dy,
      this.maxX + dx,
      this.maxY + dy,
    );
  }

  /**
   * Scales the bounds by the given factor.
   * The origin is the point to scale from.
   * By default, the origin is (0, 0).
   */
  scale(factor: number, origin: Point = { x: 0, y: 0 }): Aabb {
    const { x: ox, y: oy } = origin;
    return new Aabb(
      (this.minX - ox) * factor + ox,
      (this.minY - oy) * factor + oy,
      (this.maxX - ox) * factor + ox,
      (this.maxY - oy) * factor + oy,
    );
  }

  /**
   * Returns the point at the given normalized coordinates.
   * The input coordinates are in the range [0, 1].
   *
   * For example, (0, 0) is the top-left corner of the bounds,
   * (1, 1) is the bottom-right corner, (0.5, 0.5) is the center.
   */
  pointAt({ x, y }: Point): Point {
    const { maxX, maxY, minX, minY } = this;
    return {
      x: minX + (maxX - minX) * x,
      y: minY + (maxY - minY) * y,
    };
  }

  /**
   * Checks if one Aabb intersects another.
   */
  intersects(other: Aabb): boolean {
    return (
      this.minX <= other.maxX &&
      this.maxX >= other.minX &&
      this.minY <= other.maxY &&
      this.maxY >= other.minY
    );
  }

  /**
   * Expands the bounds by the given amount (adds padding).
   * The amount can be negative.
   */
  expand(amount: number): Aabb {
    const { maxX, maxY, minX, minY } = this;
    return new Aabb(minX - amount, minY - amount, maxX + amount, maxY + amount);
  }

  /**
   * Shrink the bounds by the given amount from each side.
   */
  shrink(amount: number): Aabb {
    return this.expand(-amount);
  }

  /**
   * Transform corner points and return their Aabb.
   */
  transform(matrix: Matrix): Aabb {
    return Aabb.fromPoints(
      [
        { x: this.minX, y: this.minY },
        { x: this.maxX, y: this.minY },
        { x: this.minX, y: this.maxY },
        { x: this.maxX, y: this.maxY },
      ].map(point => matrix.transform(point)),
    );
  }

  /**
   * Returns the intersection of the provided Aabbs.
   */
  static intersection(...aabbs: Aabb[]): Aabb {
    if (aabbs.length === 0) return Aabb.empty();
    const result = aabbs[0].clone();
    for (let i = 1; i < aabbs.length; i++) {
      result.intersectionInPlace(aabbs[i]);
    }
    return result;
  }

  /**
   * Returns the intersection of this Aabb with another.
   */
  intersection(other: Aabb): Aabb {
    const result = this.clone();
    result.intersectionInPlace(other);
    return result;
  }

  /**
   * Modifies this Aabb to be the intersection with another.
   */
  intersectionInPlace(other: Aabb): void {
    this.minX = Math.max(this.minX, other.minX);
    this.minY = Math.max(this.minY, other.minY);
    this.maxX = Math.min(this.maxX, other.maxX);
    this.maxY = Math.min(this.maxY, other.maxY);
  }

  /**
   * Returns the center point of the Aabb.
   */
  get center(): Point {
    return {
      x: (this.minX + this.maxX) * 0.5,
      y: (this.minY + this.maxY) * 0.5,
    };
  }

  /**
   * Returns the minimum x an y coordinates of the Aabb (left top corner).
   */
  get min(): Point {
    return { x: this.minX, y: this.minY };
  }

  /**
   * Returns the maximum x and y coordinates of the Aabb (right bottom corner).
   */
  get max(): Point {
    return { x: this.maxX, y: this.maxY };
  }

  /**
   * Checks if two Aabbs are equal using strict equality.
   *
   * Two Aabbs are equal if they have the same min and max coordinates.
   * Two invalid Aabbs (where minX > maxX or minY > maxY) are considered equal.
   */
  equals(other: Aabb): boolean {
    return (
      (!this.isValid() && !other.isValid()) ||
      (this.maxX === other.maxX &&
        this.maxY === other.maxY &&
        this.minX === other.minX &&
        this.minY === other.minY)
    );
  }

  get x(): number {
    return this.minX;
  }

  get y(): number {
    return this.minY;
  }

  get left(): number {
    return this.minX;
  }

  get top(): number {
    return this.minY;
  }

  get width(): number {
    return Math.max(0, this.maxX - this.minX);
  }

  get height(): number {
    return Math.max(0, this.maxY - this.minY);
  }

  getArea(): number {
    return this.width * this.height;
  }

  clone(): Aabb {
    const { maxX, maxY, minX, minY } = this;
    return new Aabb(minX, minY, maxX, maxY);
  }

  toJSON(): AabbData {
    const { maxX, maxY, minX, minY } = this;
    return { maxX, maxY, minX, minY };
  }

  static fromJSON({ maxX, maxY, minX, minY }: AabbData): Aabb {
    return new Aabb(minX, minY, maxX, maxY);
  }

  toString(): string {
    return `Aabb(${this.minX}, ${this.minY}, ${this.maxX}, ${this.maxY})`;
  }
}
