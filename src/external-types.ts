// TODO: Move 'Point' to this package from '@muralco/api/widgets'
export type Point = { x: number; y: number };

// TODO: We should be using `EngineBbox` here but it's not possible to import it
export type Bbox = {
  x: number;
  x1: number;
  y: number;
  y1: number;
};
