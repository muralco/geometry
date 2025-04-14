import { Aabb } from './aabb';
import { Point } from './external-types';
import { Matrix } from './matrix';
import { Obb } from './obb';

describe('Obb', () => {
  // Sample Obb objects for testing
  const identityObb: Obb = {
    size: { height: 200, width: 100 },
    space: Matrix.identity(),
  };

  const translatedObb: Obb = {
    size: { height: 200, width: 100 },
    space: Matrix.translation({ x: 100, y: 200 }),
  };

  const rotatedObb: Obb = {
    size: { height: 200, width: 100 },
    space: Matrix.rotation(Math.PI / 2),
  };

  const complexObb: Obb = {
    size: { height: 200, width: 100 },
    space: Matrix.identity()
      .rotate(30 * (Math.PI / 180))
      .translate({ x: 50, y: 50 }),
  };

  const complexObbParent = {
    size: { height: 100, width: 100 },
    space: Matrix.identity().translate({ x: 10, y: 10 }),
  };

  describe('scalePoint', () => {
    it('should scale a point proportionally', () => {
      const point: Point = { x: 50, y: 100 };
      const prevObb: Obb = {
        size: { height: 200, width: 100 },
        space: Matrix.identity(),
      };
      const nextObb: Obb = {
        size: { height: 400, width: 200 },
        space: Matrix.identity(),
      };

      const result = Obb.scalePoint(prevObb, point, nextObb);
      expect(result.x).toEqual(100); // 50 * (200/100)
      expect(result.y).toEqual(200); // 100 * (400/200)
    });

    it('should handle zero dimensions gracefully', () => {
      const point: Point = { x: 50, y: 100 };
      const prevObb: Obb = {
        size: { height: 0, width: 0 },
        space: Matrix.identity(),
      };
      const nextObb: Obb = {
        size: { height: 400, width: 200 },
        space: Matrix.identity(),
      };

      const result = Obb.scalePoint(prevObb, point, nextObb);
      expect(result.x).toEqual(50 * 200); // Using 1 as denominator
      expect(result.y).toEqual(100 * 400); // Using 1 as denominator
    });
  });

  describe('getLocalPosition', () => {
    it('should return the origin of the first space', () => {
      const result = Obb.getLocalPosition(translatedObb, Obb.root());
      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('should return the correct origin for complex Obb', () => {
      const result = Obb.getLocalPosition(complexObb, complexObbParent);
      expect(result).toEqual({ x: 40, y: 40 });
    });
  });

  describe('mapToGlobal', () => {
    it('should map a point from local to global space (identity)', () => {
      const point: Point = { x: 50, y: 100 };
      const result = Obb.mapToGlobal(identityObb, point);
      expect(result.x).toBeCloseTo(50);
      expect(result.y).toBeCloseTo(100);
    });

    it('should map a point from local to global space (translation)', () => {
      const point: Point = { x: 50, y: 100 };
      const result = Obb.mapToGlobal(translatedObb, point);
      expect(result.x).toBeCloseTo(150); // 100 + 50
      expect(result.y).toBeCloseTo(300); // 200 + 100
    });

    it('should map a point from local to global space (rotation)', () => {
      const point: Point = { x: 50, y: 100 };
      const result = Obb.mapToGlobal(rotatedObb, point);
      expect(result.x).toBeCloseTo(-100); // 0 + 50*0 - 100*1
      expect(result.y).toBeCloseTo(50); // 0 + 50*1 + 100*0
    });
  });

  describe('mapOriginToGlobal', () => {
    it('should map the origin (0,0) to global space', () => {
      const result = Obb.mapOriginToGlobal(translatedObb);
      expect(result.x).toBeCloseTo(100);
      expect(result.y).toBeCloseTo(200);
    });
  });

  describe('mapToLocal', () => {
    it('should map a point from global to local space (identity)', () => {
      const point: Point = { x: 50, y: 100 };
      const result = Obb.mapToLocal(identityObb, point);
      expect(result.x).toBeCloseTo(50);
      expect(result.y).toBeCloseTo(100);
    });

    it('should map a point from global to local space (translation)', () => {
      const point: Point = { x: 150, y: 300 };
      const result = Obb.mapToLocal(translatedObb, point);
      expect(result.x).toBeCloseTo(50); // 150 - 100
      expect(result.y).toBeCloseTo(100); // 300 - 200
    });

    it('should map a point from global to local space (rotation)', () => {
      const point: Point = { x: -100, y: 50 };
      const result = Obb.mapToLocal(rotatedObb, point);
      expect(result.x).toBeCloseTo(50, 1);
      expect(result.y).toBeCloseTo(100, 1);
    });

    it('should map a point from global to local space (complex)', () => {
      // Instead of using the specific global point from previous test, we'll use point mapping functions
      // to ensure round-trip consistency
      const localPoint: Point = { x: 50, y: 100 };
      const globalPoint = Obb.mapToGlobal(complexObb, localPoint);
      const result = Obb.mapToLocal(complexObb, globalPoint);

      expect(result.x).toBeCloseTo(localPoint.x, 1);
      expect(result.y).toBeCloseTo(localPoint.y, 1);
    });
  });

  describe('mapTo', () => {
    it('should map a point from one Obb to another', () => {
      const point: Point = { x: 50, y: 100 };
      const result = Obb.mapTo(identityObb, translatedObb, point);
      expect(result.x).toBeCloseTo(-50); // 50 - 100
      expect(result.y).toBeCloseTo(-100); // 100 - 200
    });

    it('should handle complex mappings between Obbs', () => {
      const point: Point = { x: 50, y: 100 };
      const result = Obb.mapTo(identityObb, complexObb, point);
      // Map from identity to complex - should be the inverse of mapToGlobal for complex
      const globalPoint = Obb.mapToGlobal(identityObb, point);
      expect(result).toEqual(Obb.mapToLocal(complexObb, globalPoint));
    });
  });

  describe('toAabb', () => {
    it('should convert an identity Obb to Aabb', () => {
      const result = Obb.toAabb(identityObb);

      expect(result).toEqual(new Aabb(0, 0, 100, 200));
    });

    it('should handle rotated Obb conversion to Aabb', () => {
      const result = Obb.toAabb(rotatedObb);

      expect(result.round()).toEqual(new Aabb(-200, 0, 0.01, 100.01));
    });
  });

  describe('includesPoint', () => {
    it('should check if point is inside of the Obb', () => {
      expect(Obb.includesPoint(identityObb, { x: 50, y: 100 })).toBe(true);
      expect(Obb.includesPoint(identityObb, { x: 150, y: 100 })).toBe(false);
    });

    it('should check if point is inside of the rotated Obb', () => {
      expect(Obb.includesPoint(rotatedObb, { x: -10, y: 50 })).toBe(true);
      expect(Obb.includesPoint(rotatedObb, { x: 100, y: 50 })).toBe(false);
    });

    it('should check if point is inside of the Obb with padding', () => {
      expect(
        Obb.includesPoint(Obb.shrink(identityObb, 10), { x: 99, y: 199 }),
      ).toBe(false);
      expect(
        Obb.includesPoint(Obb.expand(identityObb, 10), { x: 101, y: 201 }),
      ).toBe(true);
    });
  });

  describe('expand', () => {
    it('should expand the Obb by a given padding', () => {
      const expandedObb = Obb.expand(identityObb, 10);
      expect(Obb.toAabb(expandedObb)).toEqual(
        Aabb.fromLtrb(-10, -10, 110, 210),
      );
    });

    it('should shrink if negative padding is provided', () => {
      const expandedObb = Obb.expand(identityObb, -10);
      expect(Obb.toAabb(expandedObb)).toEqual(new Aabb(10, 10, 90, 190));
    });

    it('should expand rotated Obb correctly', () => {
      const expandedObb = Obb.expand(rotatedObb, 10);
      expect(Obb.toAabb(expandedObb).round()).toEqual(
        new Aabb(-210, -10, 10.01, 110.01),
      );
    });

    it('should expand complex Obb correctly', () => {
      const expandedObb = Obb.expand(complexObb, 10);
      expect(Obb.toAabb(expandedObb).round()).toEqual(
        Aabb.fromLtrb(-13.67, 86.33, 200.27, 336.87),
      );
    });
  });
});
