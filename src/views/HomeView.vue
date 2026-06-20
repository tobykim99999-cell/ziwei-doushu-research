<script setup>
import { DataAnalysis, Reading, Star } from "@element-plus/icons-vue";
import { architectureSteps, faqItems, moduleCards, platformUpdates, researchStats, sampleCharts } from "../mock/research";
</script>

<template>
  <main class="home-page">
    <section class="home-hero">
      <div class="hero-aura" aria-hidden="true"></div>
      <div class="screen-inner hero-grid">
        <div class="hero-copy">
          <el-tag effect="dark" type="warning">Zi Wei Research Lab</el-tag>
          <h1>让紫微斗数研究从单次解读，走向样本、结构与复盘</h1>
          <p>用可追踪的数据结构管理命盘、案例、宫位标签与研究结论，为后续接入 Agent 留出清晰的上下文入口。</p>
          <div class="hero-actions">
            <RouterLink to="/charts"><el-button type="warning" size="large" :icon="DataAnalysis">进入样本盘</el-button></RouterLink>
            <RouterLink to="/agent"><el-button size="large">查看 Agent 工作区</el-button></RouterLink>
          </div>
          <div class="download-row">
            <span>Research Platform</span>
            <span>Mock Data Ready</span>
            <span>Agent Context Ready</span>
          </div>
        </div>

        <div class="star-map-visual" aria-label="紫微斗数研究视觉">
          <img src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1200&q=80" alt="星空研究背景" />
          <div class="star-rings" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="star-map-card">
            <span>当前样本</span>
            <strong>{{ sampleCharts[0].name }}</strong>
            <p>{{ sampleCharts[0].birthSummary }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="updates-section page-section">
      <div class="screen-inner">
        <div class="section-kicker">最新动态</div>
        <div class="updates-grid">
          <article v-for="item in platformUpdates" :key="item.title" class="update-item">
            <span>{{ item.type }}</span>
            <strong>{{ item.title }}</strong>
            <em>{{ item.date }}</em>
          </article>
        </div>
      </div>
    </section>

    <section class="astro-band">
      <div class="screen-inner astro-band-inner">
        <div class="rotating-chart">
          <img src="https://images.unsplash.com/photo-1504333638930-c8787321eee0?auto=format&fit=crop&w=1400&q=80" alt="星盘背景" />
          <div class="chart-labels">
            <span>ZIWEI<br />十二宫</span>
            <span>FOUR<br />化象追踪</span>
            <span>CASE<br />样本复盘</span>
            <span>AGENT<br />上下文</span>
          </div>
        </div>
        <p>参考：将命盘结构、案例事件与研究假设放在同一个可追踪的数据层。</p>
      </div>
    </section>

    <section class="identity-section page-section dark-section">
      <div class="screen-inner split-section">
        <div>
          <div class="section-kicker">我们是谁</div>
          <h2>一个面向紫微斗数研究者的结构化工作台</h2>
        </div>
        <p>平台不会把传统术语堆成一页工具，而是把命盘、样本、事件、研究假设分层管理。首页只负责建立方向感，具体工作放到独立模块里。</p>
      </div>
      <div class="screen-inner stats-grid">
        <article v-for="item in researchStats" :key="item.label" class="stat-card" :class="item.tone">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}<small>{{ item.suffix }}</small></strong>
        </article>
      </div>
    </section>

    <section class="architecture-section page-section light-section">
      <div class="screen-inner">
        <div class="section-kicker">核心架构</div>
        <h2>从命盘到 Agent 的三层路径</h2>
        <div class="architecture-list">
          <article v-for="step in architectureSteps" :key="step.index">
            <span>{{ step.index }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="modules-section page-section dark-section">
      <div class="screen-inner">
        <div class="section-headline">
          <div>
            <div class="section-kicker">模块平台</div>
            <h2>不同模块独立成页，App 只负责承载路由</h2>
          </div>
          <el-icon><Star /></el-icon>
        </div>
        <div class="module-grid">
          <RouterLink v-for="item in moduleCards" :key="item.title" class="module-card" :to="item.path">
            <span>{{ item.tag }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.desc }}</p>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="sample-preview page-section light-section">
      <div class="screen-inner split-section">
        <div>
          <div class="section-kicker">样本预览</div>
          <h2>用案例建立可以被验证的研究假设</h2>
        </div>
        <RouterLink to="/charts"><el-button type="primary" :icon="Reading">打开工作台</el-button></RouterLink>
      </div>
      <div class="screen-inner sample-preview-grid">
        <article v-for="chart in sampleCharts" :key="chart.id">
          <span>{{ chart.birthSummary }}</span>
          <h3>{{ chart.name }}</h3>
          <p>{{ chart.question }}</p>
        </article>
      </div>
    </section>

    <section class="faq-section page-section dark-section">
      <div class="screen-inner faq-layout">
        <div>
          <div class="section-kicker">常见问题</div>
          <h2>先把平台结构搭清楚，再接真实服务</h2>
        </div>
        <el-collapse class="faq-collapse">
          <el-collapse-item v-for="item in faqItems" :key="item.question" :title="item.question">
            {{ item.answer }}
          </el-collapse-item>
        </el-collapse>
      </div>
    </section>

    <section class="cta-section page-section">
      <div class="screen-inner cta-panel">
        <h2>准备进入紫微斗数研究工作流</h2>
        <p>从样本盘开始，逐步把研究资料、问答链路和 Agent 上下文接入进来。</p>
        <RouterLink to="/charts"><el-button type="warning" size="large">开始研究</el-button></RouterLink>
      </div>
    </section>
  </main>
</template>
