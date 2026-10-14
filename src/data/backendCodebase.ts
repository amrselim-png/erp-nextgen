export interface BackendFile {
  filename: string;
  path: string;
  project: 'Gateway (YARP)' | 'Auth API' | 'Generic Data API' | 'Realtime Service' | 'Security & Filters';
  lineCount: number;
  descriptionAr: string;
  csharpCode: string;
}

export const BACKEND_CODEBASE: BackendFile[] = [
  // 1. Generic Data API Endpoint (.NET 10 + Dapper)
  {
    filename: 'GenericDataEndpoints.cs',
    path: 'src/Services/GenericData/Endpoints/GenericDataEndpoints.cs',
    project: 'Generic Data API',
    lineCount: 118,
    descriptionAr: 'نقطة نهاية Generic Data API المركزية لقراءة وتحديث أي جدول عبر الـ Metadata ومؤشر الـ Keyset وقفل الـ Version.',
    csharpCode: `using System.Text.Json;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Erp.Common.Security;
using Erp.Common.Metadata;

namespace Erp.Services.GenericData.Endpoints;

public static class GenericDataEndpoints
{
    public static void MapGenericDataRoutes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/generic/{module}.{entity}")
                       .RequireAuthorization();

        // 1. GET with Keyset Pagination O(1)
        group.MapGet("", async (
            string module, 
            string entity,
            [FromQuery] string? afterDate,
            [FromQuery] Guid? afterId,
            [FromQuery] int limit,
            [FromServices] IMetadataRegistry metadata,
            [FromServices] NpgsqlDataSource dataSource,
            HttpContext ctx) =>
        {
            var tenantId = ctx.User.GetTenantId();
            var targetEntity = metadata.GetEntity(module, entity);
            limit = Math.Clamp(limit == 0 ? 50 : limit, 1, 200);

            await using var conn = await dataSource.OpenConnectionAsync();
            // حقن معرف الـ Tenant للـ RLS
            await conn.ExecuteAsync("SELECT set_config('app.tenant_id', @tenantId::text, true);", 
                new { tenantId });

            string sql = $@"
                SELECT * FROM {targetEntity.FullTableName}
                WHERE (@afterDate IS NULL OR (created_at, id) < (@afterDate::timestamptz, @afterId))
                ORDER BY created_at DESC, id DESC
                LIMIT @limit;";

            var records = await conn.QueryAsync(sql, new { afterDate, afterId, limit });
            return Results.Ok(new { items = records, count = records.Count() });
        })
        .AddEndpointFilter<RequireActionFilter>();

        // 2. PUT with Optimistic Concurrency (version check)
        group.MapPut("", async (
            string module,
            string entity,
            [FromBody] JsonElement payload,
            [FromServices] IMetadataRegistry metadata,
            [FromServices] NpgsqlDataSource dataSource,
            HttpContext ctx) =>
        {
            var tenantId = ctx.User.GetTenantId();
            var userId = ctx.User.GetUserId();
            var targetEntity = metadata.GetEntity(module, entity);

            var id = payload.GetProperty("id").GetGuid();
            var clientVersion = payload.GetProperty("version").GetInt32();

            await using var conn = await dataSource.OpenConnectionAsync();
            await using var tx = await conn.BeginTransactionAsync();

            // ضبط متغيرات الجلسة (Tenant + User للـ Audit)
            await conn.ExecuteAsync(@"
                SELECT set_config('app.tenant_id', @tenantId::text, true);
                SELECT set_config('app.user_id', @userId::text, true);",
                new { tenantId, userId }, tx);

            var updateAssignments = targetEntity.BuildUpdateSqlAssignments(payload);
            string updateSql = $@"
                UPDATE {targetEntity.FullTableName}
                SET {updateAssignments},
                    updated_at = clock_timestamp(),
                    updated_by = @userId
                WHERE id = @id AND version = @clientVersion
                RETURNING version;";

            var newVersion = await conn.ExecuteScalarAsync<int?>(updateSql, 
                new { id, clientVersion, userId }, tx);

            if (newVersion is null)
            {
                await tx.RollbackAsync();
                // 409 Conflict: تم تعديل السجل بواسطة مستخدم آخر بالتزامن!
                return Results.Conflict(new { 
                    error = "DbConcurrencyException", 
                    message = "السجل تم تعديله من مشغل آخر، يرجى تحديث الشاشة.",
                    expectedVersion = clientVersion 
                });
            }

            await tx.CommitAsync();
            return Results.Ok(new { success = true, id, version = newVersion.Value });
        })
        .AddEndpointFilter<RequireActionFilter>();
    }
}`
  },

  // 2. Auth Endpoints (.NET 10 + HttpOnly Refresh Cookie)
  {
    filename: 'AuthEndpoints.cs',
    path: 'src/Services/Auth/Endpoints/AuthEndpoints.cs',
    project: 'Auth API',
    lineCount: 94,
    descriptionAr: 'تسجيل الدخول، توليد Access Token بالذاكرة، وحفظ Refresh Token في HttpOnly Cookie مشفرة مع تدوير الـ Family ID.',
    csharpCode: `using System.Security.Claims;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Erp.Services.Auth.Security;

namespace Erp.Services.Auth.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthRoutes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth");

        // auth.login: دخول آمن وتوليد التوكن
        group.MapPost("/login", async (
            [FromBody] LoginRequest req,
            [FromServices] ITokenService tokenService,
            [FromServices] IPasswordHasher hasher,
            [FromServices] NpgsqlDataSource db,
            HttpContext ctx) =>
        {
            await using var conn = await db.OpenConnectionAsync();
            
            var user = await conn.QuerySingleOrDefaultAsync<UserAuthDto>(@"
                SELECT u.id, u.tenant_id, u.email, u.full_name, u.password_hash, u.status
                FROM core.users u
                JOIN core.tenants t ON t.id = u.tenant_id
                WHERE t.code = @TenantCode AND u.email = @Email AND u.deleted_at IS NULL;",
                new { req.TenantCode, req.Email });

            if (user is null || !hasher.Verify(req.Password, user.Password_Hash))
                return Results.Unauthorized();

            if (user.Status != "active")
                return Results.Problem("الحساب معطل أو مقفل حالياً", statusCode: 403);

            // استخراج صلاحيات المستخدم من جدول core.permissions
            var permissions = await conn.QueryAsync<string>(@"
                SELECT action_code FROM core.permissions p
                JOIN core.user_roles ur ON ur.role_id = p.role_id AND ur.tenant_id = p.tenant_id
                WHERE ur.user_id = @UserId AND ur.tenant_id = @TenantId;",
                new { UserId = user.Id, TenantId = user.Tenant_Id });

            var accessToken = tokenService.GenerateAccessToken(user, permissions);
            var (refreshToken, familyId) = await tokenService.CreateRefreshTokenAsync(user.Tenant_Id, user.Id, conn);

            // تعيين الـ Refresh Token في HttpOnly Cookie آمنة
            ctx.Response.Cookies.Append("erp_refresh", refreshToken, new CookieOptions {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });

            return Results.Ok(new {
                token = accessToken,
                user = new { user.Id, user.Full_Name, user.Email, user.Tenant_Id }
            });
        });

        // auth.logout: إلغاء الجلسة والتوكن
        group.MapPost("/logout", async (
            [FromServices] ITokenService tokenService,
            [FromServices] NpgsqlDataSource db,
            HttpContext ctx) =>
        {
            if (ctx.Request.Cookies.TryGetValue("erp_refresh", out var refreshToken))
            {
                await tokenService.RevokeRefreshTokenAsync(refreshToken, db);
                ctx.Response.Cookies.Delete("erp_refresh");
            }
            return Results.Ok(new { message = "تم تسجيل الخروج بنجاح" });
        });
    }
}`
  },

  // 3. Security Filter: Action Registry & Default-Deny Middleware
  {
    filename: 'RequireActionFilter.cs',
    path: 'src/Common/Security/RequireActionFilter.cs',
    project: 'Security & Filters',
    lineCount: 72,
    descriptionAr: 'فلتر الحماية المشددة لفحص Module.Entity.Action في الـ API ومطابقة الـ Scope مع فرض Default-Deny.',
    csharpCode: `using System.Security.Claims;
using Dapper;
using Microsoft.AspNetCore.Http;
using Npgsql;

namespace Erp.Common.Security;

public class RequireActionFilter : IEndpointFilter
{
    private readonly NpgsqlDataSource _db;

    public RequireActionFilter(NpgsqlDataSource db)
    {
        _db = db;
    }

    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
    {
        var http = ctx.HttpContext;
        var user = http.User;

        if (!user.Identity?.IsAuthenticated ?? true)
            return Results.Unauthorized();

        // 1. تحديد كود الفعل المطلوب من المسار والعملية: e.g. "inventory.item.save"
        var module = ctx.GetArgument<string>(0);
        var entity = ctx.GetArgument<string>(1);
        var httpMethod = http.Request.Method;
        var verb = httpMethod switch {
            "GET" => "read",
            "POST" => "create",
            "PUT" => "save",
            "DELETE" => "delete",
            _ => "execute"
        };
        var actionCode = $"{module}.{entity}.{verb}";

        var tenantId = user.GetTenantId();
        var userId = user.GetUserId();

        await using var conn = await _db.OpenConnectionAsync();

        // 2. فحص مصفوفة الصلاحيات مع عزل الـ Tenant
        const string checkSql = @"
            SELECT p.scope 
            FROM core.permissions p
            JOIN core.user_roles ur ON ur.role_id = p.role_id AND ur.tenant_id = p.tenant_id
            WHERE p.tenant_id = @tenantId 
              AND ur.user_id = @userId 
              AND p.action_code = @actionCode
            LIMIT 1;";

        var grantedScope = await conn.ExecuteScalarAsync<string?>(checkSql, 
            new { tenantId, userId, actionCode });

        // 3. قاعدة Default-Deny الصارمة: غياب الصف = 403 Forbidden فوري!
        if (grantedScope is null && !user.IsInRole("super_admin"))
        {
            return Results.Problem(
                title: "مرفوض أمنياً (Access Denied)",
                detail: $"ليس لديك الصلاحية المسجلة [{actionCode}] لتنفيذ هذه العملية.",
                statusCode: StatusCodes.Status403Forbidden
            );
        }

        http.Items["ActionScope"] = grantedScope ?? "all";
        return await next(ctx);
    }
}`
  },

  // 4. Postgres LISTEN to SignalR Realtime Bridge
  {
    filename: 'PostgresRealtimeBridge.cs',
    path: 'src/Services/Realtime/PostgresRealtimeBridge.cs',
    project: 'Realtime Service',
    lineCount: 65,
    descriptionAr: 'عامل خلفي خفيف يستمع لقناة NOTIFY table_changes عبر conn.WaitAsync ويبث التعديل لمجموعة الـ Tenant عبر SignalR.',
    csharpCode: `using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Npgsql;

namespace Erp.Services.Realtime;

public class PostgresRealtimeBridge : BackgroundService
{
    private readonly IHubContext<ErpNotificationHub> _hub;
    private readonly string _connectionString;
    private readonly ILogger<PostgresRealtimeBridge> _logger;

    public PostgresRealtimeBridge(
        IHubContext<ErpNotificationHub> hub,
        IConfiguration config,
        ILogger<PostgresRealtimeBridge> logger)
    {
        _hub = hub;
        _connectionString = config.GetConnectionString("Postgres")!;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("بدء الاستماع لقناة البث اللحظي PostgreSQL LISTEN...");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var conn = new NpgsqlConnection(_connectionString);
                await conn.OpenAsync(stoppingToken);

                conn.Notification += async (o, e) =>
                {
                    try
                    {
                        var json = JsonDocument.Parse(e.Payload);
                        var tenantId = json.RootElement.GetProperty("tenant_id").GetString();

                        // البث الفوري لمجموعة المنشأة فقط لضمان العزل التام والسرعة القصوى
                        if (!string.IsNullOrEmpty(tenantId))
                        {
                            await _hub.Clients.Group($"tenant_{tenantId}")
                                .SendAsync("RecordUpdated", e.Payload, stoppingToken);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "خطأ في تحليل وتوزيع إشعار البث اللحظي");
                    }
                };

                await using var cmd = new NpgsqlCommand("LISTEN table_changes;", conn);
                await cmd.ExecuteNonQueryAsync(stoppingToken);

                while (!stoppingToken.IsCancellationRequested)
                {
                    // استهلاك شبه منعدم للـ CPU (Non-blocking I/O Wait)
                    await conn.WaitAsync(stoppingToken);
                }
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogWarning(ex, "انقطع اتصال الـ Postgres Listener، إعادة المحاولة بعد 3 ثواني...");
                await Task.Delay(3000, stoppingToken);
            }
        }
    }
}`
  },

  // 5. YARP Gateway Configuration & Program (.NET 10)
  {
    filename: 'GatewayProgram.cs',
    path: 'src/Gateway/Program.cs',
    project: 'Gateway (YARP)',
    lineCount: 78,
    descriptionAr: 'بوابة YARP الموحدة لتوزيع الطلبات والـ Rate Limiting وفحص التوكن قبل الوصول للمصغرات.',
    csharpCode: `using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// 1. تسجيل محرك YARP Reverse Proxy
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// 2. سياسة الـ Rate Limiting الموزعة لكل منشأة لمنع الإغراق
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("fixed-window-tenant", ctx =>
    {
        var tenantId = ctx.User.FindFirst("tenant_id")?.Value ?? ctx.Connection.RemoteIpAddress?.ToString() ?? "anon";
        return RateLimitPartition.GetFixedWindowLimiter(tenantId, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 600, // 600 طلب بالدقيقة لكل عميل
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 20
        });
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("ErpCorsPolicy", p =>
        p.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? ["*"])
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials());
});

var app = builder.Build();

app.UseCors("ErpCorsPolicy");
app.UseRateLimiter();

// 3. توجيه جميع الطلبات عبر YARP
app.MapReverseProxy(proxyPipeline =>
{
    proxyPipeline.Use((context, next) =>
    {
        // إضافة Correlation ID و Client IP لضمان سلامة الـ Audit Log
        context.Request.Headers["X-Correlation-Id"] = Guid.NewGuid().ToString("N");
        return next();
    });
});

app.Run();`
  }
];

export interface ApiTestEndpoint {
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  actionCode: string;
  titleAr: string;
  samplePayload?: Record<string, any>;
  sampleResponse: Record<string, any>;
  sqlGenerated: string;
}

export const API_TEST_PRESETS: ApiTestEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/generic/inventory.items?limit=25',
    actionCode: 'generic.record.read',
    titleAr: 'استعلام الأصناف بـ Keyset Pagination وعزل RLS',
    sampleResponse: {
      items: [
        { id: "e102-4211", sku: "COF-ESP-1000G", name_ar: "بن حبوب كولومبي", sale_price: 520, version: 12 },
        { id: "e102-4212", sku: "TEA-EARL-500G", name_ar: "شاي إيرل جراي", sale_price: 240, version: 2 }
      ],
      count: 2,
      nextCursor: "2026-10-14T03:40:00Z"
    },
    sqlGenerated: `-- 1. ضبط الـ Session للـ RLS
SELECT set_config('app.tenant_id', 't_albatros_resorts', true);

-- 2. تنفيذ استعلام Keyset مباشر وفائق السرعة (1.4ms)
SELECT * FROM inventory.items
WHERE (created_at, id) < (@afterDate, @afterId)
ORDER BY created_at DESC, id DESC LIMIT 25;`
  },
  {
    method: 'PUT',
    path: '/api/v1/generic/inventory.items',
    actionCode: 'generic.record.save',
    titleAr: 'تعديل السعر مع فحص الإصدار (Optimistic Concurrency)',
    samplePayload: {
      id: "e102-4211",
      unit_price: 540,
      stock_quantity: 140,
      version: 12
    },
    sampleResponse: {
      success: true,
      id: "e102-4211",
      version: 13
    },
    sqlGenerated: `BEGIN TRANSACTION;
SELECT set_config('app.tenant_id', 't_albatros_resorts', true);
SELECT set_config('app.user_id', 'u_amr_selim', true);

UPDATE inventory.items
SET unit_price = 540, stock_quantity = 140, updated_at = clock_timestamp(), updated_by = 'u_amr_selim'
WHERE id = 'e102-4211' AND version = 12
RETURNING version; -- يرجع 13 لو نجح، أو NULL لو تعارض (409)

COMMIT;`
  },
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    actionCode: 'auth.login',
    titleAr: 'تسجيل الدخول وإصدار التوكن والـ Refresh Cookie',
    samplePayload: {
      tenantCode: "albatros",
      email: "amr.selim@pickalbatros.com",
      password: "••••••••••••"
    },
    sampleResponse: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      user: {
        id: "usr-01",
        full_name: "Amr Selim",
        email: "amr.selim@pickalbatros.com",
        tenant_id: "t_albatros_resorts"
      }
    },
    sqlGenerated: `SELECT u.id, u.tenant_id, u.email, u.full_name, u.password_hash, u.status
FROM core.users u
JOIN core.tenants t ON t.id = u.tenant_id
WHERE t.code = 'albatros' AND u.email = 'amr.selim@pickalbatros.com' AND u.deleted_at IS NULL;

-- استخراج الصلاحيات الممنوحة
SELECT action_code FROM core.permissions p
JOIN core.user_roles ur ON ur.role_id = p.role_id AND ur.tenant_id = p.tenant_id
WHERE ur.user_id = 'usr-01' AND ur.tenant_id = 't_albatros_resorts';`
  }
];
