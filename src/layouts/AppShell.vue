<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const navItems = [
  { label: "首页", path: "/" },
  { label: "样本盘", path: "/charts" },
  { label: "研究库", path: "/library" },
  { label: "看盘指南", path: "/guide" },
  { label: "Agent 工作区", path: "/agent" }
];

const activePath = computed(() => route.path);
</script>

<template>
  <div class="app-frame">
    <header class="site-header">
      <RouterLink class="brand-mark" to="/">
        <span>紫</span>
        <strong>紫微斗数研究平台</strong>
      </RouterLink>

      <nav class="site-nav" aria-label="主导航">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :class="{ active: activePath === item.path }"
          :to="item.path"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </header>

    <router-view />
  </div>
</template>


