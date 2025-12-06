import { BaseTool } from "./BaseTool";
import type { Point, Shape } from "../types";

export class ArrowTool extends BaseTool {
  private markerId: string = "arrowhead";

  /**
   * Create arrow marker definition in SVG defs
   */
  private createArrowMarker(svg: SVGSVGElement): void {
    // Check if marker already exists
    if (svg.querySelector(`#${this.markerId}`)) return;

    // Get or create defs element
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      svg.insertBefore(defs, svg.firstChild);
    }

    // Create marker
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    marker.setAttribute("id", this.markerId);
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "3");
    marker.setAttribute("orient", "auto");

    // Create polygon (triangle)
    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );
    polygon.setAttribute("points", "0 0, 10 3, 0 6");
    polygon.setAttribute("fill", this.options.strokeColor);

    marker.appendChild(polygon);
    defs.appendChild(marker);
  }

  public onStart(point: Point, svg: SVGSVGElement): void {
    this.startPoint = point;
    this.svg = svg;

    // Create arrow marker if it doesn't exist
    this.createArrowMarker(svg);

    // Create line element with arrowhead marker
    this.currentElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    this.currentElement.setAttribute("x1", point.x.toString());
    this.currentElement.setAttribute("y1", point.y.toString());
    this.currentElement.setAttribute("x2", point.x.toString());
    this.currentElement.setAttribute("y2", point.y.toString());
    this.currentElement.setAttribute("marker-end", `url(#${this.markerId})`);

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

    // Check if arrow has minimum length
    const dx = point.x - this.startPoint.x;
    const dy = point.y - this.startPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < 10) {
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
      type: "arrow",
      element: this.currentElement,
    };

    this.currentElement.setAttribute("data-shape-id", shape.id);

    // Update arrowhead color to match stroke
    this.updateArrowheadColor();

    this.currentElement = null;
    this.startPoint = null;

    return shape;
  }

  private updateArrowheadColor(): void {
    if (!this.svg) return;

    const marker = this.svg.querySelector(`#${this.markerId} polygon`);
    if (marker) {
      marker.setAttribute("fill", this.options.strokeColor);
    }
  }

  /**
   * Update marker color when options change
   */
  public updateOptions(
    options: Required<import("../types").DrawOverOptions>
  ): void {
    super.updateOptions(options);
    this.updateArrowheadColor();
  }
}

export default ArrowTool;
