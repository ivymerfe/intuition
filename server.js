const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const http = require("http");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const connectedWebsockets = new Set();

wss.on("connection", (ws) => {
  connectedWebsockets.add(ws);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      for (const ws2 of connectedWebsockets) {
        if (ws2 !== ws && ws2.readyState === WebSocket.OPEN) {
          ws2.send(JSON.stringify(data));
        }
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: "Invalid JSON" }));
    }
  });

  ws.on("close", () => {
    connectedWebsockets.delete(ws);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Host is on http://localhost:${PORT}/host`);
  console.log(`Assistant is on http://localhost:${PORT}/assistant`);
});

const publicDir = path.join(__dirname, "public");
server.on("request", (req, res) => {
  let filePath;
  if (req.url === "/assistant") {
    filePath = path.join(publicDir, "assistant.html");
  } else if (req.url === "/host") {
    filePath = path.join(publicDir, "host.html");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("500 Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    }
  });
});
