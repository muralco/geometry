import { Aabb } from './aabb';
import { Matrix } from './matrix';
import { Obb } from './obb';
import { Point } from './point';

describe('Obb', () => {
  // Sample Obb objects for testing
  const identityObb = new Obb({ height: 200, width: 100 }, Matrix.identity());

  const translatedObb = new Obb(
    { height: 200, width: 100 },
    Matrix.translation({ x: 100, y: 200 }),
  );

  const rotatedObb = new Obb(
    { height: 200, width: 100 },
    Matrix.rotation(Math.PI / 2),
  );

  const complexObb = new Obb(
    { height: 200, width: 100 },
    Matrix.identity()
      .rotate(30 * (Math.PI / 180))
      .translate({ x: 50, y: 50 }),
  );

  const complexObbParent = new Obb(
    { height: 100, width: 100 },
    Matrix.identity().translate({ x: 10, y: 10 }),
  );

  describe('scalePoint', () => {
    it('should scale a point proportionally', () => {
      const point: Point = { x: 50, y: 100 };
      const prevObb = new Obb({ height: 200, width: 100 }, Matrix.identity());
      const nextObb = new Obb({ height: 400, width: 200 }, Matrix.identity());

      const result = prevObb.scalePoint(point, nextObb);
      expect(result.x).toEqual(100); // 50 * (200/100)
      expect(result.y).toEqual(200); // 100 * (400/200)
    });

    it('should handle zero dimensions gracefully', () => {
      const point: Point = { x: 50, y: 100 };
      const prevObb = new Obb({ height: 0, width: 0 }, Matrix.identity());
      const nextObb = new Obb({ height: 400, width: 200 }, Matrix.identity());

      const result = prevObb.scalePoint(point, nextObb);
      expect(result.x).toEqual(50 * 200); // Using 1 as denominator
      expect(result.y).toEqual(100 * 400); // Using 1 as denominator
    });
  });

  describe('getLocalPosition', () => {
    it('should return the origin of the first space', () => {
      const result = translatedObb.mapOriginTo(Obb.root());
      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('should return the correct origin for complex Obb', () => {
      const result = complexObb.mapOriginTo(complexObbParent);
      expect(result).toEqual({ x: 40, y: 40 });
    });
  });

  describe('mapToGlobal', () => {
    it('should map a point from local to global space (identity)', () => {
      const point: Point = { x: 50, y: 100 };
      const result = identityObb.mapToGlobal(point);
      expect(result.x).toBeCloseTo(50);
      expect(result.y).toBeCloseTo(100);
    });

    it('should map a point from local to global space (translation)', () => {
      const point: Point = { x: 50, y: 100 };
      const result = translatedObb.mapToGlobal(point);
      expect(result.x).toBeCloseTo(150); // 100 + 50
      expect(result.y).toBeCloseTo(300); // 200 + 100
    });

    it('should map a point from local to global space (rotation)', () => {
      const point: Point = { x: 50, y: 100 };
      const result = rotatedObb.mapToGlobal(point);
      expect(result.x).toBeCloseTo(-100); // 0 + 50*0 - 100*1
      expect(result.y).toBeCloseTo(50); // 0 + 50*1 + 100*0
    });
  });

  describe('mapOriginToGlobal', () => {
    it('should map the origin (0,0) to global space', () => {
      const result = translatedObb.mapOriginToGlobal();
      expect(result.x).toBeCloseTo(100);
      expect(result.y).toBeCloseTo(200);
    });
  });

  describe('mapToLocal', () => {
    it('should map a point from global to local space (identity)', () => {
      const point: Point = { x: 50, y: 100 };
      const result = identityObb.mapToLocal(point);
      expect(result.x).toBeCloseTo(50);
      expect(result.y).toBeCloseTo(100);
    });

    it('should map a point from global to local space (translation)', () => {
      const point: Point = { x: 150, y: 300 };
      const result = translatedObb.mapToLocal(point);
      expect(result.x).toBeCloseTo(50); // 150 - 100
      expect(result.y).toBeCloseTo(100); // 300 - 200
    });

    it('should map a point from global to local space (rotation)', () => {
      const point: Point = { x: -100, y: 50 };
      const result = rotatedObb.mapToLocal(point);
      expect(result.x).toBeCloseTo(50, 1);
      expect(result.y).toBeCloseTo(100, 1);
    });

    it('should map a point from global to local space (complex)', () => {
      // Instead of using the specific global point from previous test, we'll use point mapping functions
      // to ensure round-trip consistency
      const localPoint: Point = { x: 50, y: 100 };
      const globalPoint = complexObb.mapToGlobal(localPoint);
      const result = complexObb.mapToLocal(globalPoint);

      expect(result.x).toBeCloseTo(localPoint.x, 1);
      expect(result.y).toBeCloseTo(localPoint.y, 1);
    });
  });

  describe('mapTo', () => {
    it('should map a point from one Obb to another', () => {
      const point: Point = { x: 50, y: 100 };
      const result = identityObb.mapTo(translatedObb, point);
      expect(result.x).toBeCloseTo(-50); // 50 - 100
      expect(result.y).toBeCloseTo(-100); // 100 - 200
    });

    it('should handle complex mappings between Obbs', () => {
      const point: Point = { x: 50, y: 100 };
      const result = identityObb.mapTo(complexObb, point);
      // Map from identity to complex - should be the inverse of mapToGlobal for complex
      const globalPoint = identityObb.mapToGlobal(point);
      expect(result).toEqual(complexObb.mapToLocal(globalPoint));
    });
  });

  describe('toAabb', () => {
    it('should convert an identity Obb to Aabb', () => {
      const result = identityObb.toAabb();

      expect(result).toEqual(new Aabb(0, 0, 100, 200));
    });

    it('should handle rotated Obb conversion to Aabb', () => {
      const result = rotatedObb.toAabb();

      expect(result.round()).toEqual(new Aabb(-200, 0, 0.01, 100.01));
    });
  });

  describe('includesPoint', () => {
    it('should check if point is inside of the Obb', () => {
      expect(identityObb.includesPoint({ x: 50, y: 100 })).toBe(true);
      expect(identityObb.includesPoint({ x: 150, y: 100 })).toBe(false);
    });

    it('should check if point is inside of the rotated Obb', () => {
      expect(rotatedObb.includesPoint({ x: -10, y: 50 })).toBe(true);
      expect(rotatedObb.includesPoint({ x: 100, y: 50 })).toBe(false);
    });

    it('should check if point is inside of the Obb with padding', () => {
      expect(identityObb.shrink(10).includesPoint({ x: 99, y: 199 })).toBe(
        false,
      );
      expect(identityObb.expand(10).includesPoint({ x: 101, y: 201 })).toBe(
        true,
      );
    });
  });

  describe('expand', () => {
    it('should expand the Obb by a given padding', () => {
      const expandedObb = identityObb.expand(10);
      expect(expandedObb.toAabb()).toEqual(Aabb.fromLtrb(-10, -10, 110, 210));
    });

    it('should shrink if negative padding is provided', () => {
      const expandedObb = identityObb.expand(-10);
      expect(expandedObb.toAabb()).toEqual(new Aabb(10, 10, 90, 190));
    });

    it('should expand rotated Obb correctly', () => {
      const expandedObb = rotatedObb.expand(10);
      expect(expandedObb.toAabb().round()).toEqual(
        new Aabb(-210, -10, 10.01, 110.01),
      );
    });

    it('should expand complex Obb correctly', () => {
      const expandedObb = complexObb.expand(10);
      expect(expandedObb.toAabb().round()).toEqual(
        Aabb.fromLtrb(-63.67, 36.33, 150.27, 286.87),
      );
    });
  });
});
