import { BaseTool } from "./BaseTool";
import type { Point, Shape } from "../types";

export class TextTool extends BaseTool {
  private foreignObject: SVGForeignObjectElement | null = null;
  private textInput: HTMLDivElement | null = null;
  private isEditing: boolean = false;
  private isDragging: boolean = false;
  private dragStartPos: Point | null = null;
  private dragElement: SVGForeignObjectElement | null = null;

  public onStart(point: Point, svg: SVGSVGElement): void {
    this.startPoint = point;
    this.svg = svg;
    this.isEditing = true;

    // Create foreignObject to hold HTML content
    this.foreignObject = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "foreignObject",
    );
    this.foreignObject.setAttribute("x", point.x.toString());
    this.foreignObject.setAttribute("y", point.y.toString());
    this.foreignObject.setAttribute("width", "200");
    this.foreignObject.setAttribute("height", "100");

    // Create editable div
    this.textInput = document.createElement("div");
    this.textInput.contentEditable = "true";
    this.textInput.style.cssText = `
      min-width: 100px;
      min-height: 30px;
      padding: 4px 8px;
      font-family: Arial, sans-serif;
      font-size: 16px;
      color: ${this.options.strokeColor};
      background: transparent;
      border: 2px dashed ${this.options.strokeColor};
      outline: none;
      white-space: pre-wrap;
      word-wrap: break-word;
      cursor: text;
    `;
    this.textInput.setAttribute("placeholder", "Type text here...");

    // Add placeholder styling
    const style = document.createElement("style");
    style.textContent = `
      [contenteditable][placeholder]:empty:before {
        content: attr(placeholder);
        color: #999;
        pointer-events: none;
      }
      .text-draggable {
        cursor: move !important;
      }
      .text-dragging {
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);

    this.foreignObject.appendChild(this.textInput);
    svg.appendChild(this.foreignObject);
    this.currentElement = this.foreignObject;

    // Focus the input and set up event listeners
    setTimeout(() => {
      if (this.textInput) {
        this.textInput.focus();

        // Adjust size on input
        this.textInput.addEventListener("input", this.handleInput);

        // Prevent clicks from propagating
        this.textInput.addEventListener("mousedown", (e) => {
          e.stopPropagation();
        });

        // Handle blur to finalize text
        this.textInput.addEventListener("blur", this.handleBlur);
      }
    }, 0);
  }

  public onMove(point: Point): void {
    point;
    // Text tool doesn't need move functionality
    // Position is set on start
  }

  public onEnd(point: Point): Shape | null {
    point;
    // Don't finalize immediately - wait for blur event
    return null;
  }

  private handleInput = (): void => {
    if (!this.textInput || !this.foreignObject) return;

    // Auto-resize foreignObject based on content
    const rect = this.textInput.getBoundingClientRect();
    const width = Math.max(200, rect.width + 20);
    const height = Math.max(40, rect.height + 10);

    this.foreignObject.setAttribute("width", width.toString());
    this.foreignObject.setAttribute("height", height.toString());
  };

  private handleBlur = (): void => {
    if (!this.isEditing) return;

    this.finalizeText();
  };

  private finalizeText(): Shape | null {
    if (!this.textInput || !this.foreignObject || !this.svg) return null;

    const text = this.textInput.innerText.trim();

    // Remove if empty
    if (!text) {
      if (this.foreignObject.parentNode) {
        this.foreignObject.parentNode.removeChild(this.foreignObject);
      }
      this.cleanup();
      return null;
    }

    // Remove edit styling
    this.textInput.contentEditable = "false";
    this.textInput.style.border = "none";
    this.textInput.style.cursor = "move";
    this.textInput.removeAttribute("placeholder");
    this.textInput.classList.add("text-draggable");

    // Remove event listeners
    this.textInput.removeEventListener("input", this.handleInput);
    this.textInput.removeEventListener("blur", this.handleBlur);

    const shape: Shape = {
      id: this.generateId(),
      type: "text",
      element: this.foreignObject,
    };

    this.foreignObject.setAttribute("data-shape-id", shape.id);

    // Add double-click to re-edit
    this.textInput.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      this.makeEditable(this.textInput!, this.foreignObject!);
    });

    // Add drag functionality
    this.makeDraggable(this.textInput, this.foreignObject);

    this.cleanup();
    return shape;
  }

  private makeDraggable(
    textDiv: HTMLDivElement,
    foreignObject: SVGForeignObjectElement,
  ): void {
    const handleMouseDown = (e: MouseEvent) => {
      // Don't drag if editing
      if (textDiv.contentEditable === "true") return;

      e.preventDefault();
      e.stopPropagation();

      this.isDragging = true;
      this.dragElement = foreignObject;

      const x = parseFloat(foreignObject.getAttribute("x") || "0");
      const y = parseFloat(foreignObject.getAttribute("y") || "0");

      this.dragStartPos = {
        x: e.clientX - x,
        y: e.clientY - y,
      };

      textDiv.classList.add("text-dragging");

      // Add document-level listeners for smooth dragging
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!this.isDragging || !this.dragElement || !this.dragStartPos) return;

      e.preventDefault();

      const newX = e.clientX - this.dragStartPos.x;
      const newY = e.clientY - this.dragStartPos.y;

      this.dragElement.setAttribute("x", newX.toString());
      this.dragElement.setAttribute("y", newY.toString());
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!this.isDragging) return;

      e.preventDefault();

      this.isDragging = false;
      this.dragStartPos = null;

      if (textDiv) {
        textDiv.classList.remove("text-dragging");
      }

      // Remove document-level listeners
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      this.dragElement = null;
    };

    textDiv.addEventListener("mousedown", handleMouseDown);
  }

  private makeEditable(
    textDiv: HTMLDivElement,
    foreignObject: SVGForeignObjectElement,
  ): void {
    textDiv.contentEditable = "true";
    textDiv.style.border = `2px dashed ${this.options.strokeColor}`;
    textDiv.style.cursor = "text";
    textDiv.classList.remove("text-draggable");
    textDiv.focus();

    // Re-attach input handler
    const inputHandler = () => {
      const rect = textDiv.getBoundingClientRect();
      const width = Math.max(200, rect.width + 20);
      const height = Math.max(40, rect.height + 10);
      foreignObject.setAttribute("width", width.toString());
      foreignObject.setAttribute("height", height.toString());
    };

    textDiv.addEventListener("input", inputHandler);

    // Handle blur
    const blurHandler = () => {
      textDiv.contentEditable = "false";
      textDiv.style.border = "none";
      textDiv.style.cursor = "move";
      textDiv.classList.add("text-draggable");
      textDiv.removeEventListener("input", inputHandler);
      textDiv.removeEventListener("blur", blurHandler);
    };

    textDiv.addEventListener("blur", blurHandler);
  }

  private cleanup(): void {
    this.isEditing = false;
    this.currentElement = null;
    this.foreignObject = null;
    this.textInput = null;
    this.startPoint = null;
  }

  /**
   * Update text color when options change
   */
  public updateOptions(
    options: Required<import("../types").DrawOverOptions>,
  ): void {
    super.updateOptions(options);

    // Update existing text colors if needed
    if (this.textInput) {
      this.textInput.style.color = options.strokeColor;
      this.textInput.style.borderColor = options.strokeColor;
    }
  }

  /**
   * Public method to finalize text (called from DrawOver)
   */
  public finalize(): Shape | null {
    if (this.isEditing) {
      return this.finalizeText();
    }
    return null;
  }
}

export default TextTool;
