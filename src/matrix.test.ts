import { Radians } from './angle';
import { Matrix } from './matrix';
import { Point } from './point';

describe('Matrix', () => {
  it('should create an identity matrix', () => {
    const matrix = Matrix.identity();
    expect(matrix.transform({ x: 100, y: 20 })).toEqual({ x: 100, y: 20 });
  });

  it('should create a translation matrix', () => {
    const matrix = Matrix.translation({ x: 10, y: 20 });
    expect(matrix.transform({ x: 100, y: 20 })).toEqual({ x: 110, y: 40 });
  });

  it('should create a rotation matrix', () => {
    const matrix = Matrix.rotation(Radians(Math.PI / 2));
    expect(Point.round(matrix.transform({ x: 100, y: 20 }))).toEqual({
      x: -20,
      y: 100,
    });
  });

  it('should chain transformations', () => {
    const matrix = Matrix.identity()
      .translate({ x: 10, y: 20 })
      .rotate(Radians(Math.PI / 2))
      .scale(2);

    expect(Point.round(matrix.transform({ x: 100, y: 20 }))).toEqual({
      x: -80,
      y: 220,
    });
  });

  it('should inverse a matrix', () => {
    const matrix = Matrix.identity()
      .translate({ x: 10, y: 20 })
      .rotate(Radians(Math.PI / 2))
      .scale(2);

    const invertedMatrix = matrix.inverse();

    expect(Point.round(invertedMatrix.transform({ x: -80, y: 220 }))).toEqual({
      x: 100,
      y: 20,
    });
  });

  it('should create a valid CSS string', () => {
    const matrix = Matrix.translation({ x: 60, y: 20 });
    expect(matrix.toCss()).toEqual('matrix(1, 0, 0, 1, 60, 20)');
  });

  describe('isTranslationOf', () => {
    it('should return true for equal matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = Matrix.identity();

      // no rotation or scaling, translation by (0, 0)
      expect(matrix1.isTranslationOf(matrix2)).toBe(true);
    });

    it('should return true for translated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = Matrix.translation({ x: 10, y: 20 });

      expect(matrix1.isTranslationOf(matrix2)).toBe(true);
    });

    it('should return false for scaled matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.scale(2, 2);

      expect(matrix1.isTranslationOf(matrix2)).toBe(false);
    });

    it('should return false for rotated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.rotate(Radians(Math.PI / 4));

      expect(matrix1.isTranslationOf(matrix2)).toBe(false);
    });

    it('should return false for rotated and translated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1
        .rotate(Radians(Math.PI / 4))
        .translate({ x: 10, y: 20 });

      expect(matrix1.isTranslationOf(matrix2)).toBe(false);
    });

    it('should return false for scaled and translated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.scale(2, 2).translate({ x: 10, y: 20 });

      expect(matrix1.isTranslationOf(matrix2)).toBe(false);
    });
  });

  describe('hasRotation', () => {
    it('should return false for equal matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = Matrix.identity();

      expect(matrix1.hasRotation(matrix2)).toBe(false);
    });

    it('should return false for translated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.translate({ x: 10, y: 20 });

      expect(matrix1.hasRotation(matrix2)).toBe(false);
    });

    it('should return false for scaled matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.scale(2, 2);

      expect(matrix1.hasRotation(matrix2)).toBe(false);
    });

    it('should return false for non-proportionally scaled matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.scale(2, 4);

      expect(matrix1.hasRotation(matrix2)).toBe(false);
    });

    it('should return false for non-integer scaled matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.scale(Math.PI, Math.E);

      expect(matrix1.hasRotation(matrix2)).toBe(false);
    });

    it('should return false for negative scaled matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.scale(2, -1);

      expect(matrix1.hasRotation(matrix2)).toBe(false);
    });

    it('should return false for scaled and translated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.scale(2, 2).translate({ x: 10, y: 5 });

      expect(matrix1.hasRotation(matrix2)).toBe(false);
    });

    it('should return true for rotated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.rotate(Radians(Math.PI / 3));

      expect(matrix1.hasRotation(matrix2)).toBe(true);
    });

    it('should return true for slightly rotated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.rotate(Radians(Math.PI / 100));

      expect(matrix1.hasRotation(matrix2)).toBe(true);
    });

    it('should return true for rotated and scaled matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.rotate(Radians(Math.PI / 5)).scale(0.1, 0.7);

      expect(matrix1.hasRotation(matrix2)).toBe(true);
    });
  });

  describe('hasScaling', () => {
    it('should return false for equal matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = Matrix.identity();

      expect(matrix1.hasScaling(matrix2)).toBe(false);
    });

    it('should return false for translated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.translate({ x: 10, y: 20 });

      expect(matrix1.hasScaling(matrix2)).toBe(false);
    });

    it('should return false for rotated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.rotate(Radians(Math.PI / 4));

      expect(matrix1.hasScaling(matrix2)).toBe(false);
    });

    it('should return false for rotated and translated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1
        .rotate(Radians(Math.PI / 5))
        .translate({ x: 10, y: 5 });

      expect(matrix1.hasScaling(matrix2)).toBe(false);
    });

    it('should return true for scaled matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.scale(2, 2);

      expect(matrix1.hasScaling(matrix2)).toBe(true);
    });

    it('should return true for non-proportionally scaled matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.scale(2, 4);

      expect(matrix1.hasScaling(matrix2)).toBe(true);
    });

    it('should return true for negative scaled matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.scale(2, -1);

      expect(matrix1.hasScaling(matrix2)).toBe(true);
    });

    it('should return true for scaled and translated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.scale(2, 2).translate({ x: 10, y: 5 });

      expect(matrix1.hasScaling(matrix2)).toBe(true);
    });
  });

  describe('hasTranslation', () => {
    it('should return false for equal matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = Matrix.identity();

      expect(matrix1.hasTranslation(matrix2)).toBe(false);
    });

    it('should return true for translated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.translate({ x: 10, y: 20 });

      expect(matrix1.hasTranslation(matrix2)).toBe(true);
    });

    it('should return false for rotated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.rotate(Radians(Math.PI / 4));

      expect(matrix1.hasTranslation(matrix2)).toBe(false);
    });

    it('should return true for scaled and translated matrices', () => {
      const matrix1 = Matrix.identity();
      const matrix2 = matrix1.scale(2, 2).translate({ x: 10, y: 5 });

      expect(matrix1.hasTranslation(matrix2)).toBe(true);
    });
  });
});
