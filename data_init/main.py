import argparse
import os
import random
import string
from calendar import monthrange
from datetime import date, timedelta

import psycopg
from dotenv import load_dotenv
from faker import Faker
from tqdm import tqdm


def get_env_or_default(key: str, default: str | None = None) -> str | None:
    val = os.getenv(key)
    return val if val not in (None, "") else default


def resolve_dsn(args) -> str | None:
    # Prefer DATABASE_URL; else use discrete PG* vars; else CLI --dsn
    dsn_env = get_env_or_default("DATABASE_URL")
    if dsn_env:
        return dsn_env
    host = get_env_or_default("PGHOST")
    user = get_env_or_default("PGUSER")
    password = get_env_or_default("PGPASSWORD")
    dbname = get_env_or_default("PGDATABASE")
    port = get_env_or_default("PGPORT", "5432")
    if host and user and password and dbname:
        return f"host={host} port={port} dbname={dbname} user={user} password={password}"
    if args.dsn:
        return args.dsn
    return None


def connect(dsn: str):
    conn = psycopg.connect(dsn)
    conn.autocommit = False
    with conn.cursor() as cur:
        cur.execute("SET search_path TO carco, public;")
        try:
            cur.execute("SET CURRENT_SCHEMA TO carco;")
        except Exception:
            pass
    return conn


def run_reset(conn):
    # 1) TRUNCATE 所有事实与维度表（兼容 OpenGauss：不使用 RESTART IDENTITY）
    try:
        with conn.cursor() as cur1:
            cur1.execute(
                """
                TRUNCATE TABLE
                  carco.sale,
                  carco.inventory_assignment,
                  carco.vehicle,
                  carco.transmission_unit,
                  carco.configuration,
                  carco.model_part_spec,
                  carco.supplier_part_spec,
                  carco.model,
                  carco.brand,
                  carco.color,
                  carco.supplier,
                  carco.part_spec,
                  carco.part_category,
                  carco.customer,
                  carco.dealer
                CASCADE
                """
            )
    except Exception:
        conn.rollback()
        conn.autocommit = True
        with conn.cursor() as c2:
            c2.execute("SET search_path TO carco, public;")
        conn.autocommit = False

    # 2) 重置 carco 架构下的所有序列（尽力而为）
    try:
        with conn.cursor() as cur3:
            cur3.execute(
                """
                SELECT sequence_schema, sequence_name
                FROM information_schema.sequences
                WHERE sequence_schema = 'carco'
                """
            )
            for schema, name in cur3.fetchall():
                cur3.execute(f"ALTER SEQUENCE {schema}.{name} RESTART WITH 1;")
    except Exception:
        # 序列不存在或权限不足时忽略
        pass
    # 确保 reset 阶段完成并退出潜在异常事务状态
    try:
        conn.commit()
    except Exception:
        conn.rollback()


def insert_one(cur, sql: str, args: tuple) -> int:
    cur.execute(sql, args)
    return cur.fetchone()[0]


def fetch_scalar(cur, sql: str, args: tuple) -> int | None:
    cur.execute(sql, args)
    row = cur.fetchone()
    return None if row is None else row[0]


def upsert_brand(cur, name: str) -> int:
    existing = fetch_scalar(cur, "SELECT brand_id FROM carco.brand WHERE name=%s", (name,))
    if existing:
        return existing
    return insert_one(cur, "INSERT INTO carco.brand(name) VALUES (%s) RETURNING brand_id", (name,))


def upsert_model(cur, brand_id: int, name: str) -> int:
    existing = fetch_scalar(cur, "SELECT model_id FROM carco.model WHERE brand_id=%s AND name=%s", (brand_id, name))
    if existing:
        return existing
    return insert_one(cur, "INSERT INTO carco.model(brand_id, name) VALUES (%s, %s) RETURNING model_id", (brand_id, name))


def upsert_color(cur, name: str) -> int:
    existing = fetch_scalar(cur, "SELECT color_id FROM carco.color WHERE name=%s", (name,))
    if existing:
        return existing
    return insert_one(cur, "INSERT INTO carco.color(name) VALUES (%s) RETURNING color_id", (name,))


def upsert_part_category(cur, name: str) -> int:
    existing = fetch_scalar(cur, "SELECT category_id FROM carco.part_category WHERE name=%s", (name,))
    if existing:
        return existing
    return insert_one(cur, "INSERT INTO carco.part_category(name) VALUES (%s) RETURNING category_id", (name,))


def upsert_part_spec(cur, category_id: int, name: str, spec_code: str) -> int:
    existing = fetch_scalar(cur, "SELECT part_spec_id FROM carco.part_spec WHERE spec_code=%s", (spec_code,))
    if existing:
        return existing
    return insert_one(
        cur,
        "INSERT INTO carco.part_spec(category_id, name, spec_code) VALUES (%s, %s, %s) RETURNING part_spec_id",
        (category_id, name, spec_code),
    )


def upsert_supplier(cur, name: str) -> int:
    existing = fetch_scalar(cur, "SELECT supplier_id FROM carco.supplier WHERE name=%s", (name,))
    if existing:
        return existing
    return insert_one(cur, "INSERT INTO carco.supplier(name) VALUES (%s) RETURNING supplier_id", (name,))


def ensure_mapping(cur, table: str, a_col: str, b_col: str, a_id: int, b_id: int):
    cur.execute(f"SELECT 1 FROM carco.{table} WHERE {a_col}=%s AND {b_col}=%s", (a_id, b_id))
    if cur.fetchone() is None:
        cur.execute(f"INSERT INTO carco.{table}({a_col}, {b_col}) VALUES (%s, %s)", (a_id, b_id))


def insert_configuration(cur, model_id: int, engine_displacement: float, transmission_spec_id: int) -> int:
    return insert_one(
        cur,
        """
        INSERT INTO carco.configuration(model_id, engine_displacement, transmission_spec_id)
        VALUES (%s, %s, %s)
        RETURNING config_id
        """,
        (model_id, engine_displacement, transmission_spec_id),
    )


def insert_transmission_unit(cur, part_spec_id: int, supplier_id: int, serial_number: str, production_date: date) -> int:
    existing = fetch_scalar(cur, "SELECT transmission_unit_id FROM carco.transmission_unit WHERE serial_number=%s", (serial_number,))
    if existing:
        return existing
    return insert_one(
        cur,
        "INSERT INTO carco.transmission_unit(part_spec_id, supplier_id, serial_number, production_date) VALUES (%s, %s, %s, %s) RETURNING transmission_unit_id",
        (part_spec_id, supplier_id, serial_number, production_date),
    )


def insert_vehicle(cur, vin: str, model_id: int, config_id: int, color_id: int, transmission_unit_id: int, manufacture_date: date) -> int:
    return insert_one(
        cur,
        """
        INSERT INTO carco.vehicle(vin, model_id, config_id, color_id, transmission_unit_id, manufacture_date)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING vehicle_id
        """,
        (vin, model_id, config_id, color_id, transmission_unit_id, manufacture_date),
    )


def insert_dealer(cur, name: str, city: str, province: str) -> int:
    existing = fetch_scalar(cur, "SELECT dealer_id FROM carco.dealer WHERE name=%s", (name,))
    if existing:
        return existing
    return insert_one(cur, "INSERT INTO carco.dealer(name, city, province) VALUES (%s, %s, %s) RETURNING dealer_id", (name, city, province))


def insert_inventory(cur, vehicle_id: int, dealer_id: int, received_at: date):
    cur.execute("SELECT 1 FROM carco.inventory_assignment WHERE vehicle_id=%s", (vehicle_id,))
    if cur.fetchone() is None:
        cur.execute("INSERT INTO carco.inventory_assignment(vehicle_id, dealer_id, received_at) VALUES (%s, %s, %s)", (vehicle_id, dealer_id, received_at))
    else:
        cur.execute("UPDATE carco.inventory_assignment SET dealer_id=%s, received_at=%s WHERE vehicle_id=%s", (dealer_id, received_at, vehicle_id))


def insert_customer(cur, name: str, gender: str, income: float, city: str | None) -> int:
    return insert_one(
        cur,
        """
        INSERT INTO carco.customer(name, gender, income, city)
        VALUES (%s, %s, %s, %s)
        RETURNING customer_id
        """,
        (name, gender, income, city),
    )


def insert_sale(cur, vehicle_id: int, dealer_id: int, customer_id: int, sale_date: date, sale_price: float):
    cur.execute("SELECT 1 FROM carco.sale WHERE vehicle_id=%s", (vehicle_id,))
    if cur.fetchone() is None:
        cur.execute(
            "INSERT INTO carco.sale(vehicle_id, dealer_id, customer_id, sale_date, sale_price) VALUES (%s, %s, %s, %s, %s)",
            (vehicle_id, dealer_id, customer_id, sale_date, sale_price),
        )
    else:
        cur.execute(
            "UPDATE carco.sale SET dealer_id=%s, customer_id=%s, sale_date=%s, sale_price=%s WHERE vehicle_id=%s",
            (dealer_id, customer_id, sale_date, sale_price, vehicle_id),
        )


def gen_vin() -> str:
    # Simple VIN-like generator (17 chars, uppercase letters/digits, avoiding I/O/Q)
    alphabet = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"
    return "".join(random.choice(alphabet) for _ in range(17))


def _last_day_of_month(y: int, m: int) -> int:
    return monthrange(y, m)[1]


def _choose_sale_date(received_at: date, model_name: str, speed_factor: float) -> date:
    # 在收车后 1~150 天内，根据月份权重与车型偏好挑选日期
    # 月度权重：金九银十与年末提升，春节前后低迷
    base_weights = {1: 0.8, 2: 0.7, 3: 1.0, 4: 1.1, 5: 1.2, 6: 1.3, 7: 1.0, 8: 0.9, 9: 1.5, 10: 1.4, 11: 1.1, 12: 1.3}
    # 车型特殊加成：示例将哈弗H4在 2024-06 强化
    special_boost = {}
    special_boost_key = (2024, 6, "哈弗H4")
    special_boost[special_boost_key] = 2.5

    # 速度因子影响平均交付周期（<1 更快，>1 更慢）
    min_days, max_days = 1, 150
    base_delay = max(1, int(random.triangular(5, 120, 35) * speed_factor))
    base_delay = min(max_days, max(min_days, base_delay))
    candidate_start = received_at + timedelta(days=1)
    candidate_end = min(received_at + timedelta(days=max_days), date(2025, 12, 31))

    # 构建月份候选集合（收车月起向后 5 个月）
    months = []
    cur_y, cur_m = candidate_start.year, candidate_start.month
    for i in range(6):
        y = cur_y + (cur_m - 1 + i) // 12
        m = (cur_m - 1 + i) % 12 + 1
        w = base_weights.get(m, 1.0)
        if (y, m, model_name) in special_boost:
            w *= special_boost[(y, m, model_name)]
        months.append(((y, m), w))

    # 选择月份
    total_w = sum(w for _, w in months)
    r = random.random() * total_w
    chosen_y, chosen_m = months[0][0]
    acc = 0.0
    for (y, m), w in months:
        acc += w
        if r <= acc:
            chosen_y, chosen_m = y, m
            break

    # 在所选月份挑随机日
    last_dom = _last_day_of_month(chosen_y, chosen_m)
    day = random.randint(1, last_dom)
    sale_dt = date(chosen_y, chosen_m, day)
    # 保障在收车之后
    if sale_dt <= candidate_start:
        sale_dt = candidate_start + timedelta(days=base_delay)
    # 保障不超过上限
    if sale_dt > candidate_end:
        sale_dt = candidate_end
    return sale_dt


def main():
    load_dotenv()
    parser = argparse.ArgumentParser(description="CarCo data initializer (OpenGauss/PG)")
    parser.add_argument("--dsn", help="PostgreSQL DSN, e.g. postgresql://user:pass@host:5432/db", default=None)
    parser.add_argument("--reset", action="store_true", help="TRUNCATE all carco tables before loading")
    parser.add_argument("--yes", action="store_true", help="Auto-confirm destructive actions (used with --reset)")
    parser.add_argument("--vehicles", type=int, default=int(get_env_or_default("NUM_VEHICLES", "1200")), help="要生成的车辆数量")
    parser.add_argument("--customers", type=int, default=int(get_env_or_default("NUM_CUSTOMERS", "600")), help="要生成的客户数量")
    args = parser.parse_args()

    dsn = resolve_dsn(args)
    if not dsn:
        raise SystemExit("DATABASE_URL or PG* envs or --dsn must be provided. For @ in password, use URL encoding: %40")

    conn = connect(dsn)
    fake = Faker("zh_CN")
    try:
        if args.reset:
            if not args.yes:
                raise SystemExit("Refusing to reset without --yes")
            run_reset(conn)

        with conn.cursor() as cur:
            # Part categories
            cat_trans = upsert_part_category(cur, "Transmission")

            # Suppliers
            supplier_aisin = upsert_supplier(cur, "爱信")
            supplier_zf = upsert_supplier(cur, "采埃孚")
            supplier_getrag = upsert_supplier(cur, "格特拉克")

            # Part specs (Transmissions)
            spec_aisin_6at = upsert_part_spec(cur, cat_trans, "爱信6AT", "AISIN_6AT")
            spec_aisin_8at = upsert_part_spec(cur, cat_trans, "爱信8AT", "AISIN_8AT")
            spec_zf_8hp = upsert_part_spec(cur, cat_trans, "ZF 8HP", "ZF_8HP")
            spec_getrag_7dct = upsert_part_spec(cur, cat_trans, "格特拉克7DCT", "GETRAG_7DCT")

            # Supplier -> spec mappings
            ensure_mapping(cur, "supplier_part_spec", "supplier_id", "part_spec_id", supplier_aisin, spec_aisin_6at)
            ensure_mapping(cur, "supplier_part_spec", "supplier_id", "part_spec_id", supplier_aisin, spec_aisin_8at)
            ensure_mapping(cur, "supplier_part_spec", "supplier_id", "part_spec_id", supplier_zf, spec_zf_8hp)
            ensure_mapping(cur, "supplier_part_spec", "supplier_id", "part_spec_id", supplier_getrag, spec_getrag_7dct)

            # 品牌与车型（含基础售价：万元）
            brands_models = [
                ("比亚迪", {
                    "宋Pro": ("GETRAG_7DCT", 13.98),
                    "秦PLUS": ("GETRAG_7DCT", 12.98),
                    "唐DM-i": ("GETRAG_7DCT", 25.98),
                }),
                ("长城", {
                    "哈弗H4": ("AISIN_6AT", 10.98),
                    "哈弗H6": ("AISIN_6AT", 12.98),
                    "坦克300": ("ZF_8HP", 25.98),
                }),
                ("吉利", {
                    "博越": ("AISIN_6AT", 12.58),
                    "星瑞": ("AISIN_8AT", 14.58),
                }),
                ("奇瑞", {
                    "瑞虎8": ("GETRAG_7DCT", 12.28),
                    "艾瑞泽8": ("GETRAG_7DCT", 12.08),
                }),
                ("长安", {
                    "CS75 PLUS": ("AISIN_8AT", 13.58),
                    "UNI-K": ("AISIN_8AT", 17.58),
                }),
                ("上汽荣威", {
                    "RX5": ("AISIN_6AT", 12.98),
                    "i5": ("GETRAG_7DCT", 8.98),
                }),
                ("广汽传祺", {
                    "GS4": ("GETRAG_7DCT", 11.98),
                    "GS8": ("AISIN_8AT", 22.98),
                }),
            ]

            spec_code_to_id = {
                "AISIN_6AT": spec_aisin_6at,
                "AISIN_8AT": spec_aisin_8at,
                "ZF_8HP": spec_zf_8hp,
                "GETRAG_7DCT": spec_getrag_7dct,
            }

            model_map: dict[int, int] = {}
            model_price_base: dict[int, float] = {}
            brand_sell_mult: dict[int, float] = {}
            for brand_name, models in brands_models:
                b_id = upsert_brand(cur, brand_name)
                # 销售倾向（比亚迪略高，奇瑞略低，示例）
                brand_sell_mult[b_id] = {
                    "比亚迪": 1.15,
                    "长城": 1.05,
                    "吉利": 1.05,
                    "奇瑞": 0.95,
                    "长安": 1.05,
                    "上汽荣威": 0.98,
                    "广汽传祺": 1.00,
                }.get(brand_name, 1.0)
                for model_name, (spec_code, price_wan) in models.items():
                    m_id = upsert_model(cur, b_id, model_name)
                    model_map[m_id] = spec_code_to_id[spec_code]
                    model_price_base[m_id] = float(price_wan * 10000)

            # Ensure model required part specs mapping
            for model_id, spec_id in model_map.items():
                ensure_mapping(cur, "model_part_spec", "model_id", "part_spec_id", model_id, spec_id)

            # 颜色更丰富
            color_names = ["白", "黑", "银", "红", "蓝", "灰", "橙", "绿", "棕", "珍珠白", "钛金灰"]
            color_ids = [upsert_color(cur, c) for c in color_names]

            # Configurations per model (two engine displacements)
            configs_per_model = {}
            for model_id, spec_id in model_map.items():
                cfg15 = insert_configuration(cur, model_id, 1.5, spec_id)
                cfg20 = insert_configuration(cur, model_id, 2.0, spec_id)
                configs_per_model[model_id] = [cfg15, cfg20]

            # 经销商更丰富 + 销售速度偏差（<1 更快、>1 更慢）
            dealer_infos = [
                ("北京国贸店", "北京", "北京", 1.00),
                ("北京望京店", "北京", "北京", 1.05),
                ("上海浦东店", "上海", "上海", 0.85),
                ("上海徐汇店", "上海", "上海", 0.95),
                ("广州天河店", "广州", "广东", 0.95),
                ("深圳南山店", "深圳", "广东", 0.90),
                ("杭州滨江店", "杭州", "浙江", 0.98),
                ("南京新街口店", "南京", "江苏", 1.00),
                ("成都高新店", "成都", "四川", 1.05),
                ("重庆渝北店", "重庆", "重庆", 1.20),
                ("武汉光谷店", "武汉", "湖北", 1.05),
                ("西安高新店", "西安", "陕西", 1.00),
            ]
            dealer_ids = []
            dealer_speed: dict[int, float] = {}
            for name, city, province, speed in dealer_infos:
                d_id = insert_dealer(cur, name, city, province)
                dealer_ids.append(d_id)
                dealer_speed[d_id] = speed

            # 客户（中文进度）
            customer_ids = []
            genders = ["M", "F"]
            # 收入区间（万元/年）加权
            income_buckets = [6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 80]
            income_weights = [2, 5, 8, 10, 10, 8, 6, 4, 3, 2, 1]
            for _ in tqdm(range(args.customers), desc="客户"):
                name = fake.name()
                gender = random.choices(genders, weights=[55, 45], k=1)[0]
                income = float(random.choices(income_buckets, weights=income_weights, k=1)[0] * 10000)
                city = random.choice(["北京", "上海", "广州", "深圳", "成都", "重庆", "杭州", "武汉", "南京", "西安", "合肥", "青岛"]) 
                customer_ids.append(insert_customer(cur, name, gender, income, city))

            # Transmission units pool per part_spec and supplier
            # strategy: generate a large pool ahead of vehicles. For Aisin, bias production dates to 2024-05..2024-08 as needed.
            units_by_spec: dict[int, list[int]] = {sid: [] for sid in set(model_map.values())}

            def gen_serial(prefix: str) -> str:
                return f"{prefix}-" + "".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))

            spec_to_supplier = {
                spec_aisin_6at: supplier_aisin,
                spec_aisin_8at: supplier_aisin,
                spec_zf_8hp: supplier_zf,
                spec_getrag_7dct: supplier_getrag,
            }

            total_units = int(args.vehicles * 1.3)
            for spec_id in units_by_spec.keys():
                # 爱信产量略高，确保有足够召回区间样本
                base = max(50, total_units // len(units_by_spec))
                if spec_id in (spec_aisin_6at, spec_aisin_8at):
                    count = int(base * 1.3)
                else:
                    count = base
                sup_id = spec_to_supplier[spec_id]
                for _ in tqdm(range(count), desc=f"变速器单元{spec_id}"):
                    if sup_id == supplier_aisin and random.random() < 0.65:
                        prod_date = date(2024, 5, 1) + timedelta(days=random.randint(0, 122))  # to 2024-08-31
                    else:
                        # spread 2023-01-01 .. 2025-10-31
                        start = date(2023, 1, 1)
                        prod_date = start + timedelta(days=random.randint(0, (date(2025, 10, 31) - start).days))
                    serial = gen_serial({
                        spec_aisin_6at: "AIS6AT",
                        spec_aisin_8at: "AIS8AT",
                        spec_zf_8hp: "ZF8HP",
                        spec_getrag_7dct: "GET7DCT",
                    }[spec_id])
                    tu_id = insert_transmission_unit(cur, spec_id, sup_id, serial, prod_date)
                    if tu_id:
                        units_by_spec[spec_id].append(tu_id)

            # 车型销售倾向
            model_sell_boost_name = {
                "哈弗H4": 1.6,
                "哈弗H6": 1.2,
                "坦克300": 0.8,
                "GS8": 0.85,
                "唐DM-i": 0.9,
            }

            # 车辆 + 入库 + 销售（中文进度）
            vehicle_ids = []
            sold_flags = []
            for _ in tqdm(range(args.vehicles), desc="车辆"):
                model_id = random.choice(list(configs_per_model.keys()))
                config_id = random.choice(configs_per_model[model_id])
                # config -> transmission spec id
                cur.execute("SELECT transmission_spec_id FROM carco.configuration WHERE config_id = %s", (config_id,))
                spec_id = cur.fetchone()[0]
                # choose a matching unit
                unit_pool = units_by_spec.get(spec_id, [])
                if not unit_pool:
                    # fallback: generate one now
                    sup_id = spec_to_supplier[spec_id]
                    serial = gen_serial("ADHOC")
                    prod_date = date(2024, 1, 1) + timedelta(days=random.randint(0, 300))
                    tu_id = insert_transmission_unit(cur, spec_id, sup_id, serial, prod_date)
                else:
                    tu_id = unit_pool.pop()

                vin = gen_vin()
                color_id = random.choice(color_ids)
                mdate = date(2023, 1, 1) + timedelta(days=random.randint(0, (date(2025, 10, 31) - date(2023, 1, 1)).days))
                vid = insert_vehicle(cur, vin, model_id, config_id, color_id, tu_id, mdate)
                vehicle_ids.append(vid)

                dealer_id = random.choice(dealer_ids)
                received_at = mdate + timedelta(days=random.randint(0, 30))
                insert_inventory(cur, vid, dealer_id, received_at)

                # 销售概率：基础0.75 × 品牌倾向 × 车型倾向
                # 获取品牌倾向
                cur.execute("SELECT m.brand_id, m.name FROM carco.model m WHERE m.model_id = %s", (model_id,))
                b_id, m_name = cur.fetchone()
                brand_mult = brand_sell_mult.get(b_id, 1.0)
                model_mult = model_sell_boost_name.get(m_name, 1.0)
                sold_prob = min(0.95, 0.75 * brand_mult * model_mult)
                sold = random.random() < sold_prob
                sold_flags.append(sold)
                if sold:
                    cust_id = random.choice(customer_ids)
                    # 按经销商速度和月份权重生成售出日期
                    speed_factor = dealer_speed.get(dealer_id, 1.0)
                    sale_date = _choose_sale_date(received_at, m_name, speed_factor)
                    # 售价：以车型基准价上下浮动（±10%），少量高配（+20%）
                    base_price = model_price_base.get(model_id, 120000.0)
                    price = base_price * random.uniform(0.9, 1.1)
                    if random.random() < 0.15:
                        price *= 1.2
                    sale_price = float(round(price / 100.0) * 100)
                    insert_sale(cur, vid, dealer_id, cust_id, sale_date, sale_price)

        conn.commit()
        print("数据初始化完成。")
    except Exception as e:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()


