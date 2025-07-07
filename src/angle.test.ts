import { Angle } from './angle';

describe('Angle', () => {
  it('fromDegrees converts degrees to radians', () => {
    const angle = Angle.fromDegrees(180);
    expect(angle).toBeCloseTo(Math.PI);
  });

  it('fromRadians returns a valid Angle', () => {
    const angle = Angle.fromRadians(Math.PI);
    expect(angle).toEqual(Math.PI);
  });

  it('toDegrees converts radians to degrees', () => {
    const angle = Angle.fromRadians(Math.PI);
    expect(Angle.toDegrees(angle)).toBeCloseTo(180);
  });

  it('normalize ensures angles are in [0, 2π)', () => {
    const angle = Angle.fromDegrees(370);
    expect(Angle.normalize(angle)).toBeCloseTo(Angle.fromDegrees(10));
  });

  it('normalize handles negative angles', () => {
    const angle = Angle.fromDegrees(-30);
    expect(Angle.normalize(angle)).toBeCloseTo(Angle.fromDegrees(330));
  });

  it('add returns the normalized sum of two angles', () => {
    const a = Angle.fromDegrees(350);
    const b = Angle.fromDegrees(20);
    expect(Angle.add(a, b)).toBeCloseTo(Angle.fromDegrees(10));
  });

  it('sub returns the normalized difference of two angles', () => {
    const a = Angle.fromDegrees(20);
    const b = Angle.fromDegrees(30);
    expect(Angle.sub(a, b)).toBeCloseTo(Angle.fromDegrees(350));
  });
});
