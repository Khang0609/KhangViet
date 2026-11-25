import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const ROOT_DIR = process.cwd();
const ARTIFACTS_DIR = path.join(ROOT_DIR, ".verify-artifacts");

const FEATURE_ROUTES = [
  { name: "landing", path: "/" },
  { name: "projects-hub", path: "/projects" },
  { name: "projects-partner-bidv", path: "/projects/partners/bidv" },
  { name: "projects-solution-facade", path: "/projects/solutions/bang-hieu-mat-dung" },
  { name: "admin-hub", path: "/admin" },
  { name: "admin-projects", path: "/admin/projects" },
  {
    name: "admin-project-media",
    path: "/admin/projects/he-thong-nhan-dien-mat-tien-quay-giao-dich-chuoi-ngan-hang-bidv",
  },
  { name: "admin-partners", path: "/admin/partners" },
  { name: "admin-leads", path: "/admin/leads" },
];

function findBrowserExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error("No Chrome or Edge executable found. Set CHROME_PATH.");
}

function parseBaseUrl() {
  const idx = process.argv.indexOf("--url");
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1].replace(/\/$/, "");
  }
  return "http://127.0.0.1:8787";
}

async function isServerHealthy(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForServer(baseUrl, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isServerHealthy(baseUrl)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${baseUrl}/api/health`);
}

function startApiServer() {
  const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const child = spawn(pnpmCmd, ["--filter", "api", "exec", "wrangler", "dev", "--port", "8787"], {
    cwd: ROOT_DIR,
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });
  return child;
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method && this.listeners.has(msg.method)) {
        for (const fn of this.listeners.get(msg.method)) fn(msg.params);
      }
    });
  }

  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(fn);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function launchBrowser() {
  const exe = findBrowserExecutable();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "kv-verify-"));
  const proc = spawn(
    exe,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--remote-debugging-port=0",
      "--window-size=1440,900",
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] }
  );

  const wsEndpoint = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Browser CDP timeout")), 15000);
    let stderr = "";
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
    proc.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Browser exited early (${code}): ${stderr}`));
    });
  });

  const cdpUrl = new URL(wsEndpoint);
  const targetsRes = await fetch(`http://127.0.0.1:${cdpUrl.port}/json/list`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find((t) => t.type === "page") ?? targets[0];

  return {
    proc,
    userDataDir,
    wsUrl: pageTarget.webSocketDebuggerUrl,
  };
}

async function verifyRoute(cdp, baseUrl, route) {
  const consoleErrors = [];
  const pageErrors = [];
  const apiErrors = [];

  const onConsole = (params) => {
    if (params.type === "error") {
      const text = (params.args ?? []).map((a) => a.value ?? a.description ?? "").join(" ");
      consoleErrors.push(text || "console.error");
    }
  };
  const onException = (params) => {
    pageErrors.push(params.exceptionDetails?.text ?? "Uncaught exception");
  };
  const onResponse = (params) => {
    const url = params.response?.url ?? "";
    const status = params.response?.status ?? 0;
    if (url.includes("/api/") && status >= 400) {
      apiErrors.push(`${status} ${url}`);
    }
  };

  cdp.listeners.clear();
  cdp.on("Runtime.consoleAPICalled", onConsole);
  cdp.on("Runtime.exceptionThrown", onException);
  cdp.on("Network.responseReceived", onResponse);

  await cdp.send("Page.navigate", { url: `${baseUrl}${route.path}` });
  await new Promise((r) => setTimeout(r, 2200));

  const evalRes = await cdp.send("Runtime.evaluate", {
    expression: `({
      title: document.title,
      textLen: (document.body?.innerText || "").trim().length,
      hasNextError: Boolean(document.querySelector("#__next-build-watcher, [data-nextjs-dialog]"))
    })`,
    returnByValue: true,
  });

  const info = evalRes.result?.value ?? { title: "", textLen: 0, hasNextError: false };
  const screenshot = await cdp.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, `${route.name}.png`),
    Buffer.from(screenshot.data, "base64")
  );

  const ok =
    info.textLen > 20 &&
    !info.hasNextError &&
    consoleErrors.length === 0 &&
    pageErrors.length === 0 &&
    apiErrors.length === 0;

  return {
    name: route.name,
    path: route.path,
    ok,
    textLen: info.textLen,
    consoleErrors,
    pageErrors,
    apiErrors,
  };
}

async function main() {
  const baseUrl = parseBaseUrl();
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

  let serverProc = null;
  if (!(await isServerHealthy(baseUrl))) {
    if (baseUrl !== "http://127.0.0.1:8787") {
      throw new Error(`Server not reachable at ${baseUrl}`);
    }
    console.log("Starting local Wrangler API + static assets server on 127.0.0.1:8787...");
    serverProc = startApiServer();
    await waitForServer(baseUrl);
  }

  const browser = await launchBrowser();
  const cdp = new CdpClient(browser.wsUrl);

  try {
    await cdp.connect();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");

    const results = [];
    for (const route of FEATURE_ROUTES) {
      const res = await verifyRoute(cdp, baseUrl, route);
      results.push(res);
      const badge = res.ok ? "PASS" : "FAIL";
      console.log(`[${badge}] ${res.name} (${res.path}) — textLen=${res.textLen}`);
      if (!res.ok) {
        if (res.consoleErrors.length) console.log("  consoleErrors:", res.consoleErrors);
        if (res.pageErrors.length) console.log("  pageErrors:", res.pageErrors);
        if (res.apiErrors.length) console.log("  apiErrors:", res.apiErrors);
      }
    }

    const failed = results.filter((r) => !r.ok);
    console.log(`\nVerified ${results.length} routes (${results.length - failed.length} passed, ${failed.length} failed).`);
    console.log(`Screenshots saved to ${ARTIFACTS_DIR}`);
    if (failed.length > 0) process.exitCode = 1;
  } finally {
    cdp.close();
    browser.proc.kill();
    if (serverProc) {
      if (process.platform === "win32" && serverProc.pid) {
        spawnSync("taskkill", ["/pid", String(serverProc.pid), "/T", "/F"], { stdio: "ignore" });
      } else {
        serverProc.kill();
      }
    }
    try {
      fs.rmSync(browser.userDataDir, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 200,
      });
    } catch {
      // Windows Crashpad may briefly hold a lock on temp profile cleanup.
    }
  }
  process.exit(process.exitCode ?? 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
