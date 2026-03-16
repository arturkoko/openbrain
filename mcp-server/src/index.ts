import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { dbTools } from "./db/tools.js";
import { vaultTools } from "./vault/tools.js";
import { calendarTools } from "./calendar/tools.js";
import { config } from "./config.js";
import { readFile } from "fs/promises";
import { join } from "path";

const server = new McpServer({
  name: "openbrain",
  version: "0.1.0",
});

// ---- Register Database Tools ----

for (const [name, tool] of Object.entries(dbTools)) {
  server.tool(name, tool.description, tool.inputSchema.shape, tool.execute);
}

// ---- Register Vault Tools ----

for (const [name, tool] of Object.entries(vaultTools)) {
  server.tool(name, tool.description, tool.inputSchema.shape, tool.execute);
}

// ---- Register Calendar Tools ----

for (const [name, tool] of Object.entries(calendarTools)) {
  server.tool(name, tool.description, tool.inputSchema.shape, tool.execute);
}

// ---- Register Resources (AI-Context files) ----

const AI_CONTEXT_FILES = [
  "AI-Context/_Index.md",
  "AI-Context/Work Context.md",
  "AI-Context/Personal Context.md",
  "AI-Context/Tech Preferences.md",
  "AI-Context/Projects.md",
  "AI-Context/Ideas and Goals.md",
  "AI-Context/Habits and Routines.md",
  "AI-Context/Communication Style.md",
];

for (const file of AI_CONTEXT_FILES) {
  const resourceName = file.replace("AI-Context/", "").replace(".md", "");
  server.resource(
    resourceName,
    `openbrain://context/${resourceName.toLowerCase().replace(/ /g, "-")}`,
    { description: `AI context file: ${resourceName}`, mimeType: "text/markdown" },
    async () => {
      try {
        const content = await readFile(join(config.vault.path, file), "utf-8");
        return { contents: [{ uri: `openbrain://context/${resourceName}`, text: content, mimeType: "text/markdown" }] };
      } catch {
        return { contents: [{ uri: `openbrain://context/${resourceName}`, text: `File not found: ${file}`, mimeType: "text/plain" }] };
      }
    }
  );
}

// ---- Start Server ----

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OpenBrain MCP server running on stdio");
}

main().catch((err) => {
  console.error("Failed to start OpenBrain MCP server:", err);
  process.exit(1);
});
