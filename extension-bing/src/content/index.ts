/**
 * Content script 统一入口（隔离 world）。
 *
 * manifest 只绑统一入口，站点业务下沉 sites/<site>/。
 * 当前仅 Bing Maps 一站：boot = 配置加载 → 采集状态机 → 面板挂载（016 U3）。
 */

import { bootBingSite } from '@/sites/bing/content/bootstrap'

void bootBingSite()
