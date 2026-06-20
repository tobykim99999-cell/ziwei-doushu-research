export const ziweiKnowledgeSources = [
  {
    id: "iztro-docs",
    name: "紫微研习社 / iztro 文档",
    url: "https://docs.iztro.com/",
    note: "用于整理排盘结构、宫位、星曜、四化和运限相关术语。"
  },
  {
    id: "iztro-github",
    name: "iztro 开源排盘库",
    url: "https://github.com/SylarLong/iztro",
    note: "用于理解当前项目排盘数据结构与可扩展字段。"
  },
  {
    id: "classic-method",
    name: "传统紫微斗数阅读法",
    url: "https://zh.wikipedia.org/wiki/%E7%B4%AB%E5%BE%AE%E6%96%97%E6%95%B0",
    note: "用于术语溯源和古籍体系说明，内容在平台内已重新整理为学习摘要。"
  }
];

export const ziweiKnowledgeBase = [
  {
    id: "reading-order",
    title: "看盘顺序",
    category: "方法论",
    keywords: ["怎么看盘", "看盘步骤", "解盘", "阅读顺序", "分析命盘", "新手"],
    summary: "先定问题，再定主宫与对宫，随后看命身底色、三方四正、四化触发、星曜组合和运限时间层次。",
    method: "输出时建议拆成三段：盘面依据、现实解释、行动建议。每个结论至少对应一个宫位、星曜、四化或运限依据。",
    cautions: ["不要只凭一颗星下结论。", "不要把本命、大限、流年混成同一个时间层级。", "结论要能被现实事件复盘。"],
    sourceRefs: ["iztro-docs", "classic-method"]
  },
  {
    id: "twelve-palaces",
    title: "十二宫定位",
    category: "宫位",
    keywords: ["十二宫", "宫位", "命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄", "迁移", "交友", "官禄", "田宅", "福德", "父母"],
    summary: "十二宫用于把人生议题分门别类：命宫看底色，官禄看事业角色，财帛看资源与收入，夫妻看亲密关系，迁移看外部环境。",
    method: "提问落到哪个主题，就先取对应宫位，再看对宫和三方四正。宫位负责定题，星曜负责定风格，四化负责定事件牵引。",
    cautions: ["宫位不是孤立判断单元。", "同一颗星在不同宫位会呈现不同语义。", "现实问题越具体，取宫越稳定。"],
    sourceRefs: ["iztro-docs"]
  },
  {
    id: "ming-shen",
    title: "命宫与身宫",
    category: "基础结构",
    keywords: ["命宫", "身宫", "命身", "性格", "底色", "后天"],
    summary: "命宫偏先天底色和自我感，身宫偏后天投入、习惯和长期用力位置。两者一起看，能区分“是什么样的人”和“把力气花在哪里”。",
    method: "先看命宫主星、辅曜和四化，再看身宫所落宫位与三方四正；命宫无主星时，重点借对宫和三方补充。",
    cautions: ["命宫不是人生全部。", "身宫不是单独断事的万能钥匙。", "命身矛盾时要结合现实经历判断。"],
    sourceRefs: ["iztro-docs", "classic-method"]
  },
  {
    id: "triad-opposite",
    title: "三方四正",
    category: "结构方法",
    keywords: ["三方四正", "三合", "对宫", "会照", "四正", "互照"],
    summary: "三方四正把本宫、对宫和三合宫放在同一组观察，用来判断一个主题的自身状态、外部反馈、资源来源和行动方式。",
    method: "先定主宫，再列出三合宫和对宫。看主星组合是否同调，四化是否把事件焦点拉到某个宫位，煞曜和辅曜分别带来压力或助力。",
    cautions: ["三方强不等于一定顺，只代表主题活跃。", "对宫常常说明外部压力或对象方。", "会照要分清哪些星真正参与当前问题。"],
    sourceRefs: ["iztro-docs", "classic-method"]
  },
  {
    id: "four-transformations",
    title: "四化",
    category: "事件线索",
    keywords: ["四化", "化禄", "化权", "化科", "化忌", "禄权科忌", "飞化"],
    summary: "四化用于观察事件牵引：化禄看资源与兴趣，化权看主导与压力，化科看名声与修饰，化忌看执着、亏欠和卡点。",
    method: "先看四化从哪颗星发出，再看落在哪个宫位，最后回到现实事件：资源流入、责任加重、可见度提升或反复卡住分别发生在哪里。",
    cautions: ["化忌不是单纯灾祸，更像需要复盘的结。", "化禄也可能代表欲望入口。", "四化必须结合宫位和运限。"],
    sourceRefs: ["iztro-docs", "classic-method"]
  },
  {
    id: "major-stars",
    title: "十四主星",
    category: "星曜",
    keywords: ["十四主星", "主星", "紫微", "天机", "太阳", "武曲", "天同", "廉贞", "天府", "太阴", "贪狼", "巨门", "天相", "天梁", "七杀", "破军"],
    summary: "十四主星负责给宫位定主要气质。紫微、天府偏组织承载；七杀、破军偏变化突破；太阳、太阴偏显隐照应；天机、巨门偏思考表达。",
    method: "先看主星本身的风格，再看同宫星曜是否同调，最后结合宫位、四化、三方四正判断具体主题。",
    cautions: ["不要孤立背星曜关键词。", "同宫组合会改变星曜语义。", "主星只是主调，辅曜、煞曜和四化会改变表现方式。"],
    sourceRefs: ["iztro-docs"]
  },
  {
    id: "minor-stars",
    title: "辅曜、杂曜与煞曜",
    category: "星曜互涉",
    keywords: ["辅星", "杂曜", "煞曜", "左辅", "右弼", "文昌", "文曲", "天魁", "天钺", "擎羊", "陀罗", "火星", "铃星", "空劫"],
    summary: "辅曜多看助力、文书、贵人和修饰能力；煞曜多看压力、切割、延迟和突发；杂曜补充细节，不宜脱离主星与宫位单独下结论。",
    method: "先定主星和宫位，再看辅曜是否改善表达与资源，煞曜是否带来成本、训练或风险。最后用四化判断是否会成为事件。",
    cautions: ["煞曜不是只有坏，也可能代表突破成本。", "杂曜信息量大，必须服务于当前问题。", "辅曜能加分，但不一定改变主题本质。"],
    sourceRefs: ["iztro-docs"]
  },
  {
    id: "periods",
    title: "大限、流年、流月与流时",
    category: "运限",
    keywords: ["大限", "大运", "流年", "流月", "流日", "流时", "运限", "时间"],
    summary: "本命盘看底层结构，大限看十年阶段，流年看年度触发，流月、流日、流时用于细化节奏和事件窗口。",
    method: "先确认本命结构，再看当前大限是否激活相关宫位；流年四化落入本命或大限关键宫时，事件感通常更明显。",
    cautions: ["不要用单一年份否定本命结构。", "越细的时间层级越需要现实事件校验。", "运限分析要说明时间范围。"],
    sourceRefs: ["iztro-docs", "iztro-github"]
  },
  {
    id: "star-interaction",
    title: "星曜互涉",
    category: "组合判断",
    keywords: ["星曜互涉", "同宫", "夹宫", "对照", "会照", "星耀互涉", "组合"],
    summary: "星曜互涉看的是组合关系：同宫像同一空间共同作用，对照像镜像和压力，会照像资源汇入，夹宫像环境边界。",
    method: "判断组合时先分主次：主星定骨架，辅曜给条件，煞曜给成本，四化给事件触发。再观察它们是否围绕同一个现实主题。",
    cautions: ["同宫不等于简单相加。", "夹宫和会照都要回到主宫主题。", "组合判断应避免堆砌术语。"],
    sourceRefs: ["iztro-docs", "classic-method"]
  },
  {
    id: "career-wealth",
    title: "事业与财帛",
    category: "应用场景",
    keywords: ["事业", "职业", "工作", "官禄", "财帛", "赚钱", "收入", "财富", "迁移"],
    summary: "事业问题通常看官禄宫、命宫、迁移宫与财帛宫；官禄看角色定位，财帛看资源变现，迁移看外部平台和机会。",
    method: "先看官禄宫的主星与四化，再看财帛宫是否能承接成果，迁移宫是否带来外部机会。若财官互照明显，适合重点看能力如何产品化。",
    cautions: ["财帛宫不只等于钱，也代表资源组织方式。", "事业判断要结合行业和现实阶段。", "迁移活跃时机会多，筛选也更重要。"],
    sourceRefs: ["iztro-docs", "classic-method"]
  },
  {
    id: "relationship",
    title: "关系与夫妻宫",
    category: "应用场景",
    keywords: ["夫妻", "感情", "关系", "婚姻", "伴侣", "合作"],
    summary: "关系议题先看夫妻宫和对宫，再看命宫、福德、交友等相关宫位。夫妻宫看亲密关系模式，也可参考合作中的对象方互动。",
    method: "先判断夫妻宫主星风格，再看对宫如何反馈；四化落入夫妻、命宫或福德时，关系事件感会更强。",
    cautions: ["关系判断不能只看夫妻宫。", "化忌落关系主题时更适合看执着和沟通卡点。", "现实边界、沟通方式和选择同样重要。"],
    sourceRefs: ["iztro-docs", "classic-method"]
  }
];

const fallbackIds = ["reading-order", "triad-opposite", "four-transformations"];

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function scoreEntry(entry, query) {
  const normalizedQuery = normalizeText(query);
  const searchable = normalizeText([entry.title, entry.category, entry.summary, entry.method, ...entry.keywords].join(" "));
  let score = 0;

  entry.keywords.forEach((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) return;
    if (normalizedQuery.includes(normalizedKeyword)) score += normalizedKeyword.length >= 2 ? 10 : 4;
    if (searchable.includes(normalizedQuery) && normalizedQuery.length >= 2) score += 4;
  });

  if (normalizedQuery.includes(normalizeText(entry.title))) score += 16;
  if (normalizeText(entry.title).includes(normalizedQuery) && normalizedQuery.length >= 2) score += 8;

  return score;
}

function collectSources(entries) {
  const sourceIds = [...new Set(entries.flatMap((entry) => entry.sourceRefs))];
  return sourceIds
    .map((sourceId) => ziweiKnowledgeSources.find((source) => source.id === sourceId))
    .filter(Boolean);
}

function getFallbackEntries(limit) {
  return fallbackIds
    .map((id) => ziweiKnowledgeBase.find((entry) => entry.id === id))
    .filter(Boolean)
    .slice(0, limit);
}

export function searchZiweiKnowledge(query, limit = 3) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return getFallbackEntries(limit);

  const matched = ziweiKnowledgeBase
    .map((entry) => ({ entry, score: scoreEntry(entry, normalizedQuery) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.entry);

  return (matched.length ? matched : getFallbackEntries(limit)).slice(0, limit);
}

export function buildChartContextHint(chart) {
  if (!chart) return "";

  const keyPalaces = chart.palaces
    .filter((palace) => ["命宫", "财帛", "官禄", "迁移"].includes(palace.name))
    .map((palace) => {
      const stars = [...(palace.majorStars || []), ...(palace.minorStars || []).slice(0, 2)].join("、");
      return `${palace.name}见${stars || "待补充星曜"}`;
    })
    .join("；");

  return `结合当前样本「${chart.name}」：${chart.insight || "建议先记录现实问题，再回到命盘结构验证。"}${keyPalaces ? ` 关键宫位可先看：${keyPalaces}。` : ""}`;
}

export function buildZiweiKnowledgeReply(query, chart) {
  const entries = searchZiweiKnowledge(query, 3);
  const chartHint = buildChartContextHint(chart);
  const topicBlocks = entries
    .map((entry, index) => {
      const cautions = entry.cautions.slice(0, 2).join("；");
      return `${index + 1}. ${entry.title}｜${entry.category}\n${entry.summary}\n阅读方法：${entry.method}${cautions ? `\n注意：${cautions}` : ""}`;
    })
    .join("\n\n");

  return {
    content: `${topicBlocks}${chartHint ? `\n\n${chartHint}` : ""}\n\n当前回复来自本地紫微斗数知识库检索，适合做学习框架和分析提示；正式断盘仍需要结合真实出生资料、现实事件和复盘记录。`,
    entries,
    sources: collectSources(entries)
  };
}
