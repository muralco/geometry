import { Aabb } from './aabb';
import { Point } from './types';

/**
 * Oriented Bounding Box
 * Representation of a coordinate system inside Mural
 */
export interface Obb {
  size: { height: number; width: number };
  space: { cosR: number; origin: { x: number; y: number }; sinR: number }[];
}

export namespace Obb {
  /**
   * Scales a point inside an oriented bounding box. Very useful to
   * map points inside a widgets when it's scaled
   * @param point
   * @param prevObb
   * @param nextObb
   * @returns
   */
  export function scalePoint(point: Point, prevObb: Obb, nextObb: Obb): Point {
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
   * @returns
   */
  export function getLocalPosition(obb: Obb): Point {
    return obb.space[0].origin;
  }

  // the angle sum rule
  // cos(α+β) = cos(α).cos(β)−sin(α).sin(β)
  // sin(α+β) = sin(α).cos(β)+cos(α).sin(β)
  export function getTotalCosSin(obb: Obb): { cosR: number; sinR: number } {
    return obb.space.reduce(
      (acc, curr) => {
        return {
          cosR: acc.cosR * curr.cosR - acc.sinR * curr.sinR,
          sinR: acc.sinR * curr.cosR + acc.cosR * curr.sinR,
        };
      },
      { cosR: 1, sinR: 0 },
    );
  }

  /**
   * Maps a point in vector space to the global vector space
   * @param widgetPoint
   * @param from
   * @returns
   */
  export function mapToGlobal(widgetPoint: Point, from: Obb): Point {
    const copy = { ...widgetPoint };
    return from.space.reduce((accumulator, current) => {
      // ┌           ┐┌                    ┐┌   ┐
      // │ 1   0   j ││ cos(r)  -sin(r)  0 ││ x │
      // │ 0   1   k ││ sin(r)   cos(r)  0 ││ y │
      // │ 0   0   1 ││   0        0     1 ││ 1 │
      // └           ┘└                    ┘└   ┘
      const cosR = current.cosR;
      const sinR = current.sinR;
      const j = current.origin.x;
      const k = current.origin.y;
      const x = accumulator.x;
      const y = accumulator.y;
      copy.x = j + x * cosR - y * sinR;
      copy.y = k + x * sinR + y * cosR;
      return copy;
    }, copy);
  }

  /**
   * Returns the (0,0) of a widget in global coordinates
   */
  export function mapOriginToGlobal(widgetObb: Obb): Point {
    return Obb.mapToGlobal({ x: 0, y: 0 }, widgetObb);
  }

  /**
   * Maps a point in the global vector space to a local vector space
   * @param globalPoint
   * @param to
   * @returns
   */
  export function mapToLocal(globalPoint: Point, to: Obb): Point {
    const copy = { ...globalPoint };
    return to.space.reduceRight((accumulator, current) => {
      // ┌                    ┐┌            ┐┌   ┐
      // │  cos(r)  sin(r)  0 ││ 1   0   -j ││ x │
      // │ -sin(r)  cos(r)  0 ││ 0   1   -k ││ y │
      // │    0       0     1 ││ 0   0    1 ││ 1 │
      // └                    ┘└            ┘└   ┘
      const cosR = current.cosR;
      const sinR = current.sinR;
      const j = current.origin.x;
      const k = current.origin.y;
      const x = accumulator.x;
      const y = accumulator.y;
      // return {
      //   x: -j * cosR + x * cosR - k * sinR + y * sinR,
      //   y: -k * cosR + y * cosR + j * sinR - x * sinR,
      // };
      copy.x = cosR * (x - j) + sinR * (y - k);
      copy.y = cosR * (y - k) + sinR * (j - x);
      return copy;
    }, globalPoint);
  }

  /**
   * Maps a point in one widget vector space to another widget vector space
   * @param point
   * @param from
   * @param to
   * @returns
   */
  export function mapTo(point: Point, from: Obb, to: Obb): Point {
    return Obb.mapToLocal(Obb.mapToGlobal(point, from), to);
  }

  /**
   * Takes an oriented bounding box and returns the global
   * axis aligned bounding box
   * @param obb
   * @returns
   */
  export function getGlobalAabbFromObb(obb: Obb): Aabb {
    return Aabb.fromPoints(
      [
        { x: 0, y: 0 },
        { x: 0, y: obb.size.height },
        { x: obb.size.width, y: 0 },
        { x: obb.size.width, y: obb.size.height },
      ].map(p => Obb.mapToGlobal(p, obb)),
    );
  }
}
