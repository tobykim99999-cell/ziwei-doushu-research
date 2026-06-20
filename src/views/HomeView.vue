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
          <h1>紫微斗数排盘与研究辅助平台</h1>
          <p>面向紫微斗数学习、案例整理与分析复盘，提供命盘录入、十二宫展示、四化运限查看和结构化解读。平台定位为研究辅助工具，结论应结合真实事件持续校验。</p>
          <div class="hero-actions">
            <RouterLink to="/charts"><el-button type="warning" size="large" :icon="DataAnalysis">进入排盘工作台</el-button></RouterLink>
            <RouterLink to="/guide"><el-button size="large">查看看盘指南</el-button></RouterLink>
          </div>
          <div class="download-row">
            <span>真实排盘接入</span>
            <span>样本信息管理</span>
            <span>结构化分析</span>
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
            <span>演示样本</span>
            <strong>{{ sampleCharts[0].name }}</strong>
            <p>{{ sampleCharts[0].birthSummary }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="capability-screen page-section">
      <div class="screen-inner capability-inner">
        <div class="capability-head">
          <div>
            <div class="section-kicker">当前能力</div>
            <h2>排盘、运限与样本复盘的核心工作流</h2>
          </div>
          <p>当前版本聚焦真实样本录入、十二宫结构展示、四化与运限分层查看，为后续接入智能分析保留清晰的数据上下文。</p>
        </div>
        <div class="updates-grid capability-grid">
          <article v-for="item in platformUpdates" :key="item.title" class="update-item">
            <span>{{ item.type }}</span>
            <strong>{{ item.title }}</strong>
            <em>{{ item.date }}</em>
          </article>
        </div>
        <div class="capability-visual">
          <div class="rotating-chart">
            <img src="https://images.unsplash.com/photo-1504333638930-c8787321eee0?auto=format&fit=crop&w=1400&q=80" alt="星盘背景" />
            <div class="chart-labels">
              <span>ZIWEI<br />十二宫</span>
              <span>FOUR<br />化象追踪</span>
              <span>CASE<br />样本复盘</span>
              <span>AGENT<br />上下文</span>
            </div>
          </div>
          <p>平台围绕命盘生成、宫位信息、四化运限和复盘记录组织数据；示例内容仅用于展示结构，正式分析请以录入的真实样本为准。</p>
        </div>
      </div>
    </section>

    <section class="identity-section page-section dark-section">
      <div class="screen-inner split-section">
        <div>
          <div class="section-kicker">平台定位</div>
          <h2>用于排盘、整理、分析和复盘的工具型平台</h2>
        </div>
        <p>平台以清晰呈现和可复盘记录为核心：先把命盘、宫位、星曜、四化与运限信息结构化，再围绕具体问题形成分析记录。当前版本不提供绝对化判断，也不把演示数据包装成真实案例。</p>
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
        <div class="section-kicker">工作流程</div>
        <h2>从录入命盘到形成复盘记录</h2>
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
            <div class="section-kicker">功能模块</div>
            <h2>围绕排盘、学习、资料与智能辅助建立清晰入口</h2>
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
          <div class="section-kicker">演示样本</div>
          <h2>以下内容为演示样本，用于说明命盘、问题和分析结构</h2>
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
          <div class="section-kicker">使用说明</div>
          <h2>当前版本的能力边界与后续扩展方向</h2>
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
        <h2>开始使用排盘与研究工具</h2>
        <p>建议先录入自己的命盘或研究样本，再按看盘指南梳理问题、宫位、四化与运限层级。</p>
        <RouterLink to="/charts"><el-button type="warning" size="large">进入工作台</el-button></RouterLink>
      </div>
    </section>
  </main>
</template>
