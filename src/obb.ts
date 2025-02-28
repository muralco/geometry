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
}
