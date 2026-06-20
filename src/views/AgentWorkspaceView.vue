<script setup>
import { computed, nextTick, ref } from "vue";
import { ChatDotRound, Search } from "@element-plus/icons-vue";
import { agentMessages, sampleCharts } from "../mock/research";
import { buildZiweiKnowledgeReply, ziweiKnowledgeBase, ziweiKnowledgeSources } from "../mock/ziweiKnowledge";

const selectedChartId = ref(sampleCharts[0].id);
const researchQuery = ref("命宫与官禄宫如何形成长期研究优势？");
const draftMessage = ref("");
const chatHistoryRef = ref(null);
const messages = ref([
    {
        role: "assistant",
        content:
            "已接入本地紫微斗数知识库。你可以问三方四正、四化、十四主星、辅曜杂曜、运限层次，或让助手结合当前样本盘做基础分析。",
        sources: ziweiKnowledgeSources.slice(0, 2)
    },
    ...agentMessages
]);

const quickQuestions = [
    "三方四正应该怎么用？",
    "四化怎么看才专业？",
    "大限、流年和流月有什么区别？",
    "事业和财帛应该先看哪些宫位？"
];

const selectedChart = computed(() => sampleCharts.find((item) => item.id === selectedChartId.value) || sampleCharts[0]);
const contextPayload = computed(() => ({
    chartId: selectedChart.value.id,
    chartName: selectedChart.value.name,
    tags: selectedChart.value.tags,
    question: researchQuery.value,
    knowledgeBase: {
        entries: ziweiKnowledgeBase.length,
        sources: ziweiKnowledgeSources.map((source) => source.name)
    },
    palaces: selectedChart.value.palaces.map((item) => ({
        name: item.name,
        branch: item.branch,
        majorStars: item.majorStars,
        minorStars: item.minorStars
    }))
}));

function scrollToBottom() {
    nextTick(() => {
        const chatHistory = chatHistoryRef.value;
        if (!chatHistory) return;

        chatHistory.scrollTo({
            top: chatHistory.scrollHeight,
            behavior: "smooth"
        });
    });
}

function sendMessage(content = draftMessage.value) {
    const question = content.trim();
    if (!question) return;

    messages.value.push({ role: "user", content: question });
    const reply = buildZiweiKnowledgeReply(question, selectedChart.value);
    messages.value.push({
        role: "assistant",
        content: reply.content,
        sources: reply.sources,
        matchedTitles: reply.entries.map((entry) => entry.title)
    });
    draftMessage.value = "";
    scrollToBottom();
}

function askQuickQuestion(question) {
    sendMessage(question);
}
</script>

<template>
    <main class="page-shell">
        <section class="page-title-block">
            <el-tag type="success" effect="dark">Knowledge Agent</el-tag>
            <h1>Agent 工作区</h1>
            <p>先以本地知识库完成基础问答和样本盘上下文组织，后续可继续替换为后端 Agent、向量检索或外部模型调用。</p>
        </section>

        <section class="content-shell agent-workspace">
            <div class="agent-copy panel-block">
                <div class="section-title">
                    <el-icon>
                        <ChatDotRound />
                    </el-icon>
                    <h2>上下文配置</h2>
                </div>
                <p>当前回复会同时读取样本盘、研究问题和紫微斗数知识库条目，用于生成基础学习型分析。</p>

                <el-form label-position="top">
                    <el-form-item label="样本盘">
                        <el-select v-model="selectedChartId" size="large">
                            <el-option v-for="chart in sampleCharts" :key="chart.id" :label="chart.name"
                                :value="chart.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="研究问题">
                        <el-input v-model="researchQuery" size="large" :prefix-icon="Search" />
                    </el-form-item>
                </el-form>

                <div class="knowledge-status">
                    <article>
                        <span>知识条目</span>
                        <strong>{{ ziweiKnowledgeBase.length }}</strong>
                    </article>
                    <article>
                        <span>参考来源</span>
                        <strong>{{ ziweiKnowledgeSources.length }}</strong>
                    </article>
                </div>

                <div class="context-preview">
                    <span>上下文包预览</span>
                    <pre>{{ JSON.stringify(contextPayload, null, 2) }}</pre>
                </div>
            </div>

            <div class="chat-window">
                <div class="chat-window-head">
                    <div>
                        <!-- <span>本地知识库调用</span> -->
                        <strong>紫微斗数基础问答</strong>
                    </div>
                    <em>{{ ziweiKnowledgeBase.length }} 条</em>
                </div>

                <div ref="chatHistoryRef" class="chat-history">
                    <div v-for="(message, index) in messages" :key="`${message.role}-${index}`" class="message-row"
                        :class="message.role">
                        <span>{{ message.role === "assistant" ? "助手" : "研究者" }}</span>
                        <p>{{ message.content }}</p>
                        <div v-if="message.matchedTitles?.length" class="matched-topics">
                            <b v-for="topic in message.matchedTitles" :key="topic">{{ topic }}</b>
                        </div>
                        <div v-if="message.sources?.length" class="message-sources">
                            <a v-for="source in message.sources" :key="source.id" :href="source.url" target="_blank"
                                rel="noreferrer">
                                {{ source.name }}
                            </a>
                        </div>
                    </div>
                </div>

                <div class="quick-question-row">
                    <button v-for="question in quickQuestions" :key="question" type="button"
                        @click="askQuickQuestion(question)">
                        {{ question }}
                    </button>
                </div>

                <div class="chat-composer">
                    <el-input v-model="draftMessage" type="textarea" :rows="3" resize="none"
                        placeholder="输入你想问的紫微斗数基础问题，例如：四化怎么看？" />
                    <el-button type="primary" size="large" @click="sendMessage()">发送</el-button>
                </div>
            </div>
        </section>
    </main>
</template>
