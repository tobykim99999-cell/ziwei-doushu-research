import { createRouter, createWebHistory } from "vue-router";
import AppShell from "../layouts/AppShell.vue";
import AgentWorkspaceView from "../views/AgentWorkspaceView.vue";
import ChartWorkbenchView from "../views/ChartWorkbenchView.vue";
import HomeView from "../views/HomeView.vue";
import ReadingGuideView from "../views/ReadingGuideView.vue";
import ResearchLibraryView from "../views/ResearchLibraryView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: AppShell,
      children: [
        { path: "", name: "home", component: HomeView },
        { path: "charts", name: "charts", component: ChartWorkbenchView },
        { path: "library", name: "library", component: ResearchLibraryView },
        { path: "guide", name: "guide", component: ReadingGuideView },
        { path: "agent", name: "agent", component: AgentWorkspaceView }
      ]
    }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});


