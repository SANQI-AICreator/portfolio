# 部署上线指南

这个网站是**纯静态**的：只有 HTML / CSS / JS / 图片，没有后端、没有数据库、不需要构建。
任何能把文件夹放到公网的地方都能跑，最省事的方式 1 分钟搞定，最正规的方式需要域名和备案。

> 本地仓库已经初始化并提交好了（`git log` 能看到 `initial commit`），
> 下面所有命令都在本文件夹（`D:\AI项目\DSH\个人网站`）里执行。

---

## 一、选一个平台

| 方案 | 费用 | 国内访问 | 是否要备案 | 适合 |
| --- | --- | --- | --- | --- |
| **Netlify Drop** | 免费 | 一般（海外节点） | 不需要 | 想 1 分钟先上线 |
| **GitHub Pages** | 免费 | 一般（偶尔慢） | 不需要 | 长期维护、以后常改 |
| **Cloudflare Pages** | 免费 | 不稳定 | 不需要 | 有 Cloudflare 账号 |
| **Vercel** | 免费额度 | 一般 | 不需要 | 习惯 Git 工作流 |
| **阿里云 OSS / 腾讯云 COS** | 几块钱/月 | **快** | **必须备案** | 面向国内访客、有备案域名 |

如果是给国内的人看、又要稳定快速，最终还是要走「备案域名 + 国内云」；
先用 Netlify 或 GitHub Pages 把链接发出去，之后再换域名也不迟。

---

## 二、方案 A：Netlify Drop（最快，不用命令行）

1. 打开 <https://app.netlify.com/drop>
2. 把 `D:\AI项目\DSH\个人网站` **整个文件夹**拖进页面（不是拖 zip）
3. 等十几秒，得到一个 `https://随机名.netlify.app` 的链接，**这就是可以发人的网址**
4. 想改网址：Site configuration → Change site name，改成 `sanqi` 之类 → `https://sanqi.netlify.app`

更新内容：改完文件，再拖一次到同一个站点（Deploys → Drag and drop），会生成新版本。
免费额度对个人站完全够用，还自带 HTTPS。

---

## 三、方案 B：GitHub Pages（推荐长期用）

### 1. 在 GitHub 建仓库

登录 <https://github.com/new>，Repository name 填 `portfolio`（或任意名），
**Public**（私有仓库的 Pages 要付费），不要勾选 README / .gitignore，直接 Create。

### 2. 推上去

把下面的 `你的用户名` 和 `portfolio` 换成实际值：

```powershell
cd "D:\AI项目\DSH\个人网站"
git remote add origin https://github.com/你的用户名/portfolio.git
git branch -M main
git push -u origin main
```

> 第一次 `push` 会弹出登录窗口，用浏览器授权即可（或者用 Personal Access Token 当密码）。

### 3. 打开 Pages

仓库 → **Settings** → 左侧 **Pages** → Build and deployment：

- Source 选 **Deploy from a branch**
- Branch 选 **main**，目录选 **/(root)**
- 点 **Save**

等 1～2 分钟，访问：

```
https://你的用户名.github.io/portfolio/
```

如果仓库名就叫 `你的用户名.github.io`，网址则是 `https://你的用户名.github.io/`（少了子路径）。

### 4. 以后改内容

```powershell
cd "D:\AI项目\DSH\个人网站"
git add -A
git commit -m "更新作品"
git push
```

一分钟左右自动生效。

---

## 四、方案 C：国内云（要备案）

以阿里云 OSS 为例（腾讯云 COS 同理）：

1. 开通 OSS，新建 Bucket，**读写权限设为「公共读」**
2. 基础设置 → 静态页面：默认首页填 `index.html`，默认 404 填 `404.html`
3. 把整站文件上传到 Bucket 根目录（保持 `assets/` 目录结构）
4. 绑定自定义域名（如 `sanqi.design`）——**域名必须已完成 ICP 备案**，
   未备案的域名无法绑定，只能用 OSS 默认域名访问（浏览器会提示、且可能被限速）
5. 建议再挂一个 CDN，开启 HTTPS

备案：在服务器/云厂商的备案系统提交，需要身份证、域名证书，通常 1～3 周。
备案主体是域名，所以**先买域名再备案**。

---

## 五、绑定自己的域名

不管用哪个平台，套路一样：

1. 买域名（阿里云 / 腾讯云 / Cloudflare / Namecheap 都行，`.com` 约 ¥60-80/年）
2. 在平台后台添加自定义域名（Netlify：Domain settings；GitHub Pages：Settings → Pages → Custom domain）
3. 到域名商后台按平台提示加解析记录：
   - 根域名 `@` → A 记录 / ALIAS 记录（平台会给 IP 或目标）
   - `www` → CNAME 指向平台给的地址
4. 等 DNS 生效（几分钟到几小时），平台会自动签发 HTTPS 证书

用 GitHub Pages 时，绑定域名后仓库根目录会出现 `CNAME` 文件，**不要删**。

---

## 六、上线前检查清单

- [ ] `assets/js/site-data.js` 里的名字、作品、联系方式都换成真实内容
- [ ] 联系方式里不要放你不想公开的东西（页面上的内容所有人都能看到）
- [ ] 把 `index.html` 里的 `og:image` 改成完整网址，分享到微信/Twitter 才有缩略图：
      `content="https://你的域名/assets/img/portrait-card.jpg"`
- [ ] `index.html` 的 `<title>` 和 `<meta name="description">` 与内容一致
- [ ] 手机打开一次，确认菜单、卡片、复制联系方式都正常

## 七、常见问题

**图片不显示？**
多半是路径大小写问题。GitHub Pages 区分大小写，确保 `assets/img/portrait.webp` 与代码里写的一模一样。

**改了内容，线上没变？**
等 1 分钟；或按 `Ctrl + F5` 强制刷新（浏览器会缓存 HTML）。GitHub Pages / Netlify 都有部署状态页可以看。

**能放多少个作品？**
没有限制。`site-data.js` 里 `works.projects` 复制一段就是新项目，卡片会自动排布。

**需要后端吗？**
表单、留言板这类功能需要后端。目前「联系我」是复制邮箱/微信，不需要服务器。
以后要加表单，可以用 Netlify Forms 或 Formspree 这类免费服务，仍然不用自己写后端。
