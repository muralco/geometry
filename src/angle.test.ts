import { Radians, Degrees } from './angle';

describe('Angle', () => {
  describe('Radians', () => {
    it('fromDegrees converts degrees to radians', () => {
      const angle = Radians.fromDegrees(180);
      expect(angle).toBeCloseTo(Math.PI);
    });

    it('Radians(v) returns a valid angle', () => {
      const angle = Radians(Math.PI);
      expect(angle).toEqual(Math.PI);
    });

    it('toDegrees converts radians to degrees', () => {
      const angle = Radians(Math.PI);
      expect(Radians.toDegrees(angle)).toBeCloseTo(180);
    });

    it('normalize ensures angles are in [0, 2π)', () => {
      const angle = Radians.fromDegrees(370);
      expect(Radians.normalize(angle)).toBeCloseTo(Radians.fromDegrees(10));
    });

    it('normalize handles negative angles', () => {
      const angle = Radians.fromDegrees(-30);
      expect(Radians.normalize(angle)).toBeCloseTo(Radians.fromDegrees(330));
    });

    it('add returns the normalized sum of two angles', () => {
      const a = Radians.fromDegrees(350);
      const b = Radians.fromDegrees(20);
      expect(Radians.add(a, b)).toBeCloseTo(Radians.fromDegrees(10));
    });

    it('sub returns the normalized difference of two angles', () => {
      const a = Radians.fromDegrees(20);
      const b = Radians.fromDegrees(30);
      expect(Radians.sub(a, b)).toBeCloseTo(Radians.fromDegrees(350));
    });
  });

  describe('Degrees', () => {
    it('fromRadians converts radians to degrees', () => {
      const angle = Degrees.fromRadians(Math.PI);
      expect(angle).toBeCloseTo(180);
    });

    it('toRadians converts degrees to radians', () => {
      const rad = Degrees.toRadians(Degrees(180));
      expect(rad).toBeCloseTo(Math.PI);
    });

    it('normalize ensures angles are in [0, 360)', () => {
      const angle = Degrees.normalize(Degrees(370));
      expect(angle).toBeCloseTo(Degrees(10));
    });

    it('add returns the normalized sum of two angles', () => {
      const a = Degrees(350);
      const b = Degrees(20);
      expect(Degrees.add(a, b)).toBeCloseTo(Degrees(10));
    });

    it('sub returns the normalized difference of two angles', () => {
      const a = Degrees(20);
      const b = Degrees(30);
      expect(Degrees.sub(a, b)).toBeCloseTo(Degrees(350));
    });
  });
});
