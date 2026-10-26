# 部署上线（GitHub Pages，免费免备案）

站点是纯静态的（10 个发布文件、434 KB、零外部依赖），产物已经在本地仓库里提交好了，
推到 GitHub、打开 Pages 就能全世界访问。**不需要买服务器，也不需要备案。**

---

# 一、先说清楚这条路的边界

| | 情况 |
| --- | --- |
| 费用 | 免费（Public 仓库） |
| 上线时间 | 5 分钟 |
| 网址 | `https://你的用户名.github.io/portfolio/`，绑自己的域名也可以 |
| HTTPS | 自动，免费 |
| 国内访问 | **一般**：能开，但 GitHub 在境内不稳定，晚高峰可能慢或偶尔打不开 |

适合：先把网站发出去、给别人看作品。以后嫌慢，同一套文件可以直接搬到 Vercel / 香港 / 大陆服务器，
**换的只是托管，网站本身一行都不用改**。

---

# 二、三步上线

## 1. 建仓库

打开 <https://github.com/new>：

- **Repository name**：`portfolio`
  （想直接得到 `https://你的用户名.github.io/` 这样的根网址，就把仓库名写成 `你的用户名.github.io`）
- **Visibility**：**Public**（私有仓库的 Pages 要付费，免费版不支持）
- 不要勾 "Add a README file"
- 点 **Create repository**

## 2. 把本地代码推上去

把 `你的用户名` 换成实际的 GitHub 用户名：

```powershell
cd "D:\AI项目\DSH\个人网站"
git remote add origin https://github.com/你的用户名/portfolio.git
git branch -M main
git push -u origin main
```

> 第一次 `push` 会弹出浏览器登录窗口，授权即可。
> 如果命令行问密码，填 **Personal Access Token**（GitHub → Settings → Developer settings → Personal access tokens），不是账号密码。

推送成功后，仓库里应该能看到 `index.html`、`assets/`、`404.html` 等文件（`preview/` 被我 exclude 了，不会上传）。

## 3. 打开 Pages

仓库 → **Settings** → 左侧 **Pages**：

- **Source**：`Deploy from a branch`
- **Branch**：`main`，目录 `/(root)`
- 点 **Save**

等 1–2 分钟（顶部会显示 "Your site is live at …"），访问：

```
https://你的用户名.github.io/portfolio/
```

**到这里就上线了**，这个链接可以直接发给别人。手机也能打开。

---

# 三、验证 & 常见问题

**怎么确认部署成功？**
仓库 → **Actions** 标签，看到 `pages build and deployment` 是绿色对勾就成功了。
或者看 Settings → Pages 顶部有没有显示访问地址。

**图片 / 样式 404？**
GitHub Pages **区分大小写**。确认服务器上的路径与代码里完全一致：`assets/img/portrait.webp`。
（本地 Windows 不区分大小写，所以本地正常、线上 404 的情况很常见。）

**改了内容没生效？**
等 1 分钟；浏览器 `Ctrl + F5` 强刷（HTML 会被缓存）。

**`404.html` 有用吗？**
有用。访问不存在的路径时 GitHub Pages 会返回它，里面的「回到首页」按钮会自动适配
`/portfolio/` 这种子路径和自定义域名的根路径两种部署方式。

**想改成根网址 `用户名.github.io`？**
把仓库重命名为 `你的用户名.github.io`，Settings → Pages 里重新 Save 一次即可。

---

# 四、以后怎么更新

```powershell
cd "D:\AI项目\DSH\个人网站"
# 改完 assets/js/site-data.js
git add -A
git commit -m "更新作品"
git push
```

推上去 1 分钟内自动重新部署。

---

# 五、绑定自己的域名（可选，随时可加）

1. 买域名（阿里云 / 腾讯云 / Cloudflare，`.com` 首年 ¥60–80），完成**实名认证**
2. 仓库 → Settings → Pages → **Custom domain** 填 `sanqi.design` → Save
   （仓库里会自动生成 `CNAME` 文件，**别删**）
3. 域名商后台加解析：

| 类型 | 主机记录 | 记录值 |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `你的用户名.github.io` |

4. 等 DNS 生效（10 分钟–2 小时），Pages 里出现绿色对勾后勾选 **Enforce HTTPS**

> 域名指向 GitHub Pages（境外）**不需要备案**；备案只针对解析到中国大陆服务器的情况。

---

# 六、以后想更快：三条迁移路线（域名和代码都不用改）

| 方案 | 国内速度 | 上线时间 | 成本 |
| --- | --- | --- | --- |
| Vercel + 自定义域名 | 150–400ms | 15 分钟 | 免费 |
| 香港轻量服务器 | 40–90ms | 当天 | ¥250–350/年 |
| 大陆服务器 + 备案 | 20–40ms | 1–3 周 | ¥100–200/年 + 域名 |

- **Vercel**：`vercel.json` 已经放在根目录（缓存与安全头），GitHub Pages 会把它当普通文件忽略，不影响现在使用。
- **香港 / 大陆服务器**：`deploy/nginx.conf` + `deploy/upload.ps1` 已备好，一条命令上传部署：

```powershell
.\deploy\upload.ps1 -Server 服务器IP -User root -Domain sanqi.design
```

迁移只改 DNS 记录，网站文件不用动。

---

# 七、上线前检查清单

- [ ] `assets/js/site-data.js`：姓名、作品、联系方式都是真实内容
- [ ] 不想公开的信息（私人手机号等）没有放上去
- [ ] `index.html`：`<title>`、`<meta name="description">` 与内容一致
- [ ] 绑了域名后，把 `og:image` 改成完整网址，分享才有缩略图：
      `content="https://sanqi.design/assets/img/portrait-card.jpg"`
- [ ] 手机打开一次：菜单、作品展开、复制联系方式正常
- [ ] 微信里打开一次（境外域名偶尔会提示「非官方网页」，属正常现象）
