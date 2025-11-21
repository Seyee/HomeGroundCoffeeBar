using HomeGroundCoffeeBar.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddCookie()
.AddGoogle("Google", googleOptions =>
{
    googleOptions.ClientId = builder.Configuration["GoogleAuth:ClientId"];
    googleOptions.ClientSecret = builder.Configuration["GoogleAuth:ClientSecret"];
    googleOptions.CallbackPath = "/signin-google";

    googleOptions.Scope.Add("profile");
    googleOptions.Scope.Add("email");

    googleOptions.ClaimActions.MapJsonKey("picture", "picture", "url");
});

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseMySql(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            new MySqlServerVersion(new Version(8, 0, 33)) // MySQL version
        )
    );
builder.Services.AddSession();

var app = builder.Build();


// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}



app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseSession();

// **Add Authentication middleware**
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Home}/{id?}");

app.Run();
