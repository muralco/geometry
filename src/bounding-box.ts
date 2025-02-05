import { Rect } from '@muralco/types';

export interface BoundingBox {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
}

export namespace BoundingBox {
  export function toRect({ maxX, maxY, minX, minY }: BoundingBox): Rect {
    return {
      height: maxY - minY,
      left: minX,
      top: minY,
      width: maxX - minX,
    };
  }
}
