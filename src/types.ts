export interface Point {
  x: number;
  y: number;
}

export interface DrawOverOptions {
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  zIndex?: number;
}

export type ToolType =
  | "pencil"
  | "line"
  | "arrow"
  | "drumstick"
  | "rectangle"
  | "text";

export interface Shape {
  id: string;
  type: ToolType;
  element: SVGElement;
}
