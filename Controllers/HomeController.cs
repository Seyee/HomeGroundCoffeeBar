using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using HomeGroundCoffeeBar.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Text.Json;

namespace HomeGroundCoffeeBar.Controllers;

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

        // FIND A WAY TO STORE THE DATA FROM JAVASCRIPT AND STORE IT IN A JSON OBJECT
        // USING FETCH FUNCTION PUT IT INSIDE A FUNCTION IN JAVASCRIPT THEN CALL IT IN THE REDIRECTTION LINK IN Checkout.cshtml
        // CREATE A NEW POST REQUEST METHOD IN THIS FILE, CREATE A DTO FILE FOR STORING THE JSON OBJECT 
        // THEN PUT THE TRANSFERRED DATA FROM THE DTO TO A TempData[]

        if(orderDto == null || orderDto.Items == null || orderDto.Items.Count == 0)
            return BadRequest("No items in order.");

        // Generate order number
        string orderNumber = "ORD-" + DateTime.Now.Ticks;

        // Calculate totals
        decimal itemsTotal = orderDto.Items.Sum(i => i.Price * i.Quantity);
        decimal deliveryFee = orderDto.DeliveryFee;
        decimal totalAmount = itemsTotal + deliveryFee;

        // Build order model
        var order = new OrderModel
        {
            OrderNumber = orderNumber,
            Items = orderDto.Items,
            DeliveryFee = deliveryFee,
            TotalAmount = totalAmount,
            PaymentMethod = orderDto.PaymentMethod
        };

        // Save order temporarily in TempData (for receipt page)
        TempData["LastOrder"] = JsonSerializer.Serialize(order);

        // Return order number to frontend
        return Json(new { orderId = orderNumber });
    }

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
