chrome.action.onClicked.addListener(async (tab) => {
  // Check if we can inject into this tab
  if (
    !tab.url ||
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("chrome-extension://") ||
    tab.url.startsWith("edge://") ||
    tab.url.startsWith("about:")
  ) {
    console.log("Cannot inject into this page");
    return;
  }

  try {
    // Get current badge state
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    const nextState = prevState === "ON" ? "OFF" : "ON";

    if (nextState === "ON") {
      console.log("Activating DrawOver...");

      // Inject CSS
      try {
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ["styles.css"],
        });
        console.log("CSS injected successfully");
      } catch (error) {
        console.error("Error injecting CSS:", error);
      }

      // Inject the bundled content script
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content-script.js"],
        });
        console.log("Content script injected successfully");
      } catch (error) {
        console.error("Error injecting content script:", error);
        return; // Don't proceed if script injection fails
      }

      // Small delay to ensure script is loaded
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Initialize the drawing UI
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          if (window.injectDrawOverUI) {
            window.injectDrawOverUI();
          } else {
            console.error("injectDrawOverUI not found on window");
          }
        },
      });

      // Update badge
      await chrome.action.setBadgeText({ tabId: tab.id, text: "ON" });
      await chrome.action.setBadgeBackgroundColor({
        tabId: tab.id,
        color: "#00ff37",
      });

      console.log("DrawOver activated successfully");
    } else {
      console.log("Deactivating DrawOver...");

      // Remove the drawing UI
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const container = document.getElementById("tool-container");
          if (container) container.remove();
          const overlay = document.getElementById("draw-over-overlay");
          if (overlay) overlay.remove();
        },
      });

      // Update badge
      await chrome.action.setBadgeText({ tabId: tab.id, text: "OFF" });
      await chrome.action.setBadgeBackgroundColor({
        tabId: tab.id,
        color: "#ff0000",
      });

      console.log("DrawOver deactivated successfully");
    }
  } catch (error) {
    console.error("Error toggling DrawOver:", error);
  }
});

// Set initial badge state when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("DrawOver extension installed");
});
