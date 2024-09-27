const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { readFileSync } = require("fs");
const path = require("path");

// Read the file synchronously when the server starts
const indexFile = readFileSync(path.join(__dirname, "index.html"), "utf-8");

// Create HTTP server
const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    // Serve the index.html file
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(indexFile); // Serve the preloaded file
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

// Initialize WebSocket server
const wss = new WebSocketServer({ server });

// Helper function to broadcast messages to all connected clients
const broadcast = (message, sender) => {
  wss.clients.forEach((client) => {
    if (client !== sender && client.readyState === client.OPEN) {
      client.send(message);
    }
  });
};

// Function to authenticate the WebSocket connection
function authenticate(request, callback) {
  // Extract token from headers (or query parameters, or cookies)
  let token = request.headers["sec-websocket-protocol"]; // Example: Use the Sec-WebSocket-Protocol header
  token = request.headers["authorization"];
  console.log(token);
  if (!token) {
    return callback(new Error("No token provided"));
  }

  //   jwt.verify(token, JWT_SECRET, (err, decoded) => {
  //     if (err) {
  //       return callback(new Error("Invalid token"));
  //     }
  // Pass the decoded token or user information
  callback(null, "decoded");
  //   });
}

// Handle new WebSocket connections
wss.on("connection", (ws, req) => {
  console.log(`New client connected from ${req.socket.remoteAddress}`);
  // setInterval(() => {
  //   ws.send(JSON.stringify({ message: "hi new client. How are you" }));
  // }, 1000);
  // Mark this connection as alive
  ws.isAlive = true;
  ws.on("pong", () => {
    console.log("got pong message");
    ws.isAlive = true;
  }); // Use arrow function to ensure correct `this`

  // Handle incoming messages
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message:", data);

      // Broadcast message to other clients
      broadcast(message, ws);
    } catch (error) {
      console.error("Error parsing message:", error);
      ws.send(JSON.stringify({ error: "Invalid message format" }));
    }
  });

  // Handle connection errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  // Handle connection close
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Periodically check for dead connections
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate(); // Terminate dead connections

    ws.isAlive = false;
    ws.ping(); // Send a ping, expecting a pong
  });
}, 30000); // Check every 30 seconds

// Handle HTTP upgrade to WebSocket connection
server.on("upgrade", (request, socket, head) => {
  console.log("upgrade event emitted");
  socket.on("error", (error) => console.log(error));

  // Authenticate client before upgrading to WebSocket
  // authenticate(request, (err, client) => {
  // if (err || !client) {
  //   socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
  //   socket.destroy();
  //   return;
  // }

  // Authentication successful, proceed with WebSocket upgrade
  // wss.handleUpgrade(request, socket, head, (ws) => {
  //   wss.emit("connection", ws, request, client);
  // });
  // });
});

// Start the server
server.listen(8080, () => {
  console.log("Server is listening on port 8080");
});