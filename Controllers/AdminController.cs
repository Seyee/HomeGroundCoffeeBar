using Microsoft.AspNetCore.Mvc;
using HomeGroundCoffeeBar.Models;
using HomeGroundCoffeeBar.Data;
using Microsoft.EntityFrameworkCore;
using Models;

namespace HomeGroundCoffeeBar.Controllers
{
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult AdminHomePage()
        {
            var users = _context.Users.ToList();
            return View(users);
        }

        [HttpPost]
        public IActionResult EditUser([FromBody] UserModel user)
        {
            if (string.IsNullOrWhiteSpace(user.Name))
                return BadRequest(new { message = "Name is required." });

            if (user.Name.Length < 3)
                return BadRequest(new { message = "Name must be at least 3 characters." });

            if (user.Name.Length > 18)
                return BadRequest(new { message = "Name must not exceed 18 characters." });

            if (string.IsNullOrEmpty(user.Phone) || user.Phone.Length != 11)
                return BadRequest(new { message = "Phone number must be exactly 11 digits." });

            // Check for duplicates
            var duplicate = _context.Users
                .Any(u => (u.Phone == user.Phone || u.Name == user.Name) && u.Id != user.Id);

            if (duplicate)
                return Conflict(new { message = "Duplicate Name or Phone detected!" });

            var existing = _context.Users.Find(user.Id);
            if (existing == null)
                return NotFound(new { message = "User not found." });

            existing.Name     = user.Name;
            existing.Phone    = user.Phone;
            existing.Password = user.Password;
            existing.Role     = user.Role;

            _context.SaveChanges();

            return Ok(new { message = "User updated successfully!" });
        }

        [HttpPost]
        public IActionResult DeleteUser([FromBody] UserModel user)
        {
            if (user == null)
                return BadRequest(new { message = "Invalid user Id." });

            var existing = _context.Users.Find(user.Id);
            if (existing == null)
                return NotFound(new { message = "User not found." });

            _context.Users.Remove(existing);
            _context.SaveChanges();

            return Ok(new { message = "User deleted successfully!" });
        }

        public async Task<IActionResult> GetOrders()
{
    var orders = await _context.Orders
        .OrderByDescending(o => o.CreatedAt)
        .ToListAsync();

    return Json(orders.Select(o => new
    {
        o.Id,
        o.OrderId,
        o.FullName,
        o.Phone,
        o.Address,
        o.PaymentMethod,
        o.DeliveryNotes,
        o.Subtotal,
        o.DeliveryFee,
        o.Total,
        o.PointsEarned,
        o.Status,
        createdAt = o.CreatedAt.ToString("MMM dd, yyyy hh:mm tt"),
        items     = o.Items
    }));
}

[HttpPost]
public async Task<IActionResult> UpdateOrderStatus([FromBody] UpdateStatusRequest request)
{
    var order = await _context.Orders
        .FirstOrDefaultAsync(o => o.OrderId == request.OrderId);

    if (order == null)
        return NotFound(new { message = "Order not found." });

    order.Status = request.Status;
    await _context.SaveChangesAsync();

    return Ok(new { message = "Status updated." });
}
    }


    
}