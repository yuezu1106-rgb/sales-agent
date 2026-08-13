# SEO 优化任务（P0 + P1）

> 状态：✅ 已完成
> 日期：2026-08-13

## 一、需求原文

> 如果要做搜索引擎优化，哪些还可以调整下？（用户确认后实施 P0+P1）

## 二、现状审计结论

已有基础：lang="zh-CN"、title/description、单 h1 + h2/h3 层级、语义化标签、纯静态无图片加载快。

缺失项：canonical、favicon、Open Graph、robots.txt、sitemap.xml、JSON-LD 结构化数据、关键词布局。

## 三、改动清单

| #   | 项目                      | 文件                 | 说明                                                               |
| :-- | :------------------------ | :------------------- | :----------------------------------------------------------------- |
| 1   | canonical                 | `index.html`         | 声明权威 URL `https://www.sales-agent.top/`，避免重复内容          |
| 2   | favicon                   | `favicon.svg` + head | SVG 图标（⚡ 绿色渐变），浏览器标签页不再空白                      |
| 3   | Open Graph + Twitter Card | `index.html`         | og:title/description/image/url/type + twitter:card，分享带卡片预览 |
| 4   | og:image 分享图           | `og-image.png`       | 1200×630 品牌分享图（Playwright 截图生成）                         |
| 5   | robots.txt + sitemap.xml  | 新增两个文件         | 搜索引擎抓取指引                                                   |
| 6   | JSON-LD 结构化数据        | `index.html`         | SoftwareApplication + FAQPage（7 条现成 FAQ），争取富摘要          |
| 7   | title/description 关键词  | `index.html`         | 补充「AI 获客软件」「B2B 获客工具」「外贸客户开发」等搜索词        |

## 四、验证记录

- [x] head 标签完整性检查：canonical / og:title / og:image / twitter:card / favicon / JSON-LD / FAQPage / keywords 全部 ✅（线上 HTML 逐项匹配）
- [x] JSON-LD 语法校验：PowerShell ConvertFrom-Json 解析通过，@graph 含 SoftwareApplication + FAQPage（7 条问答）
- [x] /robots.txt、/sitemap.xml 线上 200（text/plain、text/xml）
- [x] /favicon.svg、/og-image.png 线上 200（image/svg+xml、image/png，分享图 178KB）

### 实现细节

- og-image.png：用 tools/og-image.html 模板（1200×630 品牌视觉）经浏览器截图生成，改动品牌视觉时重新截图即可
- robots.txt：Allow /，Disallow /app/ 与 /api/（产品应用不收录），声明 sitemap 地址
- title 改为「拾客 Shike AI 智能获客助手 - AI 获客软件 | B2B 外贸客户开发工具」，description 补充 AI 获客软件/外贸客户开发/B2B 获客工具等搜索词

## 五、后续（P2，未实施）

- Nginx 静态资源缓存头、gzip 补 text/html
- 提交 Google Search Console / 百度站长平台
