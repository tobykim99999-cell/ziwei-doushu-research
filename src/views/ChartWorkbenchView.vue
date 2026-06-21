<script setup>
import { computed, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { astro } from "iztro";
import { Delete, Plus, Reading, Star, Timer, TrendCharts } from "@element-plus/icons-vue";
import { chartReadingDetails, sampleCharts } from "../mock/research";
import { analyzeChartPatterns } from "../mock/ziweiPatterns";

const storageKey = "ziwei-research-user-samples";
const palaceNames = ["命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄", "迁移", "交友", "官禄", "田宅", "福德", "父母"];
const branches = ["巳", "午", "未", "申", "辰", "酉", "卯", "戌", "寅", "丑", "子", "亥"];
const gridAreas = ["si", "wu", "wei", "shen", "chen", "you", "mao", "xu", "yin", "chou", "zi", "hai"];
const branchAreaMap = {
  巳: "si",
  午: "wu",
  未: "wei",
  申: "shen",
  辰: "chen",
  酉: "you",
  卯: "mao",
  戌: "xu",
  寅: "yin",
  丑: "chou",
  子: "zi",
  亥: "hai"
};
const palaceKeywords = ["自我", "手足", "关系", "表达", "资源", "节律", "外缘", "网络", "事业", "资产", "心性", "根基"];
const palaceNotes = ["先看主星气质", "再看三方四正", "留意四化落点", "结合现实事件复盘"];
const starPools = [
  ["紫微", "天府"],
  ["太阳", "天梁"],
  ["武曲", "七杀"],
  ["天同", "太阴"],
  ["廉贞", "贪狼"],
  ["天机", "巨门"],
  ["天相", "左辅"],
  ["破军", "右弼"]
];
const minorStarPools = [
  ["左辅", "文昌", "天魁"],
  ["右弼", "文曲", "天钺"],
  ["擎羊", "铃星", "天刑"],
  ["陀罗", "火星", "地劫"],
  ["禄存", "天马", "红鸾"],
  ["天喜", "天姚", "咸池"],
  ["地空", "孤辰", "寡宿"],
  ["台辅", "封诰", "恩光"]
];
const transformations = ["化禄", "化权", "化科", "化忌"];
const flowMarkers = ["主线", "三方", "对照", "辅曜", "煞曜", "会照"];
const hourBranches = [
  { label: "子时", range: "23:00-00:59", value: 0 },
  { label: "丑时", range: "01:00-02:59", value: 1 },
  { label: "寅时", range: "03:00-04:59", value: 2 },
  { label: "卯时", range: "05:00-06:59", value: 3 },
  { label: "辰时", range: "07:00-08:59", value: 4 },
  { label: "巳时", range: "09:00-10:59", value: 5 },
  { label: "午时", range: "11:00-12:59", value: 6 },
  { label: "未时", range: "13:00-14:59", value: 7 },
  { label: "申时", range: "15:00-16:59", value: 8 },
  { label: "酉时", range: "17:00-18:59", value: 9 },
  { label: "戌时", range: "19:00-20:59", value: 10 },
  { label: "亥时", range: "21:00-22:59", value: 11 }
];

function readStoredSamples() {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function normalizeTags(value = "") {
  return value
    .split(/[，,、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function seedFromText(text) {
  return Array.from(text).reduce((total, char) => total + char.charCodeAt(0), 0);
}

function starName(star) {
  if (typeof star === "string") return star;
  if (!star?.name) return "";
  const brightness = star.brightness ? `(${star.brightness})` : "";
  const mutagen = star.mutagen ? `·${star.mutagen}` : "";
  return `${star.name}${brightness}${mutagen}`;
}

function starNames(stars = []) {
  return stars.map(starName).filter(Boolean);
}

function formatStars(stars) {
  return Array.isArray(stars) && stars.length ? stars.join("、") : "未配置";
}

function displayPalaceName(name) {
  return name === "仆役" ? "交友" : name;
}

function getTodayString() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function makePalaces(seed) {
  return palaceNames.map((name, index) => {
    const starIndex = (seed + index * 3) % starPools.length;
    return {
      name,
      branch: branches[index],
      area: gridAreas[index],
      majorStars: starPools[starIndex],
      minorStars: minorStarPools[(seed + index * 2) % minorStarPools.length],
      score: 58 + ((seed + index * 9) % 38),
      keyword: palaceKeywords[index],
      note: palaceNotes[(seed + index) % palaceNotes.length]
    };
  });
}

function createAstrolabe(sample) {
  if (!sample.birthDate || sample.birthHour === "" || !sample.gender) return null;
  try {
    const hourIndex = Number(sample.birthHour);
    if (sample.calendarType === "农历") {
      return astro.byLunar(sample.birthDate, hourIndex, sample.gender, Boolean(sample.isLeapMonth));
    }
    return astro.bySolar(sample.birthDate, hourIndex, sample.gender);
  } catch (error) {
    console.warn("iztro astrolabe failed", error);
    return null;
  }
}

function mapIztroPalaces(astrolabe) {
  return astrolabe.palaces.map((palace, index) => {
    const majorStars = starNames(palace.majorStars);
    const minorStars = [...starNames(palace.minorStars), ...starNames(palace.adjectiveStars)];
    return {
      index: palace.index ?? index,
      name: displayPalaceName(palace.name),
      originalName: palace.name,
      branch: palace.earthlyBranch || branches[index],
      stem: palace.heavenlyStem,
      area: branchAreaMap[palace.earthlyBranch] || gridAreas[index],
      majorStars,
      minorStars,
      score: Math.min(96, 62 + majorStars.length * 8 + Math.min(minorStars.length, 8) * 2),
      keyword: `${palace.heavenlyStem || ""}${palace.earthlyBranch || ""}`,
      note: [palace.changsheng12, palace.boshi12, palace.suiqian12].filter(Boolean).join(" · "),
      isBodyPalace: palace.isBodyPalace,
      isOriginalPalace: palace.isOriginalPalace,
      decadal: palace.decadal,
      ages: palace.ages || [],
      changsheng12: palace.changsheng12,
      boshi12: palace.boshi12,
      jiangqian12: palace.jiangqian12,
      suiqian12: palace.suiqian12
    };
  });
}

function buildUserChart(sample) {
  const astrolabe = createAstrolabe(sample);
  if (astrolabe) {
    const palaces = mapIztroPalaces(astrolabe);
    const tags = Array.isArray(sample.tags) && sample.tags.length ? sample.tags : ["真实排盘"];
    return {
      id: `user-${sample.id}`,
      source: "user",
      engine: "iztro",
      rawAstrolabe: astrolabe,
      birthHour: Number(sample.birthHour),
      birthDate: sample.birthDate,
      name: sample.name,
      birthSummary: [astrolabe.solarDate, astrolabe.lunarDate, astrolabe.time, sample.gender, astrolabe.fiveElementsClass].filter(Boolean).join(" · "),
      tags: [...new Set(["真实排盘", ...tags])],
      question: sample.question || "自定义命盘观察",
      insight: `命宫在${astrolabe.earthlyBranchOfSoulPalace}，身宫在${astrolabe.earthlyBranchOfBodyPalace}；命主${astrolabe.soul}，身主${astrolabe.body}，五行局为${astrolabe.fiveElementsClass}。`,
      palaces
    };
  }

  const seed = seedFromText(`${sample.name}${sample.birthInfo}${sample.question}`);
  const tags = Array.isArray(sample.tags) && sample.tags.length ? sample.tags : ["自定义命盘"];
  return {
    id: `user-${sample.id}`,
    source: "user",
    engine: "mock",
    name: sample.name,
    birthSummary: [sample.calendarType, sample.birthInfo, sample.gender].filter(Boolean).join(" · "),
    tags,
    question: sample.question || "自定义命盘观察",
    insight: sample.note || sample.event || "当前样本缺少结构化出生日期，暂用 mock 星曜分布；补充日期、时辰、性别后可按真实排盘生成。",
    palaces: makePalaces(seed)
  };
}

function makeFallbackReading(chart) {
  if (chart.engine === "iztro") {
    return {
      summary: `${chart.name} 已按真实排盘生成十二宫。建议先看命宫、身宫、命主身主，再看四化和大限流年是否触发关键宫位。`,
      structure: [
        { title: "命身主线", body: chart.insight },
        { title: "星曜层次", body: "主星定宫位主题，辅星与杂曜补充助力、阻力、修饰和事件细节。" },
        { title: "运限触发", body: "大限看十年阶段，流年与流时看当期触发，流曜与四化叠入本命宫位时事件感更强。" }
      ]
    };
  }

  return {
    summary: `${chart.name} 可以先从命宫与官禄宫建立主线，再结合财帛、迁移、福德观察资源、外缘和内在节律。`,
    structure: [
      { title: "本命结构", body: "先看命宫主星与三方四正，确认人的底色、行动方式和外部反馈。" },
      { title: "四化落点", body: "把化禄、化权、化科、化忌分别当作资源、责任、名声和卡点来追踪。" },
      { title: "星曜互涉", body: "同宫、对照、会照和夹宫要一起看，避免只凭单颗星下结论。" }
    ]
  };
}

function fallbackPeriodReading(palace) {
  return `这一阶段以${palace.name}为主宫，主星${formatStars(palace.majorStars)}带动${palace.keyword}主题，杂曜${formatStars(palace.minorStars)}补充细节条件。`;
}

function buildDecadePeriods(chart) {
  return chart.palaces.map((palace, index) => {
    const range = palace.decadal?.range;
    const label = range ? `${range[0]}-${range[1]} 岁` : `${2 + index * 10}-${11 + index * 10} 岁`;
    const branch = palace.decadal ? `${palace.decadal.heavenlyStem}${palace.decadal.earthlyBranch}` : transformations[index % transformations.length];
    return {
      key: `decade-${index}`,
      periodType: "大运 / 大限",
      label,
      subLabel: palace.name,
      palace,
      offset: index,
      transform: branch,
      focus: palace.decadal ? `${palace.decadal.heavenlyStem}${palace.decadal.earthlyBranch} · ${palace.name}` : `${palace.keyword}、${palace.note}`,
      flow: null,
      flowStars: [],
      reading: palace.decadal
        ? `此大限行至${palace.name}，大限干支为${palace.decadal.heavenlyStem}${palace.decadal.earthlyBranch}。先看本宫主星${formatStars(palace.majorStars)}，再看杂曜${formatStars(palace.minorStars)}和对宫三方。`
        : fallbackPeriodReading(palace)
    };
  });
}

function makeFlowPeriod(chart, flow, label, periodType, offset) {
  const palace = chart.palaces[flow?.index ?? offset % chart.palaces.length] || chart.palaces[0];
  const flowStars = starNames(flow?.stars?.[flow.index] || []);
  const mutagen = Array.isArray(flow?.mutagen) && flow.mutagen.length ? flow.mutagen.join("、") : `${flow?.heavenlyStem || ""}${flow?.earthlyBranch || ""}`;
  return {
    key: `${periodType}-${label}`,
    periodType,
    label: String(label),
    subLabel: palace.name,
    palace,
    offset,
    transform: mutagen,
    focus: [flow?.heavenlyStem && flow?.earthlyBranch ? `${flow.heavenlyStem}${flow.earthlyBranch}` : "", flow?.name, palace.name].filter(Boolean).join(" · "),
    flow,
    flowStars,
    reading: `${periodType}命宫落${palace.name}，干支${flow?.heavenlyStem || ""}${flow?.earthlyBranch || ""}，四化为${mutagen || "未配置"}。本宫主星${formatStars(palace.majorStars)}，流曜${formatStars(flowStars)}。`
  };
}

function buildYearPeriods(chart) {
  if (chart.rawAstrolabe?.horoscope) {
    const today = new Date();
    const baseYear = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return Array.from({ length: 12 }, (_, index) => {
      const year = baseYear + index;
      const horoscope = chart.rawAstrolabe.horoscope(`${year}-${month}-${day}`, chart.birthHour || 0);
      return makeFlowPeriod(chart, horoscope.yearly, year, "流年", index + 1);
    });
  }

  const baseYear = new Date().getFullYear();
  return chart.palaces.map((palace, index) => ({
    key: `year-${baseYear + index}`,
    periodType: "流年",
    label: `${baseYear + index}`,
    subLabel: palace.name,
    palace,
    offset: index + 1,
    transform: transformations[(index + 1) % transformations.length],
    focus: `${palace.name}流年触发`,
    flow: null,
    flowStars: [],
    reading: `${baseYear + index} 年流年落到${palace.name}，适合观察${palace.keyword}主题是否出现明确事件。`
  }));
}

function buildHourPeriods(chart) {
  if (chart.rawAstrolabe?.horoscope) {
    const date = getTodayString();
    return hourBranches.map((hour, index) => {
      const horoscope = chart.rawAstrolabe.horoscope(date, hour.value);
      return makeFlowPeriod(chart, horoscope.hourly, hour.label, "流时", index + 2);
    });
  }

  return hourBranches.map((hour, index) => {
    const palace = chart.palaces[index % chart.palaces.length];
    return {
      key: `hour-${hour.label}`,
      periodType: "流时",
      label: hour.label,
      subLabel: hour.range,
      palace,
      offset: index + 2,
      transform: transformations[(index + 2) % transformations.length],
      focus: `${hour.range} · ${palace.keyword}`,
      flow: null,
      flowStars: [],
      reading: `${hour.label}对应${palace.name}，适合把当日事务落到${palace.keyword}主题中观察。`
    };
  });
}

function normalizePalaceKey(name = "") {
  return String(name).replace("仆役", "交友");
}

function findPalace(chart, names = []) {
  const normalizedNames = names.map(normalizePalaceKey);
  return (
    chart.palaces.find((palace) =>
      normalizedNames.includes(normalizePalaceKey(palace.name)) || normalizedNames.includes(normalizePalaceKey(palace.originalName))
    ) || null
  );
}

function getPalaceIndex(chart, palace) {
  const palaceIndex = chart.palaces.findIndex((item) => item.name === palace?.name && item.branch === palace?.branch);
  return palaceIndex >= 0 ? palaceIndex : 0;
}

function palaceKey(palace) {
  return `${palace?.branch || ""}-${palace?.name || ""}`;
}

function getTriadPalaces(chart, palace) {
  if (!chart?.palaces?.length || !palace) return [];
  const baseIndex = getPalaceIndex(chart, palace);
  return [baseIndex, baseIndex + 4, baseIndex + 8, baseIndex + 6].map((index) => chart.palaces[index % chart.palaces.length]).filter(Boolean);
}

function compactText(items = []) {
  return items.filter(Boolean).join("；");
}

function palaceBrief(palace) {
  if (!palace) return "未配置宫位";
  const stemBranch = [palace.stem, palace.branch].filter(Boolean).join("");
  const location = stemBranch ? `（${stemBranch}）` : "";
  const note = palace.note ? `，${palace.note}` : "";
  return `${palace.name}${location}：主星${formatStars(palace.majorStars)}，杂曜${formatStars(palace.minorStars)}${note}`;
}

function formatPalaceSet(palaces = []) {
  return palaces.map((palace) => `${palace.name}见${formatStars(palace.majorStars)}`).join("；") || "未配置";
}

function getBodyPalace(chart) {
  return chart.palaces.find((palace) => palace.isBodyPalace) || findPalace(chart, ["身宫"]);
}

function extractTransformStars(chart) {
  const transformPattern = /(化[禄权科忌]|[·･・][禄权科忌]|\([禄权科忌]\))/;
  return chart.palaces.flatMap((palace) =>
    [...(palace.majorStars || []), ...(palace.minorStars || [])]
      .filter((star) => transformPattern.test(star))
      .map((star) => `${palace.name}${palace.branch ? `(${palace.branch})` : ""}:${star}`)
  );
}

const palaceAdviceMap = {
  命宫: "把本期判断落到个人选择、定位和行动方式上，先验证自己是否真的愿意承担这个主题。",
  兄弟: "重点观察同辈、协作者和信息互换，重要合作要先讲清边界。",
  夫妻: "适合检查关系中的期待、承诺和对方反馈，避免只用自己的节奏解释两个人的问题。",
  子女: "可看作品、表达、子女和创造性输出，先做小规模试验再放大。",
  财帛: "把资源、现金流和可复用能力列清楚，少凭感觉判断收益。",
  疾厄: "把身体节律、压力来源和长期消耗纳入观察，先修复再推进。",
  迁移: "外部环境、平台、远行和曝光会变重要，适合用外部反馈校准方向。",
  交友: "看团队、人脉和客户质量，筛选比扩张更重要。",
  官禄: "聚焦角色定位、责任范围和事业目标，适合把经验沉淀成方法。",
  田宅: "先看稳定底盘、资产、空间和家庭结构，适合做长期配置。",
  福德: "观察兴趣、精神能量和恢复方式，节律稳定后判断会更准。",
  父母: "留意制度、长辈、文书和上级资源，重要事项要保留记录。"
};

function getPalaceAdvice(palaceName) {
  return palaceAdviceMap[normalizePalaceKey(palaceName)] || "先记录现实事件，再回到宫位、主星、杂曜和四化逐层验证。";
}

function getScoreLevel(score) {
  if (score >= 92) return "重点宫位";
  if (score >= 86) return "强信号";
  if (score >= 82) return "优先观察";
  return "常规观察";
}

function buildPalaceScoreAnalysis(chart, palace) {
  if (!palace) {
    return {
      key: "empty",
      name: "未选宫位",
      score: 0,
      level: "未评分",
      formula: "请选择一个宫位查看结构活跃度。",
      reasons: []
    };
  }

  const majorCount = palace.majorStars?.length || 0;
  const minorCount = palace.minorStars?.length || 0;
  const triadPalaces = getTriadPalaces(chart, palace).filter((item) => palaceKey(item) !== palaceKey(palace));
  const strongTriad = triadPalaces.filter((item) => item.score >= 82);
  const isRealChart = chart.engine === "iztro";
  const scoreSource = isRealChart
    ? "当前分值以排盘结果中的主星配置、辅杂曜密度和宫位结构信息生成，用来提示优先观察顺序。"
    : "系统样本分值用于演示结构权重，正式分析应以自己录入后生成的命盘为准。";

  return {
    key: palaceKey(palace),
    name: palace.name,
    score: palace.score,
    level: getScoreLevel(palace.score),
    formula: `${scoreSource}它不是吉凶分，适合当作“哪里更需要展开复盘”的提示。`,
    reasons: [
      {
        label: "主星定性",
        body: majorCount
          ? `${formatStars(palace.majorStars)}坐守，宫位主题有明确主轴；主星越集中，越适合先判断该宫的性格、资源或事件底色。`
          : "本宫主星不明显时，需要借对宫与三方四正来定性，单宫分数不宜直接下结论。"
      },
      {
        label: "辅杂曜细节",
        body: minorCount
          ? `${formatStars(palace.minorStars)}补充了助力、阻力、修饰和事件细节；杂曜越多，越需要区分是助成、消耗还是触发条件。`
          : "辅杂曜较少，解读时要更依赖主星、对宫和四化落点。"
      },
      {
        label: "三方四正",
        body: `本宫会照${formatPalaceSet(triadPalaces)}。${strongTriad.length ? `其中${strongTriad.map((item) => `${item.name}${item.score}`).join("、")}也属高活跃宫位，说明这组议题容易联动。` : "三方四正未形成明显高分联动，宜回到本宫主题做单点观察。"}`
      },
      {
        label: "运限触发",
        body: palace.ages?.length
          ? `小限涉及 ${palace.ages.join("、")}，遇到大限、流年或流月再触发本宫时，事件感会更集中。`
          : "当前没有小限年龄数据，建议结合大限、流年、流月和流时再判断是否真正被触发。"
      },
      {
        label: "专业校验",
        body: getPalaceAdvice(palace.name)
      }
    ]
  };
}

function buildNatalAnalysis(chart) {
  const lifePalace = findPalace(chart, ["命宫"]) || chart.palaces[0];
  const bodyPalace = getBodyPalace(chart);
  const wealthPalace = findPalace(chart, ["财帛"]);
  const careerPalace = findPalace(chart, ["官禄"]);
  const travelPalace = findPalace(chart, ["迁移"]);
  const relationshipPalace = findPalace(chart, ["夫妻"]);
  const networkPalace = findPalace(chart, ["交友"]);
  const fortunePalace = findPalace(chart, ["福德"]);
  const healthPalace = findPalace(chart, ["疾厄"]);
  const triadPalaces = getTriadPalaces(chart, lifePalace);
  const transformStars = extractTransformStars(chart);
  const strongPalaces = [...chart.palaces].sort((a, b) => b.score - a.score).slice(0, 3).map((palace) => `${palace.name}${palace.score}`).join("、");
  const astrolabeInfo = chart.rawAstrolabe
    ? `命主${chart.rawAstrolabe.soul || "未录"}，身主${chart.rawAstrolabe.body || "未录"}，五行局${chart.rawAstrolabe.fiveElementsClass || "未录"}`
    : "系统样本为 mock 盘，适合先看结构演示，真实判断以自定义命盘为准";

  return [
    {
      title: "命身底盘",
      method: "本命层：先定气质与用力点",
      body: compactText([palaceBrief(lifePalace), bodyPalace ? `身宫落${bodyPalace.name}${bodyPalace.branch ? `（${bodyPalace.branch}）` : ""}，后天用力常落在${bodyPalace.keyword || bodyPalace.name}` : "身宫信息未配置", astrolabeInfo])
    },
    {
      title: "三方四正",
      method: "结构层：命、财、官、迁合看",
      body: `${formatPalaceSet(triadPalaces)}。先看四宫主星是否同调，再判断资源、事业、外部环境是否互相支持。`
    },
    {
      title: "财官迁主线",
      method: "事业层：资源、目标、外部反馈",
      body: compactText([palaceBrief(wealthPalace), palaceBrief(careerPalace), palaceBrief(travelPalace)])
    },
    {
      title: "四化落点",
      method: "事件层：禄权科忌追踪触发",
      body: transformStars.length
        ? `优先追踪${transformStars.slice(0, 8).join("、")}。禄看资源流入，权看责任推动，科看名声修饰，忌看执着与卡点。`
        : "当前命盘数据未给出明确四化星曜，可在流年、流月切换中观察四化落入哪些宫位，再与现实事件互证。"
    },
    {
      title: "关系与合作",
      method: "互涉层：本宫、对宫、人际网络",
      body: compactText([palaceBrief(relationshipPalace), palaceBrief(networkPalace), "关系判断要合看夫妻宫、交友宫和迁移宫，避免只凭单宫下结论"])
    },
    {
      title: "福德疾厄",
      method: "节律层：内在能量与压力成本",
      body: compactText([palaceBrief(fortunePalace), palaceBrief(healthPalace), `高权重宫位：${strongPalaces || "未配置"}，适合拿来做现实复盘入口`])
    }
  ];
}

const pressureStarKeywords = ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫", "天空", "截空", "旬空", "化忌"];

const palaceAdjustmentMap = {
  命宫: "先收束目标和身份定位，把想做的事拆成一到两个可验证动作。",
  兄弟: "减少口头承诺，合作、借贷和资源互换尽量写清楚边界。",
  夫妻: "重要关系先处理期待差异，少用情绪判断，多用事实复盘。",
  子女: "作品、表达和子女相关事项先小步试错，避免一次投入过重。",
  财帛: "重排预算、现金流和收费边界，把资源入口和消耗项分开记录。",
  疾厄: "优先调整作息、体检、压力源和恢复周期，不把身体透支当成执行力。",
  迁移: "外部机会先做背景核验，跨城、出差、曝光和平台转换保留备选方案。",
  交友: "筛选团队和客户质量，明确谁负责、谁决策、谁承担成本。",
  官禄: "把职责、交付物和评价标准写下来，用阶段成果校准事业方向。",
  田宅: "先稳住空间、资产、家庭和长期底盘，重大配置避免情绪化决策。",
  福德: "减少无效输入和社交消耗，给兴趣、睡眠和独处留出固定时间。",
  父母: "文书、制度、上级、长辈相关事项要留痕，重要节点提前确认。"
};

function getPeriodLayer(periodType = "") {
  if (periodType.includes("大")) {
    return {
      name: "大运",
      method: "十年阶段风险",
      risk: "长期方向、身份惯性和资源配置失衡",
      adjustment: "用三年目标、一年计划和季度复盘承接，不要只凭某一年好坏改掉整段方向。"
    };
  }
  if (periodType.includes("流年")) {
    return {
      name: "流年",
      method: "年度事件风险",
      risk: "年度任务、关系压力和机会取舍同时加重",
      adjustment: "把四化触发拆成季度主题，每季只抓一个主问题，年底再回验盘面判断。"
    };
  }
  if (periodType.includes("流月")) {
    return {
      name: "流月",
      method: "短期节奏风险",
      risk: "短期情绪、排期冲突和临时事件干扰判断",
      adjustment: "用周计划和月末复盘处理，适合微调行动，不宜只凭一个月推翻长期判断。"
    };
  }
  return {
    name: "流时",
    method: "当日执行风险",
    risk: "即时状态影响判断",
    adjustment: "适合安排沟通、推进或收束，不适合单独决定长期事项。"
  };
}

function collectPeriodStarNames(period) {
  return [...(period?.palace?.majorStars || []), ...(period?.palace?.minorStars || []), ...(period?.flowStars || [])];
}

function getPressureStars(period) {
  return collectPeriodStarNames(period).filter((star) => pressureStarKeywords.some((keyword) => star.includes(keyword)));
}

function getTransformAttention(transform = "") {
  if (transform.includes("忌")) return "四化见忌时，先处理欠账、执着和反复卡住的问题，避免硬推。";
  if (transform.includes("权")) return "四化见权时，责任和控制欲会变强，要防止把压力全揽到自己身上。";
  if (transform.includes("禄")) return "四化见禄时，资源入口增加，也要防机会过多导致分散。";
  if (transform.includes("科")) return "四化见科时，有利修饰、名声和文书，但要避免只重包装不重交付。";
  return "四化不明显时，先用主宫、三方四正和现实事件做复盘。";
}

function getPeriodAdjustment(palaceName) {
  return palaceAdjustmentMap[normalizePalaceKey(palaceName)] || "先把问题写成事件、时间、对象和结果，再回到宫位逐项验证。";
}

function buildPeriodGuidance(period) {
  const layer = getPeriodLayer(period?.periodType);
  const pressureStars = getPressureStars(period);
  const pressureText = pressureStars.length
    ? `本期见${pressureStars.slice(0, 4).join("、")}，要特别留意冲突、延迟、落空或额外成本。`
    : "未见明显煞曜集中，也仍需看现实里是否出现反复、拖延或过度消耗。";
  return {
    layer,
    attention: `${layer.name}层面重点防${layer.risk}。${getTransformAttention(period?.transform)}${pressureText}`,
    adjustment: `${layer.adjustment}${getPeriodAdjustment(period?.palace?.name)}`
  };
}

function buildPeriodAnalysis(period, chart) {
  if (!period?.palace) return [];
  const palace = period.palace;
  const triadPalaces = getTriadPalaces(chart, palace);
  const flowStars = formatStars(period.flowStars);
  const palaceStars = formatStars(palace.majorStars);
  const minorStars = formatStars(palace.minorStars);
  const periodGuidance = buildPeriodGuidance(period);
  return [
    {
      title: "主宫主题",
      method: "先定阶段主轴",
      body: `${period.periodType}${period.label}行至${palace.name}，以${palace.keyword || palace.name}为观察主轴；本宫主星${palaceStars}决定这一阶段的处理风格。`
    },
    {
      title: "四化触发",
      method: "追踪禄权科忌",
      body: period.transform && period.transform !== "未配置"
        ? `本期四化/干支线索为${period.transform}。看它叠入本命哪一宫，再判断资源、责任、名声或卡点被触发。`
        : "当前时段没有明确四化数据，先以主宫与流曜做事件观察。"
    },
    {
      title: "注意问题",
      method: periodGuidance.layer.method,
      body: periodGuidance.attention
    },
    {
      title: "调整方式",
      method: "落到行动策略",
      body: periodGuidance.adjustment
    },
    {
      title: "流曜叠加",
      method: "流曜看短期事件感",
      body: `流曜为${flowStars}，本宫杂曜为${minorStars}。流曜有力时适合看具体事件，杂曜则补充助力、阻力和细节条件。`
    },
    {
      title: "三方四正",
      method: "不孤立看单宫",
      body: `本期三方四正可连看：${formatPalaceSet(triadPalaces)}。若流年或流月同时触发这些宫位，事件感会更集中。`
    },
    {
      title: "现实建议",
      method: "翻译成可验证行动",
      body: getPalaceAdvice(palace.name)
    }
  ];
}

function buildMonthPeriods(chart) {
  const baseYear = new Date().getFullYear();
  if (chart.rawAstrolabe?.horoscope) {
    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const horoscope = chart.rawAstrolabe.horoscope(`${baseYear}-${month}-15`, chart.birthHour || 0);
      return makeFlowPeriod(chart, horoscope.monthly, `${baseYear}年${month}月`, "流月", index + 3);
    });
  }

  return chart.palaces.map((palace, index) => ({
    key: `month-${baseYear}-${index + 1}`,
    periodType: "流月",
    label: `${baseYear}年${index + 1}月`,
    subLabel: palace.name,
    palace,
    offset: index + 3,
    transform: transformations[(index + 3) % transformations.length],
    focus: `${palace.name}流月触发`,
    flow: null,
    flowStars: [],
    reading: `${baseYear}年${index + 1}月流月落到${palace.name}，适合把短期事务放到${palace.keyword}主题里复盘。`
  }));
}

const userSamples = ref(readStoredSamples());
const chartForm = reactive({
  name: "",
  calendarType: "阳历",
  birthDate: "",
  birthHour: "",
  isLeapMonth: false,
  gender: "",
  question: "",
  tags: ""
});
const activeChartId = ref(sampleCharts[0].id);
const activePalace = ref(sampleCharts[0].palaces[0]);
const activeFlowTab = ref("decade");
const activeDecadeIndex = ref(0);
const activeYearIndex = ref(0);
const activeMonthIndex = ref(0);
const activeHourIndex = ref(0);

const userCharts = computed(() => userSamples.value.map((sample) => buildUserChart(sample)));
const allCharts = computed(() => [...sampleCharts, ...userCharts.value]);
const activeChart = computed(() => allCharts.value.find((item) => item.id === activeChartId.value) || sampleCharts[0]);
const activeReading = computed(() => chartReadingDetails[activeChart.value.id] || makeFallbackReading(activeChart.value));
const natalAnalysis = computed(() => buildNatalAnalysis(activeChart.value));
const highScorePalaces = computed(() => activeChart.value.palaces.filter((item) => item.score >= 82).sort((a, b) => b.score - a.score));
const scoreAnalysisItems = computed(() => highScorePalaces.value.map((palace) => buildPalaceScoreAnalysis(activeChart.value, palace)));
const activeScoreAnalysis = computed(() => buildPalaceScoreAnalysis(activeChart.value, activePalace.value));
const decadePeriods = computed(() => buildDecadePeriods(activeChart.value));
const yearPeriods = computed(() => buildYearPeriods(activeChart.value));
const monthPeriods = computed(() => buildMonthPeriods(activeChart.value));
const hourPeriods = computed(() => buildHourPeriods(activeChart.value));
const currentPeriods = computed(() => {
  if (activeFlowTab.value === "year") return yearPeriods.value;
  if (activeFlowTab.value === "month") return monthPeriods.value;
  if (activeFlowTab.value === "hour") return hourPeriods.value;
  return decadePeriods.value;
});
const selectedPeriod = computed(() => currentPeriods.value[getActivePeriodIndex()] || currentPeriods.value[0]);
const selectedPeriodAnalysis = computed(() => buildPeriodAnalysis(selectedPeriod.value, activeChart.value));
const chartPatternAnalysis = computed(() => analyzeChartPatterns(activeChart.value));
const palaceLineAnchors = {
  si: { x: 0.5, y: 0.5 },
  wu: { x: 1.5, y: 0.5 },
  wei: { x: 2.5, y: 0.5 },
  shen: { x: 3.5, y: 0.5 },
  chen: { x: 0.5, y: 1.5 },
  you: { x: 3.5, y: 1.5 },
  mao: { x: 0.5, y: 2.5 },
  xu: { x: 3.5, y: 2.5 },
  yin: { x: 0.5, y: 3.5 },
  chou: { x: 1.5, y: 3.5 },
  zi: { x: 2.5, y: 3.5 },
  hai: { x: 3.5, y: 3.5 }
};
const activeTriadPalaces = computed(() => getTriadPalaces(activeChart.value, activePalace.value));
const activeTriadKeys = computed(() => new Set(activeTriadPalaces.value.map((palace) => palaceKey(palace))));
const activeTriadSummary = computed(() =>
  activeTriadPalaces.value.map((palace) => `${palace.name}${palace.branch ? `(${palace.branch})` : ""}`).join(" · ")
);
const activeTriadLines = computed(() =>
  activeTriadPalaces.value
    .map((palace) => ({
      key: palaceKey(palace),
      point: palaceLineAnchors[palace.area]
    }))
    .filter((item) => item.point)
);
const selectedFlowBoard = computed(() =>
  activeChart.value.palaces.map((palace, index) => {
    const flow = selectedPeriod.value.flow;
    const flowStars = starNames(flow?.stars?.[index] || []);
    return {
      ...palace,
      active: palace.name === selectedPeriod.value.palace.name,
      flowStars,
      flowPalaceName: flow?.palaceNames?.[index],
      transform: flow?.mutagen?.join("、") || transformations[(index + selectedPeriod.value.offset) % transformations.length],
      marker: flow?.name || flowMarkers[(index + selectedPeriod.value.offset) % flowMarkers.length]
    };
  })
);

watch(
  userSamples,
  (value) => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  },
  { deep: true }
);

function getActivePeriodIndex() {
  if (activeFlowTab.value === "year") return activeYearIndex.value;
  if (activeFlowTab.value === "month") return activeMonthIndex.value;
  if (activeFlowTab.value === "hour") return activeHourIndex.value;
  return activeDecadeIndex.value;
}

function setActivePeriod(index) {
  if (activeFlowTab.value === "year") {
    activeYearIndex.value = index;
    return;
  }
  if (activeFlowTab.value === "month") {
    activeMonthIndex.value = index;
    return;
  }
  if (activeFlowTab.value === "hour") {
    activeHourIndex.value = index;
    return;
  }
  activeDecadeIndex.value = index;
}

function resetPeriodSelection() {
  activeFlowTab.value = "decade";
  activeDecadeIndex.value = 0;
  activeYearIndex.value = 0;
  activeMonthIndex.value = 0;
  activeHourIndex.value = 0;
}

function selectChart(chartId) {
  activeChartId.value = chartId;
  activePalace.value = activeChart.value.palaces[0];
  resetPeriodSelection();
}

function resetChartForm() {
  chartForm.name = "";
  chartForm.calendarType = "阳历";
  chartForm.birthDate = "";
  chartForm.birthHour = "";
  chartForm.isLeapMonth = false;
  chartForm.gender = "";
  chartForm.question = "";
  chartForm.tags = "";
}

function createUserChart() {
  if (!chartForm.name.trim() || !chartForm.birthDate || chartForm.birthHour === "" || !chartForm.gender) {
    ElMessage.warning("请填写命盘名称、出生日期、时辰和性别");
    return;
  }

  const hour = hourBranches.find((item) => item.value === Number(chartForm.birthHour));
  const sample = {
    id: `sample-${Date.now()}`,
    name: chartForm.name.trim(),
    calendarType: chartForm.calendarType,
    birthDate: chartForm.birthDate,
    birthHour: chartForm.birthHour,
    isLeapMonth: chartForm.calendarType === "农历" ? chartForm.isLeapMonth : false,
    birthInfo: `${chartForm.birthDate} · ${hour?.label || ""}`,
    gender: chartForm.gender,
    question: chartForm.question.trim() || "自定义命盘观察",
    tags: normalizeTags(chartForm.tags),
    event: "",
    note: "",
    createdAt: new Date().toLocaleDateString("zh-CN")
  };
  userSamples.value.unshift(sample);
  selectChart(`user-${sample.id}`);
  resetChartForm();
  ElMessage.success("命盘已按真实排盘生成");
}

function removeUserChart(sampleId) {
  userSamples.value = userSamples.value.filter((sample) => sample.id !== sampleId);
  if (activeChartId.value === `user-${sampleId}`) {
    selectChart(sampleCharts[0].id);
  }
  ElMessage.success("命盘已删除");
}
</script>

<template>
  <main class="page-shell">
    <section class="page-title-block">
      <el-tag type="warning" effect="dark">Chart Lab</el-tag>
      <h1>专业排盘工作台</h1>
      <p>录入自己的命盘后，可在本命盘、大限、流年、流时之间切换查看宫位、星曜分布和阶段解读。</p>
    </section>

    <section class="content-shell chart-input-panel">
      <div class="chart-input-copy">
        <el-tag type="success" effect="plain">My Chart</el-tag>
        <h2>按真实规则生成命盘</h2>
        <p>使用结构化出生日期、时辰、性别和历法生成十二宫，主星、辅星、杂曜和大限来自排盘库计算。</p>
      </div>

      <el-form class="chart-create-form" label-position="top" @submit.prevent>
        <div class="form-row">
          <el-form-item label="命盘名称">
            <el-input v-model="chartForm.name" placeholder="例如：我的事业盘" />
          </el-form-item>
          <el-form-item label="历法">
            <el-select v-model="chartForm.calendarType">
              <el-option label="阳历" value="阳历" />
              <el-option label="农历" value="农历" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="出生日期">
            <el-date-picker v-model="chartForm.birthDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" />
          </el-form-item>
          <el-form-item label="出生时辰">
            <el-select v-model="chartForm.birthHour" placeholder="选择时辰">
              <el-option v-for="hour in hourBranches" :key="hour.value" :label="`${hour.label} ${hour.range}`" :value="hour.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="性别">
            <el-select v-model="chartForm.gender" placeholder="选择性别">
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="chartForm.calendarType === '农历'" label="农历闰月">
            <el-switch v-model="chartForm.isLeapMonth" active-text="闰月" inactive-text="非闰月" />
          </el-form-item>
        </div>
        <el-form-item label="关注问题">
          <el-input v-model="chartForm.question" placeholder="例如：未来一年职业转型阻力在哪里" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="chartForm.tags" placeholder="命迁线、四化集中、财官互照" />
        </el-form-item>
        <el-button type="primary" :icon="Plus" @click="createUserChart">生成并选择命盘</el-button>
      </el-form>
    </section>

    <section class="workbench content-shell">
      <aside class="sample-panel">
        <div class="section-title">
          <el-icon><Reading /></el-icon>
          <h2>命盘列表</h2>
        </div>

        <span class="sample-group-label">系统样本</span>
        <button
          v-for="chart in sampleCharts"
          :key="chart.id"
          class="sample-item"
          :class="{ active: chart.id === activeChart.id }"
          type="button"
          @click="selectChart(chart.id)"
        >
          <strong>{{ chart.name }}</strong>
          <span>{{ chart.birthSummary }}</span>
        </button>

        <span class="sample-group-label">我的命盘</span>
        <el-empty v-if="!userCharts.length" :image-size="72" description="暂无命盘" />
        <div v-else class="custom-chart-list">
          <button
            v-for="chart in userCharts"
            :key="chart.id"
            class="sample-item"
            :class="{ active: chart.id === activeChart.id }"
            type="button"
            @click="selectChart(chart.id)"
          >
            <strong>{{ chart.name }}</strong>
            <span>{{ chart.birthSummary }}</span>
          </button>
        </div>
      </aside>

      <section class="chart-panel">
        <div class="chart-head">
          <div>
            <el-tag type="success">{{ activeChart.birthSummary }}</el-tag>
            <h2>{{ activeChart.name }}</h2>
            <p>{{ activeChart.question }}</p>
          </div>
          <el-space wrap>
            <el-tag v-for="tag in activeChart.tags" :key="tag" effect="plain">{{ tag }}</el-tag>
          </el-space>
        </div>

        <div class="palace-board">
          <svg class="palace-relation-lines" viewBox="0 0 4 4" preserveAspectRatio="none" aria-hidden="true">
            <line
              v-for="line in activeTriadLines"
              :key="line.key"
              x1="2"
              y1="2"
              :x2="line.point.x"
              :y2="line.point.y"
            />
          </svg>
          <button
            v-for="palace in activeChart.palaces"
            :key="`${palace.branch}-${palace.name}`"
            class="palace-cell"
            :class="{
              selected: palaceKey(palace) === palaceKey(activePalace),
              'triad-related': activeTriadKeys.has(palaceKey(palace)) && palaceKey(palace) !== palaceKey(activePalace)
            }"
            :style="{ gridArea: palace.area }"
            type="button"
            @click="activePalace = palace"
          >
            <span>{{ palace.branch }} 位 · {{ palace.name }}</span>
            <strong>{{ formatStars(palace.majorStars) }}</strong>
            <small>杂曜：{{ formatStars(palace.minorStars) }}</small>
            <em>{{ palace.keyword }}</em>
          </button>

          <div class="palace-center">
            <div class="palace-center-brand">紫微研究盘</div>
            <strong>{{ activeChart.name }}</strong>
            <div class="palace-center-info">
              <p><span>出生</span>{{ activeChart.birthSummary }}</p>
              <p><span>当前</span>{{ activePalace.name }} · {{ activePalace.branch }}</p>
              <p><span>三方四正</span>{{ activeTriadSummary }}</p>
              <p><span>主星</span>{{ formatStars(activePalace.majorStars) }}</p>
              <p><span>杂曜</span>{{ formatStars(activePalace.minorStars) }}</p>
            </div>
            <em>{{ activePalace.note }}</em>
          </div>
        </div>
      </section>

      <aside class="analysis-panel">
        <div class="section-title">
          <el-icon><Star /></el-icon>
          <h2>结构摘要</h2>
        </div>
        <p>{{ activeChart.insight }}</p>
        <div class="score-head">
          <span>结构活跃度</span>
          <em>非吉凶评分</em>
        </div>
        <div class="focus-list">
          <span v-for="palace in highScorePalaces" :key="palace.name">
            {{ palace.name }} {{ palace.score }}
          </span>
        </div>
        <el-collapse class="score-collapse">
          <el-collapse-item
            v-for="item in scoreAnalysisItems"
            :key="item.key"
            :title="`${item.name} ${item.score} · ${item.level}`"
          >
            <div class="score-detail">
              <p>{{ item.formula }}</p>
              <article v-for="reason in item.reasons" :key="reason.label">
                <span>{{ reason.label }}</span>
                <p>{{ reason.body }}</p>
              </article>
            </div>
          </el-collapse-item>
        </el-collapse>
        <el-divider />
        <div class="selected-palace">
          <span>当前宫位</span>
          <strong>{{ activePalace.name }} · {{ activePalace.branch }}</strong>
          <p>主星：{{ formatStars(activePalace.majorStars) }}</p>
          <p>杂曜：{{ formatStars(activePalace.minorStars) }}</p>
          <p>评分：{{ activeScoreAnalysis.score }} · {{ activeScoreAnalysis.level }}</p>
          <p v-if="activePalace.ages?.length">小限：{{ activePalace.ages.join("、") }}</p>
          <el-progress :percentage="activePalace.score" :stroke-width="10" color="#b88746" />
        </div>
        <el-button
          v-if="activeChart.source === 'user'"
          class="delete-chart-button"
          text
          type="danger"
          :icon="Delete"
          @click="removeUserChart(activeChart.id.replace('user-', ''))"
        >
          删除当前命盘
        </el-button>
      </aside>
    </section>

    <section class="content-shell detailed-reading-panel">
      <div class="section-title">
        <el-icon><TrendCharts /></el-icon>
        <h2>排盘详细解析</h2>
      </div>
      <p class="reading-summary">{{ activeReading.summary }}</p>

      <div class="reading-overview-grid">
        <article v-for="item in activeReading.structure" :key="item.title">
          <span>{{ item.title }}</span>
          <p>{{ item.body }}</p>
        </article>
      </div>

      <div class="natal-analysis-panel">
        <div class="section-title compact">
          <el-icon><Star /></el-icon>
          <h2>专业分层解读</h2>
        </div>
        <div class="natal-analysis-grid">
          <article v-for="item in natalAnalysis" :key="item.title">
            <span>{{ item.method }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.body }}</p>
          </article>
        </div>
      </div>

      <div class="palace-reading-callout">
        <el-icon><Star /></el-icon>
        <div>
          <span>当前选中宫位补充</span>
          <p>
            {{ activePalace.name }}落{{ activePalace.branch }}位，主星为{{ formatStars(activePalace.majorStars) }}，杂曜为{{ formatStars(activePalace.minorStars) }}。
            当前分值 {{ activePalace.score }}，可优先结合{{ activePalace.keyword }}主题和“{{ activePalace.note }}”做现实验证。
          </p>
        </div>
      </div>

      <el-tabs v-model="activeFlowTab" class="flow-tabs">
        <el-tab-pane label="大运 / 大限" name="decade" />
        <el-tab-pane label="流年" name="year" />
        <el-tab-pane label="流月" name="month" />
        <el-tab-pane label="流时" name="hour" />
        <el-tab-pane label="格局分析" name="patterns" />
      </el-tabs>

      <div v-if="activeFlowTab !== 'patterns'" class="period-workbench">
        <aside class="period-selector">
          <button
            v-for="(period, index) in currentPeriods"
            :key="period.key"
            type="button"
            :class="{ active: index === getActivePeriodIndex() }"
            @click="setActivePeriod(index)"
          >
            <span>{{ period.label }}</span>
            <strong>{{ period.subLabel }}</strong>
            <em>{{ period.transform }}</em>
          </button>
        </aside>

        <section class="period-detail-panel">
          <div class="period-detail-head">
            <div>
              <span>{{ selectedPeriod.periodType }}</span>
              <h3>{{ selectedPeriod.label }} · {{ selectedPeriod.palace.name }}</h3>
              <p>{{ selectedPeriod.reading }}</p>
            </div>
            <el-tag effect="dark" type="warning">{{ selectedPeriod.transform }}</el-tag>
          </div>

          <div class="flow-focus-list">
            <span>主星：{{ formatStars(selectedPeriod.palace.majorStars) }}</span>
            <span>杂曜：{{ formatStars(selectedPeriod.palace.minorStars) }}</span>
            <span v-if="selectedPeriod.flowStars.length">流曜：{{ formatStars(selectedPeriod.flowStars) }}</span>
            <span>主题：{{ selectedPeriod.focus }}</span>
            <span>宫位：{{ selectedPeriod.palace.branch }} · {{ selectedPeriod.palace.name }}</span>
          </div>

          <div class="period-star-board">
            <article
              v-for="palace in selectedFlowBoard"
              :key="`${palace.branch}-${palace.name}`"
              :class="{ active: palace.active }"
            >
              <span>{{ palace.branch }} · {{ palace.name }}</span>
              <strong>{{ formatStars(palace.majorStars) }}</strong>
              <small>杂曜：{{ formatStars(palace.minorStars) }}</small>
              <small v-if="palace.flowStars.length">流曜：{{ formatStars(palace.flowStars) }}</small>
              <em>{{ palace.flowPalaceName || palace.transform }} · {{ palace.marker }}</em>
            </article>
          </div>

          <div class="period-analysis-grid">
            <article v-for="item in selectedPeriodAnalysis" :key="item.title">
              <span>{{ item.method }}</span>
              <strong>{{ item.title }}</strong>
              <p>{{ item.body }}</p>
            </article>
          </div>
        </section>
      </div>

      <div v-else class="chart-pattern-panel">
        <div class="section-title compact">
          <el-icon><Star /></el-icon>
          <h2>命盘格局与破格判断</h2>
        </div>
        <p class="pattern-summary">{{ chartPatternAnalysis.summary }}</p>

        <div class="pattern-guide">
          <article>
            <span>定格局</span>
            <p>先确认命宫、身宫和关键宫位是否满足成格条件，再看三方四正是否会齐所需主星或辅曜。</p>
          </article>
          <article>
            <span>看破格</span>
            <p>成格后再查同宫、对宫、三方四正是否见煞忌、空劫或过度冲动的组合，判断是否减力或转性。</p>
          </article>
          <article>
            <span>候选待验</span>
            <p>亮度、夹拱或完整条件不足时，只作为候选格局提示，需要结合真实排盘参数和现实事件复盘。</p>
          </article>
        </div>

        <div class="pattern-grid">
          <article v-for="pattern in chartPatternAnalysis.patterns" :key="pattern.name">
            <div class="pattern-head">
              <span>{{ pattern.category }}</span>
              <em :class="pattern.statusClass">{{ pattern.status }}</em>
            </div>
            <strong>{{ pattern.name }}</strong>
            <p>{{ pattern.basis }}</p>
            <div class="pattern-reading">
              <b>格局解读</b>
              <p>{{ pattern.reading }}</p>
            </div>
            <div class="pattern-reading">
              <b>破格判断</b>
              <p>{{ pattern.breaking }}</p>
            </div>
            <div class="pattern-reading">
              <b>调整建议</b>
              <p>{{ pattern.advice }}</p>
            </div>
          </article>
        </div>

        <div class="pattern-note">
          <span>定格原则：先看命宫与身宫，再取三方四正、同宫、对宫、辅弼会照与煞忌冲破；候选格局会标注“待验”，不强行当作严格成格。</span>
        </div>
      </div>

      <div class="reading-footnote">
        <el-icon><Timer /></el-icon>
        <span>自定义命盘已接入 iztro 真实排盘；解读按本命定结构、三方四正看系统、四化追事件、大限/流年/流月/流时看触发来组织。系统样本仍保留 mock 展示，不同排盘软件可能因真太阳时、闰月、流派设置和起限规则不同而略有差异。</span>
      </div>
    </section>
  </main>
</template>
