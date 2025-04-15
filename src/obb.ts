import { Aabb } from './aabb';
import { Point, Size } from './external-types';
import { Matrix } from './matrix';

/**
 * Oriented Bounding Box
 * Representation of a coordinate system inside Mural
 */
export interface Obb {
  size: Size;
  /**
   * Transformation from local space to global
   */
  space: Matrix;
}

export namespace Obb {
  /**
   * Scales a point inside an oriented bounding box. Very useful to
   * map points inside an obb when it's scaled
   * @param prevObb the original obb
   * @param point the point to scale
   * @param nextObb the new obb after scaling
   * @returns
   */
  export function scalePoint(prevObb: Obb, point: Point, nextObb: Obb): Point {
    // In the testing rig we have multiple test cases
    // producing widgets with width or height equal to
    // zero
    const prevWidth = prevObb.size.width || 1;
    const prevHeight = prevObb.size.height || 1;
    const nextWidth = nextObb.size.width || 1;
    const nextHeight = nextObb.size.height || 1;
    return {
      x: (point.x / prevWidth) * nextWidth,
      y: (point.y / prevHeight) * nextHeight,
    };
  }

  /**
   * Returns the local position of a Obb
   * @param obb
   * @param parentObb
   * @returns
   */
  export function getLocalPosition(obb: Obb, parentObb: Obb): Point {
    return parentObb
      ? mapTo(obb, parentObb, { x: 0, y: 0 })
      : mapToGlobal(obb, { x: 0, y: 0 });
  }

  /**
   * Maps a point in vector space to the global vector space
   * @param localPoint
   * @param obb
   * @returns
   */
  export function mapToGlobal(obb: Obb, localPoint: Point): Point {
    return obb.space.transform(localPoint);
  }

  /**
   * Returns the (0,0) of an obb in global coordinates
   */
  export function mapOriginToGlobal(obb: Obb): Point {
    return Obb.mapToGlobal(obb, { x: 0, y: 0 });
  }

  /**
   * Maps a point in the global vector space to a local vector space
   * @param obb
   * @param globalPoint
   * @returns
   */
  export function mapToLocal(obb: Obb, globalPoint: Point): Point {
    return obb.space.inverse().transform(globalPoint);
  }

  /**
   * Maps a point in one vector space to another vector space
   * @param from
   * @param to
   * @param point
   * @returns
   */
  export function mapTo(from: Obb, to: Obb, point: Point): Point {
    return Obb.mapToLocal(to, Obb.mapToGlobal(from, point));
  }

  /**
   * Checks if a point is inside an oriented bounding box
   * @param obb
   * @param point Point in global mural coordinates
   */
  export function includesPoint(obb: Obb, point: Point): boolean {
    const localPoint = Obb.mapToLocal(obb, point);
    return (
      localPoint.x >= 0 &&
      localPoint.x <= obb.size.width &&
      localPoint.y >= 0 &&
      localPoint.y <= obb.size.height
    );
  }

  export function translate(obb: Obb, delta: Point): Obb {
    return {
      size: obb.size,
      space: obb.space.translate(delta),
    };
  }

  export function expand(
    { size: { height, width }, space }: Obb,
    padding: number,
  ): Obb {
    const origin = space.transform({ x: 0, y: 0 });
    const target = space.transform({ x: -padding, y: -padding });

    const delta = {
      x: target.x - origin.x,
      y: target.y - origin.y,
    };

    return {
      size: {
        height: height + padding * 2,
        width: width + padding * 2,
      },
      space: space.translate(delta),
    };
  }

  export function shrink(obb: Obb, padding: number): Obb {
    return expand(obb, -padding);
  }

  /**
   * Takes an oriented bounding box and returns the global
   * axis aligned bounding box
   * @param obb
   * @returns
   */
  export function toAabb(obb: Obb): Aabb {
    return Aabb.fromPoints(
      [
        { x: 0, y: 0 },
        { x: 0, y: obb.size.height },
        { x: obb.size.width, y: 0 },
        { x: obb.size.width, y: obb.size.height },
      ].map(p => Obb.mapToGlobal(obb, p)),
    );
  }

  export function create(size: Size, space: Matrix): Obb {
    return {
      size,
      space,
    };
  }

  /**
   * Zero sized obb, placed at the origin.
   * Can be used as a default value when there is no parent Obb.
   */
  export function root(): Obb {
    return create({ height: 0, width: 0 }, Matrix.identity());
  }
}
