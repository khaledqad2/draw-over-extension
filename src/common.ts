/**
 * This module injects a drawing overlay UI into the current webpage, allowing
 * users to draw annotations (lines, arrows, shapes, text, etc.) directly over
 * the page content. It also provides functionality to capture the entire page
 * as an image using html2canvas and download it as a PNG snapshot.
 *
 * - Dynamically injects a floating toolbar into the DOM
 * - Initializes and controls a DrawOver instance for drawing interactions
 * - Allows switching tools, colors, clearing drawings, and activating/deactivating drawing mode
 * - Exposes a global function to trigger UI injection from an external script
 */

import html2canvas from "html2canvas";
import DrawOver from "./DrawOver";

// Save the content as an image
const saveImage = async () => {
  const element = document.body;

  const canvas = await html2canvas(element, {
    allowTaint: true,
    useCORS: true,
  });

  const dataURL = canvas.toDataURL("image/png");

  // Download
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = `drawing_snapshot_${Date.now()}.png`;
  link.click();
};

// Inject the html tags inside the main page function
const injectDrawOverUI = () => {
  // Prevent double injection
  if (document.getElementById("tool-container")) {
    console.log("DrawOver UI already injected");
    return;
  }

  // Create UI container and insert into <body>
  const container = document.createElement("div");
  container.innerHTML = `
  <div id="tool-container" style="position: absolute; top: 10px; left: 10px; z-index: 9999; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
    <button id="activate">Activate Drawing</button>
    <button id="deactivate">Deactivate</button>
    <button id="clear">Clear All</button>
    <button id="pencil">Pencil</button>
    <button id="line">Line</button>
    <button id="arrow">Arrow</button>
    <button id="drumstick">Drumstick</button>
    <button id="rectangle">Rectangle</button>
    <button id="text">Text</button>
    <button id="save" style="background-color: chocolate; color: white;">Save Snapshot</button>
    <button id="colorButton" style="background-color: red;">Choose Color</button>

  <div id="palette">
    <div class="color" style="background: red;"></div>
    <div class="color" style="background: green;"></div>
    <div class="color" style="background: blue;"></div>
    <div class="color" style="background: black;"></div>
    <div class="color" style="background: orange;"></div>
  </div>
  </div>
  `;

  document.body.prepend(container);

  const drawer = new DrawOver({ strokeColor: "red", strokeWidth: 3 });
  /**
   * for more user friendly behavior, activate drawing mode immediately upon clicking "Activate Drawing" button
   */
  drawer.activate();
  drawer.setTool("line");
  /**
   * create and control color palette
   */

  const button = document.getElementById("colorButton");
  const palette = document.getElementById("palette");

  button!.addEventListener("click", (e) => {
    e.stopPropagation();
    palette!.style.display =
      palette!.style.display === "block" ? "none" : "block";

    const rect = button!.getBoundingClientRect();
    palette!.style.left = rect.left + "px";
    palette!.style.top = rect.bottom + "px";
    palette!.style.zIndex = "10000";
  });

  palette!.addEventListener("click", (e) => {
    e.stopPropagation();

    if (
      e.target instanceof HTMLElement &&
      e.target.classList.contains("color")
    ) {
      drawer.setOptions({ strokeColor: e.target.style.backgroundColor });
      if (button) {
        button.style.backgroundColor = e.target.style.backgroundColor;
      }
      palette!.style.display = "none";
    }
  });

  // Hide palette when clicking anywhere else
  document.addEventListener("click", () => {
    palette!.style.display = "none";
  });
  document.getElementById("activate")!.onclick = () => {
    drawer.activate();
    drawer.setTool("line");
  };
  document.getElementById("deactivate")!.onclick = () => drawer.deactivate();
  document.getElementById("clear")!.onclick = () => drawer.clear();
  document.getElementById("pencil")!.onclick = () => drawer.setTool("pencil");
  document.getElementById("line")!.onclick = () => drawer.setTool("line");
  document.getElementById("arrow")!.onclick = () => drawer.setTool("arrow");
  document.getElementById("drumstick")!.onclick = () =>
    drawer.setTool("drumstick");
  document.getElementById("rectangle")!.onclick = () =>
    drawer.setTool("rectangle");
  document.getElementById("text")!.onclick = () => drawer.setTool("text");
  document.getElementById("save")!.onclick = () => saveImage();
  document.getElementById("black-color")!.onclick = () =>
    drawer.setOptions({ strokeColor: "green" });
  document.getElementById("red-color")!.onclick = () =>
    drawer.setOptions({ strokeColor: "red" });
};

// Expose to window for background script to call
(window as any).injectDrawOverUI = injectDrawOverUI;

export { saveImage, injectDrawOverUI };
