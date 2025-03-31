import { Aabb } from './aabb';

describe('Aabb', () => {
  it('should create a valid bounding box from points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 3 },
      { x: -2, y: 2 },
    ];
    const bounds = Aabb.fromPoints(points);
    expect(bounds).toEqual({ maxX: 1, maxY: 3, minX: -2, minY: 0 });
  });

  it('should create a valid bounding box from a rectangle', () => {
    const rect = { height: 3, left: -2, top: 0, width: 3 };
    const bounds = Aabb.fromRect(rect);
    expect(bounds).toEqual({ maxX: 1, maxY: 3, minX: -2, minY: 0 });
  });

  it('should convert a bounding box to a rectangle', () => {
    const bounds = Aabb.fromJSON({ maxX: 1, maxY: 3, minX: -2, minY: 0 });
    const rect = bounds.toRect();
    expect(rect).toEqual({ height: 3, left: -2, top: 0, width: 3 });
  });

  it('should check if a bounding box is empty', () => {
    const bounds1 = Aabb.fromJSON({ maxX: -1, maxY: 0, minX: 1, minY: 0 });
    const bounds2 = Aabb.empty();

    expect(bounds1.isEmpty()).toBe(true);
    expect(bounds2.isEmpty()).toBe(true);
  });

  it('should check if bounding box is not empty', () => {
    const bounds = Aabb.fromJSON({ maxX: 1, maxY: 3, minX: -2, minY: 0 });
    expect(bounds.isEmpty()).toBe(false);
  });

  it('should add point to bounds', () => {
    const bounds = Aabb.fromJSON({ maxX: 2, maxY: 3, minX: 1, minY: 0 });
    const point = { x: 3, y: -4 };
    const newBounds = bounds.addPoint(point);
    expect(newBounds).toEqual({ maxX: 3, maxY: 3, minX: 1, minY: -4 });
    expect(newBounds).not.toBe(bounds);
  });

  it('should create a bounds union', () => {
    const bounds1 = Aabb.fromJSON({ maxX: 1, maxY: 3, minX: -2, minY: 0 });
    const bounds2 = Aabb.fromJSON({ maxX: 5, maxY: 4, minX: 2, minY: 1 });
    const bounds3 = Aabb.empty();
    const bounds = Aabb.union(bounds1, bounds2, bounds3);
    expect(bounds).toEqual(
      Aabb.fromJSON({ maxX: 5, maxY: 4, minX: -2, minY: 0 }),
    );
  });

  it('should check if point is inside of the bounds', () => {
    const bounds = Aabb.fromJSON({ maxX: 5, maxY: 5, minX: 0, minY: 0 });
    const pointInside = { x: 2, y: 2 };
    const pointOutside = { x: 6, y: 6 };
    expect(bounds.includesPoint(pointInside)).toBe(true);
    expect(bounds.includesPoint(pointOutside)).toBe(false);
  });

  it('should check if bounds are included in other bounds', () => {
    const parent = Aabb.fromJSON({ maxX: 5, maxY: 5, minX: 0, minY: 0 });
    const child = Aabb.fromJSON({ maxX: 4, maxY: 4, minX: 1, minY: 1 });
    const notIncluded = Aabb.fromJSON({ maxX: 6, maxY: 6, minX: 2, minY: 2 });
    expect(parent.includes(child)).toBe(true);
    expect(parent.includes(notIncluded)).toBe(false);
  });

  it('should round bounds', () => {
    const bounds = Aabb.fromJSON({
      maxX: 1.554,
      maxY: 3.556,
      minX: -2.055,
      minY: 0.563,
    });
    const roundedBounds = bounds.round(1);
    expect(roundedBounds).toEqual(
      Aabb.fromJSON({
        maxX: 1.6,
        maxY: 3.6,
        minX: -2.1,
        minY: 0.5,
      }),
    );
  });

  it('should expand bounds', () => {
    const bounds = Aabb.fromJSON({ maxX: 1, maxY: 3, minX: -2, minY: 0 });
    const expandedBounds = bounds.expand(1);
    expect(expandedBounds).toEqual(
      Aabb.fromJSON({ maxX: 2, maxY: 4, minX: -3, minY: -1 }),
    );
  });

  it('should compute intersection', () => {
    const b1 = Aabb.fromLtwh(10, 10, 100, 100);
    const b2 = Aabb.fromLtwh(50, 50, 100, 100);
    expect(Aabb.intersection(b1, b2)).toEqual(Aabb.fromLtrb(50, 50, 110, 110));
  });

  it('compute intersection of non-overlapping bounds', () => {
    const b1 = Aabb.fromLtwh(10, 10, 100, 100);
    const b2 = Aabb.fromLtwh(200, 200, 100, 100);
    expect(Aabb.intersection(b1, b2).isEmpty()).toBe(true);
    expect(b1.intersection(b2).isEmpty()).toBe(true);
    expect(b1.intersects(b2)).toBe(false);
  });

  it('should translate bounds', () => {
    const bounds = Aabb.fromJSON({ maxX: 1, maxY: 3, minX: -2, minY: 0 });
    const translatedBounds = bounds.translate({ x: 1, y: 2 });
    expect(translatedBounds).toEqual(
      Aabb.fromJSON({ maxX: 2, maxY: 5, minX: -1, minY: 2 }),
    );
  });

  it('should scale bounds', () => {
    const bounds = Aabb.fromJSON({ maxX: 1, maxY: 3, minX: -2, minY: 0 });
    const scaledBounds = bounds.scale(2);
    expect(scaledBounds).toEqual(
      Aabb.fromJSON({ maxX: 2, maxY: 6, minX: -4, minY: 0 }),
    );
  });

  it('should scale with provided origin', () => {
    const bounds = Aabb.fromJSON({ maxX: 1, maxY: 3, minX: -2, minY: 0 });
    const scaledBounds = bounds.scale(2, { x: 1, y: 1 });
    expect(scaledBounds).toEqual(
      Aabb.fromJSON({ maxX: 1, maxY: 5, minX: -5, minY: -1 }),
    );
  });

  it('should return valid point at normalized coordinates', () => {
    const bounds = Aabb.fromJSON({ maxX: 1, maxY: 3, minX: -2, minY: 0 });
    expect(bounds.pointAt({ x: 0.5, y: 0.5 })).toEqual({ x: -0.5, y: 1.5 });
    expect(bounds.pointAt({ x: 0, y: 0 })).toEqual({ x: -2, y: 0 });
    expect(bounds.pointAt({ x: -1, y: 2 })).toEqual({ x: -5, y: 6 });
  });
});
