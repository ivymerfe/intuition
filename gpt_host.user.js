// ==UserScript==
// @name         GPT-Host
// @namespace    https://chatgpt.com/
// @version      2025-04-04
// @description  try to take over the world!
// @author       Ivy
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(async function () {
  "use strict";
  const websocket = new WebSocket("ws://localhost:5000");

  // Event: Connection opened
  websocket.onopen = () => {
    console.log("WebSocket connection established.");
  };

  // Event: Connection closed
  websocket.onclose = () => {
    console.log("WebSocket connection closed.");
  };

  // Event: Error occurred
  websocket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
  // Event: Message received
  websocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.send) {
        const dataTransfer = new DataTransfer();
        dataTransfer.setData("text/plain", data.send);
        const pasteEvent = new ClipboardEvent("paste", {
          bubbles: true,
          cancelable: true,
          clipboardData: dataTransfer,
        });
        Object.defineProperty(pasteEvent, "clipboardData", {
          value: dataTransfer,
        });
        const promptEl = document.querySelector("#prompt-textarea");
        if (promptEl) {
          promptEl.focus();
          promptEl.dispatchEvent(pasteEvent);
          setTimeout(() => {
            const buttonEl = document.querySelector(
              "button[data-testid=send-button]"
            );
            if (buttonEl) buttonEl.click();
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };
  const textInputElement =
    document.querySelector("#main").children[0].children[0].children[2];
  if (textInputElement) {
    textInputElement.style.position = "absolute";
    textInputElement.style.bottom = 0;
    textInputElement.style.opacity = 0.2;
  }
  document.addEventListener("keyup", (e) => {
    if (e.key == "Enter" && e.ctrlKey && document.body.clientWidth < 800) {
      const el = document.querySelector("button[data-testid=send-button]");
      if (el) el.click();
    }
  });
})();
