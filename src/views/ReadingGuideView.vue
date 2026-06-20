<script setup>
import { Compass, Connection, Reading, Warning } from "@element-plus/icons-vue";
import { beginnerMistakes, fourTransformationsGuide, readingGuideSteps, starInteractionGuide } from "../mock/research";
</script>

<template>
  <main class="page-shell guide-page">
    <section class="page-title-block guide-title-block">
      <el-tag type="warning" effect="dark">Beginner Guide</el-tag>
      <h1>新手看盘步骤指导</h1>
      <p>从问题、宫位、命身、三方四正、四化到星曜互涉，按顺序建立一套可以复盘的看盘方法。</p>
    </section>

    <section class="content-shell guide-overview">
      <article>
        <el-icon><Compass /></el-icon>
        <strong>先定问题</strong>
        <p>看盘不是把所有宫位一次讲完，而是先确认要回答什么。</p>
      </article>
      <article>
        <el-icon><Connection /></el-icon>
        <strong>再看结构</strong>
        <p>本宫、对宫、三方四正一起看，避免孤立解释单宫。</p>
      </article>
      <article>
        <el-icon><Reading /></el-icon>
        <strong>最后验证</strong>
        <p>每个判断都要落到现实事件、时间层次和行动建议。</p>
      </article>
    </section>

    <section class="content-shell guide-section">
      <div class="section-title">
        <el-icon><Reading /></el-icon>
        <h2>八步看盘顺序</h2>
      </div>

      <div class="guide-timeline">
        <article v-for="item in readingGuideSteps" :key="item.step" class="guide-step-card">
          <div class="guide-step-index">{{ item.step }}</div>
          <div class="guide-step-body">
            <span>{{ item.focus }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.detail }}</p>
            <ul>
              <li v-for="tip in item.tips" :key="tip">{{ tip }}</li>
            </ul>
          </div>
        </article>
      </div>
    </section>

    <section class="content-shell guide-section two-panel-guide">
      <div class="guide-panel dark-guide-panel">
        <div class="section-title invert">
          <el-icon><Compass /></el-icon>
          <h2>四化怎么用</h2>
        </div>
        <div class="four-transform-grid">
          <article v-for="item in fourTransformationsGuide" :key="item.name">
            <span>{{ item.name }}</span>
            <strong>{{ item.theme }}</strong>
            <p>{{ item.detail }}</p>
          </article>
        </div>
      </div>

      <div class="guide-panel">
        <div class="section-title">
          <el-icon><Connection /></el-icon>
          <h2>四化经验</h2>
        </div>
        <p class="guide-copy">四化是事件线索，不是简单吉凶。看化禄时问资源流向，看化权时问责任和掌控，看化科时问名声和修饰，看化忌时问执着和堵点。四化落入主宫、对宫、三方时，说明该主题在现实中更容易被触发。</p>
      </div>
    </section>

    <section class="content-shell guide-section">
      <div class="section-title">
        <el-icon><Connection /></el-icon>
        <h2>星曜互涉经验</h2>
      </div>
      <div class="interaction-grid">
        <article v-for="item in starInteractionGuide" :key="item.title">
          <strong>{{ item.title }}</strong>
          <p>{{ item.detail }}</p>
        </article>
      </div>
    </section>

    <section class="content-shell guide-section mistakes-panel">
      <div class="section-title invert">
        <el-icon><Warning /></el-icon>
        <h2>新手常见误区</h2>
      </div>
      <ol>
        <li v-for="item in beginnerMistakes" :key="item">{{ item }}</li>
      </ol>
    </section>
  </main>
</template>
