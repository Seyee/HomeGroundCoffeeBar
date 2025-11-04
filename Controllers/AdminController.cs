using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using _.Models;

namespace _.Controllers;

public class AdminController : Controller
{
    public IActionResult AdminHomePage()
    {
        return View();
    }
}
