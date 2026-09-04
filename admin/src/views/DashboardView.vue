<!--
  Dashboard 数据看板

  展示：
  1. 顶部统计卡片：总用户数、今日新增、24H 活跃、7D 活跃
  2. 图表区：60 天注册数柱状图 + 各打点类型事件数多系列折线（device_count 不上图）
  3. 下方 NDataTable：60 天按天数据（日期、注册数、各 mark_type 事件数/设备数）
-->
<template>
  <div class="dashboard-view">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <NCard v-for="item in summaryCards" :key="item.label">
        <NStatistic :label="item.label" :value="item.value" />
      </NCard>
    </div>

    <!-- 图表区：加载失败显示错误占位，不影响下方表格 -->
    <NCard :title="t('dashboard.chartRegistrations')" class="section-card">
      <ChartCanvas
        v-if="!loadFailed"
        :option="registrationChartOption"
        :height="chartHeight"
      />
      <NEmpty v-else :description="t('dashboard.chartLoadFailed')" />
    </NCard>

    <NCard :title="t('dashboard.chartMarkEvents')" class="section-card">
      <ChartCanvas
        v-if="!loadFailed"
        :option="markEventChartOption"
        :height="chartHeight"
      />
      <NEmpty v-else :description="t('dashboard.chartLoadFailed')" />
    </NCard>

    <!-- 数据表格 -->
    <NCard :title="t('layout.dashboard')" class="section-card">
      <NDataTable
        :columns="columns"
        :data="rows"
        :loading="loading"
        :pagination="false"
        :scroll-x="tableScrollX"
        :bordered="false"
        striped
      />
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  NCard,
  NEmpty,
  NStatistic,
  NDataTable,
  type DataTableColumns,
} from "naive-ui";
import type { EChartsCoreOption } from "echarts/core";
import {
  getDashboard,
  type DashboardData,
  type DashboardRow,
  type DashboardSummary,
} from "@/api/dashboard";
import ChartCanvas from "@/components/ChartCanvas.vue";
import { useIsMobile, usePrefersDark } from "@/composables/useResponsive";

const { t } = useI18n();
const isMobile = useIsMobile();
const isDark = usePrefersDark();

/** 数据看板固定展示最近 60 天，表格不再分页。 */
const DASHBOARD_VISIBLE_ROW_COUNT = 60;
/** Admin 看板不展示的旧网页行为列；后端与数据库仍保留这些打点。 */
const DASHBOARD_HIDDEN_MARK_TYPES = new Set<string>(["web_page_open"]);
/** 低价值但仍需保留的插件行为列，统一移动到表格末尾与折线图 legend 末尾。 */
const DASHBOARD_TRAILING_MARK_TYPES = [
  "content_open",
  "popup_open",
] as const;
/** 末尾列集合，用于保持普通列的原始顺序。 */
const DASHBOARD_TRAILING_MARK_TYPE_SET = new Set<string>(
  DASHBOARD_TRAILING_MARK_TYPES,
);

/** ECharts 的 Canvas 色值需先把 CSS token 解析为当前主题的实际颜色。 */
const chartTheme = computed(() => {
  void isDark.value;
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  return {
    palette: ["--primary", "--accent", "--warn", "--bad", "--text-2", "--primary-hover"].map(
      token,
    ),
    label: token("--text-3"),
    line: token("--border"),
  };
});

interface SummaryCard {
  /** 统计卡片标题。 */
  label: string;
  /** 统计卡片数值。 */
  value: number;
}

const loading = ref(false);
const loadFailed = ref(false);
const dashboardData = ref<DashboardData | null>(null);

const summaryCards = computed<SummaryCard[]>(() => {
  const summary = dashboardData.value?.summary;
  return [
    { label: t("dashboard.totalUsers"), value: summary?.total_users ?? 0 },
    { label: formatNewUsersLabel(summary), value: summary?.new_users ?? 0 },
    { label: t("dashboard.activeUsers24h"), value: summary?.active_users_24h ?? 0 },
    { label: t("dashboard.activeUsers7d"), value: summary?.active_users_7d ?? 0 },
  ];
});
const rows = computed(() =>
  (dashboardData.value?.rows ?? []).slice(0, DASHBOARD_VISIBLE_ROW_COUNT),
);
/** 图表 X 轴按时间从旧到新；后端 rows 最新在前，直接渲染会让趋势左右颠倒。 */
const chartRows = computed(() => [...rows.value].reverse());
const markTypes = computed(() =>
  getAdminVisibleMarkTypes(dashboardData.value?.mark_types ?? []),
);
/**
 * 表格横向滚动宽度 = 固定列（日期 120 + 注册数 90）+ 动态列（每个 mark_type 140）。
 * 未设 scroll-x 时窄视口会挤压溢出而非横向滚动。
 */
const tableScrollX = computed(() => 120 + 90 + markTypes.value.length * 140);

/** 图表高度：移动端（≤960 单列体系）略降，配合容器宽度一起收缩。 */
const chartHeight = computed(() => (isMobile.value ? "260px" : "320px"));

/** 图表一：60 天注册数柱状。 */
const registrationChartOption = computed<EChartsCoreOption>(() => ({
  color: chartTheme.value.palette,
  grid: { left: 48, right: 16, top: 32, bottom: 40 },
  tooltip: { trigger: "axis" },
  xAxis: {
    type: "category",
    data: chartRows.value.map((row) => row.date_label),
    axisLabel: { color: chartTheme.value.label },
    axisLine: { lineStyle: { color: chartTheme.value.line } },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    axisLabel: { color: chartTheme.value.label },
    splitLine: { lineStyle: { color: chartTheme.value.line } },
  },
  series: [
    {
      type: "bar",
      name: t("dashboard.registered"),
      data: chartRows.value.map((row) => row.registered_count),
    },
  ],
}));

/** 图表二：各 mark_type 事件数多系列折线；系列名与表格列头同口径（mark_type 原值）。 */
const markEventChartOption = computed<EChartsCoreOption>(() => ({
  color: chartTheme.value.palette,
  grid: { left: 48, right: 16, top: 56, bottom: 40 },
  tooltip: { trigger: "axis" },
  legend: {
    top: 0,
    type: "scroll",
    textStyle: { color: chartTheme.value.label },
  },
  xAxis: {
    type: "category",
    data: chartRows.value.map((row) => row.date_label),
    axisLabel: { color: chartTheme.value.label },
    axisLine: { lineStyle: { color: chartTheme.value.line } },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    axisLabel: { color: chartTheme.value.label },
    splitLine: { lineStyle: { color: chartTheme.value.line } },
  },
  series: markTypes.value.map((markType) => ({
    type: "line",
    name: markType,
    showSymbol: false,
    data: chartRows.value.map((row) => row.metrics[markType]?.event_count ?? 0),
  })),
}));

function formatChangePercent(changePercent: number | null | undefined): string {
  if (changePercent === null || changePercent === undefined) {
    return t("dashboard.changeUnavailable");
  }

  const roundedPercent = Math.round(Math.abs(changePercent));
  if (roundedPercent === 0) {
    return t("dashboard.changeFlat");
  }

  return t(changePercent > 0 ? "dashboard.changeUp" : "dashboard.changeDown", {
    percent: roundedPercent,
  });
}

function formatNewUsersLabel(summary: DashboardSummary | undefined): string {
  if (!summary) {
    return t("dashboard.newUsers");
  }

  const yesterdaySamePeriod = summary.new_users_yesterday_same_period ?? 0;
  const changePercent =
    summary.new_users_yesterday_same_period_change_percent ?? null;

  return t("dashboard.newUsersWithComparison", {
    count: yesterdaySamePeriod,
    change: formatChangePercent(changePercent),
  });
}

function getAdminVisibleMarkTypes(markTypes: string[]): string[] {
  const visibleMarkTypes = markTypes.filter(
    (markType) => !DASHBOARD_HIDDEN_MARK_TYPES.has(markType),
  );
  const regularMarkTypes = visibleMarkTypes.filter(
    (markType) => !DASHBOARD_TRAILING_MARK_TYPE_SET.has(markType),
  );
  const trailingMarkTypes = DASHBOARD_TRAILING_MARK_TYPES.filter((markType) =>
    visibleMarkTypes.includes(markType),
  );

  return [...regularMarkTypes, ...trailingMarkTypes];
}

/** 动态列：日期 + 注册数 + 各 mark_type 的 event_count / device_count */
const columns = computed<DataTableColumns<DashboardRow>>(() => {
  const base: DataTableColumns<DashboardRow> = [
    {
      title: t("dashboard.date"),
      key: "date_label",
      width: 120,
      fixed: "left",
    },
    {
      title: t("dashboard.registered"),
      key: "registered_count",
      width: 90,
      align: "right",
    },
  ];

  // 按 mark_type 动态生成列，每个 mark_type 一列，单元格内显示 "事件数/设备数"
  for (const mt of markTypes.value) {
    base.push({
      title: mt,
      key: mt,
      width: 140,
      align: "right",
      render: (row: DashboardRow) => {
        const cell = row.metrics[mt];
        if (!cell) return "-";
        return `${cell.event_count}/${cell.device_count}`;
      },
    });
  }

  return base;
});

async function loadData() {
  loading.value = true;
  loadFailed.value = false;
  try {
    dashboardData.value = await getDashboard();
  } catch (error) {
    console.error("DashboardView.loadData() 加载失败:", error);
    dashboardData.value = null;
    loadFailed.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.section-card {
  margin-top: 16px;
}

.stat-cards {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.stat-cards :deep(.n-statistic__label) {
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
}
</style>
