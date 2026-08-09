#!/bin/bash
# 方案 A：产品前端改子路径 /app/ 的三处配置修复
set -e
cd ~/ai-customer-deploy

# 1. 修复 vite.config.ts（先清理可能被破坏的行，再插入正确的 base）
sed -i '/base:/d' frontend/vite.config.ts
sed -i 's/^export default defineConfig({$/export default defineConfig({\n  base: "\/app\/",/' frontend/vite.config.ts

# 2. main.tsx：BrowserRouter 加 basename（幂等）
if ! grep -q 'basename=' frontend/src/main.tsx; then
  sed -i 's|<BrowserRouter>|<BrowserRouter basename="/app">|' frontend/src/main.tsx
fi

# 3. docker-compose.yml：frontend 端口 80:80 → 127.0.0.1:8081:80（幂等）
if ! grep -q '127.0.0.1:8081:80' docker-compose.yml; then
  sed -i 's|- "80:80"|- "127.0.0.1:8081:80"|' docker-compose.yml
fi

echo "=== VITE ==="
cat frontend/vite.config.ts
echo "=== MAIN (BrowserRouter) ==="
grep -n 'BrowserRouter' frontend/src/main.tsx
echo "=== COMPOSE (ports) ==="
grep -n '8081\|80:80' docker-compose.yml
