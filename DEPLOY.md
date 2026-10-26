# 部署上线指南（Vercel + 自己的域名，免备案）

站点是纯静态的（12 个文件、434 KB、零外部依赖），所以部署只是「把文件放到一个能公网访问的地方」。

**你现在要走的路线：Vercel + 买一个域名。** 全程免备案，15 分钟上线。

---

# 一、先说实话：Vercel 在国内的真实体验

| | 速度 | 稳定性 |
| --- | --- | --- |
| `xxx.vercel.app` 默认域名 | 国内经常打不开 | 差（域名常被污染，**不要用这个发人**） |
| **自己的域名指向 Vercel** | 约 150–400ms 首字节 | 基本能开，晚高峰偶有抖动 |

结论：**能访问、免备案、免费，但不要期待「秒开」**。真正秒开只有大陆服务器 + 备案（文末有）。
好消息是这个站很轻（首屏 ~400KB，gzip 后更小），实际打开体感会比数字好。

如果你更在意国内速度又不想备案，**香港轻量服务器**（¥24/月左右）比 Vercel 稳得多，见第五节。

---

# 二、Vercel 部署步骤

## 0. 准备

- GitHub 账号（代码要先推上去，Vercel 从仓库自动部署）
- 一个域名（`.com` 首年 ¥60–80，阿里云 / 腾讯云 / Cloudflare 都行）
- 域名**做实名认证**（国内注册商要求，不做会被暂停解析）

> 域名解析到境外服务器**不需要备案**。备案只针对「解析到中国大陆服务器」的情况。

## 1. 把代码推到 GitHub

```powershell
cd "D:\AI项目\DSH\个人网站"
git remote add origin https://github.com/你的用户名/portfolio.git
git branch -M main
git push -u origin main
```

（仓库在 <https://github.com/new> 建，选 **Public**，不要勾 README。）

## 2. 导入 Vercel

1. <https://vercel.com/signup> → 用 **GitHub 账号**注册/登录
2. 控制台点 **Add New… → Project**
3. 找到 `portfolio` 仓库 → **Import**
4. 配置页保持默认即可（框架会被识别为 **Other**，无需 Build Command / Output Directory）
5. 点 **Deploy**，约 20 秒完成

得到一个 `https://portfolio-xxxx.vercel.app`。**这个域名在国内大概率打不开，别急，下一步绑自己的域名。**

## 3. 绑定域名

Vercel 项目 → **Settings → Domains**，输入你的域名（如 `sanqi.design`），点 **Add**；
再添加一条 `www.sanqi.design`（Vercel 会自动把 www 跳转到主域名）。

然后到域名商后台加解析：

| 类型 | 主机记录 | 记录值 | 说明 |
| --- | --- | --- | --- |
| A | `@` | `76.76.21.21` | 裸域名指向 Vercel（以面板显示为准） |
| CNAME | `www` | `cname.vercel-dns.com` | www 子域名 |

> ⚠️ 以 **Vercel 的 Domains 面板里显示的记录值为准**——新项目有时会给出不同的 IP，
> 照抄面板上的就不会错。官方说明：<https://vercel.com/kb/guide/a-record-and-caa-with-vercel>

## 4. 等生效 + 自动 HTTPS

DNS 一般 10 分钟到 2 小时生效（`ping sanqi.design` 能看到 Vercel 的 IP 就 OK）。
生效后 Vercel 会**自动签发并续期 HTTPS 证书**，不需要额外操作，`http://` 会自动跳 `https://`。

## 5. 以后更新内容

```powershell
cd "D:\AI项目\DSH\个人网站"
git add -A
git commit -m "更新作品"
git push
```

Vercel 检测到 push 会自动重新部署，1 分钟内生效。

---

# 三、让 Vercel 在国内尽量快一点

已经做好的（代码层面）：

- 零外部依赖：不加载 Google Fonts / CDN 脚本，字体用系统字体
- 图片已压缩：人像 WebP 175KB，卡片 JPG 183KB
- `vercel.json` 已配置：`/assets/` 一年强缓存、HTML 不缓存、安全响应头

你还可以做的：

1. **一定要用自己的域名**，别用 `vercel.app`（那串域名在国内经常解析失败）
2. 域名 DNS 建议放 **Cloudflare** 或 **DNSPod**，解析更稳、生效更快
3. 不要开启 Vercel 的 Deployment Protection（会多一次鉴权跳转）
4. 别加不必要的图片优化 / 分析脚本

仍然改变不了的事实：**Vercel 没有中国大陆节点**，物理距离和跨境链路决定了它有下限。
实测国内访问大约 150–400ms 首字节，能打开，但不是「秒开」。

---

# 四、上线前检查清单

- [ ] `assets/js/site-data.js`：姓名、作品、联系方式是真实内容
- [ ] 不想公开的信息（私人手机号等）没放上去
- [ ] `index.html`：`<title>`、`<meta name="description">` 正确
- [ ] `og:image` 改成完整网址，分享才有缩略图：
      `content="https://sanqi.design/assets/img/portrait-card.jpg"`
- [ ] 手机打开一次：菜单、作品展开、复制联系方式正常
- [ ] 微信里打开测试一下（微信对境外域名可能提示「非官方网页」，属正常现象）

---

# 五、想更快：两条后续路线（域名可以不变）

## A. 香港轻量服务器（免备案，当天可上）

- 阿里云 / 腾讯云香港轻量，2 核 2G，¥24–30/月（年付更便宜）
- 装 Nginx，把文件传上去，域名 A 记录指向服务器 IP
- 国内访问约 40–90ms，比 Vercel 稳
- 配置和脚本项目里都有：`deploy/nginx.conf`、`deploy/upload.ps1`

```powershell
.\deploy\upload.ps1 -Server 你的服务器IP -User root -Domain sanqi.design
```

## B. 大陆服务器 + ICP 备案（真正秒开，20–40ms）

- 需要域名 + 大陆轻量服务器（购买 ≥3 个月才有备案服务码，只买对象存储不行）
- 备案：云厂商初审 1–2 天 + 管局 7–20 个工作日
- 备案期间网站不能解析到大陆服务器，所以先用 Vercel 过渡
- 备案通过后：装 Nginx → `deploy/upload.ps1` 上传 → 域名 A 记录改指服务器

**迁移成本几乎为零**：只改 DNS 记录，网站文件一行都不用动。

---

# 六、常见问题

**Vercel 免费额度够吗？**
Hobby 计划每月 100GB 带宽，个人作品集完全够。注意 Hobby 仅限非商业用途，放付费服务需升级 Pro。

**域名买了，但解析一直不生效？**
先确认实名认证通过；TTL 改 600 秒再等 10 分钟；用 `nslookup sanqi.design 8.8.8.8` 验证。

**能不能不用 GitHub，直接上传文件夹？**
可以：`npm i -g vercel` 后在本目录执行 `vercel`，登录授权后按提示部署。
但 Git 方式更好——以后改内容只需 `git push`。

**国内打开很慢 / 打不开？**
先排除 DNS 未生效、微信内置浏览器拦截；确认用的是自定义域名而不是 `vercel.app`。
长期不满意就走第五节的香港轻量。
