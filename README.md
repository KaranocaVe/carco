# CarCo 汽车数据平台

一个端到端的汽车数据分析与展示系统，包含数据库模式、数据生成脚本、后端 API 与前端仪表盘。

## 项目亮点
- 销售趋势、品牌/车型 Top、价格摘要
- 经销商库存老化与未售清单
- 变速器召回命中与按车型聚合
- 目录查询：品牌 / 车型 / 颜色 / 供应商 / 变速器

## 技术栈
- 数据库：OpenGauss / PostgreSQL（视图、触发器、索引；`sql/init.sql`）
- 后端：ASP.NET Core Web API、EF Core、Npgsql（`backend/`）
- 前端：React + Vite + TypeScript + MUI + React Query + ECharts（`frontend/`）
- 数据生成：Python、Faker、psycopg（`data_init/`）

## 快速开始
- 一键启动（需 Docker & Compose）：`docker-compose up -d --build`
- 前端（开发）：`cd frontend && npm install && npm run dev` → `http://localhost:5173`
- 后端（开发）：`cd backend && dotnet run` → 默认 `http://127.0.0.1:5175`
- 数据库与数据：
  - 初始化：`psql -f sql/init.sql`（或通过 Compose 自动执行）
  - 灌数：`pip install -r requirements.txt && python data_init/main.py --yes`

---
Automotive data analytics • OpenGauss/PostgreSQL schema • ASP.NET Core Web API • React dashboard