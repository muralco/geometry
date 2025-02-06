import { BoundingBox } from './bounding-box';

describe('BoundingBox', () => {
  it('should create a valid bounding box from points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 3 },
      { x: -2, y: 2 },
    ];
    const bounds = BoundingBox.fromPoints(points);
    expect(bounds).toEqual({ maxX: 1, maxY: 3, minX: -2, minY: 0 });
  });

  it('should create a valid bounding box from a rectangle', () => {
    const rect = { height: 3, left: -2, top: 0, width: 3 };
    const bounds = BoundingBox.fromRect(rect);
    expect(bounds).toEqual({ maxX: 1, maxY: 3, minX: -2, minY: 0 });
  });

  it('should convert a bounding box to a rectangle', () => {
    const bounds = { maxX: 1, maxY: 3, minX: -2, minY: 0 };
    const rect = BoundingBox.toRect(bounds);
    expect(rect).toEqual({ height: 3, left: -2, top: 0, width: 3 });
  });

  it('should check if a bounding box is empty', () => {
    const bounds1 = { maxX: -1, maxY: 0, minX: 1, minY: 0 };
    const bounds2 = BoundingBox.empty();

    expect(BoundingBox.isEmpty(bounds1)).toBe(true);
    expect(BoundingBox.isEmpty(bounds2)).toBe(true);
  });

  it('should check if bounding box is not empty', () => {
    const bounds = { maxX: 1, maxY: 3, minX: -2, minY: 0 };
    expect(BoundingBox.isEmpty(bounds)).toBe(false);
  });

  it('should add point to bounds', () => {
    const bounds = { maxX: 2, maxY: 3, minX: 1, minY: 0 };
    const point = { x: 3, y: -4 };
    const newBounds = BoundingBox.addPoint(bounds, point);
    expect(newBounds).toEqual({ maxX: 3, maxY: 3, minX: 1, minY: -4 });
  });

  it('should create a bounds union', () => {
    const bounds1 = { maxX: 1, maxY: 3, minX: -2, minY: 0 };
    const bounds2 = { maxX: 5, maxY: 4, minX: 2, minY: 1 };
    const bounds3 = BoundingBox.empty();
    const bounds = BoundingBox.union(bounds1, bounds2, bounds3);
    expect(bounds).toEqual({ maxX: 5, maxY: 4, minX: -2, minY: 0 });
  });

  it('should check if point is inside of the bounds', () => {
    const bounds = { maxX: 5, maxY: 5, minX: 0, minY: 0 };
    const pointInside = { x: 2, y: 2 };
    const pointOutside = { x: 6, y: 6 };
    expect(BoundingBox.includesPoint(bounds, pointInside)).toBe(true);
    expect(BoundingBox.includesPoint(bounds, pointOutside)).toBe(false);
  });

  it('should check if bounds are included in other bounds', () => {
    const parent = { maxX: 5, maxY: 5, minX: 0, minY: 0 };
    const child = { maxX: 4, maxY: 4, minX: 1, minY: 1 };
    const notIncluded = { maxX: 6, maxY: 6, minX: 2, minY: 2 };
    expect(BoundingBox.includesBounds(parent, child)).toBe(true);
    expect(BoundingBox.includesBounds(parent, notIncluded)).toBe(false);
  });

  it('should round bounds', () => {
    const bounds = { maxX: 1.554, maxY: 3.556, minX: -2.055, minY: 0.563 };
    const roundedBounds = BoundingBox.round(bounds, 1);
    expect(roundedBounds).toEqual({
      maxX: 1.6,
      maxY: 3.6,
      minX: -2.1,
      minY: 0.5,
    });
  });

  it('should expand bounds', () => {
    const bounds = { maxX: 1, maxY: 3, minX: -2, minY: 0 };
    const expandedBounds = BoundingBox.expand(bounds, 1);
    expect(expandedBounds).toEqual({ maxX: 2, maxY: 4, minX: -3, minY: -1 });
  });
});
