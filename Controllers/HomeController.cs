using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using _.Models;

namespace _.Controllers;

public class HomeController : Controller
{
    
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
{
    return RedirectToAction("Home");
}


    public IActionResult Home()
    {
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

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
