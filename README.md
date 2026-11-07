# 三七 · 个人网站

**中文** ｜ [English](README.en.md)

一个人的开发者主页 —— 用一部 11 秒的黏土动画短片串起四页内容：滚动翻页，影片跟着逐帧推进；首页角色会跟着鼠标转头。

🔗 **在线预览：https://SANQI-AICreator.github.io/portfolio/**

![首页](preview-hero.jpg)

---

## 这是什么

一个**纯 HTML + CSS + JavaScript** 的单页作品集，没有框架、没有构建工具、没有外部依赖（字体、视频、图片全部本地）。`index.html` 一个文件里就是全部样式与脚本，约 163 KB。

四页：

| # | 页面 | 内容 |
|---|---|---|
| 01 | 关于 | 大标题排版、两段统计、联系我按钮 |
| 02 | 简历 | 可翻转的玻璃卡片 —— 正面概要，翻到背面看完整履历 |
| 03 | 作品 | 3D 深度轮播，五个项目，点击展开详情 |
| 04 | 联系 | 与首页同构的三栏排版、邮箱一键复制 |

## 交互设计

**页面切换**　不是原生长滚动，而是"换页"模型：滚轮一格、上下方向键、触屏上下滑各翻一页。翻页时背景影片用 `currentTime` 精确 seek（视频已重编码为全关键帧，可以瞬间跳到任意帧），文字层做上浮淡入。

**首页追视**　鼠标位置换算成"相对角色脸部"的向量，再用角度映射到一段 264 帧的转头素材（`assets/gaze2/`）上，用一个环形关键帧表插值出对应的秒数，最后画到 canvas 上。指针停在原处时保持当前姿势，不会自己乱转。

**简历卡片**　点击或左右拖动翻面，弹簧阻尼是手写的（`k=170 / c=20`），悬停时有轻微倾斜和高光；键盘 `Enter` / `Space` 也能翻。

**作品轮播**　卡片的 `translateZ` / `rotateY` / 明暗 / 模糊由一张环形位置表算出，形成放射状深度队列；拖动、箭头、圆点、横向滚轮都能切，4.5 秒自动轮播（悬停或打开详情时暂停）。

**细节**　胶囊导航用 SDF + 等值线裁剪出"溶解"动画；"联系我"按钮是 WebGL2 写的镜面高光边框；光标是一枚霓虹箭头；邮箱和联系方式都能一键复制。

## 无障碍与兼容

- `prefers-reduced-motion: reduce` 下关闭翻转、倾斜、弹簧动画，只保留淡入
- 视频 `muted` + `playsinline`，iOS Safari 不会强制全屏
- 触屏设备：不加载自定义光标，简历/作品改为底部抽屉布局
- 语义化标签 + `aria-pressed` / `aria-hidden` / `role`，键盘可操作

## 目录

```
.
├── index.html          # 全部样式与脚本（单文件）
├── assets/
│   ├── hero-1080.mp4   # 首屏影片，1920×1080，11.03 s，全关键帧 22 MB
│   ├── hero-720.mp4    # 移动端版本，1280 宽 7 MB
│   ├── gaze2/          # 264 张转头帧（576×720 webp，7.7 MB）
│   ├── fonts/          # Anton + Inter + JetBrains Mono + Noto Sans SC（子集）
│   ├── resume.webp     # 简历页角色
│   ├── work.webp       # 作品页角色
│   ├── work-1…5.webp   # 五个项目的配图
│   └── poster.jpg      # 视频首帧
├── preview/            # 各页截图（不参与部署）
├── build-dist.py       # 打包成 dist/
└── deploy.ps1          # 打包 + 提交 + 推送
```

## 本地预览

资源都是相对路径，直接用浏览器打开 `index.html` 也能跑，但建议起一个本地服务（避免个别浏览器对 `file://` 的限制）：

```bash
cd code文件
python -m http.server 8088
# 打开 http://127.0.0.1:8088/
```

## 部署

推送即发布。`dist/` 是一个独立的 git 仓库，`main` 分支根目录就是站点根目录。

```powershell
# 改完 index.html 之后
pwsh -File deploy.ps1 "改了首屏文案"
```

`deploy.ps1` 会依次做：`build-dist.py` 重建 `dist/`（补 favicon、OG 标签、`.nojekyll`、404 兜底）→ 提交 → 推送。GitHub Pages 约 30–60 秒后重新构建。

## 性能

首访约 **250 个请求 / 30 MB**，其中主影片 22 MB。之后走浏览器缓存。

想更轻可以：主影片降到 1080p / CRF 26（约 12 MB）、追视帧改为进入首屏才加载并抽掉重复帧，预计首访降到 13 MB 左右，拖动手感不受影响（仍是全关键帧）。

## 说明

- 角色短片、角色插画由即梦 AI 生成后二次处理；作品配图同样为 AI 生成
- 字体：Anton、Inter、JetBrains Mono（SIL OFL）；中文为 Noto Sans SC 子集
- 交互灵感参考了 React Bits 的 FlipCard / DepthCarousel / GooeyNav / SpecularButton / CardSwap，但这里全部用原生 JS 重写，没有引入 React 或 gsap

© 2025 三七 — 上海
