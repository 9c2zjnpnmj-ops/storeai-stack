const fs = require("fs");
const path = require("path");
const { categories, tools, tutorials, comparisons, matcherUseCases } = require("../src/site-data");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const basePath = (process.env.BASE_PATH || "").replace(/\/$/, "");
const siteUrl = (process.env.SITE_URL || `https://example.com${basePath}`).replace(/\/$/, "");

function assetPath(pathName) {
  return `${basePath}${pathName}`;
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function esc(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function slugCategory(id, lang) {
  return categories.find((cat) => cat.id === id)?.[lang] || id;
}

function canonicalPath(pathName) {
  return `${basePath}${pathName}`;
}

function urlFor(type, slug, lang = "en") {
  if (type === "home") return assetPath(`/${lang}/`);
  return assetPath(`/${lang}/${type}/${slug}/`);
}

function writePage(filePath, html) {
  const full = path.join(dist, filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, "utf8");
}

function layout({ lang = "en", title, description, pathName, children, scripts = "", structured = [] }) {
  const alternatePath = lang === "en" ? pathName.replace(/^\/en\//, "/zh/") : pathName.replace(/^\/zh\//, "/en/");
  const alternate = assetPath(alternatePath);
  const nav = lang === "en"
    ? { tools: "Tools", tutorials: "Tutorials", comparisons: "Comparisons", matcher: "Matcher", growth: "Growth kit", other: "中文" }
    : { tools: "工具库", tutorials: "教程", comparisons: "对比榜单", matcher: "匹配器", growth: "推广包", other: "EN" };
  const otherLang = lang === "en" ? "zh" : "en";
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${siteUrl}${pathName}">
  <link rel="alternate" hreflang="en" href="${siteUrl}${pathName.replace(/^\/zh\//, "/en/")}">
  <link rel="alternate" hreflang="zh" href="${siteUrl}${pathName.replace(/^\/en\//, "/zh/")}">
  <link rel="alternate" hreflang="x-default" href="${siteUrl}/en/">
  <link rel="stylesheet" href="${assetPath("/assets/styles.css")}">
  ${structured.map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join("\n  ")}
</head>
<body>
  <header class="site-header">
    <a class="brand" href="${assetPath(`/${lang}/`)}"><span class="brand-mark">AI</span><span>StoreAI Stack</span></a>
    <nav class="nav">
      <a href="${assetPath(`/${lang}/tools/`)}">${nav.tools}</a>
      <a href="${assetPath(`/${lang}/tutorials/`)}">${nav.tutorials}</a>
      <a href="${assetPath(`/${lang}/comparisons/`)}">${nav.comparisons}</a>
      <a href="${assetPath(`/${lang}/matcher/`)}">${nav.matcher}</a>
      <a href="${assetPath(`/${lang}/growth-kit/`)}">${nav.growth}</a>
      <a href="${alternate}">${nav.other}</a>
    </nav>
  </header>
  ${children}
  <footer class="footer">
    <strong>StoreAI Stack</strong>
    <p>${lang === "en" ? "Independent editorial directory for Shopify AI tools. Some links may be affiliate links." : "面向 Shopify 独立站卖家的 AI 工具与教程站。部分链接可能包含联盟佣金。"}</p>
    <div class="nav">
      <a href="${assetPath(`/${lang}/about/`)}">About</a>
      <a href="${assetPath(`/${lang}/contact/`)}">Contact</a>
      <a href="${assetPath(`/${lang}/privacy/`)}">Privacy</a>
      <a href="${assetPath(`/${lang}/affiliate-disclosure/`)}">Affiliate disclosure</a>
      <a href="${assetPath(`/${lang}/terms/`)}">Terms</a>
    </div>
  </footer>
  <script src="${assetPath("/assets/app.js")}"></script>
  ${scripts}
</body>
</html>`;
}

function breadcrumb(pathName, names) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: names.map((name, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: `${siteUrl}${index === names.length - 1 ? pathName : "/en/"}`
    }))
  };
}

function homePage(lang) {
  const isZh = lang === "zh";
  const featured = tools.filter((tool) => ["klaviyo","gorgias","canva","semrush","copy-ai","tidio"].includes(tool.slug));
  const latest = tutorials.filter((item) => item.lang === lang).slice(0, 6);
  const categoryZhIntent = {
    "product-copy": "撰写商品描述、套装卖点、FAQ 和利益点文案。",
    "ad-creative": "生成广告钩子、视觉 brief、落地页角度和投放版本。",
    seo: "寻找关键词、内容大纲、内链和旧文刷新机会。",
    email: "搭建生命周期邮件、用户分层和弃购自动化。",
    support: "自动回答客服问题、退换货流程和售前咨询。",
    "image-video": "制作商品视觉、UGC 概念、短视频和广告素材。",
    research: "分析评论、竞品、定价和转化卡点。",
    automation: "把 AI 输出接入 Shopify 运营流程，形成可复用自动化。"
  };
  const copy = isZh ? {
    eyebrow: "Shopify 独立站 AI 增长库",
    h1: "帮跨境卖家选对 AI 工具，并把它们用进真实增长流程",
    lead: "工具导航、实战教程、对比榜单和匹配器，聚焦商品文案、广告素材、SEO、邮件营销、客服和图片视频。",
    cta: "浏览工具库",
    cta2: "使用匹配器",
    cats: "按增长任务筛选",
    featured: "推荐工具",
    tutorials: "最新实战教程"
  } : {
    eyebrow: "AI operating stack for Shopify sellers",
    h1: "Choose the right AI tools and turn them into practical ecommerce workflows",
    lead: "A bilingual directory, playbook library, comparison hub, and matcher for product copy, ads, SEO, email, support, and visual content.",
    cta: "Browse tools",
    cta2: "Use matcher",
    cats: "Browse by growth task",
    featured: "Featured tools",
    tutorials: "Latest playbooks"
  };
  return layout({
    lang,
    title: isZh ? "StoreAI Stack - Shopify AI 工具导航与教程" : "StoreAI Stack - AI tools and playbooks for Shopify sellers",
    description: isZh ? "面向 Shopify 独立站卖家的中英双语 AI 工具库、教程、对比榜单和工具匹配器。" : "Bilingual AI tools directory, tutorials, comparisons, and matcher for Shopify sellers.",
    pathName: `/${lang}/`,
    children: `
<main>
  <section class="hero">
    <div class="hero-copy">
      <div class="eyebrow">${copy.eyebrow}</div>
      <h1>${copy.h1}</h1>
      <p class="lead">${copy.lead}</p>
      <div class="hero-actions">
        <a class="button" href="${assetPath(`/${lang}/tools/`)}">${copy.cta}</a>
        <a class="button secondary" href="${assetPath(`/${lang}/matcher/`)}">${copy.cta2}</a>
      </div>
    </div>
    <div class="hero-visual">
      <div class="metric-strip">
        <div class="metric"><strong>50</strong><span>AI tools</span></div>
        <div class="metric"><strong>40</strong><span>Playbooks</span></div>
        <div class="metric"><strong>10</strong><span>Comparisons</span></div>
      </div>
      <div class="tool-preview">
        ${featured.slice(0, 4).map((tool) => `<div class="preview-row"><span>${tool.name}</span><strong>${slugCategory(tool.category, lang)}</strong></div>`).join("")}
      </div>
    </div>
  </section>
  <section class="section">
    <div class="section-head"><h2>${copy.cats}</h2><p>${isZh ? "从任务出发，而不是从工具名出发。" : "Start with the job, not the tool name."}</p></div>
    <div class="grid">${categories.map((cat) => `<a class="card" href="${assetPath(`/${lang}/tools/`)}?category=${cat.id}"><h3><span class="category-dot"></span>${cat[lang]}</h3><p>${isZh ? categoryZhIntent[cat.id] : cat.intent}</p></a>`).join("")}</div>
  </section>
  <section class="section">
    <div class="section-head"><h2>${copy.featured}</h2><a class="button secondary" href="${assetPath(`/${lang}/tools/`)}">View all</a></div>
    <div class="grid">${featured.map((tool) => toolCard(tool, lang)).join("")}</div>
  </section>
  <section class="section">
    <div class="section-head"><h2>${copy.tutorials}</h2><a class="button secondary" href="${assetPath(`/${lang}/tutorials/`)}">View all</a></div>
    <div class="grid">${latest.map((item) => tutorialCard(item, lang)).join("")}</div>
  </section>
</main>`
  });
}

function toolCard(tool, lang) {
  return `<a class="card tool-card" data-category="${tool.category}" href="${urlFor("tools", tool.slug, lang)}">
    <div class="tag-row"><span class="tag">${slugCategory(tool.category, lang)}</span><span class="tag">${tool.pricing}</span>${tool.affiliate ? `<span class="tag">Affiliate</span>` : ""}</div>
    <h3>${esc(tool.name)}</h3>
    <p>${esc(lang === "zh" ? tool.zhSummary : tool.summary)}</p>
  </a>`;
}

function tutorialCard(item, lang) {
  return `<a class="card" href="${urlFor("tutorials", item.slug, lang)}">
    <div class="tag-row"><span class="tag">${slugCategory(item.category, lang)}</span></div>
    <h3>${esc(item.title)}</h3>
    <p>${esc(item.summary)}</p>
  </a>`;
}

function toolsIndex(lang) {
  const isZh = lang === "zh";
  return layout({
    lang,
    title: isZh ? "Shopify AI 工具库 - StoreAI Stack" : "Shopify AI tools directory - StoreAI Stack",
    description: isZh ? "筛选 50 个适合 Shopify 独立站卖家的 AI 工具。" : "Filter 50 AI tools for Shopify sellers by growth task and use case.",
    pathName: `/${lang}/tools/`,
    children: `<main class="section">
      <div class="section-head"><h1>${isZh ? "Shopify AI 工具库" : "Shopify AI tools directory"}</h1><p>${isZh ? "按真实运营任务筛选工具。" : "Filter by the operational job you need to solve."}</p></div>
      <div class="filters">
        <input id="tool-search" placeholder="${isZh ? "搜索工具、标签、用途" : "Search tools, tags, use cases"}">
        <select id="category-filter"><option value="all">${isZh ? "全部分类" : "All categories"}</option>${categories.map((cat) => `<option value="${cat.id}">${cat[lang]}</option>`).join("")}</select>
      </div>
      <div class="grid">${tools.map((tool) => toolCard(tool, lang)).join("")}</div>
    </main>`
  });
}

function toolPage(tool, lang) {
  const isZh = lang === "zh";
  const related = tools.filter((item) => item.category === tool.category && item.slug !== tool.slug).slice(0, 3);
  const relatedTutorials = tutorials.filter((item) => item.lang === lang && item.category === tool.category).slice(0, 3);
  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "BusinessApplication",
    offers: { "@type": "Offer", price: tool.pricing, priceCurrency: "USD" },
    description: lang === "zh" ? tool.zhSummary : tool.summary
  };
  return layout({
    lang,
    title: `${tool.name} ${isZh ? "评测与 Shopify 用法" : "review and Shopify use cases"} - StoreAI Stack`,
    description: isZh ? tool.zhSummary : tool.summary,
    pathName: urlFor("tools", tool.slug, lang),
    structured: [software, breadcrumb(urlFor("tools", tool.slug, lang), ["StoreAI Stack", "Tools", tool.name])],
    children: `<main class="section two-col">
      <article class="article">
        <div class="eyebrow">${slugCategory(tool.category, lang)} · ${tool.pricing}</div>
        <h1>${tool.name}</h1>
        <p class="lead">${esc(isZh ? tool.zhSummary : tool.summary)}</p>
        <div class="notice">${isZh ? "编辑说明：这里的推荐以 Shopify 卖家的实际任务为中心。部分链接可能产生联盟佣金，但不影响排序逻辑。" : "Editorial note: recommendations are organized around real Shopify seller jobs. Some links may earn affiliate commission without changing the editorial criteria."}</div>
        <h2>${isZh ? "适合什么场景" : "Best fit"}</h2>
        <p>${esc(isZh ? tool.zhSummary : tool.bestFor)}</p>
        <h2>${isZh ? "Shopify 使用方式" : "How Shopify teams can use it"}</h2>
        <ul>
          <li>${isZh ? "把商品评论和客服问题输入工具，提炼购买动机和常见异议。" : "Feed product reviews and support questions into the tool to extract motivations and objections."}</li>
          <li>${isZh ? "生成 3-5 个版本，再由运营人员按品牌语气和事实准确性审核。" : "Generate 3-5 variants, then review for brand voice and factual accuracy."}</li>
          <li>${isZh ? "把最终输出沉淀进商品页、广告 brief、邮件流程或客服知识库。" : "Move approved outputs into PDPs, ad briefs, email flows, or support knowledge bases."}</li>
        </ul>
        <h2>${isZh ? "优点与注意事项" : "Strengths and cautions"}</h2>
        <p>${isZh ? "优点是能显著加快素材和文案产出。注意事项是不要直接发布未审核内容，尤其是价格、物流、功效承诺和合规声明。" : "The upside is faster production of copy and creative inputs. Do not publish unreviewed claims, pricing, shipping promises, or compliance-sensitive statements."}</p>
      </article>
      <aside class="side-panel">
        <a class="button" href="#" rel="sponsored nofollow">${isZh ? "访问官网 / 联盟链接" : "Visit tool / affiliate link"}</a>
        <h3>${isZh ? "标签" : "Tags"}</h3>
        <div class="tag-row">${tool.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        <h3>${isZh ? "替代工具" : "Alternatives"}</h3>
        <div class="tools-list">${related.map((item) => `<a href="${urlFor("tools", item.slug, lang)}">${item.name}</a>`).join("")}</div>
        <h3>${isZh ? "相关教程" : "Related playbooks"}</h3>
        <div class="tools-list">${relatedTutorials.map((item) => `<a href="${urlFor("tutorials", item.slug, lang)}">${item.title}</a>`).join("")}</div>
      </aside>
    </main>`
  });
}

function tutorialIndex(lang) {
  const isZh = lang === "zh";
  const list = tutorials.filter((item) => item.lang === lang);
  return layout({
    lang,
    title: isZh ? "Shopify AI 实战教程 - StoreAI Stack" : "Shopify AI playbooks - StoreAI Stack",
    description: isZh ? "面向跨境独立站卖家的 AI 工作流教程。" : "Practical AI workflows for Shopify sellers.",
    pathName: `/${lang}/tutorials/`,
    children: `<main class="section"><div class="section-head"><h1>${isZh ? "Shopify AI 实战教程" : "Shopify AI playbooks"}</h1><p>${isZh ? "每篇教程都绑定一个真实运营任务。" : "Every playbook maps to a real ecommerce task."}</p></div><div class="grid">${list.map((item) => tutorialCard(item, lang)).join("")}</div></main>`
  });
}

function tutorialPage(item, lang) {
  const isZh = lang === "zh";
  const related = tools.filter((tool) => tool.category === item.category).slice(0, 5);
  return layout({
    lang,
    title: `${item.title} - StoreAI Stack`,
    description: item.summary,
    pathName: urlFor("tutorials", item.slug, lang),
    structured: [breadcrumb(urlFor("tutorials", item.slug, lang), ["StoreAI Stack", "Tutorials", item.title])],
    children: `<main class="section two-col">
      <article class="article">
        <div class="eyebrow">${slugCategory(item.category, lang)}</div>
        <h1>${esc(item.title)}</h1>
        <p class="lead">${esc(item.summary)}</p>
        <h2>${isZh ? "目标" : "Goal"}</h2>
        <p>${isZh ? "用 AI 缩短从想法到可发布资产的距离，同时保留人工审核、品牌语气和事实准确性。" : "Use AI to shorten the path from idea to publishable asset while keeping human review, brand voice, and factual accuracy."}</p>
        <h2>${isZh ? "工作流" : "Workflow"}</h2>
        <ol>
          <li>${isZh ? "收集输入：商品信息、评论、客服问题、竞品页面和当前转化目标。" : "Gather inputs: product details, reviews, support questions, competitor pages, and the current conversion goal."}</li>
          <li>${isZh ? "让 AI 先做结构化分析，不要一开始就要求最终文案。" : "Ask AI for structured analysis before asking for final copy."}</li>
          <li>${isZh ? "生成多个版本，分别服务不同受众、场景和异议。" : "Generate multiple variants for different audiences, contexts, and objections."}</li>
          <li>${isZh ? "人工审核事实、承诺、语气和平台政策风险。" : "Review facts, claims, tone, and platform-policy risk manually."}</li>
          <li>${isZh ? "把结果放入 Shopify 页面、邮件系统、广告 brief 或客服知识库，并记录表现。" : "Publish into Shopify pages, email tools, ad briefs, or support docs, then track performance."}</li>
        </ol>
        <h2>${isZh ? "可直接使用的 Prompt" : "Reusable prompt"}</h2>
        <p>${isZh ? "你是一个 Shopify 独立站增长顾问。基于以下商品信息、目标受众、评论和转化目标，先总结购买动机、异议和卖点，再输出 5 个可测试版本。所有事实不确定的地方必须标注需要人工确认。" : "You are a Shopify growth strategist. Based on the product details, target audience, reviews, and conversion goal below, first summarize motivations, objections, and proof points, then produce 5 testable variants. Mark any uncertain factual claim for human review."}</p>
        <h2>${isZh ? "常见错误" : "Common mistakes"}</h2>
        <ul>
          <li>${isZh ? "直接复制 AI 输出，没有校验物流、价格、功效或保修承诺。" : "Copying AI output without checking shipping, price, efficacy, or warranty claims."}</li>
          <li>${isZh ? "只追求文案好看，没有绑定页面位置、流量来源和转化目标。" : "Optimizing for nice wording without tying the asset to placement, traffic source, and conversion goal."}</li>
          <li>${isZh ? "没有记录版本表现，导致下次仍从零开始。" : "Failing to log performance, which makes every campaign start from zero again."}</li>
        </ul>
      </article>
      <aside class="side-panel">
        <h3>${isZh ? "推荐工具" : "Recommended tools"}</h3>
        <div class="tools-list">${related.map((tool) => `<a href="${urlFor("tools", tool.slug, lang)}">${tool.name}</a>`).join("")}</div>
      </aside>
    </main>`
  });
}

function comparisonIndex(lang) {
  const isZh = lang === "zh";
  return layout({
    lang,
    title: isZh ? "Shopify AI 工具对比榜单 - StoreAI Stack" : "Shopify AI tool comparisons - StoreAI Stack",
    description: isZh ? "按使用场景比较 Shopify AI 工具。" : "Compare AI tools for Shopify by real ecommerce use case.",
    pathName: `/${lang}/comparisons/`,
    children: `<main class="section"><div class="section-head"><h1>${isZh ? "AI 工具对比榜单" : "AI tool comparisons"}</h1><p>${isZh ? "先按任务比较，再选工具。" : "Compare by job before choosing a tool."}</p></div><div class="grid">${comparisons.map((item) => `<a class="card" href="${urlFor("comparisons", item.slug, lang)}"><span class="tag">${slugCategory(item.category, lang)}</span><h3>${esc(item.title)}</h3><p>${item.toolSlugs.length} tools compared for Shopify sellers.</p></a>`).join("")}</div></main>`
  });
}

function comparisonPage(item, lang) {
  const isZh = lang === "zh";
  const rows = item.toolSlugs.map((slug) => tools.find((tool) => tool.slug === slug)).filter(Boolean);
  return layout({
    lang,
    title: `${item.title} - StoreAI Stack`,
    description: `Compare ${rows.map((tool) => tool.name).join(", ")} for Shopify sellers.`,
    pathName: urlFor("comparisons", item.slug, lang),
    children: `<main class="section">
      <div class="section-head"><h1>${esc(isZh ? item.title.replace("Best", "最佳").replace("for Shopify", "Shopify 工具").replace("AI", "AI") : item.title)}</h1><p>${isZh ? "按适用场景、价格类型和 Shopify 用法比较。" : "Compared by fit, pricing model, and Shopify use case."}</p></div>
      <table class="table">
        <thead><tr><th>${isZh ? "工具" : "Tool"}</th><th>${isZh ? "分类" : "Category"}</th><th>${isZh ? "价格" : "Pricing"}</th><th>${isZh ? "适合场景" : "Best fit"}</th></tr></thead>
        <tbody>${rows.map((tool) => `<tr><td><a href="${urlFor("tools", tool.slug, lang)}"><strong>${tool.name}</strong></a></td><td>${slugCategory(tool.category, lang)}</td><td>${tool.pricing}</td><td>${esc(isZh ? tool.zhSummary : tool.bestFor)}</td></tr>`).join("")}</tbody>
      </table>
    </main>`
  });
}

function matcherPage(lang) {
  const isZh = lang === "zh";
  const data = matcherUseCases.map((useCase) => ({
    id: useCase.id,
    tools: useCase.recommended.map((slug) => {
      const tool = tools.find((item) => item.slug === slug);
      return { name: tool.name, summary: isZh ? tool.zhSummary : tool.summary, tags: tool.tags, url: urlFor("tools", tool.slug, lang) };
    })
  }));
  return layout({
    lang,
    title: isZh ? "Shopify AI 工具匹配器 - StoreAI Stack" : "Shopify AI tool matcher - StoreAI Stack",
    description: isZh ? "选择你的增长任务，获得 3-5 个适合的 AI 工具推荐。" : "Choose your growth job and get 3-5 suitable AI tool recommendations.",
    pathName: `/${lang}/matcher/`,
    scripts: `<script>window.matcherData = ${JSON.stringify(data)};</script>`,
    children: `<main class="section" id="tool-matcher">
      <div class="section-head"><h1>${isZh ? "AI 工具匹配器" : "AI tool matcher"}</h1><p>${isZh ? "从你要完成的任务开始。" : "Start with the job you need done."}</p></div>
      <div class="matcher-options">${matcherUseCases.map((item) => `<button data-usecase="${item.id}">${item[lang]}</button>`).join("")}</div>
      <div class="grid" id="matcher-output"></div>
    </main>`
  });
}

function staticPage(lang, slug) {
  const isZh = lang === "zh";
  const content = {
    about: [isZh ? "关于 StoreAI Stack" : "About StoreAI Stack", isZh ? "我们帮助 Shopify 独立站卖家把 AI 工具用于真实增长任务，而不是堆砌链接。" : "We help Shopify sellers apply AI tools to real growth tasks instead of collecting generic links."],
    contact: [isZh ? "联系" : "Contact", isZh ? "合作、赞助和反馈可发送到 hello@example.com。" : "For partnerships, sponsorships, and feedback, email hello@example.com."],
    privacy: [isZh ? "隐私政策" : "Privacy Policy", isZh ? "本站使用基础分析数据改进内容，不出售个人信息。邮件订阅可随时取消。" : "This site uses basic analytics to improve content. We do not sell personal information. Email subscribers can unsubscribe anytime."],
    "affiliate-disclosure": [isZh ? "联盟披露" : "Affiliate Disclosure", isZh ? "部分链接可能带来佣金。我们的排序依据是 Shopify 卖家的任务适配度、功能、价格和实际使用场景。" : "Some links may earn commission. Rankings are based on task fit, capabilities, pricing, and practical Shopify use cases."],
    terms: [isZh ? "使用条款" : "Terms", isZh ? "本站内容仅供信息参考，不构成法律、财务或平台政策建议。发布 AI 生成内容前请人工审核。" : "Content is informational and is not legal, financial, or platform-policy advice. Review AI-generated output before publishing."],
    "growth-kit": [isZh ? "增长推广包" : "Growth Kit", isZh ? "每周发布 3 个 Shopify AI 工作流：一个商品页优化、一个投放素材、一个邮件或客服自动化。" : "Publish 3 Shopify AI workflows weekly: one PDP improvement, one ad creative idea, and one email or support automation."]
  }[slug];
  return layout({
    lang,
    title: `${content[0]} - StoreAI Stack`,
    description: content[1],
    pathName: `/${lang}/${slug}/`,
    children: `<main class="section article"><h1>${content[0]}</h1><p class="lead">${content[1]}</p><h2>${isZh ? "执行原则" : "Operating principles"}</h2><ul><li>${isZh ? "内容必须服务真实 Shopify 任务。" : "Content must serve real Shopify jobs."}</li><li>${isZh ? "联盟收入必须透明披露。" : "Affiliate revenue must be disclosed clearly."}</li><li>${isZh ? "不做垃圾群发、虚假点击或误导性推广。" : "No spam outreach, fake clicks, or misleading promotion."}</li></ul></main>`
  });
}

function writeAssets() {
  fs.mkdirSync(path.join(dist, "assets"), { recursive: true });
  fs.copyFileSync(path.join(root, "src", "styles.css"), path.join(dist, "assets", "styles.css"));
  fs.copyFileSync(path.join(root, "src", "app.js"), path.join(dist, "assets", "app.js"));
}

function build() {
  cleanDir(dist);
  writeAssets();
  writePage("index.html", `<meta http-equiv="refresh" content="0; url=${assetPath("/en/")}">`);
  for (const lang of ["en", "zh"]) {
    writePage(`${lang}/index.html`, homePage(lang));
    writePage(`${lang}/tools/index.html`, toolsIndex(lang));
    writePage(`${lang}/tutorials/index.html`, tutorialIndex(lang));
    writePage(`${lang}/comparisons/index.html`, comparisonIndex(lang));
    writePage(`${lang}/matcher/index.html`, matcherPage(lang));
    for (const slug of ["about","contact","privacy","affiliate-disclosure","terms","growth-kit"]) writePage(`${lang}/${slug}/index.html`, staticPage(lang, slug));
    for (const tool of tools) writePage(`${lang}/tools/${tool.slug}/index.html`, toolPage(tool, lang));
    for (const item of tutorials.filter((tutorial) => tutorial.lang === lang)) writePage(`${lang}/tutorials/${item.slug}/index.html`, tutorialPage(item, lang));
    for (const item of comparisons) writePage(`${lang}/comparisons/${item.slug}/index.html`, comparisonPage(item, lang));
  }
  const urls = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (name === "index.html") urls.push(`${siteUrl}/${path.relative(dist, path.dirname(full)).replace(/\\/g, "/")}/`.replace(/\/\//g, "/").replace("https:/", "https://"));
    }
  };
  walk(dist);
  fs.writeFileSync(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>`, "utf8");
  fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`, "utf8");
  console.log(`Built ${urls.length} pages into ${dist}`);
}

build();
