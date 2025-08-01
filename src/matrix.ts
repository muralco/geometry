import { Radians } from './angle';
import { Point } from './point';

const TRANSFORM_DETECTION_PRECISION = 4;

/**
 * 2D transformation matrix.
 *
 * It's a convenient way to represent a series of transformations
 * (translation, rotation, scaling) made in different orders.
 *
 * For example for rotation around origin this matrix can be used:
 * ```
 * const matrix = Matrix
 *    .translation(Point.neg(origin)) // move origin to (0, 0)
 *    .rotate(theta) // rotation around (0, 0)
 *    .translate(origin); // move origin back to its original position
 *
 * const rotatedPoints = myPoints.map(p => matrix.transform(p));
 * ```
 */
export class Matrix {
  /**
   * 6-element array representing a 3x3 matrix in column-major order.
   * The last row is always [0, 0, 1], so we only need to store the first 6 elements.
   * Affine matrix:
   * [ a, c, e ]
   * [ b, d, f ]
   * [ 0, 0, 1 ]
   */
  private readonly data: Float32Array;

  /**
   * Use static methods to create a new matrix.
   */
  private constructor(data: Float32Array) {
    this.data = data;
  }

  /**
   * Apply the matrix to a point.
   */
  transform({ x, y }: Point): Point {
    const m = this.data;
    return {
      x: m[0] * x + m[2] * y + m[4],
      y: m[1] * x + m[3] * y + m[5],
    };
  }

  /**
   * Combine two transformation matrices.
   * It's similar to `then` method, but argument order is reversed.
   */
  multiply(matrix: Matrix): Matrix {
    const m1 = this.data;
    const m2 = matrix.data;

    const a = m1[0] * m2[0] + m1[2] * m2[1];
    const b = m1[1] * m2[0] + m1[3] * m2[1];
    const c = m1[0] * m2[2] + m1[2] * m2[3];
    const d = m1[1] * m2[2] + m1[3] * m2[3];
    const e = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
    const f = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];

    return new Matrix(new Float32Array([a, b, c, d, e, f]));
  }

  /**
   * Apply next transformation to the current matrix.
   * This is a convenience method to chain transformations.
   */
  then(matrix: Matrix): Matrix {
    return matrix.multiply(this);
  }

  /**
   * Create rotation matrix and multiply it with the current matrix.
   */
  rotate(angle: Radians): Matrix {
    if (angle === 0) return this;
    return this.then(Matrix.rotation(angle));
  }

  /**
   * Create a rotation matrix around a specific pivot point, and multiply it with
   * current matrix
   */
  rotateAround(angle: Radians, pivot: Point): Matrix {
    if (angle === 0) return this;
    if (Point.equals(pivot, Point.zero())) return this.rotate(angle);

    return this.then(Matrix.translation(Point.scale(pivot, -1)))
      .then(Matrix.rotation(angle))
      .then(Matrix.translation(pivot));
  }

  /**
   * Create translation matrix and multiply it with the current matrix.
   */
  translate(delta: Point): Matrix {
    if (delta.x === 0 && delta.y === 0) return this;

    const data = new Float32Array(this.data);

    data[4] += delta.x;
    data[5] += delta.y;

    return new Matrix(data);
  }

  /**
   * Create scaling matrix and multiply it with the current matrix.
   */
  scale(sx: number, sy?: number): Matrix;
  scale(factor: number | Point): Matrix;
  scale(factor: number | Point, _sy?: number): Matrix {
    if (_sy !== undefined) {
      factor = { x: factor as number, y: _sy };
    } else if (typeof factor === 'number') {
      factor = { x: factor, y: factor };
    }

    if (Point.equals(factor, { x: 1, y: 1 })) return this;

    return this.then(Matrix.scaling(factor));
  }

  /**
   * Create scaling matrix around a specific pivot point, and multiply
   * it with the current matrix.
   */
  scaleAround(factor: Point | number, pivot: Point): Matrix {
    if (typeof factor === 'number') {
      factor = { x: factor, y: factor };
    }

    if (Point.equals(factor, { x: 1, y: 1 })) return this;
    if (Point.equals(pivot, Point.zero())) return this.scale(factor);

    return this.then(Matrix.translation(Point.scale(pivot, -1)))
      .then(Matrix.scaling(factor))
      .then(Matrix.translation(pivot));
  }

  private det() {
    const m = this.data;
    return m[0] * m[3] - m[1] * m[2];
  }

  /**
   * Calculate the inverse of the matrix.
   *
   * The inverse matrix does an opposite transformation to the original matrix.
   * For example, if the original matrix translates a point by (tx, ty),
   * the inverse matrix translates it back by (-tx, -ty).
   */
  inverse(): Matrix {
    const m = this.data;
    const idet = 1.0 / this.det();
    const a = m[0];
    const b = m[1];
    const c = m[2];
    const d = m[3];
    const e = m[4];
    const f = m[5];

    return new Matrix(
      new Float32Array([
        d * idet,
        -b * idet,
        -c * idet,
        a * idet,
        (c * f - d * e) * idet,
        (b * e - a * f) * idet,
      ]),
    );
  }

  /**
   * Returns true, if the other matrix is a translated version of this matrix.
   * Scaling and rotation should be the same as the original matrix.
   */
  isTranslationOf(other: Matrix): boolean {
    const m0 = this.data;
    const m1 = other.data;
    return (
      m0[0] === m1[0] && m0[1] === m1[1] && m0[2] === m1[2] && m0[3] === m1[3]
    );
  }

  /**
   * Returns true if there is translation in the matrix.
   * Scaling and rotation are not considered.
   */
  hasTranslation(
    other: Matrix,
    precision = TRANSFORM_DETECTION_PRECISION,
  ): boolean {
    const m0 = this.data;
    const m1 = other.data;

    const multiplier = 10 ** precision;

    return (
      Math.round((m0[4] - m1[4]) * multiplier) !== 0 ||
      Math.round((m0[5] - m1[5]) * multiplier) !== 0
    );
  }

  /**
   * Returns true if there is no skewing or rotation in the matrix.
   */
  hasRotation(
    other: Matrix,
    precision = TRANSFORM_DETECTION_PRECISION,
  ): boolean {
    if (this.isTranslationOf(other)) return false;

    const m0 = this.data;
    const m1 = other.data;

    const tanX =
      (m0[0] * m1[2] - m0[2] * m1[0]) / (m0[0] * m1[0] + m0[2] * m1[2]);
    const tanY =
      (m0[1] * m1[3] - m0[3] * m1[1]) / (m0[1] * m1[1] + m0[3] * m1[3]);

    const multiplier = 10 ** precision;

    return (
      Math.round(tanX * multiplier) !== 0 || Math.round(tanY * multiplier) !== 0
    );
  }

  /**
   * Returns true if there is scaling in the matrix.
   */
  hasScaling(
    other: Matrix,
    precision = TRANSFORM_DETECTION_PRECISION,
  ): boolean {
    const m0 = this.data;
    const m1 = other.data;

    // originalXVectorLength2 / transformedXVectorLength2
    const scaleX =
      (m0[0] * m0[0] + m0[2] * m0[2]) / (m1[0] * m1[0] + m1[2] * m1[2]);

    // originalYVectorLength2 / transformedYVectorLength2
    const scaleY =
      (m0[1] * m0[1] + m0[3] * m0[3]) / (m1[1] * m1[1] + m1[3] * m1[3]);

    const multiplier = 10 ** precision;

    return (
      Math.round((1 - scaleX) * multiplier) !== 0 ||
      Math.round((1 - scaleY) * multiplier) !== 0
    );
  }

  /**
   * Checks if two matrices are equal.
   */
  equals(other: Matrix): boolean {
    const m0 = this.data;
    const m1 = other.data;
    return (
      m0[0] === m1[0] &&
      m0[1] === m1[1] &&
      m0[2] === m1[2] &&
      m0[3] === m1[3] &&
      m0[4] === m1[4] &&
      m0[5] === m1[5]
    );
  }

  toString(): string {
    const [a, b, c, d, e, f] = this.data;
    return `[[${a}, ${c}, ${e}], [${b}, ${d}, ${f}], [0, 0, 1]]`;
  }

  /**
   * Returns a CSS string representation of the matrix.
   * Don't forget to use `transform-origin` to set the origin of the transformation.
   */
  toCss(): string {
    const [a, b, c, d, e, f] = this.data;
    return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;
  }

  /**
   * Returns a copy of the underlying matrix data, in column-major order.
   *
   * @see {data}
   * @returns [a, b, c, d, e, f];
   */
  toRaw(): Float32Array {
    return new Float32Array(this.data);
  }

  /**
   * Creates an identity matrix. It does not perform any transformations.
   * Can be used as a base for further transformations.
   */
  static identity(): Matrix {
    return new Matrix(new Float32Array([1, 0, 0, 1, 0, 0]));
  }

  /**
   * Creates a translation matrix.
   */
  static translation({ x, y }: Point): Matrix {
    return new Matrix(new Float32Array([1, 0, 0, 1, x, y]));
  }

  /**
   * Create a rotation around the (0, 0) matrix.
   */
  static rotation(angle: Radians): Matrix {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Matrix(new Float32Array([cos, sin, -sin, cos, 0, 0]));
  }

  /**
   * Creates a scaling matrix.
   */
  static scaling(sx: number, sy?: number): Matrix;
  static scaling(factor: Point | number): Matrix;
  static scaling(factor: Point | number, _sy?: number): Matrix {
    if (_sy !== undefined) {
      factor = { x: factor as number, y: _sy };
    } else if (typeof factor === 'number') {
      factor = { x: factor, y: factor };
    }

    return new Matrix(new Float32Array([factor.x, 0, 0, factor.y, 0, 0]));
  }
}
