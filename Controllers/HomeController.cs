using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using HomeGroundCoffeeBar.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Text.Json;
using HomeGroundCoffeeBar.Data;
using HomeGroundCoffeeBar.DTO;
using Microsoft.EntityFrameworkCore;



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
        // REMOVE THE CODE HERE, accessible naamn si session sa .cshtml files, rather than ipapasa mo pa as a viewbag, unnecessary and matrabaho ba
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

    // =============================
    // ORDER SUBMISSION & RECEIPT
    // =============================
    [HttpPost]
    public async Task<IActionResult> SubmitOrder([FromBody] SubmitOrderRequest request)
    {
        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr))
            return Json(new { success = false, message = "Not logged in" });

        string userId = userIdStr;

        // Pull cart from DB
        var cartItems = await _context.Cart
            .Where(c => c.UserId == userId)
            .ToListAsync();

        if (!cartItems.Any())
            return Json(new { success = false, message = "Cart is empty." });

        // Fetch user FIRST before building the order
        var user = await _context.Users.FindAsync(int.Parse(userId));
        if (user == null)
            return Json(new { success = false, message = "User not found." });

        // Totals
        decimal subtotal = cartItems.Sum(i => i.Price * i.Quantity);
        decimal delivery = 50m;
        decimal total    = subtotal + delivery;
        int points       = (int)Math.Floor(total * 0.05m);

        string orderId = "ORD-" + Guid.NewGuid().ToString("N")[..8].ToUpper();
        string address = $"{request.StreetAddress}, {request.City}, {request.State} {request.ZipCode}";

        var order = new Order
        {
            OrderId       = orderId,
            UserId        = int.Parse(userId),
            FullName      = request.FullName,
            Phone         = user.Phone,
            Address       = address,
            PaymentMethod = request.PaymentMethod,
            DeliveryNotes = request.DeliveryNotes,
            Subtotal      = subtotal,
            DeliveryFee   = delivery,
            Total         = total,
            PointsEarned  = points,
            Status        = "Pending",
            CreatedAt     = DateTime.UtcNow,
            Items = cartItems.Select(c => new OrderItemSnapshot
            {
                ProductName = c.ProductName,
                Price       = c.Price,
                Quantity    = c.Quantity,
                Image       = c.Image
            }).ToList()
        };

        _context.Orders.Add(order);

        user.Points += points;

        _context.Cart.RemoveRange(cartItems);

        await _context.SaveChangesAsync();

        return Json(new { success = true, orderId, pointsEarned = points });
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


        public IActionResult Redeem()
    {
        var rewards = new List<RewardModel>
        {
            new RewardModel{ Id=1, Name="Homeground Coffee Club Cap", PointsRequired=250, Image="/img/rewards/cap.png", Description="Stylish Homeground cap perfect for coffee lovers who want to represent their favorite brew anywhere."},
            new RewardModel{ Id=2, Name="Homeground Barista Insulated Mug", PointsRequired=400, Image="/img/rewards/insulatedmug.png", Description="Premium insulated mug designed to keep your coffee hot while you enjoy every sip."},
            new RewardModel{ Id=3, Name="Homeground Brew Hoodie", PointsRequired=300, Image="/img/rewards/hoodie.png", Description="Comfortable Homeground hoodie inspired by cozy coffee shop vibes."},
            new RewardModel{ Id=4, Name="Homeground Notebook", PointsRequired=100, Image="/img/rewards/notebook.png", Description="Homeground notebook for jotting down your ideas."}

        };

        return View(rewards);
    }


[HttpPost]
public IActionResult RedeemReward([FromBody] RedeemRequest request)
{
    int rewardId = request.RewardId;

    var name = HttpContext.Session.GetString("Name");
    if (string.IsNullOrEmpty(name))
        return Unauthorized();

    var user = _context.Users.FirstOrDefault(u => u.Name == name);
    if (user == null)
        return NotFound();

    int requiredPoints = rewardId switch
    {
        1 => 100,
        2 => 300,
        3 => 500,
        _ => 0
    };

    if (user.Points < requiredPoints)
        return BadRequest("Not enough points");

    user.Points -= requiredPoints;

    _context.SaveChanges();

    return Json(new { success = true, remainingPoints = user.Points });
}
}

// =============================
// DTO & Model Classes
// =============================


// TODO move this in a DTO folder

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



