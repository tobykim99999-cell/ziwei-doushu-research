const maleficStars = ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫", "天刑", "阴煞", "化忌"];
const supportStars = ["左辅", "右弼", "文昌", "文曲", "天魁", "天钺", "禄存", "天马", "化禄", "化权", "化科"];

function normalizeName(value = "") {
  return String(value).replace("仆役", "交友");
}

function allStars(palace) {
  return [...(palace?.majorStars || []), ...(palace?.minorStars || [])].filter(Boolean);
}

function starText(palace) {
  return allStars(palace).join("、");
}

function hasStar(palace, star) {
  return allStars(palace).some((item) => String(item).includes(star));
}

function hasAnyStar(palace, stars) {
  return stars.some((star) => hasStar(palace, star));
}

function countStars(palaces, stars) {
  return palaces.reduce((total, palace) => total + allStars(palace).filter((star) => stars.some((item) => String(star).includes(item))).length, 0);
}

function findPalace(chart, names = []) {
  const normalizedNames = names.map(normalizeName);
  return (
    chart?.palaces?.find((palace) => normalizedNames.includes(normalizeName(palace.name)) || normalizedNames.includes(normalizeName(palace.originalName))) ||
    null
  );
}

function findPalaceWithStars(chart, stars = []) {
  return chart?.palaces?.find((palace) => stars.every((star) => hasStar(palace, star))) || null;
}

function getPalaceIndex(chart, palace) {
  const index = chart?.palaces?.findIndex((item) => item.name === palace?.name && item.branch === palace?.branch);
  return index >= 0 ? index : 0;
}

function palaceAt(chart, index) {
  return chart?.palaces?.[((index % chart.palaces.length) + chart.palaces.length) % chart.palaces.length] || null;
}

function getTriadPalaces(chart, palace) {
  if (!chart?.palaces?.length || !palace) return [];
  const baseIndex = getPalaceIndex(chart, palace);
  return [baseIndex, baseIndex + 4, baseIndex + 8, baseIndex + 6].map((index) => palaceAt(chart, index)).filter(Boolean);
}

function getNeighborPalaces(chart, palace) {
  if (!chart?.palaces?.length || !palace) return [];
  const index = getPalaceIndex(chart, palace);
  return [palaceAt(chart, index - 1), palaceAt(chart, index + 1)].filter(Boolean);
}

function formatPalaces(palaces = []) {
  return palaces.map((palace) => `${palace.name}${palace.branch ? `(${palace.branch})` : ""}`).join("、") || "未取到宫位";
}

function formatEvidence(palaces = []) {
  return palaces
    .map((palace) => {
      const stars = starText(palace) || "未见主要星曜";
      return `${palace.name}${palace.branch ? `(${palace.branch})` : ""}见${stars}`;
    })
    .join("；");
}

function isBright(star) {
  return /庙|旺|得/.test(String(star));
}

function findStarRecord(palace, star) {
  return allStars(palace).find((item) => String(item).includes(star)) || "";
}

function evaluateBreak(palaces, options = {}) {
  const shaCount = countStars(palaces, maleficStars);
  const supportCount = countStars(palaces, supportStars);
  const strictNoSha = Boolean(options.strictNoSha);
  const hasBreak = strictNoSha ? shaCount > 0 : shaCount >= 2;

  if (hasBreak) {
    return {
      broken: true,
      status: "见格有破",
      statusClass: "broken",
      text: `三方四正或关键宫位见 ${shaCount} 处煞忌，格局仍有主题，但成就方式会转为压力、反复、切割或先破后立。`
    };
  }

  if (shaCount === 1) {
    return {
      broken: false,
      status: "小有冲破",
      statusClass: "warning",
      text: "关键宫位仅见一处煞忌，不能直接判为破格，但需要用现实事件验证其压力来源。"
    };
  }

  if (supportCount > 0) {
    return {
      broken: false,
      status: "成格有辅",
      statusClass: "formed",
      text: `未见明显煞忌冲破，并有 ${supportCount} 处辅曜或禄权科会入，格局条件较完整。`
    };
  }

  return {
    broken: false,
    status: "成格待辅",
    statusClass: "formed",
    text: "未见明显煞忌冲破，但辅曜条件不算突出，格局更偏内在倾向，需要靠运限和现实选择扶起。"
  };
}

function makePattern({ name, category, basisPalaces, condition, reading, advice, strictNoSha = false, candidate = false }) {
  const breakResult = evaluateBreak(basisPalaces, { strictNoSha });
  const status = candidate ? "候选待验" : breakResult.status;
  const statusClass = candidate ? "candidate" : breakResult.statusClass;

  return {
    name,
    category,
    status,
    statusClass,
    basis: `${condition} 判定依据：${formatEvidence(basisPalaces)}。`,
    reading,
    breaking: candidate ? "当前盘面只满足部分条件，需进一步核对星曜亮度、夹拱关系或完整排盘参数，暂不作严格成格。" : breakResult.text,
    advice,
    broken: breakResult.broken && !candidate
  };
}

function buildFallback(chart, mingPalace) {
  const triad = getTriadPalaces(chart, mingPalace);
  const breakResult = evaluateBreak(triad);
  return {
    name: "未见严格成格",
    category: "综合格局",
    status: breakResult.broken ? "结构有冲" : "以局部组合为主",
    statusClass: breakResult.broken ? "warning" : "candidate",
    basis: `命宫三方四正未命中当前内置的严格格局条件。参考宫位：${formatEvidence(triad)}。`,
    reading: "此盘更适合按命宫、身宫、三方四正、四化和运限逐层分析，不宜强行套用单一大格。",
    breaking: breakResult.broken ? breakResult.text : "未形成明确大格时，不谈破格；重点看主宫系统是否稳定、四化是否把事件拉到关键宫位。",
    advice: "先记录现实议题，再用官禄、财帛、迁移、福德等宫位验证具体方向。"
  };
}

export function analyzeChartPatterns(chart) {
  if (!chart?.palaces?.length) {
    return {
      summary: "当前命盘宫位数据不足，暂不能定格局。",
      patterns: []
    };
  }

  const patterns = [];
  const mingPalace = findPalace(chart, ["命宫"]) || chart.palaces[0];
  const bodyPalace = chart.palaces.find((palace) => palace.isBodyPalace) || null;
  const careerPalace = findPalace(chart, ["官禄"]);
  const wealthPalace = findPalace(chart, ["财帛"]);
  const migrationPalace = findPalace(chart, ["迁移"]);
  const mingTriad = getTriadPalaces(chart, mingPalace);

  const hasAllInMingTriad = (stars) => stars.every((star) => mingTriad.some((palace) => hasStar(palace, star)));

  if (hasAllInMingTriad(["天机", "太阴", "天同", "天梁"])) {
    patterns.push(
      makePattern({
        name: "机月同梁格",
        category: "文职策划格",
        basisPalaces: mingTriad,
        condition: "命宫三方四正会齐天机、太阴、天同、天梁",
        reading: "主谋划、制度、研究、文职、顾问和服务型专业能力，适合靠方法、流程、资料整合和长期经验累积成事。",
        advice: "成格后仍要防止只想不做，最好把知识沉淀成作品、流程或可验证的服务。"
      })
    );
  }

  const shaPoLangCore = [mingPalace, bodyPalace].filter(Boolean);
  if (shaPoLangCore.some((palace) => hasAnyStar(palace, ["七杀", "破军", "贪狼"]))) {
    patterns.push(
      makePattern({
        name: "杀破狼格",
        category: "开创变动格",
        basisPalaces: [...new Set([...shaPoLangCore, ...mingTriad])],
        condition: "命宫或身宫见七杀、破军、贪狼之一，并以三方四正观察变动系统",
        reading: "主开创、变化、竞争、突破和阶段性重组。盘面不喜拖泥带水，适合在变化场景里建立新秩序。",
        advice: "要把冲劲落到计划和节奏上，避免每逢压力就推翻重来。"
      })
    );
  }

  const ziFuPalace = findPalaceWithStars(chart, ["紫微", "天府"]);
  if (ziFuPalace) {
    patterns.push(
      makePattern({
        name: "紫府同宫格",
        category: "统摄承载格",
        basisPalaces: getTriadPalaces(chart, ziFuPalace),
        condition: "紫微、天府同宫，以所在宫位及其三方四正定格局落点",
        reading: "紫微主统摄，天府主承载与资源库，同宫时重组织、管理、稳定、资源调配与长期责任。",
        advice: "格局要靠制度和资源管理发力，忌只重身份感而不做细节。"
      })
    );
  }

  if (hasStar(mingPalace, "紫微") && mingPalace.branch === "午") {
    patterns.push(
      makePattern({
        name: "极向离明格",
        category: "紫微正照格",
        basisPalaces: mingTriad,
        condition: "紫微坐命午宫，按古法重视不见煞忌冲破",
        reading: "此格重主心骨、名望、领导感和正面担当，适合以清晰规则和公开责任建立影响力。",
        advice: "越是成格越要避免独断，需以团队、流程和可验证成果稳住格局。",
        strictNoSha: true
      })
    );
  }

  if (hasStar(mingPalace, "紫微") && hasStar(mingPalace, "贪狼") && ["卯", "酉"].includes(mingPalace.branch)) {
    patterns.push(
      makePattern({
        name: "极居卯酉格",
        category: "紫贪转化格",
        basisPalaces: mingTriad,
        condition: "紫微、贪狼同坐命宫卯酉位",
        reading: "紫微的统摄与贪狼的欲望、才艺、人际和变化并存，格局成败取决于能否把欲望转成专业经营。",
        advice: "宜把兴趣、社交、表达和资源经营制度化，忌散漫、过度应酬或只求短期刺激。"
      })
    );
  }

  if (careerPalace && wealthPalace && hasStar(careerPalace, "天府") && hasStar(wealthPalace, "天相")) {
    patterns.push(
      makePattern({
        name: "府相朝垣格",
        category: "财官承托格",
        basisPalaces: [mingPalace, careerPalace, wealthPalace, migrationPalace].filter(Boolean),
        condition: "天府在官禄、天相在财帛，与命迁系统形成朝拱",
        reading: "重制度、资源、职位责任和可持续收入，适合在组织、管理、专业服务和资源配置中成事。",
        advice: "格局重点在稳定承接，适合把能力转成流程、岗位权责和长期资产。"
      })
    );
  }

  const sunPalace = chart.palaces.find((palace) => hasStar(palace, "太阳"));
  const moonPalace = chart.palaces.find((palace) => hasStar(palace, "太阴"));
  const sunRecord = findStarRecord(sunPalace, "太阳");
  const moonRecord = findStarRecord(moonPalace, "太阴");
  if (sunPalace && moonPalace && mingTriad.includes(sunPalace) && mingTriad.includes(moonPalace)) {
    patterns.push(
      makePattern({
        name: "日月并明格",
        category: "显隐双照格",
        basisPalaces: mingTriad,
        condition: "命宫三方四正同时会太阳、太阴，并需参考二星庙旺亮度",
        reading: "太阳主公开、行动和担当，太阴主积累、内在和细腻；二者同会时，适合在表达与沉淀、外放与内修之间建立平衡。",
        advice: "若亮度不足或煞忌冲会，要避免外在责任和内在消耗相互拉扯。",
        candidate: !(isBright(sunRecord) && isBright(moonRecord))
      })
    );
  }

  const fireGreedy = findPalaceWithStars(chart, ["贪狼", "火星"]);
  const bellGreedy = findPalaceWithStars(chart, ["贪狼", "铃星"]);
  const greedyPalace = fireGreedy || bellGreedy;
  if (greedyPalace) {
    patterns.push(
      makePattern({
        name: fireGreedy ? "火贪格" : "铃贪格",
        category: "突发进取格",
        basisPalaces: getTriadPalaces(chart, greedyPalace),
        condition: `${fireGreedy ? "火星" : "铃星"}与贪狼同宫，并以三方四正判断爆发力是否可承接`,
        reading: "贪狼主欲望、才艺和资源经营，火铃带来突发、速度和冲击，组合得用时行动力强、机会来得快。",
        advice: "必须重视风险边界和节奏管理，避免因急进、投机或情绪驱动导致破格。"
      })
    );
  }

  const ziPo = hasStar(mingPalace, "紫微") && hasStar(mingPalace, "破军");
  const ziXiang = hasStar(mingPalace, "紫微") && hasStar(mingPalace, "天相");
  const tianFuMing = hasStar(mingPalace, "天府");
  const neighbors = getNeighborPalaces(chart, mingPalace);
  const hasLeftRight = neighbors.some((palace) => hasStar(palace, "左辅")) && neighbors.some((palace) => hasStar(palace, "右弼"));
  const hasChangQu = [mingPalace, migrationPalace].filter(Boolean).some((palace) => hasStar(palace, "文昌")) &&
    [mingPalace, migrationPalace].filter(Boolean).some((palace) => hasStar(palace, "文曲"));
  const neighborAllFour = ["天机", "太阴", "天同", "天梁"].every((star) => neighbors.some((palace) => hasStar(palace, star)));

  if ((ziPo && hasLeftRight) || (ziXiang && hasChangQu) || (tianFuMing && neighborAllFour)) {
    patterns.push(
      makePattern({
        name: "君臣庆会格",
        category: "辅弼拱主格",
        basisPalaces: [...new Set([mingPalace, migrationPalace, ...neighbors].filter(Boolean))],
        condition: "命宫主星得左右、昌曲或机月同梁等臣佐拱辅",
        reading: "主星有臣佐会合时，格局不只靠个人强，而是靠组织、助力、文书、制度与专业协同成事。",
        advice: "适合重视团队、文书、流程和长期信誉；若煞忌冲入，先修制度再谈扩张。"
      })
    );
  }

  if (!patterns.length) patterns.push(buildFallback(chart, mingPalace));

  const brokenCount = patterns.filter((pattern) => pattern.broken).length;
  const formedCount = patterns.filter((pattern) => pattern.statusClass === "formed").length;
  const candidateCount = patterns.filter((pattern) => pattern.statusClass === "candidate").length;

  return {
    summary: `本盘共识别 ${patterns.length} 个格局判断项：${formedCount} 个成格或成格有辅，${candidateCount} 个候选待验，${brokenCount} 个见格有破。定格局以命宫、身宫、三方四正、关键同宫与煞忌冲会为依据。`,
    patterns
  };
}
