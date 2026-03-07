using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using HomeGroundCoffeeBar.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Text.Json;
using HomeGroundCoffeeBar.Data;

namespace HomeGroundCoffeeBar.Controllers;



public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    private readonly ApplicationDbContext _context;

public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
{
    _logger = logger;
    _context = context;
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

    public IActionResult Privacy() => View();
    public IActionResult Menu() => View();
    public IActionResult Signin() => View();
    public IActionResult Signup() => View();
    public IActionResult Cart() => View();
    public IActionResult Location() => View();
    public IActionResult AboutUs() => View();
    public IActionResult Checkout() => View();
    public IActionResult PaymentMethods() => View();

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }

    // =============================
    // ORDER SUBMISSION & RECEIPT
    // =============================
[HttpPost]
public IActionResult SubmitOrder([FromBody] OrderDto orderDto)
{
    if (orderDto == null || orderDto.Items == null || orderDto.Items.Count == 0)
        return BadRequest("No items in order.");

    string orderNumber = "ORD-" + DateTime.Now.Ticks;
    decimal itemsTotal = orderDto.Items.Sum(i => i.Price * i.Quantity);
    decimal totalAmount = itemsTotal + orderDto.DeliveryFee;
    int earnedPoints = (int)(totalAmount * 0.05m);

    // Get user name from session
    var name = HttpContext.Session.GetString("Name");

    if (!string.IsNullOrEmpty(name))
    {
        // Fetch the actual tracked entity from EF
        var user = _context.Users.FirstOrDefault(u => u.Name == name);
        if (user != null)
        {
            // Update points
            user.Points += earnedPoints;

            // Save changes to database
            _context.SaveChanges();
        }
    }

    // Store order in TempData for receipt page
    var order = new OrderModel
    {
        OrderNumber = orderNumber,
        Items = orderDto.Items,
        DeliveryFee = orderDto.DeliveryFee,
        TotalAmount = totalAmount,
        PaymentMethod = orderDto.PaymentMethod
    };

    TempData["LastOrder"] = JsonSerializer.Serialize(order);

    return Json(new { orderId = orderNumber, pointsEarned = earnedPoints });
}

    /*[HttpPost]
    public IActionResult sendCartData([FromBody])
    {
        
    }*/

    public IActionResult Receipt(string orderNumber)
    {
        // FIND A WAY TO STORE THE DATA FROM    
        var lastOrderJson = TempData["LastOrder"] as string;

        Console.WriteLine(lastOrderJson);

        if (string.IsNullOrEmpty(lastOrderJson))
        {
            // No order found → redirect to menu
            return RedirectToAction("menu");
        }

        // Deserialize order
        var order = JsonSerializer.Deserialize<OrderModel>(lastOrderJson);

        return View(/*order*/);
    }
}

// =============================
// DTO & Model Classes
// =============================

public class OrderDto
{
    public List<OrderItem> Items { get; set; } = new List<OrderItem>();
    public decimal DeliveryFee { get; set; } = 50; // default
    public string PaymentMethod { get; set; } = "Cash";
}

public class OrderModel
{
    public string OrderNumber { get; set; }
    public List<OrderItem> Items { get; set; } = new List<OrderItem>();
    public decimal DeliveryFee { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; }
}

public class OrderItem
{
    public string Name { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}
