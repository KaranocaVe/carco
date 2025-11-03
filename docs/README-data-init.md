### 数据初始化（Python）

准备：
- 复制 `env.example` 为 `.env` 并设置连接串（注意密码中的 `@` 需写成 `%40`）。
- 或者使用 `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD` 环境变量。

安装与使用：
```bash
cd /Users/karanocave/Code/uestc-database
bash scripts/setup_venv.sh
source .venv/bin/activate

# 重置并加载（会 TRUNCATE carco.*）
python -m data_init.main --reset --yes

# 或仅增量写入（不清空表）
python -m data_init.main

# 自定义规模
python -m data_init.main --vehicles 400 --customers 200
```

连接示例：
```env
DATABASE_URL=postgresql://gaussdb:Secretpassword%40123@127.0.0.1:5432/postgres
```

说明：
- 本脚本只写入数据，不变更 DDL；假设已执行 `sql/init.sql`。
- 数据覆盖 2023–2025，含品牌/车型/配置/颜色/供应商/规格、车辆与入库、客户与销售。
- 生成部分“爱信”变速器生产于 2024-05~08 用于缺陷追溯查询验证。

