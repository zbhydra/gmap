/**
 * Content script 统一入口（隔离 world）。
 *
 * manifest 只绑统一入口，站点业务下沉 sites/<site>/；当前唯一站点为 Maps。
 */

import { bootstrapMapsContent } from '@/sites/maps/content/bootstrap'

bootstrapMapsContent()
