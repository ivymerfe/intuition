// ==UserScript==
// @name         GPT Hotkey
// @version      2025-04-07
// @description  Alt+1 = send; Alt+2 = silent copy
// @author       Ivy
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @run-at document-start
// ==/UserScript==

(function() {
  'use strict';
  async function trySend(text) {
    await fetch("http://localhost:5000/send", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({send: text}),
      mode: "no-cors"
    });
  }
  var selectedText = "";
  document.addEventListener("selectionchange", (e) => {
    const text = getSelection().toString();
    if (text) {
      selectedText = text;
    }
  });
  document.addEventListener("keyup", (e) => {
    if (e.key == '1' && e.altKey) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (selectedText != "") {
        trySend(selectedText);
        selectedText = "";
      }
    }
  });
})();
