<p align="center">
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&style=flat-square" alt="Vite">
  <img src="https://img.shields.io/badge/PaddleJS-OCR-0EA5E9?style=flat-square" alt="PaddleJS">
  <img src="https://img.shields.io/badge/License-MIT-success?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/privacy-first-100%25%20local-8B5CF6?style=flat-square" alt="Privacy">
  <img src="https://img.shields.io/badge/offline-ready-ok-green?style=flat-square" alt="Offline">
</p>

<h1 align="center">🛡️ Privacy Invoice OCR</h1>
<p align="center"><strong>100% 本地 · 零网络外传 · 浏览器端发票 OCR 批量工作台</strong></p>

<p align="center">
  上传 → OCR 识别 → 结构化提取 → CSV 导出，全程在浏览器完成。<br>
  你的发票图片从不会离开你的电脑。
</p>

---

## ✨ 为什么选这个？

| 对比维度 | 传统 SaaS OCR | ☁️ 云端 API | 🛡️ **Privacy Invoice OCR** |
|----------|:-----------:|:---------:|:------------------------:|
| 数据隐私 | ❌ 上传到第三方 | ❌ 发送到云端 | ✅ 100% 本地 |
| 网络要求 | 必须联网 | 必须联网 | ✅ 断网可用 |
| 费用 | 按次/按月 | 按调用量 | ✅ 完全免费 |
| 批量处理 | 通常不支持 | 需开发 | ✅ 内置队列 |
| 可定制 | 黑盒 | 有限 | ✅ 开源可控 |

---

## 🎯 核心功能

- 🔒 **隐私零泄露** — 图片完全在浏览器内处理，不上传任何服务器
- 🧠 **Edge AI 推理** — 基于百度 PaddleJS，浏览器端运行深度学习 OCR 模型
- ⚡ **WebGL GPU 加速** — 利用显卡进行推理，比纯 CPU 快数倍
- 📦 **模型本地化** — 检测 + 识别模型打包在项目内，`npm install` 自动下载
- 🧹 **高容错解析** — 针对 OCR 乱码优化的正则引擎，自动提取 7 个关键字段
- 📊 **批量队列** — 一次选多张发票，顺序处理，实时进度条
- 📥 **CSV 一键导出** — BOM 头 UTF-8，Excel 打开中文零乱码
- ✏️ **人工校对** — 识别结果可手动修改后再导出

---

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/your-username/privacy-invoice-ocr.git
cd privacy-invoice-ocr

# 2. 安装依赖（自动下载 OCR 模型）
npm install

# 3. 启动开发服务器
npm run dev
```

打开 `http://localhost:5173`，上传发票图片即可。

> 💡 `npm install` 会自动执行 `postinstall` 脚本下载 OCR 模型到 `public/models/`，无需额外操作。

### 构建部署

```bash
npm run build      # 产出到 dist/
npm run preview    # 预览生产构建
```

`dist/` 目录可直接部署到任意静态服务器（Nginx、GitHub Pages、Vercel 等）。

---

## 📸 识别的字段

| 字段 | 示例 | 规则 |
|------|------|------|
| 🧾 发票号码 | `044001800111` | 8-20 位数字，优先匹配"号码/NO"后 |
| 📅 开票日期 | `2024年01月15日` | `YYYY年MM月DD日` 格式 |
| 🏢 购买方 | `某某科技有限公司` | "称:" 后第一个公司名 |
| 🏭 销售方 | `某某信息技术有限公司` | "称:" 后第二个公司名 |
| 🆔 销售方税号 | `91110108MA01XXXXX` | 15-20 位字母数字 |
| 💰 价税合计 | `1234.56` | 文本中最大金额，保留两位小数 |
| 🏛️ 税务局 | `国家税务总局北京市税务局` | 全国 36 个税务局白名单匹配 |

---

## 🏗️ 架构

```
┌──────────────────────────────────────────────────────────────────┐
│                         Browser (100% Local)                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────┐   ┌──────────────┐   ┌──────────┐   ┌───────────┐ │
│  │ 图片上传 │ → │ 步进式压缩   │ → │ PaddleJS │ → │ 正则解析  │ │
│  │ (多选)   │   │ (50% 降采样) │   │ OCR 识别 │   │ 7 字段提取│ │
│  └──────────┘   └──────────────┘   └──────────┘   └───────────┘ │
│                                                         │         │
│                      ┌──────────────────────────────────┘         │
│                      ▼                                            │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌───────────┐     │
│  │ 校对编辑 │ ← │ 字段卡片 │ ← │ 批量队列 │ → │ CSV 导出  │     │
│  │ (可修改) │   │ 实时预览 │   │ 进度追踪 │   │ BOM + UTF8│     │
│  └──────────┘   └──────────┘   └──────────┘   └───────────┘     │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 🛡️ Network Interceptor                                      │ │
│  │ fetch() → paddlejs.cdn.bcebos.com → /models/det + /models/rec│ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 源码模块

```
src/
├── main.js                    🚀 启动入口（3 行）
├── network-interceptor.js     🛡️ 拦截 CDN → 本地模型
├── image-processor.js         🖼️ 步进式降采样 + 图片加载
├── invoice-parser.js          🧠 高容错正则解析引擎
├── export-engine.js           📥 原生 CSV 生成 + 下载
└── ui-controller.js           🎮 DOM 交互 + 批量队列
```

---

## 🔧 关键技术细节

### 隐私保护机制

```javascript
// network-interceptor.js — 拦截所有 PaddleJS CDN 请求
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  if (url.includes('paddlejs.cdn.bcebos.com')) {
    url = url.replace(CDN_BASE, '/models');  // 重定向到本地
  }
  return originalFetch.apply(this, args);
};
```

模型文件在 `npm install` 时通过 `download.mjs` 提前下载到 `public/models/`，运行时零外网请求。

### 步进式图片压缩

大图直接缩放会丢失细节，影响 OCR 准确率。采用**多次 50% 降采样**策略：

```
4096px → 2048px → 1024px → 目标尺寸
        ↑ 每步只缩 50%，保留更多纹理信息
```

### OCR 容错策略

发票 OCR 常有乱码（尤其是印章遮挡），解析引擎做了多层容错：

| 场景 | 策略 |
|------|------|
| 税务局被遮挡 | 白名单匹配，容忍 0-4 个乱码字符 |
| 发票号码格式偏移 | 优先匹配"号码/NO"，兜底匹配发票代码前缀 |
| 税号位置不固定 | 正则 + 兜底 9 开头 18 位纳税人识别号 |
| 金额符号混杂 | 归一化 ¥/￥/Y，取最大金额为价税合计 |

---

## 📁 完整项目结构

```
privacy-invoice-ocr/
├── index.html                 # SPA 入口，左右双栏布局
├── package.json               # 含 postinstall 自动下载脚本
├── download.mjs               # 模型下载工具
├── README.md
├── src/
│   ├── main.js                # 薄启动入口
│   ├── network-interceptor.js # fetch 拦截层
│   ├── image-processor.js     # Canvas 图片预处理
│   ├── invoice-parser.js      # 正则结构化提取
│   ├── export-engine.js       # CSV 生成引擎
│   └── ui-controller.js       # UI 状态与事件
└── public/
    └── models/
        ├── det/               # 文字检测模型 (~2MB)
        │   ├── model.json
        │   └── *.dat
        └── rec/               # 文字识别模型 (~5MB)
            ├── model.json
            └── *.dat
```

---

## 📦 依赖

| 包 | 版本 | 用途 |
|---|------|------|
| `vite` | ^8.x | 开发服务器 & 构建工具 |
| `@paddlejs-models/ocr` | ^1.2 | OCR 模型接口 |
| `@paddlejs/paddlejs-core` | ^2.2 | PaddleJS 推理引擎核心 |
| `@paddlejs/paddlejs-backend-webgl` | ^1.2 | WebGL GPU 加速后端 |

> 零运行时外部依赖。PaddleJS 模型在构建时打包进 `dist/`。

---

## 🔜 路线图

- [x] 多字段正则解析
- [x] 批量图片处理
- [x] CSV 导出（BOM + UTF-8）
- [x] 模块化源码拆分
- [x] `npm postinstall` 自动下载模型
- [ ] 增值税专用发票 / 电子发票
- [ ] 拖拽上传 + 粘贴图片
- [ ] PWA 离线缓存
- [ ] Web Worker 后台推理（不阻塞 UI）

---

## 🐛 常见问题

<details>
<summary><strong>Q: 启动后一直显示"引擎加载中..."？</strong></summary>

检查 `public/models/` 目录下是否有模型文件。如果没有，手动运行：

```bash
node download.mjs
```
</details>

<details>
<summary><strong>Q: OCR 识别率低或乱码？</strong></summary>

- 确保发票图片清晰，分辨率不要太低
- 避免过度倾斜或折叠的发票
- 可以在右侧面板手动修正识别结果后再导出
</details>

<details>
<summary><strong>Q: Chrome 提示 WebGL 不可用？</strong></summary>

在地址栏输入 `chrome://gpu` 检查 WebGL 状态。如被禁用，在 `chrome://flags` 中搜索 WebGL 并启用。
</details>

---

## 📄 License

[MIT](LICENSE)

---

## 🙏 致谢

- [PaddleJS](https://github.com/PaddlePaddle/PaddleJS) — 百度飞桨前端推理框架
- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) — 中文 OCR 识别模型
- [Vite](https://vitejs.dev/) — 下一代前端构建工具
