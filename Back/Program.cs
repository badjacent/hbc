using Back.Controllers;
using Back.Data;
using Back.Hubs;
using OrdersHub = Back.Hubs.MainHub;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddSingleton<Repository>();
builder.Services.AddHostedService<NotificationService>();


// 1. DEFINE CORS POLICY
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:3000") // The address of your React App
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
});

var app = builder.Build();


app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapHub<OrdersHub>("/hubs/orders");

app.MapControllers();

app.Run();

// Needed for WebApplicationFactory in tests
public partial class Program { }
