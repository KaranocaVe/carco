using System;
using System.Net;
using Microsoft.Extensions.Configuration;

namespace carco.Data
{
    public static class DbConfig
    {
        public static string GetNpgsqlConnectionString(IConfiguration configuration)
        {
            string? url = Environment.GetEnvironmentVariable("DATABASE_URL");
            if (!string.IsNullOrWhiteSpace(url))
            {
                string cs = ConvertDatabaseUrlToNpgsql(url);
                return AppendSearchPath(cs);
            }

            string? host = Environment.GetEnvironmentVariable("PGHOST");
            string port = Environment.GetEnvironmentVariable("PGPORT") ?? "5432";
            string? database = Environment.GetEnvironmentVariable("PGDATABASE");
            string? user = Environment.GetEnvironmentVariable("PGUSER");
            string? password = Environment.GetEnvironmentVariable("PGPASSWORD");
            if (!string.IsNullOrWhiteSpace(host) &&
                !string.IsNullOrWhiteSpace(database) &&
                !string.IsNullOrWhiteSpace(user) &&
                !string.IsNullOrWhiteSpace(password))
            {
                string cs = $"Host={host};Port={port};Database={database};Username={user};Password={password}";
                return AppendSearchPath(cs);
            }

            string? fromConfig = configuration.GetConnectionString("Carco");
            if (!string.IsNullOrWhiteSpace(fromConfig))
            {
                return AppendSearchPath(fromConfig);
            }

            throw new InvalidOperationException("Connection string not found. Provide DATABASE_URL or PG* envs or ConnectionStrings:Carco.");
        }

        private static string ConvertDatabaseUrlToNpgsql(string databaseUrl)
        {
            // Supports forms like: postgresql://user:pass@host:5432/db
            Uri uri = new(databaseUrl);
            string[] userInfo = uri.UserInfo.Split(':', 2);
            string username = WebUtility.UrlDecode(userInfo[0]);
            string password = userInfo.Length > 1 ? WebUtility.UrlDecode(userInfo[1]) : string.Empty;
            string host = uri.Host;
            int port = uri.IsDefaultPort ? 5432 : uri.Port;
            string database = uri.AbsolutePath.Trim('/');
            return $"Host={host};Port={port};Database={database};Username={username};Password={password}";
        }

        private static string AppendSearchPath(string connString)
        {
            // Ensure carco schema takes precedence and disable DISCARD for openGauss compatibility
            string result = connString;
            if (!result.Contains("SearchPath=", StringComparison.OrdinalIgnoreCase))
            {
                result += (result.EndsWith(";") ? string.Empty : ";") + "SearchPath=carco,public";
            }
            if (!result.Contains("No Reset On Close", StringComparison.OrdinalIgnoreCase))
            {
                result += (result.EndsWith(";") ? string.Empty : ";") + "No Reset On Close=true";
            }
            return result;
        }
    }
}
