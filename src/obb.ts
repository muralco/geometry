import { Aabb } from './aabb';
import { Size } from './external-types';
import { Matrix } from './matrix';
import { Point } from './point';

export class Obb {
  constructor(public readonly size: Size, public readonly space: Matrix) {}

  get width(): number {
    return this.size.width;
  }

  get height(): number {
    return this.size.height;
  }

  getGlobalCenter(): Point {
    return this.space.transform({
      x: this.size.width * 0.5,
      y: this.size.height * 0.5,
    });
  }

  /**
   * Maps a point in vector space to the global vector space
   */
  mapToGlobal(localPoint: Point): Point {
    return this.space.transform(localPoint);
  }

  /**
   * Maps a point in the global vector space to a local vector space
   */
  mapToLocal(globalPoint: Point): Point {
    return this.space.inverse().transform(globalPoint);
  }

  /**
   * Returns the (0,0) of an obb in global coordinates
   */
  mapOriginToGlobal(): Point {
    return this.mapToGlobal({ x: 0, y: 0 });
  }

  /**
   * Maps a point in one vector space to another vector space
   */
  mapTo(to: Obb, point: Point): Point {
    return to.mapToLocal(this.mapToGlobal(point));
  }

  /**
   * Checks if a point is inside an oriented bounding box
   * @param point Point in global mural coordinates
   */
  includesPoint(point: Point): boolean {
    const localPoint = this.mapToLocal(point);
    const { height, width } = this;
    return (
      localPoint.x >= 0 &&
      localPoint.x <= width &&
      localPoint.y >= 0 &&
      localPoint.y <= height
    );
  }

  translate(delta: Point): Obb {
    return new Obb(this.size, this.space.translate(delta));
  }

  expand(padding: number): Obb {
    const { height, space, width } = this;
    const origin = space.transform({ x: 0, y: 0 });
    const target = space.transform({ x: -padding, y: -padding });

    const delta = {
      x: target.x - origin.x,
      y: target.y - origin.y,
    };

    return new Obb(
      {
        height: height + padding * 2,
        width: width + padding * 2,
      },
      space.translate(delta),
    );
  }

  shrink(padding: number): Obb {
    return this.expand(-padding);
  }

  /**
   * Takes an oriented bounding box and returns the global
   * axis aligned bounding box
   */
  toAabb(): Aabb {
    const { height, width } = this;
    return Aabb.fromPoints(
      [
        { x: 0, y: 0 },
        { x: 0, y: height },
        { x: width, y: 0 },
        { x: width, y: height },
      ].map(p => this.mapToGlobal(p)),
    );
  }

  /**
   * Zero sized obb, placed at the origin.
   * Can be used as a default value when there is no parent Obb.
   */
  static root(): Obb {
    return new Obb({ height: 0, width: 0 }, Matrix.identity());
  }

  /**
   * Returns the local position of a Obb
   */
  mapOriginTo(parentObb: Obb | undefined): Point {
    return parentObb
      ? this.mapTo(parentObb, { x: 0, y: 0 })
      : this.mapToGlobal({ x: 0, y: 0 });
  }

  /**
   * Returns true if current Obb is a translation of the other Obb.
   * There should be no rotation or scaling.
   */
  isTranslationOf(other: Obb): boolean {
    return (
      this.space.isTranslationOf(other.space) &&
      this.size.width === other.size.width &&
      this.size.height === other.size.height
    );
  }

  hasTranslation(other: Obb): boolean {
    return this.space.hasTranslation(other.space);
  }

  hasRotation(other: Obb): boolean {
    return this.space.hasRotation(other.space);
  }

  hasScaling(other: Obb): boolean {
    return (
      this.size.width !== other.size.width ||
      this.size.height !== other.size.height ||
      this.space.hasScaling(other.space)
    );
  }

  /**
   * Scales a point inside an oriented bounding box. Very useful to
   * map points inside an obb when it's scaled
   * @param prevObb the original obb
   * @param point the point to scale
   * @param nextObb the new obb after scaling
   * @returns
   */
  scalePoint(point: Point, nextObb: Obb): Point {
    // In the testing rig we have multiple test cases
    // producing widgets with width or height equal to
    // zero
    const prevWidth = this.width || 1;
    const prevHeight = this.height || 1;
    const nextWidth = nextObb.width || 1;
    const nextHeight = nextObb.height || 1;
    return {
      x: (point.x / prevWidth) * nextWidth,
      y: (point.y / prevHeight) * nextHeight,
    };
  }

  equals(other: Obb): boolean {
    return (
      this.size.width === other.size.width &&
      this.size.height === other.size.height &&
      this.space.equals(other.space)
    );
  }

  toString(): string {
    return `Obb(${JSON.stringify(this.size)}, ${this.space})`;
  }
}
