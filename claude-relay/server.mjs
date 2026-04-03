import http from "node:http";
import { execSync } from "node:child_process";

const PORT = 9099;
const CWD = "/opt/openbrain";

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(200); res.end(); return; }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
    return;
  }

  if (req.method !== "POST" || req.url !== "/chat") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  let body = "";
  req.on("data", (chunk) => body += chunk);
  req.on("end", () => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }

    const { message, session_id, append_system_prompt } = parsed;
    if (!message) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "message required" }));
      return;
    }

    let cmd = '/usr/bin/claude -p ' + JSON.stringify(message) +
      ' --output-format json --dangerously-skip-permissions';

    if (session_id) {
      cmd += ' --resume ' + JSON.stringify(session_id);
    }

    if (append_system_prompt) {
      cmd += ' --append-system-prompt ' + JSON.stringify(append_system_prompt);
    }

    console.log("Executing: " + cmd.substring(0, 200));

    try {
      const result = execSync(cmd, {
        cwd: CWD,
        timeout: 300000,
        maxBuffer: 10 * 1024 * 1024,
        encoding: "utf-8",
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(result);
    } catch (err) {
      console.error("Error: " + (err.message || "").substring(0, 300));
      const stdout = err.stdout || "";
      if (stdout) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(stdout);
      } else {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          type: "result", subtype: "error", is_error: true,
          result: (err.stderr || err.message || "Unknown error").substring(0, 500)
        }));
      }
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Claude Relay listening on 0.0.0.0:" + PORT);
});

server.timeout = 600000;
