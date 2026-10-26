# 个人作品集网站

一个纯静态的单页个人网站：深色粒子背景、玻璃拟态卡片、可展开的作品画廊、点击复制联系方式的弹窗。
无框架、无构建、无外部依赖，双击 `index.html` 就能打开。

```
个人网站/
├─ index.html              页面骨架（一般不用改）
├─ favicon.svg             浏览器标签页图标
├─ assets/
│  ├─ css/style.css        样式（配色、间距、动效都在这里）
│  └─ js/
│     ├─ site-data.js      ★ 所有内容：名字、介绍、作品、联系方式
│     ├─ particles.js      背景粒子画布
│     └─ main.js           渲染与交互
└─ preview/                截图预览（可删）
```

## 改成自己的网站

**只改 `assets/js/site-data.js` 一个文件就够了。**

| 字段 | 作用 |
| --- | --- |
| `meta.description` | 浏览器标签 / 搜索结果里的一句话简介 |
| `brand.name` / `brand.latin` | 中文名、英文名（首页大标题与左上角 Logo 文字） |
| `brand.role` | 身份，如「品牌设计师 / 独立开发者」 |
| `brand.mark` | 站点 Logo 的 SVG，可换成自己的图形 |
| `hero.eyebrow` / `hero.meta` | 首页小标签、名字下面那行要点 |
| `about.lead` | 关于我的开场自我介绍 |
| `about.cards` | 三张玻璃卡片：标题 + 一段话 |
| `about.facts` | 四个数据（数字 + 说明） |
| `about.skills` | 技能标签 |
| `works.lead` | 作品区导语 |
| `works.projects` | 作品列表，见下方说明 |
| `contact.items` | 联系方式（点击整行即可复制） |
| `footer.text` | 页脚版权 |

每个作品的写法：

```js
{
  title: "作品名",
  type: "项目类型",        // 如「品牌重塑」
  year: "2025",
  bg: "#d8794b",            // 卡片底色
  ink: "#24120a",           // 卡片上图标的颜色
  summary: "一两句话介绍这个项目。",
  tags: ["Logo", "包装"],   // 标签，可留空数组
  links: [],                // 可选：{ label: "查看案例", href: "https://..." }
  mark: '<svg viewBox="0 0 160 160">…</svg>'  // 卡片上的图形
}
```

> 想加作品就复制一段对象；`mark` 里任意 SVG 都能用，`fill="currentColor"` / `stroke="currentColor"`
> 会自动跟随 `ink` 的颜色。

改完 `site-data.js` 记得把 `index.html` 里 `<title>` 和 `<meta name="description">` 也顺手改一下
（页面打开后 JS 会自动用 `site-data.js` 覆盖它们，但这两个标签是给搜索引擎和分享卡片看的）。

## 本地预览 & 部署

```powershell
# 方式一：直接双击 index.html

# 方式二：起一个本地服务器（推荐，剪贴板等接口更稳定）
python -m http.server 8000
# 然后访问 http://127.0.0.1:8000
```

部署：把整个文件夹拖到 GitHub Pages / Netlify / Vercel / 任意对象存储（OSS、COS）都能直接用。
域名、HTTPS 都在平台侧配置，站点本身不需要任何服务端。

## 交互与细节

- **滚动联动**：导航高亮、标签页标题、背景粒子模式会跟随当前板块切换。
- **作品卡片**：点一下放大成通栏详情（桌面）/ 上下结构（手机），再点一下收起，`Esc` 也能收起。
- **联系我**：点击整行复制邮箱 / 微信，右下角出现提示。
- **移动端**：≤860px 收起为右上角菜单；≤700px 作品卡片改为单列。
- **无障碍**：键盘可完成全部操作，弹窗有焦点循环与 `Esc` 关闭，系统开启「减少动态效果」时动画自动关闭。
- **性能**：粒子数量按屏幕面积自适应，页面切到后台自动暂停，设备像素比上限 2。

## 配色

改 `assets/css/style.css` 顶部的 `:root` 变量即可：`--bg`（背景）、`--text`（正文）、`--line`（描边）。
作品卡片颜色在 `site-data.js` 里逐个设置，互不影响。

## 换掉人像

- 首页主视觉：`assets/img/portrait.webp`（已经抠掉背景，宽高比约 1.21 : 1）
- 关于我卡片：`assets/img/portrait-card.jpg`（900 × 900 方图）

用同名文件覆盖即可，页面不用改。首页那张建议保持「人物居中、底部逐渐透明」的处理，
这样它才能自然融进背后巨大的 SANQI 描边字里；换图后如果想重新抠背景，可以让我再处理一次。
## 首页人像的交互

纯 CSS，没有 JS，人像本身保持静止：

- 鼠标移到人像上：放大到 1.045 倍，背后亮起一圈柔光，投影加深；移开自动缩回
- 过渡曲线 `cubic-bezier(.16, 1, .3, 1)`、时长 0.55s，所以是「轻轻弹一下」而不是硬切
- 系统开启「减少动态效果」时，缩放会立即完成

想改幅度：`style.css` 里 `.hero-stage:hover .hero-portrait` 的 `scale(1.045)`。