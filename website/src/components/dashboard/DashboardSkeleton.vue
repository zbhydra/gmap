<script setup lang="ts">
/**
 * 视图首屏骨架：与真实布局同尺寸，SSG 直接输出进 HTML（首帧即「外壳 + 骨架」），会话或视图数据到达后
 * 换成内容只淡入、不位移。整块对读屏隐藏：会话恢复期间由主区的 sr-only status 播报加载中。
 * 定宽骨架条写成 min(定宽, 百分比)：视图根是网格自动列，按子项最小内容宽撑开；定宽加百分比 max-width
 * 在算固有宽度时百分比不生效，窄屏会把整列撑出视图。
 * History 工具栏骨架用真实工具栏的 hist-* 类：随同一组容器断点显隐与排布（≤ 680 折成搜索 + Filters + 刷新图标）。
 */
import type { DashboardView } from '../../scripts/dashboard/route'

defineProps<{ view: DashboardView }>()

/** 任务行骨架的关键词与进度条宽度：多行错落，避免整齐划一像真实数据。 */
const RECENT_ROWS = [[72, 70, 96], [64, 60, 88], [80, 66, 104], [58, 58, 92], [70, 62, 96]] as const
const HISTORY_ROWS = [...RECENT_ROWS, [76, 64, 100], [62, 56, 90], [68, 68, 98]] as const
</script>

<template>
  <div v-if="view === 'online'" class="view-stack" aria-hidden="true">
    <div class="d-panel">
      <div class="composer-head">
        <span class="skel" style="width: 88px; height: 14px"></span>
        <span class="skel skel--pill" style="width: min(300px, 100%); height: 42px"></span>
      </div>
      <div class="composer-body"><span class="skel skel--block" style="height: 148px"></span></div>
      <div class="composer-foot">
        <span class="skel" style="width: min(260px, 60%); height: 14px"></span>
        <span class="skel skel--pill" style="width: 150px; height: 38px"></span>
      </div>
    </div>
    <div>
      <div class="d-section-head">
        <span class="skel skel--on-bg" style="width: 132px; height: 16px"></span>
        <span class="skel skel--on-bg" style="width: 72px"></span>
      </div>
      <div class="jobs jobs--compact">
        <div class="jobs-head"><span class="skel" style="width: 40px"></span></div>
        <div class="jobs-list">
          <div v-for="(row, index) in RECENT_ROWS" :key="index" class="job">
            <div class="job-row">
              <span class="skel-stack"><span class="skel" :style="{ width: `${row[0]}%` }"></span><span class="skel" style="width: 132px"></span></span>
              <span class="skel" :style="{ width: `${row[1]}%` }"></span>
              <span class="skel" style="width: 40px; justify-self: end"></span>
              <span class="skel skel--pill" :style="{ width: `${row[2]}px`, height: '22px' }"></span>
              <span class="skel skel--pill" style="width: 120px; height: 32px; justify-self: end"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="view === 'history'" class="view-stack" aria-hidden="true">
    <span class="skel skel--on-bg" style="width: min(560px, 85%)"></span>
    <div class="hist-bar">
      <span class="skel skel--block hist-search" style="height: 40px"></span>
      <span class="skel skel--pill hist-status" style="width: 380px; height: 40px"></span>
      <span class="skel skel--pill hist-range-btn" style="width: 128px; height: 40px"></span>
      <span class="skel skel--pill hist-filter-btn" style="width: 100px; height: 40px"></span>
      <span class="skel skel--pill hist-refresh" style="height: 40px"></span>
    </div>
    <div class="jobs">
      <div class="jobs-head"><span class="skel" style="width: 40px"></span></div>
      <div class="jobs-list">
        <div v-for="(row, index) in HISTORY_ROWS" :key="index" class="job">
          <div class="job-row">
            <span class="skel-stack"><span class="skel" :style="{ width: `${row[0]}%` }"></span><span class="skel" style="width: 132px"></span></span>
            <span class="skel" :style="{ width: `${row[1]}%` }"></span>
            <span class="skel" style="width: 40px; justify-self: end"></span>
            <span class="skel skel--pill" :style="{ width: `${row[2]}px`, height: '22px' }"></span>
            <span class="skel skel--pill" style="width: 120px; height: 32px; justify-self: end"></span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="view === 'api'" class="view-stack" aria-hidden="true">
    <span class="skel skel--on-bg" style="width: min(440px, 80%)"></span>
    <div class="api-grid">
      <div class="d-panel" data-area="plan">
        <div class="d-panel-body skel-stack">
          <span class="skel" style="width: 64px; height: 12px"></span>
          <span class="skel" style="width: 46%; height: 22px"></span>
          <span class="skel" style="width: 58%"></span>
          <span class="skel" style="width: 36%; height: 28px; margin-top: var(--s-2)"></span>
          <span class="skel skel--pill" style="height: 6px"></span>
          <span class="skel" style="width: 80%"></span>
        </div>
      </div>
      <div class="d-panel" data-area="key">
        <div class="d-panel-body skel-stack">
          <span class="skel" style="width: 80px; height: 14px"></span>
          <span class="skel skel--block" style="height: 40px"></span>
          <span class="skel" style="width: 40%"></span>
        </div>
      </div>
      <!-- 连接区沿用真实布局类（两条地址宽屏并排、窄屏单列，curl 通栏在下）；骨架条加上下外边距补足文字行高 -->
      <div class="d-panel" data-area="conn">
        <div class="d-panel-head"><span class="skel" style="width: 140px; height: 14px"></span></div>
        <div class="d-panel-body">
          <div class="conn-grid">
            <div class="conn-row">
              <span class="skel" style="width: 88px; height: 12px; margin-block: 4px"></span>
              <span class="skel skel--block" style="height: 38px"></span>
            </div>
            <div class="conn-row">
              <span class="skel" style="width: 104px; height: 12px; margin-block: 4px"></span>
              <span class="skel skel--block" style="height: 38px"></span>
              <div class="skel-stack" style="padding-block: 5px">
                <span class="skel" style="width: 92%"></span>
                <span class="skel" style="width: 48%"></span>
              </div>
            </div>
          </div>
          <!-- curl 快速上手：代码窗 4 行 = 13px × 1.75 行高 + 上下内边距 38px + 边框 2px -->
          <div class="conn-curl">
            <span class="skel" style="width: 76px; height: 12px; margin-block: 2.5px"></span>
            <span class="skel" style="width: 64%; margin-block: 5px"></span>
            <span class="skel skel--block" style="height: 131px"></span>
          </div>
        </div>
      </div>
      <div class="d-panel" data-area="apps">
        <div class="d-panel-body skel-stack">
          <span class="skel" style="width: 120px; height: 14px"></span>
          <span class="skel" style="width: 66%"></span>
          <span class="skel skel--block" style="height: 56px"></span>
          <span class="skel skel--block" style="height: 56px"></span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="view-stack" aria-hidden="true">
    <span class="skel skel--on-bg" style="width: min(520px, 85%)"></span>
    <div class="plans-grid">
      <div v-for="width in [60, 66, 40]" :key="width" class="d-panel plan-card">
        <span class="skel" :style="{ width: `${width}%`, height: '16px' }"></span>
        <span class="skel-stack">
          <span class="skel" style="width: 30%"></span>
          <span class="skel" style="width: 60%; height: 20px"></span>
          <span class="skel" style="width: 80%"></span>
        </span>
        <span class="skel skel--pill" style="width: 130px; height: 38px"></span>
      </div>
    </div>
  </div>
</template>
