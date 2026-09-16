#!/usr/bin/env node
// 专职下载工具入口：实现来自 monorepo 的 @wgl-m/down-img（workspace 链接）
import { run } from "@wgl-m/down-img/cli";

run(process.argv.slice(2)).catch((err) => {
  console.error(`\n✗ ${err.message || err}`);
  process.exit(1);
});
