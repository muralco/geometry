import { Point } from './external-types';
import { Matrix } from './matrix';

function roundPoint({ x, y }: Point) {
  return {
    x: Math.round(x * 128) / 128,
    y: Math.round(y * 128) / 128,
  };
}

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
    const matrix = Matrix.rotation(Math.PI / 2);
    expect(roundPoint(matrix.transform({ x: 100, y: 20 }))).toEqual({
      x: -20,
      y: 100,
    });
  });

  it('should chain transformations', () => {
    const matrix = Matrix.identity()
      .translate({ x: 10, y: 20 })
      .rotate(Math.PI / 2)
      .scale(2);

    expect(roundPoint(matrix.transform({ x: 100, y: 20 }))).toEqual({
      x: -80,
      y: 220,
    });
  });

  it('should inverse a matrix', () => {
    const matrix = Matrix.identity()
      .translate({ x: 10, y: 20 })
      .rotate(Math.PI / 2)
      .scale(2);

    const invertedMatrix = matrix.inverse();

    expect(roundPoint(invertedMatrix.transform({ x: -80, y: 220 }))).toEqual({
      x: 100,
      y: 20,
    });
  });

  it('should create a valid CSS string', () => {
    const matrix = Matrix.translation({ x: 60, y: 20 });
    expect(matrix.toCss()).toEqual('matrix(1, 0, 0, 1, 60, 20)');
  });
});
