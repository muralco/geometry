# Geometry Primitives

This package provides essential geometric primitives and utilities for 2D graphics and spatial calculations in Mural applications.

## Available Primitives

### Point

A basic interface representing a point or vector in 2D space with `x` and `y` coordinates.

For points we use POJO like `{ x: 0, y: 0 }` to make it easy to serialize/deserialize it.
Use namespace syntax to access points methods (`Point.add(p1, { x: dx, y: dy })`).

Other geometry primitives like `Aabb` and `Obb` are regular JS classes.

```typescript
import { Point } from '@muralco/geometry';

// Example usage
const { add, scale, fromSize } = Point;
const center = add(leftTop, scale(fromSize(size), 0.5));
```

The `Point` namespace provides numerous utility functions for vector operations, including:
- Vector arithmetic (`add`, `sub`, `mul`, etc.)
- Normalization and scaling
- Distance and length calculations

### Matrix

A 2D transformation matrix for representing and combining translations, rotations, and scaling.

```typescript
import { Matrix } from '@muralco/geometry';

// Rotation around a specific point
const matrix = Matrix.identity()
  .translate(Point.neg(origin))
  .rotate(angleInRadians)
  .translate(origin);

const transformedPoint = matrix.transform(myPoint);
```

### Aabb (Axis-Aligned Bounding Box)

A rectangle defined by minimum and maximum X/Y coordinates, always aligned to the coordinate axes.

```typescript
import { Aabb } from '@muralco/geometry';

// Create from points
const bounds = Aabb.fromPoints([point1, point2, point3]);

// Check if a point is inside
if (bounds.includesPoint(somePoint)) {
  // Point is inside the bounding box
}
```

### Obb (Oriented Bounding Box)

A rectangle with arbitrary orientation, defined by a size and a transformation matrix.

```typescript
import { Obb } from '@muralco/geometry';

// Create an OBB
const obb = new Obb(
  { width: 100, height: 50 },
  Matrix.rotation(Math.PI / 4) // 45 degrees rotation
);

// Map points between spaces
const globalPoint = obb.mapToGlobal(localPoint);
```

### Angle

Angle is a tagged number type representing angles in radians.
It provides utility functions for angle arithmetic and conversions.

```typescript
import { Angle } from '@muralco/geometry';

// Create an angle
const angle = Angle.fromDegrees(90);

// Convert to radians
const radians = Angle.toRadians(angle);
const degrees = Angle.toDegrees(angle);

// Normalize to [0, 2π)
const normalizedAngle = Angle.normalize(angle);
```

