const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const http = require("http");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const connectedWebsockets = new Set();
const screenshareClients = new Set();

wss.on("connection", (ws) => {
  connectedWebsockets.add(ws);

  ws.on("message", (message) => {
    try {
      const msg = JSON.parse(message);
      if (msg.type === "screenshare") {
        screenshareClients.add(ws);
        for (const client of screenshareClients) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
          }
        }
        return;
      }
      for (const ws2 of connectedWebsockets) {
        if (ws2 !== ws && ws2.readyState === WebSocket.OPEN) {
          ws2.send(JSON.stringify(msg));
        }
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: "Invalid JSON" }));
    }
  });

  ws.on("close", () => {
    connectedWebsockets.delete(ws);
    screenshareClients.delete(ws);
  });
});

const publicDir = path.join(__dirname, "pages");
const publicFileRoutes = {
  "/assistant": path.join(publicDir, "assistant.html"),
  "/speech": path.join(publicDir, "speech.html"),
  "/screenshare": path.join(publicDir, "screenshare.html"),
  "/screenshare_assistant": path.join(publicDir, "screenshare_assistant.html"),
};

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Pages:");
  for (const route in publicFileRoutes) {
    console.log(`- http://localhost:${PORT}${route}`);
  }
});

server.on("request", (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Private-Network": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS, POST",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }
  if (req.method === "POST" && req.url === "/send") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        for (const ws of connectedWebsockets) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
          }
        }
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("ok");
      } catch (error) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Bad request");
      }
    });
    return;
  }
  const filePath = publicFileRoutes[req.url];
  if (!filePath) {
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
