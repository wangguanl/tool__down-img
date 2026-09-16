#!/usr/bin/env node
/**
 * 壳工程冒烟测试：验证 bin/cli.js → @wgl-m/down-img（monorepo workspace 链接）链路可用
 * 基于本地 HTTP 服务，无外网依赖
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin", "cli.js");

const JPG = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  Buffer.alloc(100, 7),
  Buffer.from([0xff, 0xd9]),
]);

const server = http.createServer((req, res) => {
  if (req.url.split("?")[0] === "/smoke.jpg") {
    res.writeHead(200, { "content-type": "image/jpeg" });
    res.end(JPG);
  } else {
    res.writeHead(404);
    res.end("not found");
  }
});

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "down-img-shell-"));
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}/smoke.jpg`;

let failed = false;
function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => console.log(`  ✓ ${name}`))
    .catch((err) => {
      failed = true;
      console.error(`  ✗ ${name} — ${err.message}`);
    });
}

await check("--help 输出（实现来自 monorepo 包）", async () => {
  const { stdout } = await execFileAsync("node", [cli, "--help"]);
  if (!/down-img — 网络图片批量下载/.test(stdout)) throw new Error("帮助文本异常");
});

await check("下载落盘 + 幂等跳过", async () => {
  const out = path.join(tmp, "t1");
  await execFileAsync("node", [cli, url, "-o", out]);
  const { stdout } = await execFileAsync("node", [cli, url, "-o", out]);
  if (!fs.existsSync(path.join(out, "smoke.jpg"))) throw new Error("文件未落盘");
  if (!/跳过/.test(stdout)) throw new Error("第二次未跳过");
});

await check("404 报错退出码 1", async () => {
  try {
    await execFileAsync("node", [cli, url.replace("smoke.jpg", "404.jpg"), "-o", path.join(tmp, "t2"), "--retries", "0"]);
    throw new Error("应失败却成功");
  } catch (err) {
    if (err.code !== 1 || !/HTTP 404/.test(err.stderr)) throw new Error(`退出码/报错异常：code=${err.code}`);
  }
});

server.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(failed ? "\n冒烟失败 ✗" : "\n壳工程冒烟通过 ✔");
process.exit(failed ? 1 : 0);
