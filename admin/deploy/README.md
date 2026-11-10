# Admin 部署

生产参数由 [production.conf.example](production.conf.example) 对应的本地 `production.conf` 提供；该实际文件不入 Git。

```bash
cp admin/deploy/production.conf.example admin/deploy/production.conf
chmod 600 admin/deploy/production.conf
pnpm --dir admin build
bash admin/deploy/deploy.sh --render-nginx
```

`pnpm build` 从文件的 `ADMIN_API_BASE_URL` 编译后端地址，不读取同名进程变量、`VITE_API_BASE_URL` 或 `.env.production`。SSH 私钥路径为空时使用 SSH 的默认认证选择。生产发布前填写实际存在且覆盖 Admin 域名的 TLS 证书与私钥路径；缺少证书时部署预检失败。仅渲染配置时允许证书为空，输出候选只含 HTTP 监听。

配置就绪后运行 `bash admin/deploy/deploy.sh`，本地构建、上传静态产物并发布；远端不需要 Node.js。

测试部署保留显式文件入口：复制 [.env.example](.env.example) 为 `.env.test` 后运行 `bash admin/deploy/deploy.sh admin/deploy/.env.test`。该入口以 `--mode test` 构建并使用测试文件的 API 地址。
