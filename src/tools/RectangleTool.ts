import { BaseTool } from "./BaseTool";
import type { Point, Shape } from "../types";

export class RectangleTool extends BaseTool {
  public onStart(point: Point, svg: SVGSVGElement): void {
    this.startPoint = point;
    this.svg = svg;

    // Create rectangle element
    this.currentElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    this.currentElement.setAttribute("x", point.x.toString());
    this.currentElement.setAttribute("y", point.y.toString());
    this.currentElement.setAttribute("width", "0");
    this.currentElement.setAttribute("height", "0");

    this.applyStyles(this.currentElement);

    svg.appendChild(this.currentElement);
  }

  public onMove(point: Point): void {
    if (!this.currentElement || !this.startPoint) return;

    // Calculate rectangle dimensions
    const width = point.x - this.startPoint.x;
    const height = point.y - this.startPoint.y;

    // Handle negative dimensions (drawing from right to left or bottom to top)
    if (width < 0) {
      this.currentElement.setAttribute("x", point.x.toString());
      this.currentElement.setAttribute("width", Math.abs(width).toString());
    } else {
      this.currentElement.setAttribute("x", this.startPoint.x.toString());
      this.currentElement.setAttribute("width", width.toString());
    }

    if (height < 0) {
      this.currentElement.setAttribute("y", point.y.toString());
      this.currentElement.setAttribute("height", Math.abs(height).toString());
    } else {
      this.currentElement.setAttribute("y", this.startPoint.y.toString());
      this.currentElement.setAttribute("height", height.toString());
    }
  }

  public onEnd(point: Point): Shape | null {
    if (!this.currentElement || !this.startPoint) return null;

    // Check if rectangle has minimum size
    const width = Math.abs(point.x - this.startPoint.x);
    const height = Math.abs(point.y - this.startPoint.y);

    if (width < 5 || height < 5) {
      // Remove the element if too small
      if (this.currentElement.parentNode) {
        this.currentElement.parentNode.removeChild(this.currentElement);
      }
      this.currentElement = null;
      this.startPoint = null;
      return null;
    }

    const shape: Shape = {
      id: this.generateId(),
      type: "rectangle",
      element: this.currentElement,
    };

    this.currentElement.setAttribute("data-shape-id", shape.id);
    this.currentElement = null;
    this.startPoint = null;

    return shape;
  }
}

export default RectangleTool;
