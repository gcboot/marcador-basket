using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Scoreboard.Api.Data;
using Scoreboard.Api.Hubs;
using System.Text.Json.Serialization;

// 🔒 Nuevos using para JWT
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ---------- Configuración ----------
// Cadena de conexión
var cs = builder.Configuration.GetConnectionString("Sql")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__Sql");

// ---------- Servicios ----------
builder.Services.AddDbContext<AppDb>(o => o.UseSqlServer(cs));

// ✅ Configuración de CORS para Angular + SignalR
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // 👈 tu frontend Angular
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // 👈 necesario para SignalR + JWT
    });
});

builder.Services.AddSignalR();

builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// 👈 Necesario para que Swagger genere la UI
builder.Services.AddEndpointsApiExplorer();

// 🔒 Autenticación y Autorización con JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtKey = builder.Configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey))
            throw new InvalidOperationException("JWT Key no está configurada en appsettings.json o variables de entorno");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // ✅ Permitir token en SignalR con ?access_token=
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hub/game"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ---------- Swagger ----------
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Scoreboard API", Version = "v1" });

    // 🔒 Configuración de JWT en Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer", // 👈 minúscula
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingrese 'Bearer' seguido de un espacio y luego su token JWT.\n\nEjemplo: \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\""
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ---------- Build ----------
var app = builder.Build();

// ---------- Middleware ----------
app.UseCors("AllowFrontend"); // ✅ usar la política definida
app.UseAuthentication();
app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Scoreboard API v1");
    c.RoutePrefix = "swagger"; // accesible en /swagger
});

// ---------- SignalR ----------
app.MapHub<GameHub>("/hub/game");

// ---------- Controladores ----------
app.MapControllers();

// ---------- Run ----------
app.Run();
