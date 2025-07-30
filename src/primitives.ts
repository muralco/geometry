export type Bbox = {
  x: number;
  x1: number;
  y: number;
  y1: number;
};

export type Size = {
  height: number;
  width: number;
};

export interface Rect extends Size {
  left: number;
  top: number;
}
