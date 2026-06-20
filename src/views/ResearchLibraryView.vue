<script setup>
import { computed, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { Connection, Delete, Plus, Reading } from "@element-plus/icons-vue";
import { architectureSteps, researchNotes } from "../mock/research";

const storageKey = "ziwei-research-user-samples";

function readStoredSamples() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

const userSamples = ref(readStoredSamples());
const sampleForm = reactive({
  name: "",
  birthInfo: "",
  question: "",
  tags: "",
  event: "",
  note: ""
});

const userSampleCount = computed(() => userSamples.value.length);

watch(
  userSamples,
  (value) => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  },
  { deep: true }
);

function normalizeTags(value) {
  return value
    .split(/[，,、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function resetForm() {
  sampleForm.name = "";
  sampleForm.birthInfo = "";
  sampleForm.question = "";
  sampleForm.tags = "";
  sampleForm.event = "";
  sampleForm.note = "";
}

function addSample() {
  if (!sampleForm.name.trim() || !sampleForm.birthInfo.trim()) {
    ElMessage.warning("请至少填写样本名称和出生信息");
    return;
  }

  userSamples.value.unshift({
    id: `sample-${Date.now()}`,
    name: sampleForm.name.trim(),
    birthInfo: sampleForm.birthInfo.trim(),
    question: sampleForm.question.trim() || "未填写关注问题",
    tags: normalizeTags(sampleForm.tags),
    event: sampleForm.event.trim(),
    note: sampleForm.note.trim(),
    createdAt: new Date().toLocaleDateString("zh-CN")
  });
  resetForm();
  ElMessage.success("样本已加入资料库");
}

function removeSample(sampleId) {
  userSamples.value = userSamples.value.filter((sample) => sample.id !== sampleId);
  ElMessage.success("样本已删除");
}
</script>

<template>
  <main class="page-shell">
    <section class="page-title-block">
      <el-tag type="success" effect="dark">Knowledge</el-tag>
      <h1>研究资料库</h1>
      <p>这里存放研究方法、结构化标签、复盘规范和个人样本，后续可以接入文档库、向量检索或案例管理接口。</p>
    </section>

    <section class="content-shell sample-entry-panel">
      <div class="sample-entry-copy">
        <el-tag type="warning" effect="plain">Sample Intake</el-tag>
        <h2>添加自己的样本信息</h2>
        <p>记录出生信息、关注问题、已验证事件和初步判断，方便后续和排盘结果、Agent 分析上下文一起使用。</p>
      </div>

      <el-form class="sample-entry-form" label-position="top" @submit.prevent>
        <div class="form-row">
          <el-form-item label="样本名称">
            <el-input v-model="sampleForm.name" placeholder="例如：职业转型案例 01" />
          </el-form-item>
          <el-form-item label="出生信息">
            <el-input v-model="sampleForm.birthInfo" placeholder="例如：农历六月十八 · 巳时 · 甲年" />
          </el-form-item>
        </div>
        <el-form-item label="关注问题">
          <el-input v-model="sampleForm.question" placeholder="例如：未来一年职业转型阻力在哪里" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="sampleForm.tags" placeholder="命迁线、四化集中、财官互照" />
        </el-form-item>
        <el-form-item label="已验证事件">
          <el-input v-model="sampleForm.event" type="textarea" :rows="3" placeholder="记录已发生的重要年份、事件和结果" />
        </el-form-item>
        <el-form-item label="初步判断">
          <el-input v-model="sampleForm.note" type="textarea" :rows="3" placeholder="记录盘面线索、疑点和后续需要验证的假设" />
        </el-form-item>
        <el-button type="primary" :icon="Plus" @click="addSample">加入样本库</el-button>
      </el-form>
    </section>

    <section class="content-shell user-samples-panel">
      <div class="section-title samples-title">
        <el-icon><Reading /></el-icon>
        <h2>我的样本</h2>
        <span>{{ userSampleCount }} 条</span>
      </div>

      <el-empty v-if="!userSamples.length" description="还没有自定义样本" />

      <div v-else class="user-sample-grid">
        <article v-for="sample in userSamples" :key="sample.id" class="user-sample-card">
          <div class="user-sample-head">
            <div>
              <span>{{ sample.createdAt }}</span>
              <h3>{{ sample.name }}</h3>
            </div>
            <el-button circle text type="danger" :icon="Delete" @click="removeSample(sample.id)" />
          </div>
          <p>{{ sample.birthInfo }}</p>
          <strong>{{ sample.question }}</strong>
          <el-space wrap>
            <el-tag v-for="tag in sample.tags" :key="tag" effect="plain">{{ tag }}</el-tag>
          </el-space>
          <div v-if="sample.event || sample.note" class="sample-note-block">
            <p v-if="sample.event">事件：{{ sample.event }}</p>
            <p v-if="sample.note">判断：{{ sample.note }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="content-shell research-grid library-grid">
      <article v-for="note in researchNotes" :key="note.title" class="research-card">
        <el-icon><Connection /></el-icon>
        <span>{{ note.category }}</span>
        <h3>{{ note.title }}</h3>
        <p>{{ note.body }}</p>
      </article>
    </section>

    <section class="content-shell method-panel">
      <div class="section-title">
        <el-icon><Reading /></el-icon>
        <h2>研究工作流</h2>
      </div>
      <div class="architecture-list compact">
        <article v-for="step in architectureSteps" :key="step.index">
          <span>{{ step.index }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.body }}</p>
        </article>
      </div>
    </section>
  </main>
</template>
