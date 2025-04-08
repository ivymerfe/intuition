// ==UserScript==
// @name         GPT Hotkey
// @version      2025-04-07
// @description  try to take over the world!
// @author       Ivy
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @noframes
// @run-at document-start
// ==/UserScript==

(function() {
    'use strict';
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
    function trySend(prompt) {
        if (websocket.readyState == WebSocket.OPEN) {
            websocket.send(JSON.stringify({send: prompt}));
        }
    }

    document.addEventListener("keyup", (e) => {
        var handled = false;
        if (e.key == '1' && e.altKey) {
            handled = true;
            var selectedText = getSelection().toString();
            if (selectedText != "") {
                trySend(selectedText);
            }
            else if (e.target.value) {
                trySend(e.target.value);
            }
        }
        if (e.key == '2' && e.altKey && e.target.value) {
            handled = true;
            navigator.clipboard.writeText(e.target.value);
        }
        if (handled) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    });
})();