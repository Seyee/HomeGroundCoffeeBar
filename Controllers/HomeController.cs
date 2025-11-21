using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using _.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace _.Controllers;

public class HomeController : Controller
{
    
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }


     public async Task<IActionResult> Logout()
    {
        HttpContext.Session.Clear();
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Signin", "Home");
    }


    public IActionResult Home()
    {
       var user = HttpContext.Session.GetString("Name");

    if (!string.IsNullOrEmpty(user))
    {
        return RedirectToAction("Index", "Dashboard");
    }
    return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }

    public IActionResult Menu()
    {
        return View();
    }

    public IActionResult Signin()
    {
        return View();
    }

    public IActionResult Signup()
    {
        return View();
    }

    public IActionResult Cart()
    {
        return View();
    }

    public IActionResult Location()
    {
        return View();
    }

    public IActionResult AboutUs()
    {
        return View();
    }

    public IActionResult Checkout()
    {
        return View();
    }

    public IActionResult PaymentMethods()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
