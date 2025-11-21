using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using HomeGroundCoffeeBar.Models;

namespace HomeGroundCoffeeBar.Controllers;

public class AdminController : Controller
{
    public IActionResult AdminHomePage()
    {
        return View();
    }
}
