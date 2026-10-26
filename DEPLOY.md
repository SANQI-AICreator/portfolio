# 部署上线指南

这个网站是**纯静态**的（HTML / CSS / JS / 图片，共 434 KB，没有任何外部依赖），
所以换成国内服务器后首屏基本是「秒开」——瓶颈只在服务器带宽，不在代码。

仓库已经初始化并提交好了，下面命令都在本文件夹（`D:\AI项目\DSH\个人网站`）执行。

---

# 一、国内秒开：两条路，先选一条

| | **A. 大陆服务器 + 备案** | **B. 香港轻量（免备案）** |
| --- | --- | --- |
| 国内访问速度 | 最快，20–40ms | 较快，40–90ms（跨境出口） |
| 多久能上线 | 备案 1–3 周 | **当天** |
| 费用/年 | 域名 ¥70 + 服务器 ¥100–200 | 域名 ¥70 + 服务器 ¥250–350 |
| 合规 | 需要 ICP 备案（个人可备，作品集没问题） | 不需要备案 |
| 稳定性 | 最稳 | 高峰期偶有抖动 |

**建议**：不着急就先走 B，当天把域名跑起来；等备案下来再迁到 A（只改 DNS，网站文件不用动）。
着急「秒开」且能等两三个礼拜，就直接走 A。

---

# 二、路线 A：大陆服务器（真正的秒开）

## 0. 你要准备的东西

- 一个域名（阿里云 / 腾讯云买，`.com` 首年 ¥60–80，**必须完成实名认证**）
- 身份证、手机号、常用邮箱
- 一台大陆服务器（备案需要它的「备案服务码」，所以不能只买对象存储）

## 1. 买服务器

买**轻量应用服务器**最划算（阿里云 / 腾讯云，2 核 2G、3–4M 带宽，促销价 ¥100–200/年）。
注意两点：

- 地域选**大陆**（香港/海外的不给大陆备案）
- 购买时长要 **3 个月以上**，否则拿不到备案服务码

## 2. 提交 ICP 备案

在云厂商 App 或控制台点「ICP 备案」：

1. 备案类型选**个人**
2. 填域名、服务器（系统会带出备案服务码）、身份证、手机号
3. 上传证件、按提示做**人脸核验**（现在多数省份不用幕布拍照了）
4. 提交给云厂商初审（1–2 个工作日）→ 管局审核（**7–20 个工作日**）

备案期间网站是打不开的（未备案域名不能解析到大陆服务器），
**这段时间先用 GitHub Pages 的链接过渡**（见文末）。

## 3. 备案通过后：部署网站

服务器装好 Nginx（或宝塔面板），把站点文件传上去。两种方式：

**方式一：用项目里的脚本（推荐）**

```powershell
cd "D:\AI项目\DSH\个人网站"
.\deploy\upload.ps1 -Server 你的服务器IP -User root -Domain sanqi.design
```

脚本会自动打包 → `scp` 上传 → 服务器上解压到 `/var/www/sanqi` → `nginx -t` 并重载。
（前提：本机能 `ssh root@IP` 登录，建议先配好免密登录。）

**方式二：图形界面**

用 WinSCP / 宝塔面板的「文件」功能，把 `index.html`、`404.html`、`favicon.svg`、
`robots.txt`、`assets/` 传到 `/var/www/sanqi/`（保持目录结构）。

## 4. 配置 Nginx

把项目里的 [`deploy/nginx.conf`](deploy/nginx.conf) 传到 `/etc/nginx/conf.d/sanqi.conf`，
改两处：

```nginx
server_name sanqi.design www.sanqi.design;   # 换成你的域名
root /var/www/sanqi;                          # 文件实际所在目录
```

然后：

```bash
nginx -t && systemctl reload nginx
```

这份配置已经包含：gzip 压缩（文本资源压到 1/4）、`assets/` 长缓存、HTML 不缓存、
404 页面、安全响应头。

## 5. 域名解析

域名商控制台 → 解析设置 → 添加：

| 类型 | 主机记录 | 记录值 |
| --- | --- | --- |
| A | `@` | 你的服务器公网 IP |
| A | `www` | 你的服务器公网 IP |

（如果服务器有独立 IPv6，再加 AAAA 记录。）

## 6. 免费 HTTPS

**最简单**：云厂商控制台的「SSL 证书」里申请免费 DV 证书（一年期，到期可续），
下载 Nginx 格式，上传到 `/etc/nginx/ssl/`，把 `nginx.conf` 里注释掉的 443 那段打开。

**或自动续期**：

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d sanqi.design -d www.sanqi.design
```

证书配好后，把 80 端口那段改成 `return 301 https://$host$request_uri;` 强制跳转。

## 7.（可选）CDN 加速

站点只有 434 KB，单机 Nginx + gzip 已经够快，**开 CDN 意义不大**。
如果以后图片多了，再挂阿里云 CDN / 腾讯云 CDN，回源指向这台服务器即可。

---

# 三、路线 B：香港轻量（免备案，当天上线）

1. 买**香港/新加坡**的轻量应用服务器（阿里云、腾讯云都有，¥24–30/月或年付更便宜）
2. 装 Nginx，按路线 A 的第 3–4 步上传文件、配置 `nginx.conf`
3. 域名解析 A 记录指向服务器 IP（香港服务器不需要备案，解析立刻生效）
4. HTTPS 同上（certbot 或免费证书）

适合：想马上有个自己域名的站、又不想等备案。
国内访问大约 40–90ms，日常浏览体感已经很快；高峰时段可能偶有抖动。

---

# 四、备案期间的过渡：GitHub Pages（免费）

备案没下来之前，先用 GitHub Pages 把链接发出去：

1. <https://github.com/new> 建仓库，名字 `portfolio`，选 **Public**
2. 推送：

```powershell
cd "D:\AI项目\DSH\个人网站"
git remote add origin https://github.com/你的用户名/portfolio.git
git branch -M main
git push -u origin main
```

3. 仓库 → Settings → Pages → Source 选 `Deploy from a branch` → `main` / `(root)` → Save
4. 等 1–2 分钟，访问 `https://你的用户名.github.io/portfolio/`

备案下来后，把域名解析从 GitHub 改指到国内服务器即可，网站文件一行都不用改。

---

# 五、以后怎么更新内容

改完 `assets/js/site-data.js` 之后：

- **国内服务器**：重新运行一次 `.\deploy\upload.ps1 -Server IP -User root`
- **GitHub Pages**：`git add -A; git commit -m "更新"; git push`

Nginx 那套配置里 HTML 不缓存，所以改完刷新就能看到；图片等静态资源缓存 30 天，
如果换了图片文件名没变，记得 `Ctrl + F5` 或者改个文件名。

---

# 六、上线前检查清单

- [ ] `assets/js/site-data.js` 里是真实的姓名、作品、联系方式
- [ ] 不想公开的信息（私人手机号等）没有放上去
- [ ] `index.html` 的 `<title>`、`<meta name="description">` 与内容一致
- [ ] `og:image` 改成完整网址，分享才有缩略图：
      `content="https://sanqi.design/assets/img/portrait-card.jpg"`
- [ ] 手机打开一次：菜单、作品展开、复制联系方式正常
- [ ] 备案通过后 30 天内，各省可能还要求做**公安联网备案**，按提示补充即可

---

# 七、常见问题

**国内访问还是慢？**
先看是不是 CDN/域名解析还没生效；再看服务器带宽（3M 带宽约等于 375KB/s，
本站 434KB，首次加载约 1.2 秒，之后走缓存基本秒开）。真要更快可以升到 5M 带宽或加 CDN。

**图片 404 / 样式丢失？**
路径区分大小写，确认服务器上 `assets/img/portrait.webp` 大小写与代码一致。

**备案要多久？**
云厂商初审 1–2 天 + 管局 7–20 个工作日，各省不同，没有加急办法。

**能不能加访问统计？**
可以，接 Umami / Plausible / 51LA，在 `index.html` 的 `</body>` 前加一段脚本即可。
