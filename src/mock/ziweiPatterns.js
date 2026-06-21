const maleficStars = ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫", "天刑"];
const hardBreakStars = ["擎羊", "陀罗", "地空", "地劫"];
const supportStars = ["左辅", "右弼", "文昌", "文曲", "天魁", "天钺", "禄存", "天马"];
const mutagens = ["禄", "权", "科", "忌"];
const shaPoLang = ["七杀", "破军", "贪狼"];

function starName(star) {
    if (!star) return "";
    if (typeof star === "string") return star;
    const brightness = star.brightness ? `(${star.brightness})` : "";
    const mutagen = star.mutagen ? `·${star.mutagen}` : "";
    return `${star.name || ""}${brightness}${mutagen}`;
}

function allStars(palace) {
    return [...(palace?.majorStars || []), ...(palace?.minorStars || []), ...(palace?.adjectiveStars || [])].filter(Boolean);
}

function starText(palace) {
    return allStars(palace).map(starName).filter(Boolean).join("、");
}

function hasStar(palace, star) {
    if (!palace) return false;
    if (typeof palace.has === "function") return palace.has([star]);
    return allStars(palace).some((item) => starName(item).includes(star));
}

function hasOneOf(palace, stars) {
    if (!palace) return false;
    if (typeof palace.hasOneOf === "function") return palace.hasOneOf(stars);
    return stars.some((star) => hasStar(palace, star));
}

function hasAll(palace, stars) {
    return stars.every((star) => hasStar(palace, star));
}

function palaceLabel(palace) {
    if (!palace) return "未取到宫位";
    const branch = palace.earthlyBranch || palace.branch;
    return `${palace.name}${branch ? `(${branch})` : ""}`;
}

function palaceEvidence(palace) {
    return `${palaceLabel(palace)}见${starText(palace) || "未见主要星曜"}`;
}

function formatEvidence(palaces = []) {
    return palaces.filter(Boolean).map(palaceEvidence).join("；") || "未取得有效宫位依据";
}

function uniquePalaces(palaces = []) {
    const seen = new Set();
    return palaces.filter((palace) => {
        const key = `${palace?.name || ""}-${palace?.earthlyBranch || palace?.branch || ""}`;
        if (!palace || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function getRawPalace(astrolabe, palaceName) {
    try {
        return astrolabe?.palace?.(palaceName);
    } catch {
        return null;
    }
}

function getBodyPalace(astrolabe) {
    return astrolabe?.palaces?.find((palace) => palace.isBodyPalace) || null;
}

function getSurround(astrolabe, indexOrName) {
    try {
        return astrolabe?.surroundedPalaces?.(indexOrName);
    } catch {
        return null;
    }
}

function getPalaceSurround(astrolabe, palace) {
    if (!palace) return null;
    return getSurround(astrolabe, palace.index ?? palace.name);
}

function surroundList(surround) {
    return uniquePalaces([surround?.target, surround?.career, surround?.wealth, surround?.opposite]);
}

function countStars(palaces, stars) {
    return palaces.reduce((total, palace) => total + allStars(palace).filter((star) => stars.some((item) => starName(star).includes(item))).length, 0);
}

function hasMutagen(palace, mutagen) {
    if (!palace) return false;
    if (typeof palace.hasMutagen === "function") return palace.hasMutagen(mutagen);
    return allStars(palace).some((star) => starName(star).includes(mutagen));
}

function surroundHasMutagen(surround, mutagen) {
    if (!surround) return false;
    if (typeof surround.haveMutagen === "function") return surround.haveMutagen(mutagen);
    return surroundList(surround).some((palace) => hasMutagen(palace, mutagen));
}

function surroundHave(surround, stars) {
    if (!surround) return false;
    if (typeof surround.have === "function") return surround.have(stars);
    const palaces = surroundList(surround);
    return stars.every((star) => palaces.some((palace) => hasStar(palace, star)));
}

function surroundHaveOneOf(surround, stars) {
    if (!surround) return false;
    if (typeof surround.haveOneOf === "function") return surround.haveOneOf(stars);
    return surroundList(surround).some((palace) => hasOneOf(palace, stars));
}

function findPalaceWithStars(astrolabe, stars) {
    return astrolabe?.palaces?.find((palace) => stars.every((star) => hasStar(palace, star))) || null;
}

function findStarPalace(astrolabe, star) {
    return astrolabe?.palaces?.find((palace) => hasStar(palace, star)) || null;
}

function findStarRecord(palace, star) {
    return allStars(palace).find((item) => starName(item).includes(star)) || null;
}

function isBright(star) {
    return /庙|旺/.test(starName(star));
}

function oppositePalace(surround) {
    return surround?.opposite || null;
}

function neighborPalaces(astrolabe, palace) {
    if (!astrolabe?.palaces?.length || !palace) return [];
    const index = palace.index ?? astrolabe.palaces.findIndex((item) => item.name === palace.name);
    if (index < 0) return [];
    const total = astrolabe.palaces.length;
    return [astrolabe.palaces[(index - 1 + total) % total], astrolabe.palaces[(index + 1) % total]].filter(Boolean);
}

function evaluateStrictBreak(surround, options = {}) {
    const palaces = surroundList(surround);
    const shaCount = countStars(palaces, maleficStars);
    const hardBreakCount = countStars(palaces, hardBreakStars);
    const supportCount = countStars(palaces, supportStars);
    const hasJi = surroundHasMutagen(surround, "忌");
    const allowFireBell = Boolean(options.allowFireBell);
    const adjustedShaCount = allowFireBell ? hardBreakCount : shaCount;
    const requiresNoMalefic = options.requiresNoMalefic !== false;
    const broken = requiresNoMalefic && (adjustedShaCount > 0 || hasJi);

    if (broken) {
        return {
            broken: true,
            status: "见格有破",
            statusClass: "broken",
            text: `严格按三方四正验格：关键宫位见 ${adjustedShaCount} 处煞曜${hasJi ? "，且见化忌" : ""}。此类情况不按完整美格论，须视为格局减力、转性或先破后成。`
        };
    }

    if (supportCount > 0) {
        return {
            broken: false,
            status: "严格成格",
            statusClass: "formed",
            text: `三方四正未见煞忌冲破，并得 ${supportCount} 处辅曜会入，格局条件相对完整。`
        };
    }

    return {
        broken: false,
        status: "成格待辅",
        statusClass: "warning",
        text: "三方四正未见煞忌冲破，但辅弼昌曲魁钺等助力不突出；可按成格方向观察，但不宜放大为高等级格局。"
    };
}

function makePattern({ name, category, surround, basisPalaces, condition, reading, advice, candidate = false, candidateReason = "", requiresNoMalefic = true, allowFireBell = false }) {
    const palaces = basisPalaces || surroundList(surround);
    const breakResult = evaluateStrictBreak(surround, { requiresNoMalefic, allowFireBell });
    const status = candidate ? "候选待验" : breakResult.status;
    const statusClass = candidate ? "candidate" : breakResult.statusClass;

    return {
        name,
        category,
        status,
        statusClass,
        basis: `${condition}。判定依据：${formatEvidence(palaces)}。`,
        reading,
        breaking: candidate ? candidateReason || "当前只满足部分严格条件，暂列候选；需核对星曜庙旺、夹拱或煞忌条件后再定格。" : breakResult.text,
        advice,
        broken: !candidate && breakResult.broken
    };
}

function makeNoPattern(astrolabe) {
    const mingSurround = getSurround(astrolabe, "命宫");
    return {
        name: "未见严格大格",
        category: "严格验格结果",
        status: "转入结构分析",
        statusClass: "candidate",
        basis: `按命宫三方四正检视，未命中当前规则库中的严格大格。参考依据：${formatEvidence(surroundList(mingSurround))}。`,
        reading: "未命中大格不代表命盘弱，而是说明盘面更适合按主星结构、四化、运限和现实议题逐层分析。",
        breaking: "未成格时不谈破格。破格只针对已经满足成格条件的组合，再看煞忌冲破、空劫耗散或条件不全。",
        advice: "先以现实问题取主宫，再看命迁、财官、福德、夫妻等系统是否被四化和运限触发。"
    };
}

function makeStructurePattern(astrolabe, mingSurround) {
    const palaces = surroundList(mingSurround);
    const majorStars = ["紫微", "天府", "天相", "太阳", "太阴", "天机", "天同", "天梁", "武曲", "廉贞", "巨门", "七杀", "破军", "贪狼"];
    const activeStars = majorStars.filter((star) => palaces.some((palace) => hasStar(palace, star)));
    const shaCount = countStars(palaces, maleficStars);

    return {
        name: "命宫三方主星结构",
        category: "基础结构",
        status: "结构参考",
        statusClass: shaCount ? "warning" : "candidate",
        basis: `命宫三方四正主星组合：${activeStars.join("、") || "未见主星集中"}。参考依据：${formatEvidence(palaces)}。`,
        reading: "这不是传统定格名称，而是当未命中大格时，用来说明命宫系统的主星倾向，避免“没有格局就没有分析”。",
        breaking: shaCount ? `命宫三方见 ${shaCount} 处煞曜，分析时要优先看压力、切割、延迟和风险边界。` : "未见明显煞曜集中，可优先按主星气质和四化触发展开。",
        advice: "继续结合命宫、身宫、大限和流年，把主星倾向落到具体问题。"
    };
}

const majorStarProfiles = {
    紫微: {
        core: "统摄、定方向、整合资源",
        risk: "容易重姿态而轻执行",
        advice: "把权责、流程和团队边界落清楚。"
    },
    天机: {
        core: "谋略、变化、信息处理",
        risk: "容易多虑、反复修正",
        advice: "用阶段目标和复盘节奏承接变化。"
    },
    太阳: {
        core: "公开表达、担当、外放行动",
        risk: "容易过度消耗或只顾外部评价",
        advice: "把影响力转成职责、作品和可交付成果。"
    },
    武曲: {
        core: "执行、财务、效率和资源控制",
        risk: "容易刚硬、急于结果",
        advice: "用预算、标准和纪律推进事务。"
    },
    天同: {
        core: "福气、协调、舒适和包容",
        risk: "容易拖延、避开冲突",
        advice: "在稳定节奏中保持必要的推进力。"
    },
    廉贞: {
        core: "规则、边界、欲望约束和制度感",
        risk: "容易陷入纠缠、控制或违规风险",
        advice: "先守住规则边界，再谈变化和经营。"
    },
    天府: {
        core: "承载、府库、资源沉淀",
        risk: "容易保守、重储备轻开拓",
        advice: "把资源盘活，形成长期可复用资产。"
    },
    太阴: {
        core: "积累、审美、财务感和内在稳定",
        risk: "容易迟疑、内耗或过度防守",
        advice: "经营长期资产、专业沉淀和稳定节律。"
    },
    贪狼: {
        core: "欲望、才艺、人际和经营拓展",
        risk: "容易分散、应酬过度或短期刺激",
        advice: "把兴趣、人脉和欲望转成可持续经营模型。"
    },
    巨门: {
        core: "辨析、口才、议论和信息拆解",
        risk: "容易口舌、怀疑和沟通消耗",
        advice: "用证据、结构化表达和记录降低误解。"
    },
    天相: {
        core: "辅佐、协调、制度平衡",
        risk: "容易顾虑太多、替他人承担过量",
        advice: "明确角色、授权和协作边界。"
    },
    天梁: {
        core: "原则、护持、长辈规则和风险修复",
        risk: "容易说教、保守或道德压力过重",
        advice: "把原则转成制度、方法和实际保护。"
    },
    七杀: {
        core: "攻坚、决断、竞争和突破",
        risk: "容易孤军、强压或冒险",
        advice: "用清晰边界、风控和阶段目标承接冲劲。"
    },
    破军: {
        core: "破旧、重组、转型和更新",
        risk: "容易先破后乱、成本失控",
        advice: "先定义要破什么、立什么，再安排资源。"
    }
};

const majorStarNames = Object.keys(majorStarProfiles);

const starPairProfiles = [
    {
        stars: ["天机", "太阴"],
        name: "机月同宫结构",
        category: "谋略积累结构",
        reading: "天机的谋略变化与太阴的积累细腻同宫，重研究、规划、审美、财务感和幕后组织力。",
        advice: "宜把想法沉淀为文档、模型和长期资产；忌想得太细却迟迟不落地。"
    },
    {
        stars: ["天同", "天梁"],
        name: "同梁同宫结构",
        category: "福荫护持结构",
        reading: "天同的和缓福气与天梁的原则护持同宫，重照顾、修复、制度保护和长辈/规则资源。",
        advice: "宜在服务、咨询、教育、照护和制度修复中发挥；忌只求安稳而回避责任。"
    },
    {
        stars: ["太阳", "太阴"],
        name: "日月同宫结构",
        category: "显隐并照结构",
        reading: "太阳主外显担当，太阴主内在积累；同宫时要同时看公开责任与长期沉淀是否平衡。",
        advice: "宜一边建立外部成果，一边经营财务、审美和内在节律。"
    },
    {
        stars: ["太阳", "天梁"],
        name: "阳梁同宫结构",
        category: "名望规则结构",
        reading: "太阳的公开性与天梁的原则护持同宫，重名望、资质、制度、长辈规则和公共责任。",
        advice: "宜走专业信誉、公开表达、证照资质和制度内影响力。"
    },
    {
        stars: ["武曲", "天府"],
        name: "武府同宫结构",
        category: "财库执行结构",
        reading: "武曲主执行与财务，天府主府库承载；同宫时适合资源管理、预算控制和长期资产经营。",
        advice: "宜把收入、成本、库存和资源配置制度化；忌只储备不周转。"
    },
    {
        stars: ["武曲", "天相"],
        name: "武相同宫结构",
        category: "执行协同结构",
        reading: "武曲的执行效率与天相的协调制度同宫，重项目推进、组织协同和权责平衡。",
        advice: "宜用流程、预算和协作机制推进；忌刚性执行压过沟通。"
    },
    {
        stars: ["廉贞", "天府"],
        name: "廉府同宫结构",
        category: "规则资源结构",
        reading: "廉贞的边界规则与天府的资源承载同宫，重制度资产、合规经营和资源守成。",
        advice: "宜先把规则、合同和财务边界立清楚，再谈扩张。"
    },
    {
        stars: ["廉贞", "天相"],
        name: "廉相同宫结构",
        category: "制度协调结构",
        reading: "廉贞主规则边界，天相主辅佐协调；同宫时强调组织秩序、公信力和关系中的分寸。",
        advice: "宜用公开规则和流程处理关系；忌暧昧边界或私下消耗。"
    }
];

function pairKey(stars) {
    return stars.slice().sort().join("|");
}

const starPairProfileMap = new Map(starPairProfiles.map((profile) => [pairKey(profile.stars), profile]));

function mainStarsInPalace(palace) {
    return majorStarNames.filter((star) => hasStar(palace, star));
}

function samePalace(left, right) {
    if (!left || !right) return false;
    return `${left.name}-${left.earthlyBranch || left.branch || ""}` === `${right.name}-${right.earthlyBranch || right.branch || ""}`;
}

function starPairs(stars) {
    const pairs = [];
    stars.forEach((star, index) => {
        stars.slice(index + 1).forEach((nextStar) => pairs.push([star, nextStar]));
    });
    return pairs;
}

function evaluateStructure(surround, options = {}) {
    const palaces = surroundList(surround);
    const shaCount = countStars(palaces, options.allowFireBell ? hardBreakStars : maleficStars);
    const supportCount = countStars(palaces, supportStars);
    const hasJi = surroundHasMutagen(surround, "忌");

    if (shaCount || hasJi) {
        return {
            status: "结构受扰",
            statusClass: "warning",
            text: `结构层面见 ${shaCount} 处煞曜${hasJi ? "，并见化忌" : ""}。这不直接等同传统破格，但说明该结构落地时会有压力、反复、消耗或条件交换。`
        };
    }

    if (supportCount) {
        return {
            status: "结构成局",
            statusClass: "formed",
            text: `三方四正见 ${supportCount} 处辅曜助力，结构承接条件较清楚，可作为本盘重点观察方向。`
        };
    }

    return {
        status: "结构待辅",
        statusClass: "candidate",
        text: "未见明显煞忌冲扰，但辅弼昌曲魁钺禄马等助力也不突出；宜作为盘面倾向观察，不宜直接拔高为传统美格。"
    };
}

function makeDynamicStructurePattern({ name, category, surround, basisPalaces, condition, reading, advice, allowFireBell = false }) {
    const structure = evaluateStructure(surround, { allowFireBell });
    const palaces = basisPalaces || surroundList(surround);

    return {
        name,
        category,
        status: structure.status,
        statusClass: structure.statusClass,
        basis: `${condition}。判定依据：${formatEvidence(palaces)}。`,
        reading,
        breaking: structure.text,
        advice,
        broken: false
    };
}

function makePairStructurePattern(astrolabe, palace, pair) {
    const profile = starPairProfileMap.get(pairKey(pair));
    const first = majorStarProfiles[pair[0]];
    const second = majorStarProfiles[pair[1]];
    const name = profile?.name || `${pair.join("、")}同宫结构`;
    const category = profile?.category || "主星组合结构";
    const reading =
        profile?.reading ||
        `${pair.join("、")}同宫，形成「${first.core}」与「${second.core}」的复合结构。它不是强行套用传统格名，而是用来补足未收录组合的盘面解读。`;
    const advice = profile?.advice || `宜同时处理「${first.advice}」与「${second.advice}」；风险点在于${first.risk}、${second.risk}。`;

    return makeDynamicStructurePattern({
        name,
        category,
        surround: getPalaceSurround(astrolabe, palace),
        basisPalaces: [palace],
        condition: `${palaceLabel(palace)}见${pair.join("、")}同宫`,
        reading,
        advice
    });
}

function makeSingleStarStructurePattern(astrolabe, palace, roleName) {
    const star = mainStarsInPalace(palace)[0];
    if (!star) return null;
    const profile = majorStarProfiles[star];

    return makeDynamicStructurePattern({
        name: `${roleName}${star}坐守结构`,
        category: roleName === "身宫" ? "后天行动结构" : "主星坐守结构",
        surround: getPalaceSurround(astrolabe, palace),
        basisPalaces: [palace],
        condition: `${roleName}以${star}为主星坐守`,
        reading: `${star}在${roleName}主「${profile.core}」。这是主星结构判断，用来补足未形成传统大格时的核心性格、行动或事件倾向。`,
        advice: `${profile.advice} 需要留意：${profile.risk}。`
    });
}

function matchedStarsInSurround(surround, stars) {
    const palaces = surroundList(surround);
    return stars.filter((star) => palaces.some((palace) => hasStar(palace, star)));
}

function buildSurroundStructurePatterns(roleName, surround) {
    if (!surround) return [];
    const palaces = surroundList(surround);
    const patterns = [];
    const matchedMutagens = mutagens.filter((mutagen) => surroundHasMutagen(surround, mutagen));
    const supportMatched = matchedStarsInSurround(surround, supportStars);
    const maleficMatched = matchedStarsInSurround(surround, maleficStars);
    const emptyMatched = matchedStarsInSurround(surround, ["地空", "地劫"]);
    const literaryMatched = matchedStarsInSurround(surround, ["文昌", "文曲"]);
    const nobleMatched = matchedStarsInSurround(surround, ["左辅", "右弼", "天魁", "天钺"]);

    if (matchedMutagens.length) {
        patterns.push(
            makeDynamicStructurePattern({
                name: `${roleName}四化触发结构`,
                category: "四化结构",
                surround,
                basisPalaces: palaces,
                condition: `${roleName}三方四正见${matchedMutagens.map((item) => `化${item}`).join("、")}`,
                reading: "四化是事件触发层：禄看资源入口，权看责任与主导，科看名声修饰，忌看卡点与牵挂。此项用于把格局落到真实事件。",
                advice: "先判断哪一化落入命迁财官，再看大限、流年、流月是否再次触发同一宫位。"
            })
        );
    }

    if (supportMatched.length) {
        patterns.push(
            makeDynamicStructurePattern({
                name: `${roleName}辅曜承接结构`,
                category: "助力结构",
                surround,
                basisPalaces: palaces,
                condition: `${roleName}三方四正见${supportMatched.join("、")}`,
                reading: "辅曜表示助力、文书、贵人、平台、流动资源和可被承接的外部条件。它决定格局是否容易落地。",
                advice: "把助力具体化为团队、证照、文档、渠道或资源清单，不要只笼统理解为贵人。"
            })
        );
    }

    if (maleficMatched.length) {
        patterns.push(
            makeDynamicStructurePattern({
                name: `${roleName}煞曜压力结构`,
                category: "压力结构",
                surround,
                basisPalaces: palaces,
                condition: `${roleName}三方四正见${maleficMatched.join("、")}`,
                reading: "煞曜不只代表凶，也代表速度、切割、竞争、压力和必须付出的成本。严谨解读时要看它是成事压力还是破坏来源。",
                advice: "把风险边界、时间缓冲、成本上限和冲突预案先做出来，再推进对应宫位的事项。",
                allowFireBell: true
            })
        );
    }

    if (emptyMatched.length) {
        patterns.push(
            makeDynamicStructurePattern({
                name: `${roleName}空劫耗散结构`,
                category: "虚实转换结构",
                surround,
                basisPalaces: palaces,
                condition: `${roleName}三方四正见${emptyMatched.join("、")}`,
                reading: "空劫重虚实转换、落空、抽象、断裂和减法。得用时利研究、创意、精神性和系统重构；失衡时易资源耗散。",
                advice: "重要事务保留现金流、备选方案和验证节点，避免把全部资源押在单点。"
            })
        );
    }

    if (literaryMatched.length === 1) {
        patterns.push(
            makeDynamicStructurePattern({
                name: `${roleName}文曜单照结构`,
                category: "文书表达结构",
                surround,
                basisPalaces: palaces,
                condition: `${roleName}三方四正见${literaryMatched.join("、")}`,
                reading: "文昌、文曲未必总是成对出现；单曜会照也能提示文书、学习、审美、表达或资料整理能力。",
                advice: "把表达能力落实为笔记、作品、流程文档和可复用材料。"
            })
        );
    }

    if (nobleMatched.length === 1) {
        patterns.push(
            makeDynamicStructurePattern({
                name: `${roleName}单辅贵人结构`,
                category: "协作资源结构",
                surround,
                basisPalaces: palaces,
                condition: `${roleName}三方四正见${nobleMatched.join("、")}`,
                reading: "左辅、右弼、天魁、天钺单曜入局时，助力不一定成双成对，但仍提示可借组织、前辈、平台或协作者。",
                advice: "先找明确的协作对象、正式渠道和可验证资源，不要把它理解成无条件好运。"
            })
        );
    }

    return patterns;
}

function uniquePatternList(patterns) {
    const seen = new Set();
    return patterns.filter((pattern) => {
        const key = `${pattern.name}-${pattern.basis}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function buildDerivedStructurePatterns(ctx) {
    const { astrolabe, ming, body, mingSurround, bodySurround } = ctx;
    const patterns = [];

    astrolabe.palaces.forEach((palace) => {
        const stars = mainStarsInPalace(palace);
        if (stars.length >= 2) {
            starPairs(stars).forEach((pair) => patterns.push(makePairStructurePattern(astrolabe, palace, pair)));
        }
    });

    if (ming && mainStarsInPalace(ming).length === 1) {
        patterns.push(makeSingleStarStructurePattern(astrolabe, ming, "命宫"));
    }

    if (body && !samePalace(body, ming) && mainStarsInPalace(body).length === 1) {
        patterns.push(makeSingleStarStructurePattern(astrolabe, body, "身宫"));
    }

    patterns.push(...buildSurroundStructurePatterns("命宫", mingSurround));

    if (bodySurround && body && !samePalace(body, ming)) {
        patterns.push(...buildSurroundStructurePatterns("身宫", bodySurround));
    }

    return uniquePatternList(patterns.filter(Boolean));
}

const namedPatternRules = [
    {
        name: "机月同梁格",
        category: "文职策划格",
        match: ({ mingSurround }) => surroundHave(mingSurround, ["天机", "太阴", "天同", "天梁"]) && { surround: mingSurround },
        condition: "命宫三方四正会齐天机、太阴、天同、天梁",
        reading: "主谋略、文书、研究、制度、顾问与专业服务。成格完整时，适合靠知识结构、流程设计和长期经验积累成事。",
        advice: "宜沉淀方法论、文档和可复用流程；忌只停留在思考和计划。"
    },
    {
        name: "杀破狼格",
        category: "开创变动格",
        match: ({ ming, mingSurround }) => hasOneOf(ming, shaPoLang) && surroundHave(mingSurround, shaPoLang) && { surround: mingSurround },
        condition: "命宫坐七杀、破军、贪狼之一，且命宫三方四正会齐杀破狼体系",
        reading: "主开创、竞争、变动、突破与重组。格局得用时，适合在不稳定场景中打开局面。",
        advice: "必须把变动欲望落到节奏、边界和风险控制上；见煞忌时尤其要防急进。",
        requiresNoMalefic: false
    },
    {
        name: "身宫杀破狼",
        category: "后天行动格",
        match: ({ body, bodySurround }) => body && hasOneOf(body, shaPoLang) && surroundHave(bodySurround, shaPoLang) && { surround: bodySurround },
        condition: "身宫坐七杀、破军、贪狼之一，且身宫三方四正会齐杀破狼体系",
        reading: "后天行动模式偏开创和变化，人生推进常靠环境转换、角色重组或压力突破。",
        advice: "宜主动设计阶段目标，不宜让变化完全由外界推动。",
        requiresNoMalefic: false
    },
    {
        name: "紫府同宫格",
        category: "统摄承载格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["紫微", "天府"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "紫微、天府同宫，并以该宫三方四正验格",
        reading: "紫微主统摄，天府主府库承载。同宫时重组织、制度、资源调配和长期责任。",
        advice: "宜用制度、团队和资源管理成事；忌只重身份感而忽略执行细节。"
    },
    {
        name: "紫府朝垣格",
        category: "统摄承载格",
        match: ({ mingSurround }) => surroundHave(mingSurround, ["紫微", "天府"]) && { surround: mingSurround },
        condition: "命宫三方四正会紫微、天府",
        reading: "紫微给统摄力，天府给承载和资源库。格局成时，重管理、组织、资源配置和稳定经营。",
        advice: "宜把个人能力放入制度和长期资源盘中，不宜只靠个人声望。"
    },
    {
        name: "府相朝垣格",
        category: "财官承托格",
        match: ({ mingSurround }) => surroundHave(mingSurround, ["天府", "天相"]) && { surround: mingSurround },
        condition: "命宫三方四正会天府、天相",
        reading: "重制度、资源、职位责任与稳定承接，适合在组织、管理、专业服务和资源配置中成事。",
        advice: "宜把能力转为流程、权责和长期资产；破格时先修制度和现金流。"
    },
    {
        name: "日月并明格",
        category: "显隐双照格",
        match: ({ astrolabe, mingSurround }) => {
            const sunPalace = findStarPalace(astrolabe, "太阳");
            const moonPalace = findStarPalace(astrolabe, "太阴");
            if (!sunPalace || !moonPalace || !surroundHave(mingSurround, ["太阳", "太阴"])) return false;
            const candidate = !(isBright(findStarRecord(sunPalace, "太阳")) && isBright(findStarRecord(moonPalace, "太阴")));
            return {
                surround: mingSurround,
                candidate,
                candidateReason: "太阳、太阴虽会入命宫三方四正，但未同时确认庙旺亮度，按严格法暂列候选。"
            };
        },
        condition: "命宫三方四正会太阳、太阴，并核对二星庙旺亮度",
        reading: "太阳主公开行动，太阴主积累内修。二者明亮会照时，利于外显责任与内在沉淀并行。",
        advice: "若亮度不足或见煞忌，不宜直接作完整美格，应回到具体宫位和现实事件验证。"
    },
    {
        name: "日照雷门格",
        category: "太阳明照格",
        match: ({ ming, mingSurround }) => hasStar(ming, "太阳") && ming?.earthlyBranch === "卯" && { surround: mingSurround, basisPalaces: [ming] },
        condition: "太阳坐命卯宫，并以命宫三方四正验格",
        reading: "太阳在卯为日出之象，重公开表达、担当、行动力和被看见的责任。",
        advice: "宜把影响力落到作品、职责和公开成果；忌虚名大于实际承接。"
    },
    {
        name: "月朗天门格",
        category: "太阴明照格",
        match: ({ ming, mingSurround }) => hasStar(ming, "太阴") && ming?.earthlyBranch === "亥" && { surround: mingSurround, basisPalaces: [ming] },
        condition: "太阴坐命亥宫，并以命宫三方四正验格",
        reading: "太阴在亥重积累、审美、财务感、细腻感和内在稳定。",
        advice: "宜经营长期资产、专业沉淀和稳定节律；忌过度内耗或迟疑。"
    },
    {
        name: "巨日同宫格",
        category: "表达传播格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["太阳", "巨门"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "太阳、巨门同宫，并以该宫三方四正验格",
        reading: "太阳的公开性与巨门的辨析、口才、议论同宫，利表达、传播、咨询、辩证和研究。",
        advice: "宜把观点转成清晰产品或内容；见煞忌时注意口舌、人际误解和信息压力。"
    },
    {
        name: "阳梁昌禄格",
        category: "名望文贵格",
        match: ({ mingSurround }) => surroundHave(mingSurround, ["太阳", "天梁", "文昌", "禄存"]) && { surround: mingSurround },
        condition: "命宫三方四正会太阳、天梁、文昌、禄存",
        reading: "重名望、文书、制度、长辈/规则助力和可被认可的专业资格。",
        advice: "宜走专业信誉、证照资质、公开表达和制度内影响力；忌急功近利。"
    },
    {
        name: "机梁同宫格",
        category: "谋略护持格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["天机", "天梁"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "天机、天梁同宫",
        reading: "天机主谋划，天梁主原则和护持。组合重策略、制度、顾问、修复和风险预判。",
        advice: "宜做长期规划、制度设计、咨询研究；忌想太多而行动不足。"
    },
    {
        name: "机巨同宫格",
        category: "思辨表达格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["天机", "巨门"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "天机、巨门同宫",
        reading: "重思考、推理、信息分析、语言表达和问题拆解。",
        advice: "宜把复杂问题结构化；见煞忌时注意过度怀疑、口舌和沟通成本。"
    },
    {
        name: "同阴同宫格",
        category: "温润积累格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["天同", "太阴"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "天同、太阴同宫",
        reading: "天同重安适与福气，太阴重积累与细腻。组合偏温和、审美、照顾、财务与生活品质。",
        advice: "宜经营稳定资产和长期关系；忌安逸拖延。"
    },
    {
        name: "天同巨门格",
        category: "内外拉扯格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["天同", "巨门"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "天同、巨门同宫",
        reading: "天同求和，巨门辨析，组合常见内在安适与外在争辩并存。",
        advice: "宜把情绪和表达分开处理，避免因沟通消耗削弱福气。"
    },
    {
        name: "紫微天相格",
        category: "辅政管理格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["紫微", "天相"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "紫微、天相同宫",
        reading: "紫微主统摄，天相主辅佐与制度协调。组合重管理、平衡、组织和公共规则。",
        advice: "宜以流程、公信力和协作成事；忌只讲姿态不落细节。"
    },
    {
        name: "紫微七杀格",
        category: "权威开创格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["紫微", "七杀"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "紫微、七杀同宫",
        reading: "紫微的统摄与七杀的决断同宫，利开局、改革、承担压力和建立新秩序。",
        advice: "宜有明确边界和制度约束；见煞忌时防强压、孤军和决策过急。",
        requiresNoMalefic: false
    },
    {
        name: "紫微破军格",
        category: "破旧立新格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["紫微", "破军"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "紫微、破军同宫",
        reading: "主改制、转型、推翻旧结构后重建新秩序。",
        advice: "宜先定义要破什么、立什么；见煞忌时防破坏大于建设。",
        requiresNoMalefic: false
    },
    {
        name: "极居卯酉格",
        category: "紫贪转化格",
        match: ({ ming, mingSurround }) =>
            hasStar(ming, "紫微") && hasStar(ming, "贪狼") && ["卯", "酉"].includes(ming?.earthlyBranch) && { surround: mingSurround, basisPalaces: [ming] },
        condition: "紫微、贪狼同坐命宫卯酉位",
        reading: "紫微的统摄与贪狼的欲望、才艺、人际和经营并存，成败关键在于能否把欲望转为专业经营。",
        advice: "宜制度化经营兴趣、表达和资源；忌过度应酬、散漫或短期刺激。"
    },
    {
        name: "武曲七杀格",
        category: "执行攻坚格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["武曲", "七杀"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "武曲、七杀同宫",
        reading: "武曲重执行和资源，七杀重攻坚和决断。组合适合高压任务、执行管理、技术攻关和竞争场景。",
        advice: "宜用目标、预算和纪律承接压力；见煞忌时防刚硬、孤立和风险过高。",
        requiresNoMalefic: false
    },
    {
        name: "武曲破军格",
        category: "资源重组格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["武曲", "破军"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "武曲、破军同宫",
        reading: "主资源拆解、成本重排、旧资产转新模式。",
        advice: "宜用数据和预算管理转型；见煞忌时防财务波动和过度冒险。",
        requiresNoMalefic: false
    },
    {
        name: "武贪同行格",
        category: "经营变现格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["武曲", "贪狼"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "武曲、贪狼同宫",
        reading: "武曲主财务执行，贪狼主经营欲望与资源拓展，适合商业、产品、技能变现和资源经营。",
        advice: "宜把欲望转为定价、交付和复购模型；忌短期投机。"
    },
    {
        name: "廉贞七杀格",
        category: "规则攻坚格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["廉贞", "七杀"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "廉贞、七杀同宫",
        reading: "廉贞重规则、边界和欲望约束，七杀重决断与压力突破。",
        advice: "宜在有纪律和边界的体系内攻坚；见煞忌时防冲突和违规风险。",
        requiresNoMalefic: false
    },
    {
        name: "廉贞破军格",
        category: "制度变革格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["廉贞", "破军"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "廉贞、破军同宫",
        reading: "主制度、边界、欲望和旧结构的强烈重组。",
        advice: "宜先守底线再谈改变；见煞忌时防关系、规则或财务上的破耗。",
        requiresNoMalefic: false
    },
    {
        name: "廉贞贪狼格",
        category: "欲望经营格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["廉贞", "贪狼"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "廉贞、贪狼同宫",
        reading: "主欲望、才艺、人际、规则和资源经营并行。",
        advice: "宜把人际、兴趣和商业化放进规则框架；忌过度消耗或边界不清。"
    },
    {
        name: "火贪格",
        category: "突发进取格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["贪狼", "火星"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "火星与贪狼同宫，再验该宫三方四正是否可承接",
        reading: "贪狼主欲望、才艺和资源经营，火星带来速度与爆发。得用时行动力强，机会来得快。",
        advice: "尤其要重视风险边界；见煞忌时容易由爆发力转为冲动、投机或反复。",
        allowFireBell: true
    },
    {
        name: "铃贪格",
        category: "突发进取格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["贪狼", "铃星"]);
            return palace && { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
        },
        condition: "铃星与贪狼同宫，再验该宫三方四正是否可承接",
        reading: "贪狼主资源经营，铃星带来突然性和敏感反应。得用时适合捕捉变化机会。",
        advice: "宜建立风险阈值和复盘机制；防情绪化决策。",
        allowFireBell: true
    },
    {
        name: "禄马交驰格",
        category: "流动资源格",
        match: ({ astrolabe }) => {
            const palace = findPalaceWithStars(astrolabe, ["禄存", "天马"]);
            if (palace) return { surround: getPalaceSurround(astrolabe, palace), basisPalaces: [palace] };
            const mingSurround = getSurround(astrolabe, "命宫");
            return surroundHave(mingSurround, ["禄存", "天马"]) && { surround: mingSurround };
        },
        condition: "禄存、天马会入同一宫位或命宫三方四正",
        reading: "主资源随流动而来，常见外出、迁移、平台转换、跨区域机会与行动带财。",
        advice: "宜主动连接外部平台和移动场景；忌守在原地等资源。"
    },
    {
        name: "三奇嘉会格",
        category: "四化会照格",
        match: ({ mingSurround }) => mutagens.slice(0, 3).every((mutagen) => surroundHasMutagen(mingSurround, mutagen)) && { surround: mingSurround },
        condition: "命宫三方四正同时会化禄、化权、化科",
        reading: "禄主资源，权主主导，科主名声与修饰。三者会照时，事件推进、可见度和资源承接较完整。",
        advice: "宜把机会、责任和表达同时落地；见化忌或煞曜时要看哪一环拖累整体。"
    },
    {
        name: "权禄巡逢格",
        category: "四化会照格",
        match: ({ mingSurround }) => surroundHasMutagen(mingSurround, "禄") && surroundHasMutagen(mingSurround, "权") && { surround: mingSurround },
        condition: "命宫三方四正会化禄、化权",
        reading: "资源与主导同会，常见机会带责任、收益带压力、资源需要主动经营。",
        advice: "宜明确权责和分配规则；见忌时防资源入口变成负担。"
    },
    {
        name: "科名会照格",
        category: "文名声誉格",
        match: ({ mingSurround }) => surroundHasMutagen(mingSurround, "科") && surroundHaveOneOf(mingSurround, ["文昌", "文曲", "天魁", "天钺"]) && { surround: mingSurround },
        condition: "命宫三方四正见化科，并会文昌、文曲、魁钺之一",
        reading: "主文书、名声、修饰、证照、发表和被认可的专业形象。",
        advice: "宜重视表达质量、材料留痕和专业资质；忌包装大于实质。"
    },
    {
        name: "辅弼拱主格",
        category: "助力协同格",
        match: ({ mingSurround }) => surroundHave(mingSurround, ["左辅", "右弼"]) && { surround: mingSurround },
        condition: "命宫三方四正会左辅、右弼",
        reading: "左右会照主助力、团队、协作和贵人条件。",
        advice: "宜借组织和伙伴成事；忌孤军作战。"
    },
    {
        name: "昌曲会照格",
        category: "文艺表达格",
        match: ({ mingSurround }) => surroundHave(mingSurround, ["文昌", "文曲"]) && { surround: mingSurround },
        condition: "命宫三方四正会文昌、文曲",
        reading: "主文书、审美、表达、学习、创作和信息整理能力。",
        advice: "宜把表达能力转成内容、文档、作品或专业材料。"
    },
    {
        name: "魁钺夹辅格",
        category: "贵人提携格",
        match: ({ mingSurround }) => surroundHave(mingSurround, ["天魁", "天钺"]) && { surround: mingSurround },
        condition: "命宫三方四正会天魁、天钺",
        reading: "主贵人、提携、制度机会、考试资质和关键节点被看见。",
        advice: "宜把握正式渠道、长辈资源和专业平台；忌只靠私下关系。"
    },
    {
        name: "羊陀夹命局",
        category: "煞曜夹冲局",
        match: ({ astrolabe, ming }) => {
            const neighbors = neighborPalaces(astrolabe, ming);
            return neighbors.length === 2 && neighbors.some((palace) => hasStar(palace, "擎羊")) && neighbors.some((palace) => hasStar(palace, "陀罗")) && {
                surround: getSurround(astrolabe, "命宫"),
                basisPalaces: [ming, ...neighbors],
                candidate: false,
                requiresNoMalefic: false
            };
        },
        condition: "命宫左右邻宫分别见擎羊、陀罗",
        reading: "这不是美格，而是压力结构。主夹制、延迟、冲突、硬碰硬和必须付出成本后成事。",
        advice: "宜把压力制度化，避免冲动对抗；重要选择要留缓冲。",
        requiresNoMalefic: false
    },
    {
        name: "火铃夹命局",
        category: "煞曜夹冲局",
        match: ({ astrolabe, ming }) => {
            const neighbors = neighborPalaces(astrolabe, ming);
            return neighbors.length === 2 && neighbors.some((palace) => hasStar(palace, "火星")) && neighbors.some((palace) => hasStar(palace, "铃星")) && {
                surround: getSurround(astrolabe, "命宫"),
                basisPalaces: [ming, ...neighbors],
                requiresNoMalefic: false
            };
        },
        condition: "命宫左右邻宫分别见火星、铃星",
        reading: "主突发、焦灼、急迫和情绪压力。若能训练节奏，反而有快速反应和突破力。",
        advice: "宜建立冷却机制和风险预案；忌临时起意做重大决定。",
        requiresNoMalefic: false,
        allowFireBell: true
    },
    {
        name: "空劫夹命局",
        category: "空耗转化局",
        match: ({ astrolabe, ming }) => {
            const neighbors = neighborPalaces(astrolabe, ming);
            return neighbors.length === 2 && neighbors.some((palace) => hasStar(palace, "地空")) && neighbors.some((palace) => hasStar(palace, "地劫")) && {
                surround: getSurround(astrolabe, "命宫"),
                basisPalaces: [ming, ...neighbors],
                requiresNoMalefic: false
            };
        },
        condition: "命宫左右邻宫分别见地空、地劫",
        reading: "主落空、重组、虚实转换、资源断裂或精神性强。适合做研究、抽象、创意和减法。",
        advice: "宜降低执着、保留现金流和备选方案；忌把全部资源押在单点。"
    },
    {
        name: "命无正曜格",
        category: "借对宫格",
        match: ({ ming, mingSurround }) => {
            const empty = !ming?.majorStars?.length || (typeof ming.isEmpty === "function" && ming.isEmpty());
            return empty && { surround: mingSurround, basisPalaces: [ming, oppositePalace(mingSurround)].filter(Boolean), candidate: true };
        },
        condition: "命宫无主星，需借对宫和三方四正定格",
        reading: "命宫无正曜时，不以本宫单独断人，而要重点看对宫、三方四正和身宫。",
        advice: "宜先看对宫主星和身宫落点，再回到现实问题验证。",
        candidateReason: "命无正曜本身不是完整美格，必须借对宫和三方四正才可继续定性。"
    }
];

function analyzeStrictPatterns(chart) {
    const astrolabe = chart.rawAstrolabe;
    const ming = getRawPalace(astrolabe, "命宫");
    const body = getBodyPalace(astrolabe);
    const mingSurround = getSurround(astrolabe, "命宫");
    const bodySurround = body ? getSurround(astrolabe, body.index) : null;
    const ctx = { astrolabe, ming, body, mingSurround, bodySurround };
    const patterns = [];

    namedPatternRules.forEach((rule) => {
        const match = rule.match(ctx);
        if (!match) return;

        patterns.push(
            makePattern({
                name: rule.name,
                category: rule.category,
                surround: match.surround,
                basisPalaces: match.basisPalaces,
                condition: rule.condition,
                reading: rule.reading,
                advice: rule.advice,
                candidate: Boolean(match.candidate || rule.candidate),
                candidateReason: match.candidateReason || rule.candidateReason,
                requiresNoMalefic: match.requiresNoMalefic ?? rule.requiresNoMalefic,
                allowFireBell: match.allowFireBell ?? rule.allowFireBell
            })
        );
    });

    const structures = buildDerivedStructurePatterns(ctx);

    if (!patterns.length) patterns.push(makeNoPattern(astrolabe));
    structures.push(makeStructurePattern(astrolabe, mingSurround));

    const brokenCount = patterns.filter((pattern) => pattern.broken).length;
    const formedCount = patterns.filter((pattern) => pattern.statusClass === "formed").length;
    const candidateCount = patterns.filter((pattern) => pattern.statusClass === "candidate").length;

    return {
        summary: `经典格局规则库覆盖 ${namedPatternRules.length} 个判断项。本盘命中 ${patterns.length} 项格局判断，其中 ${formedCount} 项严格成格，${candidateCount} 项候选待验，${brokenCount} 项见格有破；底部另列 ${structures.length} 条结构说明，不并入格局定名。定格局以命宫、身宫、三方四正、关键同宫与煞忌冲会为依据。`,
        patterns,
        structures
    };
}

function analyzeMockPatterns(chart) {
    return {
        summary: `当前为系统演示样本，没有 rawAstrolabe 原始排盘对象；经典格局规则库虽已覆盖 ${namedPatternRules.length} 个判断项，但演示样本不能严格定格。请录入真实出生资料后切换到 iztro 严格验格。`,
        patterns: [
            {
                name: "演示样本不定严格格局",
                category: "降级展示",
                status: "待真实排盘",
                statusClass: "candidate",
                basis: `演示样本仅有页面 mock 星曜：${chart?.palaces?.slice(0, 4).map((palace) => palaceEvidence(palace)).join("；") || "无宫位数据"}。`,
                reading: "mock 数据不包含完整庙旺、飞化、原始宫位函数和流派参数，不能用于严格定格局。",
                breaking: "没有严格成格，就不判断破格。",
                advice: "请在上方录入阳历/农历、出生日期、时辰和性别，生成真实命盘后再查看格局分析。"
            }
        ],
        structures: []
    };
}

export function analyzeChartPatterns(chart) {
    if (!chart?.palaces?.length) {
        return {
            summary: "当前命盘宫位数据不足，暂不能定格局。",
            patterns: [],
            structures: []
        };
    }

    if (chart.rawAstrolabe?.palace && chart.rawAstrolabe?.surroundedPalaces) {
        return analyzeStrictPatterns(chart);
    }

    return analyzeMockPatterns(chart);
}
