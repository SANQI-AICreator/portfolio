# 部署上线指南（GitHub Pages + 自己的域名）

这个网站是**纯静态**的：只有 HTML / CSS / JS / 图片，没有后端、不需要构建。
下面这条路线完全免费（域名除外），不需要备案，改完内容 `git push` 就更新。

> 本地仓库已经初始化并提交好了（`git log` 能看到第一次提交），
> 下列命令都在本文件夹（`D:\AI项目\DSH\个人网站`）里执行。

---

## 第 0 步：注册 GitHub（如果还没有）

<https://github.com/signup>，用邮箱注册即可，用户名会被用作网址的一部分（如 `sanqi`）。

---

## 第 1 步：建仓库

打开 <https://github.com/new>：

- **Repository name**：填 `portfolio`（想用 `用户名.github.io` 当网址，就把仓库名写成 `用户名.github.io`）
- **Visibility**：选 **Public**（私有仓库的 Pages 要付费）
- 不要勾选 "Add a README file"，直接 **Create repository**

---

## 第 2 步：把本地代码推上去

把下面的 `你的用户名` 和 `portfolio` 换成实际值：

```powershell
cd "D:\AI项目\DSH\个人网站"
git remote add origin https://github.com/你的用户名/portfolio.git
git branch -M main
git push -u origin main
```

> 第一次 push 会弹出浏览器登录窗口，授权即可。
> 如果提示要密码，密码处填 **Personal Access Token**（GitHub → Settings → Developer settings → Tokens），不是账号密码。

---

## 第 3 步：打开 Pages

仓库页 → **Settings** → 左侧 **Pages**：

- **Source**：Deploy from a branch
- **Branch**：`main`，目录 `/(root)`
- 点 **Save**

等 1～2 分钟（页面顶部会显示部署进度），访问：

```
https://你的用户名.github.io/portfolio/
```

这一步成功就说明**全世界都能访问了**——可以先把这个链接发给朋友看效果，再慢慢弄域名。

---

## 第 4 步：买一个域名

推荐在国内平台买，支付宝付款、实名认证方便：

| 平台 | 优点 | 备注 |
| --- | --- | --- |
| 阿里云（万网） | 支付宝、实名快 | 首年 .com 约 ¥60-80，续费约 ¥90 |
| 腾讯云 | 同上，常有优惠券 | 同上 |
| Cloudflare Registrar | 成本价、无溢价 | 需要国际信用卡 |

买的时候注意：

1. **域名要能自定义 DNS**（以上几家都行）
2. 国内平台买的域名要做**实名认证**（上传身份证），不认证会被暂停解析
3. 用 GitHub Pages 托管**不需要备案**（服务器在境外），备案是国内服务器才需要
4. 建议同时把 `www` 和根域名都保留，两边都能打开

---

## 第 5 步：把域名绑到 GitHub Pages

### 1）在 GitHub 里填域名

仓库 → **Settings** → **Pages** → **Custom domain**，填入 `sanqi.design`（你的域名），点 Save。
GitHub 会在仓库里自动生成一个 `CNAME` 文件，**以后不要删它**。

### 2）到域名商后台加解析

以阿里云为例：域名控制台 → 解析设置 → 添加记录。**四条 A 记录 + 一条 CNAME**：

| 记录类型 | 主机记录 | 记录值 | TTL |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | 600 |
| A | `@` | `185.199.109.153` | 600 |
| A | `@` | `185.199.110.153` | 600 |
| A | `@` | `185.199.111.153` | 600 |
| CNAME | `www` | `你的用户名.github.io` | 600 |

（如果域名商支持 IPv6，可以再加四条 AAAA：`2606:50c0:8000::153`、`2606:50c0:8001::153`、`2606:50c0:8002::153`、`2606:50c0:8003::153`，不是必须。）

### 3）等 DNS 生效

一般 10 分钟到 2 小时。用 `ping sanqi.design` 看到 `185.199.108.153` 就说明生效了。

### 4）开启强制 HTTPS

回到 Settings → Pages，等 **Custom domain** 那一行出现绿色对勾（GitHub 自动签发证书，可能要等几分钟到几小时），
然后勾上 **Enforce HTTPS**。之后 `http://` 会自动跳转到 `https://`。

---

## 第 6 步：把分享图改成完整网址

绑定域名成功后，改一下 `index.html` 里这一行，微信/Twitter 分享时才有缩略图：

```html
<meta property="og:image" content="https://sanqi.design/assets/img/portrait-card.jpg">
```

然后提交：

```powershell
cd "D:\AI项目\DSH\个人网站"
git add -A
git commit -m "配置自定义域名"
git push
```

---

## 以后怎么更新内容

```powershell
cd "D:\AI项目\DSH\个人网站"
# 改完 assets/js/site-data.js 之后
git add -A
git commit -m "更新作品"
git push
```

等 1 分钟左右自动生效。浏览器有缓存的话按 `Ctrl + F5` 强刷。

---

## 上线前检查清单

- [ ] `assets/js/site-data.js`：名字、作品、联系方式都是真实内容
- [ ] `index.html`：`<title>`、`<meta name="description">`、`og:image` 都对
- [ ] 手机打开一次：菜单、作品展开、复制联系方式都正常
- [ ] 不想公开的信息（私人手机号等）不要放上去

---

## 常见问题

**国内访问 GitHub Pages 慢 / 打不开？**
这是 GitHub 在境内的网络问题，没有技术手段能彻底解决。域名可以保留，
以后换成国内对象存储（阿里云 OSS / 腾讯云 COS）+ 备案域名，只需要把 DNS 记录改指过去，网站文件一行都不用动。

**图片 404？**
路径区分大小写，确认 `assets/img/portrait.webp` 大小写与代码一致。

**改了没生效？**
看仓库的 **Actions** 页有没有新部署；再按 `Ctrl + F5`。

**能不能加访问统计？**
可以，接入 Umami / Plausible / 51LA 这类服务，在 `index.html` 的 `</body>` 前加一段脚本即可。

---

## 备选方案（不想用 GitHub 时）

- **Netlify Drop**：<https://app.netlify.com/drop>，把整个文件夹拖进去，10 秒上线，免备案
- **Cloudflare Pages**：连 GitHub 仓库自动部署，免费额度大
- **国内云**：需要已备案域名 + 对象存储静态网站托管，国内速度最好
