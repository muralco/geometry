/**
 * Widget Oriented Bounding Box
 * Representation of a Widget coordinate system inside Mural
 */
export type WidgetObb = {
  size: { height: number; width: number };
  space: { cosR: number; origin: { x: number; y: number }; sinR: number }[];
};
