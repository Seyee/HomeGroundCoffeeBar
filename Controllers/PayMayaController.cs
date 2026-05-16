using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using HomeGroundCoffeeBar.Data;
using HomeGroundCoffeeBar.Models;
using HomeGroundCoffeeBar.DTO;

public class PayMayaController : Controller
{
    private readonly ILogger<PayMayaController> _logger;
    private readonly ApplicationDbContext _context;

    public PayMayaController(ILogger<PayMayaController> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

public IActionResult PayMayaMain(int amount, string orderId)
{
    Console.WriteLine("Accessed Maya Table");
    TempData["OrderId"] = orderId;
    TempData.Keep("OrderId");

    var PayMaya = _context.PayMaya.OrderByDescending(p => p.CreatedAt).FirstOrDefault();

    if (PayMaya == null)
    {
        var updateAvailBalance = new PayMayaModel
        {
            AvailBalance = 10000,
            Amount = amount
        };
        _context.PayMaya.Add(updateAvailBalance);
        _context.SaveChanges();
    }
    else
    {
        if (PayMaya.AvailBalance > 0)
        {
            if (PayMaya.Amount > PayMaya.AvailBalance)
                return BadRequest(new { message = "Amount exceeded!" });
        }
        else
        {
            var updateAvailBalance = new PayMayaModel
            {
                AvailBalance = 10000,
                Amount = PayMaya.Amount
            };
            _context.PayMaya.Add(updateAvailBalance);
            _context.SaveChanges();
            return Ok(new { message = "Maya Balance update", redirect = Url.Action("PayMayaMain", "PayMaya") });
        }
    }

    ViewBag.OrderId = orderId;
    return View();
}

public IActionResult PayMayaOTP()
{
    ViewBag.OrderId = TempData["OrderId"]?.ToString();
    TempData.Keep("OrderId");
    return View();
}

public IActionResult PayMayaDetails()
{
    ViewBag.OrderId = TempData["OrderId"]?.ToString();
    TempData.Keep("OrderId");

    var payment = _context.PayMaya.OrderByDescending(p => p.CreatedAt).FirstOrDefault();
    var vm = new ViewModels
    {
        PayMaya = payment ?? new PayMayaModel()
    };
    return View(vm);
}

public IActionResult PayMayaSuccess()
{
    ViewBag.OrderId = TempData["OrderId"]?.ToString();
    TempData.Keep("OrderId");

    var payment = _context.PayMaya.OrderByDescending(p => p.CreatedAt).FirstOrDefault();
    var vm = new ViewModels
    {
        PayMaya = payment ?? new PayMayaModel()
    };
    return View(vm);
}

    [HttpPost]
    public IActionResult SendData([FromBody] PayMayaModel availBalance)
    {
        _context.PayMaya.Add(availBalance);
        _context.SaveChanges();

        return Json(new { success = true, message = "Data saved successfully" });
    }

    [HttpPost]
    public IActionResult GetAvailBalance([FromBody] PaymentRequest amount)
    {
        Console.WriteLine("Accessed Maya Table"); // REMOVE THIS
        var PayMaya = _context.PayMaya.OrderByDescending(p => p.CreatedAt).FirstOrDefault();

        if (PayMaya == null)
        {
            Console.WriteLine("Empty Table");
        }
        else
        {
            if (PayMaya.AvailBalance > 0)
            {
                if (PayMaya.Amount > PayMaya.AvailBalance)
                {
                    return BadRequest(new { message = "Amount exceeded!" });
                }
                else
                {
                    var newBalance = PayMaya.AvailBalance - PayMaya.Amount;

                    // CHECKS IF PayMaya TABLE AVAILBALANCE COLUMN IS 0
                    if (newBalance <= 0)
                    {
                        var balance = 10000;

                        var updatePayMayaBalance = new PayMayaModel
                        {
                            AvailBalance = balance,
                            Amount = PayMaya.Amount
                        };

                        _context.PayMaya.Add(updatePayMayaBalance);

                        return Ok( new { message = "Maya Balance update", redirect = Url.Action("PayMayaMain", "PayMaya")});
                    }
                    

                    var sendNewBalance = new PayMayaModel
                    {
                        AvailBalance = newBalance,
                        Amount = PayMaya.Amount
                    };

                    _context.PayMaya.Add(sendNewBalance);
                    _context.SaveChanges();

                    Console.WriteLine("Success");

                    return Ok( new { message = "Successful payment", redirect = Url.Action("PayMayaSuccess", "PayMaya")});
                }
            }
            else
            {
                var balance = 10000;

                var updateAvailBalance = new PayMayaModel
                {
                    AvailBalance = balance,
                    Amount = PayMaya.Amount
                };

                _context.PayMaya.Add(updateAvailBalance);
                _context.SaveChanges();
                Console.WriteLine("Update PayMaya balance to 10,000"); // REMOVE THIS

                return Ok( new { message = "Maya Balance update", redirect = Url.Action("PayMayaMain", "PayMaya")});
            }
        }


        return Ok( new { message = "Maya Balance update", redirect = Url.Action("PayMayaMain", "PayMaya")});
    }
}