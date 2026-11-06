import request from "./request";

export type Plugin = "maps" | "bing";

export interface PluginVersion {
  id: number;
  plugin: Plugin;
  version: string;
  is_enabled: boolean;
  update_url: string;
  created_at: number;
  updated_at: number;
  is_recommended: boolean;
}

export interface PluginVersionCreate {
  plugin: Plugin;
  version: string;
  is_enabled: boolean;
  update_url: string;
}

export interface PluginVersionsParams {
  plugin?: Plugin;
  page: number;
  page_size: number;
}

interface PluginVersionsPage {
  rows: PluginVersion[];
  total: number;
  page: number;
  page_size: number;
}

export function getPluginVersions(params: PluginVersionsParams) {
  return request.get<never, PluginVersionsPage>("/plugin-versions", { params });
}

export function createPluginVersion(data: PluginVersionCreate) {
  return request.post<never, PluginVersion>("/plugin-versions", data);
}

export function updatePluginVersion(
  id: number,
  data: { update_url?: string; is_enabled?: boolean },
) {
  return request.post<never, PluginVersion>(`/plugin-versions/${id}`, data);
}
