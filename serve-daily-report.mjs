#!/usr/bin/env node
/**
 * Local static server + live snapshot API for alliance-daily-report.html
 * Usage: node serve-daily-report.mjs
 * Then open http://127.0.0.1:8787/alliance-daily-report.html
 *
 * Live API: GET /api/alliance-live-snapshot  （读生产只读库，仅本机服务）
 */
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { buildLiveSnapshot, loadDbConfig } from "./_alliance-live-snapshot.mjs";

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

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
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
    "access-control-allow-headers":
      req.headers["access-control-request-headers"] ||
      "Admin-Token,X-Token,token,Content-Type,Accept",
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
      return send(res, 404, "Not found: " + reqPath, {
        "content-type": "text/plain; charset=utf-8",
      });
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
    fs.createReadStream(filePath).pipe(res);
  });
}

let liveInFlight = null;
async function handleLiveSnapshot(res) {
  try {
    if (!liveInFlight) {
      liveInFlight = buildLiveSnapshot(loadDbConfig()).finally(() => {
        liveInFlight = null;
      });
    }
    const snap = await liveInFlight;
    return sendJson(res, 200, snap);
  } catch (err) {
    return sendJson(res, 500, {
      ok: false,
      error: String(err && err.message ? err.message : err),
    });
  }
}

const server = http.createServer((req, res) => {
  const url = req.url || "/";
  const pathname = url.split("?")[0];

  if (req.method === "OPTIONS" && (pathname.startsWith("/api2") || pathname.startsWith("/api/"))) {
    return handleOptions(req, res);
  }

  if (pathname === "/api/alliance-live-snapshot") {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return send(res, 405, "Method Not Allowed");
    }
    return handleLiveSnapshot(res);
  }

  if (pathname.startsWith("/api2")) {
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
  console.log("联盟日报本地预览已启动（含实时快照 API）");
  console.log("  " + url);
  console.log("  GET /api/alliance-live-snapshot");
  console.log("");
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
