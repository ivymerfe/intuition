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
  const textInputElement =
    document.querySelector("#main").children[0].children[0].children[2];
  if (textInputElement) {
    textInputElement.style.position = "absolute";
    textInputElement.style.bottom = 0;
    textInputElement.style.opacity = 0.3;
  }
  const chatContainer =
    document.querySelector("#main").children[0].children[0].children[1];
  if (chatContainer) {
    chatContainer.style.marginBottom = 0;
  }
  document.addEventListener("keyup", (e) => {
    if (e.key == "Enter" && e.ctrlKey && document.body.clientWidth < 800) {
      const el = document.querySelector("button[data-testid=send-button]");
      if (el) el.click();
    }
  });
  const textField = document.createElement("pre");
  textField.textContent = "Жду ассистента...";
  textField.style.position = "absolute";
  textField.style.top = "80px";
  textField.style.right = "40px";
  textField.style.backgroundColor = "transparent";
  textField.style.padding = "5px";
  textField.style.maxWidth = "240px";
  textField.style.whiteSpace = "pre-wrap";
  document.body.appendChild(textField);

  function gptSend(data) {
    const stopButton = document.querySelector(
      "button[data-testid=stop-button]"
    );
    if (stopButton) {
      stopButton.click();
      setTimeout(() => gptSend(data), 600);
      return;
    }
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", data);
    const pasteEvent = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData: dataTransfer,
    });
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: dataTransfer,
    });
    const promptTextarea = document.querySelector("#prompt-textarea");
    if (promptTextarea) {
      promptTextarea.focus();
      promptTextarea.dispatchEvent(pasteEvent);
      setTimeout(() => {
        const sendButton = document.querySelector(
          "button[data-testid=send-button]"
        );
        if (sendButton) sendButton.click();
      }, 500);
    }
  }

  const websocket = new WebSocket("ws://localhost:5000");
  websocket.onopen = () => {
    console.log("WebSocket connection established.");
  };
  websocket.onclose = () => {
    console.log("WebSocket connection closed.");
  };
  websocket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
  websocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.send) {
        gptSend(data.send);
      } else if (data.input) {
        textField.textContent = data.input;
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };
})();
