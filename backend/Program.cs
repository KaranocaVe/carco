using carco.Data;
using carco.Services;
using Microsoft.EntityFrameworkCore;

namespace carco
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Npgsql timestamp behavior compatibility (treat unspecified DateTime more leniently)
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddAuthorization();
            builder.Services.AddControllers();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });

            // DbContext
            string connString = DbConfig.GetNpgsqlConnectionString(builder.Configuration);
            builder.Services.AddDbContext<CarcoContext>(options => options.UseNpgsql(connString));

            // Application services
            builder.Services.AddScoped<AnalyticsService>();
            builder.Services.AddScoped<RecallService>();
            builder.Services.AddScoped<CatalogService>();
            builder.Services.AddScoped<InventoryService>();

            // OpenAPI
            builder.Services.AddOpenApi();

            WebApplication app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowFrontend");

            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}
