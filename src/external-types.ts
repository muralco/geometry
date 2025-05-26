// TODO: We should be using `EngineBbox` here but it's not possible to import it
export type Bbox = {
  x: number;
  x1: number;
  y: number;
  y1: number;
};

// TODO: Move 'Size' to this package from '@muralco/types'
export type Size = {
  height: number;
  width: number;
};
