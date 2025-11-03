# openGauss × EF Core/Npgsql 兼容说明

## 时间与时区
- API 入参统一按 UTC 处理：控制器层 `DateTime.SpecifyKind(value, Utc)`。
- 启用兼容开关：`AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true)`。
- 视图/表字段推荐使用 `date` 或 `timestamp without time zone`；跨库场景优先在应用层统一。

## 按月分组
- 避免 `make_date`/`date_trunc` 差异：在 LINQ 使用 `s.SaleDate.Year/Month` 分组，SQL 侧生成 `date_part`，内存侧再 `new DateTime(y,m,1)`。

## 原生 SQL 参数
- 避免 `({p} is null or col={p})` 形式导致 `$n` 类型未知。
- 动态构建 where 条件：非空才追加对应过滤，并使用 `FromSqlRaw(sql, params[])` 参数化。

## 模型映射（Keyless）
- 视图：`VSalesDetail`、`VDealerInventoryDwell`、`VTransmissionInstalls`。
- 基础表（查询用）：`BrandRow`、`ModelRow`、`ColorRow`、`SupplierRow`、`PartSpecRow`。
- 原生投影：`PriceSummary`（Keyless）。

## CORS/开发环境
- 开启 CORS：允许 `http://localhost:5173` 与 `http://127.0.0.1:5173`。
- HTTPS 重定向开发期可忽略警告或在 `launchSettings.json` 设置 `sslPort`。



