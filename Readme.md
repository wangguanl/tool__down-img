# down-img（专职下载工具 · 壳工程）

专职网络图片下载工具。**下载实现已提炼到 [wgl-monorepo](../wgl-monorepo/packages/down-img) 的 `@wgl-m/down-img` 包**，本仓库通过 pnpm `workspace:*` 协议引用，自身只保留工具入口和下载清单——职责：日常贴链接下图的那个"工具"，monorepo 职责：可复用的下载函数库（另被 tool__compress-img 用于远程图片压缩）。

## 用法

```bash
pnpm install        # 建立 workspace 链接（依赖 monorepo 已构建：见下方注意）

# 下载（三种姿势）
pnpm down https://a.com/1.png https://a.com/2.png
node bin/cli.js https://a.com/1.png -o ./images --prefix cover
node bin/cli.js --file test/index.json --concurrency 8   # 老工作流：清单在 test/index.json
```

选项与行为（`--out / --file / --prefix / --overwrite / --timeout / --retries / --concurrency / --help`）见 [monorepo 包文档](../wgl-monorepo/packages/down-img/README.md)。

## 目录结构

```
bin/cli.js       工具入口（调 @wgl-m/down-img/cli 的 run）
test/index.json  下载清单示例（--file 用）
test/smoke.mjs   冒烟测试：验证壳 → monorepo 实现链路（pnpm smoke）
legacy/          2021 年旧版归档（CommonJS + 已废弃的 request 库）
```

## 开发注意

- 链接指向 monorepo 包的 `dist/` 产物——**改 monorepo 里 down-img 源码后需重建**：`pnpm --filter @wgl-m/down-img build`（在 monorepo 目录执行）
- `@wgl-m/down-img` 发版后：依赖改为 `pnpm add @wgl-m/down-img`，并从 `pnpm-workspace.yaml` 移除 monorepo 路径
- 旧版历史：本仓库 git log 保留了从 2021 年初版到重构版的完整演变；monorepo 侧为 TS 重写版
