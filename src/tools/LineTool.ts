import { BaseTool } from "./BaseTool";
import type { Point, Shape } from "../types";

export class LineTool extends BaseTool {
  public onStart(point: Point, svg: SVGSVGElement): void {
    this.startPoint = point;
    this.svg = svg;

    // Create line element
    this.currentElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    this.currentElement.setAttribute("x1", point.x.toString());
    this.currentElement.setAttribute("y1", point.y.toString());
    this.currentElement.setAttribute("x2", point.x.toString());
    this.currentElement.setAttribute("y2", point.y.toString());

    this.applyStyles(this.currentElement);

    svg.appendChild(this.currentElement);
  }

  public onMove(point: Point): void {
    if (!this.currentElement) return;

    this.currentElement.setAttribute("x2", point.x.toString());
    this.currentElement.setAttribute("y2", point.y.toString());
  }

  public onEnd(point: Point): Shape | null {
    if (!this.currentElement || !this.startPoint) return null;

    // Check if line has minimum length (avoid accidental dots)
    const dx = point.x - this.startPoint.x;
    const dy = point.y - this.startPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < 5) {
      // Remove the element if too short
      if (this.currentElement.parentNode) {
        this.currentElement.parentNode.removeChild(this.currentElement);
      }
      this.currentElement = null;
      this.startPoint = null;
      return null;
    }

    const shape: Shape = {
      id: this.generateId(),
      type: "line",
      element: this.currentElement,
    };

    this.currentElement.setAttribute("data-shape-id", shape.id);
    this.currentElement = null;
    this.startPoint = null;

    return shape;
  }
}

export default LineTool;
