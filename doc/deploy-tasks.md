# 宣传网站部署任务清单（43.153.229.106:80）

> 状态：✅ 已完成
> 日期：2026-08-09

## 一、需求原文

> 能否部署到 43.153.229.106 服务器中？端口还是 80？能否用虚拟服务器的配置来做？

## 二、服务器现状（已勘察）

- Ubuntu 24.04 LTS，SSH 用户 `ubuntu`（密钥 `~/.ssh/id_ed25519`），sudo 免密
- 80 端口被 `aic-frontend`（ai-customer 产品前端）占用；产品后端 8080、DB 5433
- 部署目录 `/home/ubuntu/ai-customer-deploy/`（compose：db/backend/frontend，frontend 源码齐全可重建）
- 前端 API 请求用绝对路径 `/api${path}`，挪子路径不受影响

## 三、方案（方案 A：宣传站占根路径 + Nginx 虚拟主机）

| 路径                         | 指向                                                       |
| :--------------------------- | :--------------------------------------------------------- |
| `http://43.153.229.106/`     | 宣传网站（Nginx 静态，/var/www/sales-agent）               |
| `http://43.153.229.106/app/` | 产品前端（aic-frontend 改映射 127.0.0.1:8081，Nginx 反代） |
| `http://43.153.229.106/api/` | 产品后端（Nginx 反代 127.0.0.1:8080，保持前端 fetch 兼容） |

### 改动清单

1. ✅ 服务器安装 nginx（1.24.0）
2. ✅ 上传宣传站文件 → `/var/www/sales-agent/`
3. ✅ 前端改子路径：`vite.config.ts` 加 `base: "/app/"`；`main.tsx` 加 `basename="/app"`
4. ✅ `docker-compose.yml`：frontend ports `80:80` → `127.0.0.1:8081:80`
5. ✅ 重建前端镜像 + recreate（`--no-deps` 避免 backend 构建失败）
6. ✅ Nginx site 配置（根路径宣传站 + /app/ 反代 + /api/ 反代）
7. ✅ 验证：`/` 宣传页、`/app/` 产品前端、`/api/health` 后端

### 部署中踩坑与修复

- **sed 转义被 PowerShell 破坏**：改用本地写脚本 → scp 上传 → 服务器执行；vite.config.ts 被弄坏后直接用本地干净文件覆盖
- **docker 权限**：需 `sudo docker compose`
- **compose up 触发 backend 构建失败**（backend 源码目录不存在）：`--no-build --no-deps` 只重建 frontend
- **前端容器 nginx 报 `host not found in upstream "backend"`**：`--no-deps` 重建后容器只在 deploy_default 网络，`docker network connect ai-customer_default aic-frontend` 接入 backend 所在网络后恢复
- **/app/ 下 JS 资源 404（MIME text/html）**：外层 nginx `proxy_pass` 加尾斜杠 `http://127.0.0.1:8081/` 剥离 `/app/` 前缀
- **已知遗留**：产品前端 `client.ts` 401 硬跳转 `window.location.href = "/login"`（不带 /app 前缀），未登录访问 /app/ 会被跳到宣传页；试用入口统一用 `/app/login` 直达登录页规避

### 宣传页迭代（用户要求）

- ✅ 试用登录入口 `/app/login` 加入页面：导航栏「免费试用」、Hero「立即免费试用」、底部 CTA「🚀 免费试用」、Footer「登录试用」
- ✅ 移除「访问产品仓库」按钮（CTA 区）

## 四、验证记录

- [x] curl / 返回宣传页 HTML（200）
- [x] curl /app/ 返回产品前端 HTML（200，资源路径正常）
- [x] curl /api/health 返回 200
- [x] 浏览器 DOM 测量宣传页无溢出（809px 桌面 / 390px 移动端均无水平溢出）
- [x] 宣传页「立即免费试用」点击 → `/app/login` 登录页正常渲染（用户名/密码/登录按钮齐全）

## 五、回滚方案

- compose ports 改回 `80:80` + recreate frontend；停用 nginx site 即可恢复原状
