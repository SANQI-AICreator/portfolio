/* =============================================================================
 * site-data.js — 个人网站的全部内容都在这里
 * -----------------------------------------------------------------------------
 * 想换成自己的网站？改这一个文件就够了：
 *   1. brand / hero   → 名字、英文名、身份、首页标语
 *   2. about          → 自我介绍、三张卡片、数据、技能标签
 *   3. works.projects → 作品列表（背景色、图标 SVG、简介、标签）
 *   4. contact        → 联系方式（邮箱 / 微信 / 社交账号）
 *   5. footer         → 页脚版权
 * 改完保存、刷新浏览器即可，不需要构建工具。
 * ========================================================================== */

window.SITE = {
  /* ---------- 站点信息（浏览器标签页 / 搜索结果里的描述） ---------- */
  meta: {
    description: "三七的个人作品集：研究 AI 产品，一个人做设计、开发与上线。"
  },

  /* ---------- 品牌：名字与身份 ---------- */
  brand: {
    name: "三七",
    latin: "SANQI",
    // 身份：用在浏览器标签页标题和分享卡片上（首页标语请改上面的 hero.tagline）
    role: "AI 产品设计师",
    // 站点 Logo（菱形 + 圆点）。想换成自己的图形，替换这段 SVG 即可。
    mark: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="9" y="9" width="30" height="30" rx="8" stroke="currentColor" stroke-width="2.4" transform="rotate(45 24 24)"/><circle cx="24" cy="24" r="7" fill="currentColor"/></svg>'
  },

  /* ---------- 首页 ---------- */
  hero: {
    eyebrow: "PORTFOLIO · 2026",
    // 大标题下方那句标语
    tagline: "一个人，做点新奇的产品",
    meta: ["研究 AI 产品", "一人公司 · 进行中", "接受远程合作"]
  },

  /* ---------- 关于我 ---------- */
  about: {
    lead: "我是三七，研究 AI 产品，也亲手把它做出来。愿景是成为一家「一人公司」——从想法、设计到上线都由自己主导完成，做一些新奇的产品，并且一直保持进步。",
    cards: [
      {
        title: "研究 AI 产品",
        text: "持续拆解新模型、新工具、新产品，判断什么真的有用——我想让 AI 走进人们的生活。"
      },
      {
        title: "一人公司",
        text: "长期目标是让设计、开发、运营都有对应的 Agent，用最小的团队跑完一个完整的产品闭环。"
      }
    ],
    facts: [
      { value: "6 年", label: "产品与体验设计" },
      { value: "30+", label: "上线项目" },
      { value: "12", label: "AI 产品设计" },
      { value: "1 人", label: "设计 · 开发 · 运营" }
    ],
    skills: [
      "AI 产品设计", "交互设计", "用户研究", "信息架构",
      "对话体验", "提示词设计", "设计系统", "原型验证",
      "Figma", "动效设计", "前端实现"
    ]
  },

  /* ---------- 我的作品 ---------- */
  works: {
    lead: "六个 AI 产品的设计与落地：从场景定义、交互原型，到上线之后一轮一轮的迭代。",
    projects: [
      {
        title: "Helio 晨光",
        type: "AI 日程助手",
        year: "2025",
        bg: "#d8794b",
        ink: "#24120a",
        summary: "把「今天要做什么」变成一句话就能完成的事：自然语言排期、自动拆解任务、时间冲突主动提醒。",
        tags: ["产品设计", "对话交互", "设计系统"],
        links: [],
        mark: '<svg viewBox="0 0 160 160" fill="none" aria-hidden="true"><circle cx="80" cy="92" r="30" stroke="currentColor" stroke-width="6"/><path d="M26 92h108" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M80 34v16M46 48l11 11M114 48l-11 11" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>'
      },
      {
        title: "Kite 风筝",
        type: "AI 灵感工具",
        year: "2025",
        bg: "#b9c9b2",
        ink: "#17251a",
        summary: "面向创作者的灵感捕捉工具：随手记下一句话，AI 帮你连成线、长成大纲，再变回可执行的选题。",
        tags: ["0→1", "移动端", "交互原型"],
        links: [],
        mark: '<svg viewBox="0 0 160 160" fill="none" aria-hidden="true"><path d="M80 28l42 36-42 36-42-36z" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/><path d="M80 28v72M38 64h84" stroke="currentColor" stroke-width="3.4" opacity=".55"/><path d="M80 100c0 16-12 16-12 30" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>'
      },
      {
        title: "Null 零点笔记",
        type: "AI 笔记应用",
        year: "2024",
        bg: "#15171d",
        ink: "#eef0f4",
        summary: "以「留白」为核心的极简笔记：写作时不打扰，需要时一句话把散落的笔记整理成结构化摘要。",
        tags: ["App 设计", "信息架构", "品牌"],
        links: [],
        mark: '<svg viewBox="0 0 160 160" fill="none" aria-hidden="true"><path d="M60 44H40v72h20" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M100 44h20v72h-20" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="80" cy="80" r="11" fill="currentColor"/></svg>'
      },
      {
        title: "Tide 潮汐",
        type: "AI 冥想应用",
        year: "2024",
        bg: "#2e4c55",
        ink: "#dff0f1",
        summary: "根据作息与情绪生成个性化冥想脚本，用三层声场和呼吸节奏，把「放松」做成看得见的曲线。",
        tags: ["声音交互", "视觉系统", "动效"],
        links: [],
        mark: '<svg viewBox="0 0 160 160" fill="none" aria-hidden="true"><path d="M24 68c12-14 24-14 36 0s24 14 36 0 24-14 36 0" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M24 90c12-14 24-14 36 0s24 14 36 0 24-14 36 0" stroke="currentColor" stroke-width="6" stroke-linecap="round" opacity=".6"/><path d="M24 112c12-14 24-14 36 0s24 14 36 0 24-14 36 0" stroke="currentColor" stroke-width="6" stroke-linecap="round" opacity=".35"/></svg>'
      },
      {
        title: "Arcadia 拱廊",
        type: "空间设计助手",
        year: "2023",
        bg: "#e3d8c2",
        ink: "#241d14",
        summary: "面向建筑师的 AI 方案助手：输入场地与需求，生成可编辑的体块与材料清单，把判断权留给人。",
        tags: ["B 端产品", "工作流", "Web 应用"],
        links: [],
        mark: '<svg viewBox="0 0 160 160" fill="none" aria-hidden="true"><path d="M46 122V82a34 34 0 0 1 68 0v40" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M66 122V86a14 14 0 0 1 28 0v36" stroke="currentColor" stroke-width="4" opacity=".5"/><path d="M28 120h104" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>'
      },
      {
        title: "Pulse 脉冲",
        type: "AI 播客工具",
        year: "2023",
        bg: "#4a3a8c",
        ink: "#efeaff",
        summary: "把一篇长文变成一档播客：自动生成脚本、多角色配音与封面，把发布链路压缩到十分钟。",
        tags: ["生成式工具", "编辑器", "视觉系统"],
        links: [],
        mark: '<svg viewBox="0 0 160 160" fill="none" aria-hidden="true"><path d="M30 74v12M46 62v36M62 46v68M78 56v48M94 38v84M110 60v40M126 72v16" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>'
      }
    ]
  },

  /* ---------- 联系方式 ---------- */
  contact: {
    title: "联系我",
    sub: "点击任意一行即可复制",
    foot: "通常 24 小时内回复 · 欢迎带着想法来聊",
    items: [
      { label: "邮箱", value: "longyihan751@gmail.com" },
      { label: "微信", value: "RL_lover" }
      // 有了再加，取消下面的注释并填上账号即可（空着的条目不要放上来，点了会复制一条空内容）：
      // { label: "GitHub", value: "github.com/你的用户名" },
      // { label: "抖音", value: "你的抖音号" }
    ]
  },

  /* ---------- 页脚 ---------- */
  footer: {
    text: "© 2026 三七 · 用设计与代码手工搭建"
  }
};
