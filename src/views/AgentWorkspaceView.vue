<script setup>
import { computed, ref } from "vue";
import { ChatDotRound, Search } from "@element-plus/icons-vue";
import { agentMessages, sampleCharts } from "../mock/research";

const selectedChartId = ref(sampleCharts[0].id);
const researchQuery = ref("命宫与官禄宫如何形成长期研究优势？");

const selectedChart = computed(() => sampleCharts.find((item) => item.id === selectedChartId.value) || sampleCharts[0]);
const contextPayload = computed(() => ({
  chartId: selectedChart.value.id,
  chartName: selectedChart.value.name,
  tags: selectedChart.value.tags,
  question: researchQuery.value,
  palaces: selectedChart.value.palaces.map((item) => ({
    name: item.name,
    branch: item.branch,
    majorStars: item.majorStars
  }))
}));
</script>

<template>
  <main class="page-shell">
    <section class="page-title-block">
      <el-tag type="info" effect="dark">Agent Ready</el-tag>
      <h1>Agent 工作区</h1>
      <p>先把对话、样本上下文和 payload 结构搭出来，后续接入服务端 Agent 时可以直接替换 mock 响应。</p>
    </section>

    <section class="content-shell agent-workspace">
      <div class="agent-copy panel-block">
        <div class="section-title">
          <el-icon><ChatDotRound /></el-icon>
          <h2>上下文配置</h2>
        </div>
        <el-form label-position="top">
          <el-form-item label="样本盘">
            <el-select v-model="selectedChartId" size="large">
              <el-option v-for="chart in sampleCharts" :key="chart.id" :label="chart.name" :value="chart.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="研究问题">
            <el-input v-model="researchQuery" size="large" :prefix-icon="Search" />
          </el-form-item>
        </el-form>

        <div class="context-preview">
          <span>上下文包预览</span>
          <pre>{{ JSON.stringify(contextPayload, null, 2) }}</pre>
        </div>
      </div>

      <div class="chat-window">
        <div v-for="message in agentMessages" :key="message.content" class="message-row" :class="message.role">
          <span>{{ message.role === "assistant" ? "助手" : "研究者" }}</span>
          <p>{{ message.content }}</p>
        </div>
      </div>
    </section>
  </main>
</template>
