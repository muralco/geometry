import { Point } from './point';

describe('Point', () => {
  describe('basic operations', () => {
    it('should calculate length correctly', () => {
      expect(Point.length({ x: 3, y: 4 })).toBe(5);
      expect(Point.length({ x: 0, y: 0 })).toBe(0);
    });

    it('should calculate lengthSquared correctly', () => {
      expect(Point.lengthSquared({ x: 3, y: 4 })).toBe(25);
      expect(Point.lengthSquared({ x: -2, y: 3 })).toBe(13);
    });

    it('should add points correctly', () => {
      const a = { x: 1, y: 2 };
      const b = { x: 3, y: 4 };
      expect(Point.add(a, b)).toEqual({ x: 4, y: 6 });
    });

    it('should subtract points correctly', () => {
      const a = { x: 5, y: 8 };
      const b = { x: 2, y: 3 };
      expect(Point.sub(a, b)).toEqual({ x: 3, y: 5 });
    });

    it('should multiply points correctly', () => {
      const a = { x: 2, y: 3 };
      const b = { x: 4, y: 5 };
      expect(Point.mul(a, b)).toEqual({ x: 8, y: 15 });
    });

    it('should divide points correctly', () => {
      const a = { x: 10, y: 15 };
      const b = { x: 2, y: 3 };
      if (!Point.isNonZero(b)) fail('Division by zero should not happen here');
      expect(Point.div(a, b)).toEqual({ x: 5, y: 5 });
    });

    it('should negate points correctly', () => {
      expect(Point.neg({ x: 3, y: -4 })).toEqual({ x: -3, y: 4 });
    });

    it('should scale points correctly', () => {
      const p = { x: 2, y: 3 };
      expect(Point.scale(p, 2)).toEqual({ x: 4, y: 6 });
      expect(Point.scale(p, 2, 3)).toEqual({ x: 4, y: 9 });
    });

    it('should normalize points correctly', () => {
      const p = { x: 3, y: 0 };
      if (!Point.isNonZero(p)) fail('Division by zero should not happen here');
      expect(Point.normalize(p)).toEqual({ x: 1, y: 0 });

      const p2 = { x: 1, y: 1 };
      if (!Point.isNonZero(p2)) fail('Division by zero should not happen here');
      const normalized = Point.normalize(p2);
      // Using approximately because of floating point precision
      expect(Point.length(normalized)).toBeCloseTo(1);
    });

    it('should calculate dot product correctly', () => {
      const a = { x: 2, y: 3 };
      const b = { x: 4, y: 5 };
      expect(Point.dot(a, b)).toBe(23); // 2*4 + 3*5
    });

    it('should create zero point', () => {
      expect(Point.zero()).toEqual({ x: 0, y: 0 });
    });

    it('should check if points are equal', () => {
      expect(Point.equals({ x: 2, y: 3 }, { x: 2, y: 3 })).toBe(true);
      expect(Point.equals({ x: 2, y: 3 }, { x: 2, y: 4 })).toBe(false);
      expect(Point.equals({ x: 2, y: 3 }, { x: 1, y: 3 })).toBe(false);
    });

    it('should check if points are almost equal', () => {
      expect(Point.almostEquals({ x: 2, y: 3 }, { x: 2, y: 3 })).toBe(true);
      expect(Point.almostEquals({ x: 2, y: 3 }, { x: 2.0000001, y: 3 })).toBe(
        true,
      );
      expect(Point.almostEquals({ x: 2, y: 3 }, { x: 2.1, y: 3 })).toBe(false);

      // Testing with precision
      expect(Point.almostEquals({ x: 2, y: 3 }, { x: 2.01, y: 3 }, 1)).toBe(
        true,
      );
      expect(Point.almostEquals({ x: 2, y: 3 }, { x: 2.1, y: 3 }, 0)).toBe(
        true,
      );
    });

    it('should round point values', () => {
      expect(Point.round({ x: 2.34, y: 3.56 })).toEqual({ x: 2.34, y: 3.56 });
      expect(Point.round({ x: 4.33, y: 3.56 }, 1)).toEqual({ x: 4.3, y: 3.6 });
      expect(Point.round({ x: 2.34, y: 3.56 }, 0)).toEqual({ x: 2, y: 4 });
    });

    it('should interpolate between points correctly', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 10, y: 20 };

      // t = 0 should return the first point
      expect(Point.lerp(a, b, 0)).toEqual({ x: 0, y: 0 });

      // t = 1 should return the second point
      expect(Point.lerp(a, b, 1)).toEqual({ x: 10, y: 20 });

      // t = 0.5 should return the midpoint
      expect(Point.lerp(a, b, 0.5)).toEqual({ x: 5, y: 10 });

      // t = 0.25 should return a point 1/4 of the way from a to b
      expect(Point.lerp(a, b, 0.25)).toEqual({ x: 2.5, y: 5 });

      // t values outside [0,1] should extrapolate properly
      expect(Point.lerp(a, b, 2)).toEqual({ x: 20, y: 40 });
      expect(Point.lerp(a, b, -0.5)).toEqual({ x: -5, y: -10 });
    });
  });

  describe('in-place operations', () => {
    it('should add points in place', () => {
      const a = { x: 1, y: 2 };
      const b = { x: 3, y: 4 };
      Point.inPlace.add(a, b);
      expect(a).toEqual({ x: 4, y: 6 });
    });

    it('should subtract points in place', () => {
      const a = { x: 5, y: 8 };
      const b = { x: 2, y: 3 };
      Point.inPlace.sub(a, b);
      expect(a).toEqual({ x: 3, y: 5 });
    });

    it('should multiply points in place', () => {
      const a = { x: 2, y: 3 };
      const b = { x: 4, y: 5 };
      Point.inPlace.mul(a, b);
      expect(a).toEqual({ x: 8, y: 15 });
    });

    it('should divide points in place', () => {
      const a = { x: 10, y: 15 };
      const b = { x: 2, y: 3 };
      if (!Point.isNonZero(b)) fail('Division by zero should not happen here');
      Point.inPlace.div(a, b);
      expect(a).toEqual({ x: 5, y: 5 });
    });

    it('should negate points in place', () => {
      const p = { x: 3, y: -4 };
      Point.inPlace.neg(p);
      expect(p).toEqual({ x: -3, y: 4 });
    });

    it('should scale points in place', () => {
      const p = { x: 2, y: 3 };
      Point.inPlace.scale(p, 2);
      expect(p).toEqual({ x: 4, y: 6 });

      const p2 = { x: 2, y: 3 };
      Point.inPlace.scale(p2, 2, 3);
      expect(p2).toEqual({ x: 4, y: 9 });
    });

    it('should normalize points in place', () => {
      const p = { x: 3, y: 0 };
      if (!Point.isNonZero(p)) fail('Division by zero should not happen here');
      Point.inPlace.normalize(p);
      expect(p).toEqual({ x: 1, y: 0 });

      const p2 = { x: 1, y: 1 };
      if (!Point.isNonZero(p2)) fail('Division by zero should not happen here');
      Point.inPlace.normalize(p2);
      expect(Point.length(p2)).toBeCloseTo(1);
    });

    it('should round points in place', () => {
      const p = { x: 4.34, y: 3.56 };
      Point.inPlace.round(p, 1);
      expect(p).toEqual({ x: 4.3, y: 3.6 });

      const p2 = { x: 2.34, y: 3.56 };
      Point.inPlace.round(p2, 0);
      expect(p2).toEqual({ x: 2, y: 4 });
    });
  });
});
