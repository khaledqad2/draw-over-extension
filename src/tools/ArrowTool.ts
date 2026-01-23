import { BaseTool } from "./BaseTool";
import type { Point, Shape } from "../types";

export class ArrowTool extends BaseTool {
  private currentMarkerId: string | null = null;

  constructor(options: Required<import("../types").DrawOverOptions>) {
    super(options);
  }

  /**
   * Create a unique arrow marker definition in SVG defs for each arrow
   */
  private createArrowMarker(svg: SVGSVGElement, color: string): string {
    // Generate unique marker ID for this specific arrow
    const markerId = "arrowhead-" + Math.random().toString(36).substr(2, 9);

    // Get or create defs element
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      svg.insertBefore(defs, svg.firstChild);
    }

    // Create marker
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker",
    );
    marker.setAttribute("id", markerId);
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "3");
    marker.setAttribute("orient", "auto");

    // Create polygon (triangle)
    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon",
    );
    polygon.setAttribute("points", "0 0, 10 3, 0 6");
    polygon.setAttribute("fill", color);

    marker.appendChild(polygon);
    defs.appendChild(marker);

    return markerId;
  }

  public onStart(point: Point, svg: SVGSVGElement): void {
    this.startPoint = point;
    this.svg = svg;

    // Create unique marker for this arrow immediately
    this.currentMarkerId = this.createArrowMarker(
      svg,
      this.options.strokeColor,
    );

    // Create line element with arrowhead marker
    this.currentElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    this.currentElement.setAttribute("x1", point.x.toString());
    this.currentElement.setAttribute("y1", point.y.toString());
    this.currentElement.setAttribute("x2", point.x.toString());
    this.currentElement.setAttribute("y2", point.y.toString());
    this.currentElement.setAttribute(
      "marker-end",
      `url(#${this.currentMarkerId})`,
    );

    this.applyStyles(this.currentElement);

    svg.appendChild(this.currentElement);
  }

  public onMove(point: Point): void {
    if (!this.currentElement) return;

    this.currentElement.setAttribute("x2", point.x.toString());
    this.currentElement.setAttribute("y2", point.y.toString());
  }

  public onEnd(point: Point): Shape | null {
    if (!this.currentElement || !this.startPoint || !this.svg) return null;

    // Check if arrow has minimum length
    const dx = point.x - this.startPoint.x;
    const dy = point.y - this.startPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < 10) {
      // Remove the element if too short
      if (this.currentElement.parentNode) {
        this.currentElement.parentNode.removeChild(this.currentElement);
      }
      // Also remove the marker definition
      if (this.currentMarkerId) {
        const marker = this.svg.querySelector(`#${this.currentMarkerId}`);
        if (marker && marker.parentNode) {
          marker.parentNode.removeChild(marker);
        }
      }
      this.currentElement = null;
      this.startPoint = null;
      this.currentMarkerId = null;
      return null;
    }

    const shape: Shape = {
      id: this.generateId(),
      type: "arrow",
      element: this.currentElement,
    };

    this.currentElement.setAttribute("data-shape-id", shape.id);

    this.currentElement = null;
    this.startPoint = null;
    this.currentMarkerId = null;

    return shape;
  }

  /**
   * updateOptions no longer needs to update arrowhead colors
   * since each arrow has its own marker
   */
  public updateOptions(
    options: Required<import("../types").DrawOverOptions>,
  ): void {
    super.updateOptions(options);
    // No need to update existing arrowheads - each has its own marker
  }
}

export default ArrowTool;
