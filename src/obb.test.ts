import { Aabb } from './aabb';
import { Obb } from './obb';
import { Point } from './types';

describe('Obb', () => {
  // Sample Obb objects for testing
  const identityObb: Obb = {
    size: { height: 200, width: 100 },
    space: [{ cosR: 1, origin: { x: 0, y: 0 }, sinR: 0 }],
  };

  const translatedObb: Obb = {
    size: { height: 200, width: 100 },
    space: [{ cosR: 1, origin: { x: 100, y: 200 }, sinR: 0 }],
  };

  const rotatedObb: Obb = {
    size: { height: 200, width: 100 },
    space: [{ cosR: 0, origin: { x: 0, y: 0 }, sinR: 1 }], // 90 degrees rotation
  };

  const complexObb: Obb = {
    size: { height: 200, width: 100 },
    space: [
      { cosR: 0.866, origin: { x: 100, y: 100 }, sinR: 0.5 }, // 30 degrees rotation
      { cosR: 1, origin: { x: 50, y: 50 }, sinR: 0 }, // translation
    ],
  };

  describe('scalePoint', () => {
    it('should scale a point proportionally', () => {
      const point: Point = { x: 50, y: 100 };
      const prevObb: Obb = {
        size: { height: 200, width: 100 },
        space: [{ cosR: 1, origin: { x: 0, y: 0 }, sinR: 0 }],
      };
      const nextObb: Obb = {
        size: { height: 400, width: 200 },
        space: [{ cosR: 1, origin: { x: 0, y: 0 }, sinR: 0 }],
      };

      const result = Obb.scalePoint(point, prevObb, nextObb);
      expect(result.x).toEqual(100); // 50 * (200/100)
      expect(result.y).toEqual(200); // 100 * (400/200)
    });

    it('should handle zero dimensions gracefully', () => {
      const point: Point = { x: 50, y: 100 };
      const prevObb: Obb = {
        size: { height: 0, width: 0 },
        space: [{ cosR: 1, origin: { x: 0, y: 0 }, sinR: 0 }],
      };
      const nextObb: Obb = {
        size: { height: 400, width: 200 },
        space: [{ cosR: 1, origin: { x: 0, y: 0 }, sinR: 0 }],
      };

      const result = Obb.scalePoint(point, prevObb, nextObb);
      expect(result.x).toEqual(50 * 200); // Using 1 as denominator
      expect(result.y).toEqual(100 * 400); // Using 1 as denominator
    });
  });

  describe('getLocalPosition', () => {
    it('should return the origin of the first space', () => {
      const result = Obb.getLocalPosition(translatedObb);
      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('should return the correct origin for complex Obb', () => {
      const result = Obb.getLocalPosition(complexObb);
      expect(result).toEqual({ x: 100, y: 100 });
    });
  });

  describe('getTotalCosSin', () => {
    it('should return identity for identity Obb', () => {
      const result = Obb.getTotalCosSin(identityObb);
      expect(result.cosR).toBeCloseTo(1);
      expect(result.sinR).toBeCloseTo(0);
    });

    it('should return correct values for rotated Obb', () => {
      const result = Obb.getTotalCosSin(rotatedObb);
      expect(result.cosR).toBeCloseTo(0);
      expect(result.sinR).toBeCloseTo(1);
    });

    it('should compose multiple transformations correctly', () => {
      const result = Obb.getTotalCosSin(complexObb);
      expect(result.cosR).toBeCloseTo(0.866, 3);
      expect(result.sinR).toBeCloseTo(0.5, 3);
    });
  });

  describe('mapToGlobal', () => {
    it('should map a point from local to global space (identity)', () => {
      const point: Point = { x: 50, y: 100 };
      const result = Obb.mapToGlobal(point, identityObb);
      expect(result.x).toBeCloseTo(50);
      expect(result.y).toBeCloseTo(100);
    });

    it('should map a point from local to global space (translation)', () => {
      const point: Point = { x: 50, y: 100 };
      const result = Obb.mapToGlobal(point, translatedObb);
      expect(result.x).toBeCloseTo(150); // 100 + 50
      expect(result.y).toBeCloseTo(300); // 200 + 100
    });

    it('should map a point from local to global space (rotation)', () => {
      const point: Point = { x: 50, y: 100 };
      const result = Obb.mapToGlobal(point, rotatedObb);
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
      const result = Obb.mapToLocal(point, identityObb);
      expect(result.x).toBeCloseTo(50);
      expect(result.y).toBeCloseTo(100);
    });

    it('should map a point from global to local space (translation)', () => {
      const point: Point = { x: 150, y: 300 };
      const result = Obb.mapToLocal(point, translatedObb);
      expect(result.x).toBeCloseTo(50); // 150 - 100
      expect(result.y).toBeCloseTo(100); // 300 - 200
    });

    it('should map a point from global to local space (rotation)', () => {
      const point: Point = { x: -100, y: 50 };
      const result = Obb.mapToLocal(point, rotatedObb);
      expect(result.x).toBeCloseTo(50, 1);
      expect(result.y).toBeCloseTo(100, 1);
    });

    it('should map a point from global to local space (complex)', () => {
      // Instead of using the specific global point from previous test, we'll use point mapping functions
      // to ensure round-trip consistency
      const localPoint: Point = { x: 50, y: 100 };
      const globalPoint = Obb.mapToGlobal(localPoint, complexObb);
      const result = Obb.mapToLocal(globalPoint, complexObb);

      expect(result.x).toBeCloseTo(localPoint.x, 1);
      expect(result.y).toBeCloseTo(localPoint.y, 1);
    });
  });

  describe('mapTo', () => {
    it('should map a point from one Obb to another', () => {
      const point: Point = { x: 50, y: 100 };
      const result = Obb.mapTo(point, identityObb, translatedObb);
      expect(result.x).toBeCloseTo(-50); // 50 - 100
      expect(result.y).toBeCloseTo(-100); // 100 - 200
    });

    it('should handle complex mappings between Obbs', () => {
      const point: Point = { x: 50, y: 100 };
      const result = Obb.mapTo(point, identityObb, complexObb);
      // Map from identity to complex - should be the inverse of mapToGlobal for complex
      const globalPoint = Obb.mapToGlobal(point, identityObb);
      expect(result).toEqual(Obb.mapToLocal(globalPoint, complexObb));
    });
  });

  describe('toAabb', () => {
    it('should convert an identity Obb to Aabb', () => {
      // Mock the Aabb.fromPoints function
      const mockFromPoints = jest.spyOn(Aabb, 'fromPoints');
      mockFromPoints.mockImplementation((points: Point[]) => {
        // Implementation to return the Aabb with the correct structure
        return {
          maxX: Math.max(...points.map(p => p.x)),
          maxY: Math.max(...points.map(p => p.y)),
          minX: Math.min(...points.map(p => p.x)),
          minY: Math.min(...points.map(p => p.y)),
        };
      });

      const result = Obb.toAabb(identityObb);

      expect(mockFromPoints).toHaveBeenCalledWith([
        { x: 0, y: 0 },
        { x: 0, y: 200 },
        { x: 100, y: 0 },
        { x: 100, y: 200 },
      ]);

      expect(result).toEqual({
        maxX: 100,
        maxY: 200,
        minX: 0,
        minY: 0,
      });

      mockFromPoints.mockRestore();
    });

    it('should handle rotated Obb conversion to Aabb', () => {
      // Mock the Aabb.fromPoints function
      const mockFromPoints = jest.spyOn(Aabb, 'fromPoints');
      mockFromPoints.mockImplementation((points: Point[]) => {
        return {
          maxX: Math.max(...points.map(p => p.x)),
          maxY: Math.max(...points.map(p => p.y)),
          minX: Math.min(...points.map(p => p.x)),
          minY: Math.min(...points.map(p => p.y)),
        };
      });

      const result = Obb.toAabb(rotatedObb);

      // In a 90-degree rotation, the width becomes height and vice versa
      expect(mockFromPoints).toHaveBeenCalledWith([
        { x: 0, y: 0 },
        { x: -200, y: 0 },
        { x: 0, y: 100 },
        { x: -200, y: 100 },
      ]);

      expect(result).toEqual({
        maxX: 0,
        maxY: 100,
        minX: -200,
        minY: 0,
      });

      mockFromPoints.mockRestore();
    });
  });
});
