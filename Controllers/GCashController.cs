using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using HomeGroundCoffeeBar.Models;
using HomeGroundCoffeeBar.Data;
using Microsoft.AspNetCore.Mvc.Razor.Compilation;
using HomeGroundCoffeeBar.DTO;

namespace HomeGroundCoffeeBar.Controllers;

public class GCashController(ILogger<GCashController> logger, ApplicationDbContext context) : Controller
{
    private readonly ILogger<GCashController> _logger = logger;
    private readonly ApplicationDbContext _context = context;

    public IActionResult GCashMain(int amount)
    {
        Console.WriteLine("Accessed Gcash Table"); // REMOVE THIS

        var gcashTable = _context.GCash.OrderByDescending(p => p.CreatedAt).FirstOrDefault();

        if (gcashTable == null)
        {
            var balance = 10000;

            var updateAvailBalance = new GCashModel
            {
                AvailableBalance = balance,
                Amount = amount
            };

            _context.GCash.Add(updateAvailBalance);
            _context.SaveChanges();

            Console.WriteLine("Empty Table");
        }
        else
        {
            if (gcashTable.AvailableBalance > 0)
            {
                if (gcashTable.Amount > gcashTable.AvailableBalance)
                {
                    return BadRequest(new { message = "Amount exceeded!" });
                }
                else
                {
                    var newBalance = gcashTable.AvailableBalance - gcashTable.Amount;

                    var sendNewBalance = new GCashModel
                    {
                        AvailableBalance = newBalance,
                        Amount = gcashTable.Amount
                    };

                    _context.GCash.Add(sendNewBalance);

                    // CHECKS IF GCASH TABLE AVAILBALANCE COLUMN IS 0
                    if (newBalance <= 0)
                    {
                        var balance = 10000;

                        var updateGcashBalance = new GCashModel
                        {
                            AvailableBalance = balance,
                            Amount = gcashTable.Amount
                        };

                        _context.GCash.Add(updateGcashBalance);
                    }

                    _context.SaveChanges();
                }
            }
            else
            {
                var balance = 10000;

                var updateAvailBalance = new GCashModel
                {
                    AvailableBalance = balance,
                    Amount = gcashTable.Amount
                };

                _context.GCash.Add(updateAvailBalance);
                _context.SaveChanges();
                Console.WriteLine("Update GCash balance to 10,000"); // REMOVE THIS
            }
        }

        var payment = _context.GCash
                        .OrderByDescending(p => p.CreatedAt)
                        .FirstOrDefault();

        var vm = new ViewModels
        {
            GCash = payment ?? new GCashModel()
        };

        return View(vm);
    }

    [HttpPost]
    public IActionResult GetAvailBalance([FromBody] PaymentRequest amount)
    {
        Console.WriteLine("Accessed Gcash Table"); // REMOVE THIS

        var gcashTable = _context.GCash.OrderByDescending(p => p.CreatedAt).FirstOrDefault();

        if (gcashTable == null)
        {
            Console.WriteLine("Empty Table");
        }
        else
        {
            if (gcashTable.AvailableBalance > 0)
            {
                if (gcashTable.Amount > gcashTable.AvailableBalance)
                {
                    return BadRequest(new { message = "Amount exceeded!" });
                }
                else
                {
                    var newBalance = gcashTable.AvailableBalance - gcashTable.Amount;

                    var sendNewBalance = new GCashModel
                    {
                        AvailableBalance = newBalance,
                        Amount = gcashTable.Amount
                    };

                    _context.GCash.Add(sendNewBalance);

                    // CHECKS IF GCASH TABLE AVAILBALANCE COLUMN IS 0
                    if (newBalance <= 0)
                    {
                        var balance = 10000;

                        var updateGcashBalance = new GCashModel
                        {
                            AvailableBalance = balance,
                            Amount = gcashTable.Amount
                        };

                        _context.GCash.Add(updateGcashBalance);
                    }

                    _context.SaveChanges();
                }
            }
            else
            {
                var balance = 10000;

                var updateAvailBalance = new GCashModel
                {
                    AvailableBalance = balance,
                    Amount = gcashTable.Amount
                };

                _context.GCash.Add(updateAvailBalance);
                _context.SaveChanges();
                Console.WriteLine("Update GCash balance to 10,000"); // REMOVE THIS
            }
        }


        return Ok(new { message = "Received form" });
    }
}