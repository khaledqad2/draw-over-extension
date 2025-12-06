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
    <button id="black-color">Black</button>
    <button id="red-color">Red</button>
    <button id="save" style="background-color: chocolate; color: white;">Save Snapshot</button>
  </div>
  `;

  document.body.prepend(container);

  const drawer = new DrawOver({ strokeColor: "red", strokeWidth: 3 });

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
  document.getElementById("save")!.onclick = () => saveImage();
  document.getElementById("black-color")!.onclick = () =>
    drawer.setOptions({ strokeColor: "black" });
  document.getElementById("red-color")!.onclick = () =>
    drawer.setOptions({ strokeColor: "red" });
};

// Expose to window for background script to call
(window as any).injectDrawOverUI = injectDrawOverUI;

export { saveImage, injectDrawOverUI };
