import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Try multiple possible paths for the public directory
  const possiblePaths = [
    path.resolve(__dirname, "public"),
    path.resolve(__dirname, "../dist/public"),
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(process.cwd(), "dist", "public"),
  ];
  
  let distPath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      break;
    }
  }
  
  if (!distPath) {
    console.error("Tried paths:", possiblePaths);
    throw new Error(
      `Could not find the build directory. Tried: ${possiblePaths.join(", ")}`,
    );
  }
  
  console.log(`Serving static files from: ${distPath}`);

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
