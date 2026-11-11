#!/usr/bin/env node
/**
 * Local static server + /api2 reverse proxy for alliance-daily-report.html
 * Usage: node serve-daily-report.mjs
 * Then open http://127.0.0.1:8787/alliance-daily-report.html
 */
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8787);
const UPSTREAM = "https://nrta-pfm.jiyong.vip";
const OPEN_PATH = "/alliance-daily-report.html";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json",
};

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent((reqPath || "/").split("?")[0]);
  const cleaned = path.normalize(decoded).replace(/^([/\\])+/, "");
  const full = path.join(root, cleaned);
  if (!full.startsWith(root)) return null;
  return full;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function proxyApi(req, res) {
  const target = new URL(req.url, UPSTREAM);
  const headers = { ...req.headers, host: target.host };
  delete headers["origin"];
  delete headers["referer"];

  const upstreamReq = https.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || 443,
      path: target.pathname + target.search,
      method: req.method,
      headers,
    },
    (upstreamRes) => {
      const pass = {
        ...upstreamRes.headers,
        "access-control-allow-origin": req.headers.origin || "*",
        "access-control-allow-credentials": "true",
      };
      res.writeHead(upstreamRes.statusCode || 502, pass);
      upstreamRes.pipe(res);
    }
  );

  upstreamReq.on("error", (err) => {
    send(res, 502, JSON.stringify({ success: "0", msg: "代理失败：" + err.message }), {
      "content-type": "application/json; charset=utf-8",
    });
  });

  req.pipe(upstreamReq);
}

function handleOptions(req, res) {
  res.writeHead(204, {
    "access-control-allow-origin": req.headers.origin || "*",
    "access-control-allow-credentials": "true",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": req.headers["access-control-request-headers"] || "Admin-Token,X-Token,token,Content-Type,Accept",
    "access-control-max-age": "86400",
  });
  res.end();
}

function serveStatic(req, res) {
  let reqPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (reqPath === "/") reqPath = OPEN_PATH;
  const filePath = safeJoin(ROOT, reqPath);
  if (!filePath) return send(res, 403, "Forbidden");

  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      return send(res, 404, "Not found: " + reqPath, { "content-type": "text/plain; charset=utf-8" });
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url || "/";
  if (req.method === "OPTIONS" && url.startsWith("/api2")) {
    return handleOptions(req, res);
  }
  if (url.startsWith("/api2")) {
    return proxyApi(req, res);
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "Method Not Allowed");
  }
  return serveStatic(req, res);
});

server.listen(PORT, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${PORT}${OPEN_PATH}`;
  console.log("");
  console.log("联盟日报本地预览已启动");
  console.log("  " + url);
  console.log("");
  console.log("数据由 agent 手工维护；本服务仅用于本地静态预览");
  console.log("停止：Ctrl+C");
  console.log("");
  openBrowser(url);
});

function openBrowser(url) {
  if (process.env.NO_OPEN === "1") return;
  try {
    if (process.platform === "win32") {
      spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    } else if (process.platform === "darwin") {
      spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
    } else {
      spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
    }
  } catch (_) {}
}
