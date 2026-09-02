<!--
  echarts 图表承载组件

  职责单一：管理 echarts 实例生命周期（init / setOption / dispose），
  并用 ResizeObserver 让画布跟随容器宽高自适应。
  option 由调用方全量构建，组件不做任何业务加工。
-->
<template>
  <div ref="containerRef" class="chart-canvas" :style="{ height }" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsCoreOption, EChartsType } from "echarts/core";

// 按需注册：Dashboard 图表只用到柱状 / 折线 + Grid/Tooltip/Legend + Canvas 渲染。
echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

const props = withDefaults(
  defineProps<{
    /** echarts 完整 option；由调用方全量构建，变更时整体替换（notMerge）。 */
    option: EChartsCoreOption;
    /** 画布高度；宽度始终铺满容器。 */
    height?: string;
  }>(),
  { height: "320px" },
);

const containerRef = ref<HTMLDivElement | null>(null);
let chart: EChartsType | null = null;
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (!containerRef.value) {
    return;
  }
  chart = echarts.init(containerRef.value);
  chart.setOption(props.option, { notMerge: true });
  resizeObserver = new ResizeObserver(() => {
    chart?.resize();
  });
  resizeObserver.observe(containerRef.value);
});

// option 是调用方每次重建的完整对象，引用比较即可；notMerge 避免系列增减时残留旧系列。
watch(
  () => props.option,
  (option) => {
    chart?.setOption(option, { notMerge: true });
  },
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  chart?.dispose();
  chart = null;
});
</script>

<style scoped>
.chart-canvas {
  width: 100%;
}
</style>
