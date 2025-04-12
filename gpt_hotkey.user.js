// ==UserScript==
// @name         GPT Hotkey
// @version      2025-04-07
// @description  Alt+1 = send; Alt+2 = silent copy
// @author       Ivy
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_setClipboard
// @run-at document-start
// ==/UserScript==

(function () {
  "use strict";
  async function trySend(text) {
    await fetch("http://localhost:5000/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ send: text }),
      mode: "no-cors",
    });
  }

  document.addEventListener("keyup", (e) => {
    var handled = false;
    if (e.key == "1" && e.altKey) {
      handled = true;
      var selectedText = getSelection().toString();
      if (selectedText != "") {
        trySend(selectedText);
      } else if (e.target.value) {
        trySend(e.target.value);
      }
    }
    if (e.key == "2" && e.altKey && e.target.value) {
      handled = true;
      GM_setClipboard(e.target.value);
    }
    if (handled) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });
})();
