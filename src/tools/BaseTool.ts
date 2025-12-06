import type { Point, Shape, DrawOverOptions } from "../types";

export abstract class BaseTool {
  protected options: Required<DrawOverOptions>;
  protected startPoint: Point | null = null;
  protected currentElement: SVGElement | null = null;
  protected svg: SVGSVGElement | null = null;

  constructor(options: Required<DrawOverOptions>) {
    this.options = options;
  }

  /**
   * Update tool options
   */
  public updateOptions(options: Required<DrawOverOptions>): void {
    this.options = options;
  }

  /**
   * Called when drawing starts (mouse down)
   */
  public abstract onStart(point: Point, svg: SVGSVGElement): void;

  /**
   * Called during drawing (mouse move)
   */
  public abstract onMove(point: Point): void;

  /**
   * Called when drawing ends (mouse up)
   * Returns the created shape or null if invalid
   */
  public abstract onEnd(point: Point): Shape | null;

  /**
   * Generate a unique ID for shapes
   */
  protected generateId(): string {
    return `shape-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Apply common styles to SVG elements
   */
  protected applyStyles(element: SVGElement): void {
    element.setAttribute("stroke", this.options.strokeColor);
    element.setAttribute("stroke-width", this.options.strokeWidth.toString());
    element.setAttribute("fill", this.options.fillColor);
  }
}

export default BaseTool;
