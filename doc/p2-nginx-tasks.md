# P2 服务器层优化任务（Nginx 缓存 + gzip）

> 状态：✅ 已完成
> 日期：2026-08-14

## 一、需求原文

> 做 2 p2 服务器层（SEO 任务清单中的 P2 项：Nginx 静态资源缓存头、gzip 补 text/html）

## 二、服务器现状勘察（2026-08-14）

- 线上配置 `/etc/nginx/sites-enabled/sales-agent` 已升级为 HTTPS 版（2026-08-10，腾讯云证书）：
  - ✅ HTTP 80 → 301 跳转 HTTPS（P2 第 9 项已完成，无需再做）
  - ✅ TLS 1.2/1.3 + http2 + SSL session cache
  - ⚠️ gzip_types 缺 `text/html`（实际 nginx 默认总是 gzip text/html，但显式声明更稳）
  - ❌ 静态资源无 Cache-Control（css/js/svg/png 每次全量拉取）
- 本地 `deploy/nginx-sales-agent.conf` 还是旧的 HTTP-only 版本，需同步

## 三、改动清单

| #   | 项目                  | 说明                                                                                      |
| :-- | :-------------------- | :---------------------------------------------------------------------------------------- |
| 1   | gzip 补全             | gzip_types 加 text/html、text/plain、application/xml；加 gzip_min_length                  |
| 2   | 静态资源缓存头        | css/js/svg/png 等带指纹less 资源 Cache-Control 7 天（文件名无 hash，不能 immutable/太长） |
| 3   | index.html 不缓存     | no-cache，保证每次拿到最新 HTML（入口文件）                                               |
| 4   | 同步本地 deploy/ 配置 | 把线上 HTTPS 版配置回写 deploy/nginx-sales-agent.conf，保持仓库与线上一致                 |

## 四、验证记录

- [x] nginx -t 通过 + reload（RELOAD_OK；坑：备份文件不能放 sites-enabled/ 内，会被当配置加载导致 duplicate default server，已移至 /etc/nginx/backups/）
- [x] curl 验证 css/js 响应头含 Cache-Control: max-age=3600（expires 1h 自动生成，第一版 expires+add_header 双写导致重复头，已修正为只用 expires）
- [x] curl 验证 index.html 为 no-cache
- [x] curl 验证 gzip 生效：HTML 7079B / CSS 3812B / JS 1793B 均 Content-Encoding: gzip
- [x] HTTP→HTTPS 301 跳转正常（Location: https://www.sales-agent.top/）
- [x] /app/login 200、/api/health 200（产品前后端代理不受影响）
- [x] 浏览器 DOM 测量：1280px 视口无水平溢出、无元素越界、favicon 正常加载
