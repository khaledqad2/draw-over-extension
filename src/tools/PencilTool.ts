import { BaseTool } from "./BaseTool";
import type { Point, Shape } from "../types";

export class PencilTool extends BaseTool {
  private points: Point[] = [];
  private pathElement: SVGPathElement | null = null;

  public onStart(point: Point, svg: SVGSVGElement): void {
    this.startPoint = point;
    this.svg = svg;
    this.points = [point];

    // Create path element for smooth curves
    this.pathElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    this.pathElement.setAttribute("d", `M ${point.x} ${point.y}`);
    this.pathElement.setAttribute("fill", "none");

    this.applyStyles(this.pathElement);

    // Add line cap and join for smoother drawing
    this.pathElement.setAttribute("stroke-linecap", "round");
    this.pathElement.setAttribute("stroke-linejoin", "round");

    svg.appendChild(this.pathElement);
    this.currentElement = this.pathElement;
  }

  public onMove(point: Point): void {
    if (!this.pathElement || !this.points.length) return;

    // Add point to the path
    this.points.push(point);

    // Update path with smooth curves
    const pathData = this.createSmoothPath(this.points);
    this.pathElement.setAttribute("d", pathData);
  }

  public onEnd(point: Point): Shape | null {
    if (!this.currentElement || !this.startPoint || this.points.length < 2) {
      // Remove the element if path is too short
      if (this.currentElement && this.currentElement.parentNode) {
        this.currentElement.parentNode.removeChild(this.currentElement);
      }
      this.currentElement = null;
      this.pathElement = null;
      this.startPoint = null;
      this.points = [];
      return null;
    }

    // Add final point
    this.points.push(point);
    const pathData = this.createSmoothPath(this.points);
    this.pathElement!.setAttribute("d", pathData);

    const shape: Shape = {
      id: this.generateId(),
      type: "pencil",
      element: this.currentElement,
    };

    this.currentElement.setAttribute("data-shape-id", shape.id);

    // Reset
    this.currentElement = null;
    this.pathElement = null;
    this.startPoint = null;
    this.points = [];

    return shape;
  }

  /**
   * Create a smooth path using quadratic curves
   * This makes the drawing look more natural
   */
  private createSmoothPath(points: Point[]): string {
    if (points.length < 2) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    // Use quadratic curves for smooth drawing
    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];

      // Control point is the current point
      // End point is the midpoint between current and next
      const endX = (current.x + next.x) / 2;
      const endY = (current.y + next.y) / 2;

      path += ` Q ${current.x} ${current.y}, ${endX} ${endY}`;
    }

    // Add the last point
    const last = points[points.length - 1];
    const secondLast = points[points.length - 2];
    path += ` Q ${secondLast.x} ${secondLast.y}, ${last.x} ${last.y}`;

    return path;
  }

  /**
   * Simplify path by removing redundant points (optional optimization)
   * This can be used to reduce the number of points for performance
   */
  // private simplifyPoints(points: Point[], tolerance: number = 2): Point[] {
  //   if (points.length < 3) return points;

  //   const simplified: Point[] = [points[0]];

  //   for (let i = 1; i < points.length - 1; i++) {
  //     const prev = simplified[simplified.length - 1];
  //     const current = points[i];

  //     // Calculate distance from previous point
  //     const dx = current.x - prev.x;
  //     const dy = current.y - prev.y;
  //     const distance = Math.sqrt(dx * dx + dy * dy);

  //     // Only add point if it's far enough from the previous one
  //     if (distance > tolerance) {
  //       simplified.push(current);
  //     }
  //   }

  //   // Always include the last point
  //   simplified.push(points[points.length - 1]);

  //   return simplified;
  // }
}

export default PencilTool;
