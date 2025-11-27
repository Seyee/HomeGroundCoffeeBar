using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Models;
using MySql.Data.MySqlClient;

public class AccountController : Controller
{
    private readonly string connectionString;

    public AccountController(IConfiguration configuration)
    {
        connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    // ================================
    // LOGOUT
    // ================================
    public async Task<IActionResult> Logout()
    {
        HttpContext.Session.Clear();
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Signin", "Home");
    }

    // ================================
    // GOOGLE LOGIN
    // ================================
    public IActionResult GoogleLogin()
    {
        var redirectUrl = Url.Action("GoogleResponse", "Account");
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    public async Task<IActionResult> GoogleResponse()
    {
        var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        var claims = result.Principal.Identities.FirstOrDefault()?.Claims;

        var googleId = claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        var name = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
        var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
        var profilePic = claims?.FirstOrDefault(c => c.Type == "picture")?.Value;

        using (var conn = new MySqlConnection(connectionString))
        {
            conn.Open();

            var checkCmd = new MySqlCommand("SELECT Id FROM Users WHERE GoogleId=@GoogleId", conn);
            checkCmd.Parameters.AddWithValue("@GoogleId", googleId);
            var userId = checkCmd.ExecuteScalar();

            if (userId == null)
            {
                var insertCmd = new MySqlCommand(
                    "INSERT INTO Users (GoogleId, Name, Email, ProfilePic, CreatedAt) VALUES (@GoogleId, @Name, @Email, @Pic, NOW()); SELECT LAST_INSERT_ID();",
                    conn
                );
                insertCmd.Parameters.AddWithValue("@GoogleId", googleId);
                insertCmd.Parameters.AddWithValue("@Name", name);
                insertCmd.Parameters.AddWithValue("@Email", email);
                insertCmd.Parameters.AddWithValue("@Pic", profilePic ?? "");
                userId = insertCmd.ExecuteScalar();
            }

            // Store UserId in session
            HttpContext.Session.SetString("UserId", userId.ToString());
            HttpContext.Session.SetString("GoogleId", googleId ?? "");
            HttpContext.Session.SetString("Name", name ?? "");
            HttpContext.Session.SetString("Email", email ?? "");
            HttpContext.Session.SetString("ProfilePic", profilePic ?? "");
        }

        return RedirectToAction("Index", "Dashboard");
    }

    [HttpGet("/api/user/status")]
public IActionResult GetStatus() {
    if (User.Identity.IsAuthenticated) {
        return Ok(new { loggedIn = true, username = User.Identity.Name });
    }
    return Ok(new { loggedIn = false });
}


    // ================================
    // SIGN UP
    // ================================
    [HttpPost]
    public IActionResult Signup(string Name, string Phone, string Password)
    {
        try
        {
            using (var conn = new MySqlConnection(connectionString))
            {
                conn.Open();
                string query = "INSERT INTO Users (Name, Phone, Password, CreatedAt) VALUES (@Name, @Phone, @Password, NOW())";

                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Name", Name);
                    cmd.Parameters.AddWithValue("@Phone", Phone);
                    cmd.Parameters.AddWithValue("@Password", Password);
                    cmd.ExecuteNonQuery();

                    // Get the inserted user Id
                    var userId = cmd.LastInsertedId;
                    HttpContext.Session.SetString("UserId", userId.ToString());
                    HttpContext.Session.SetString("Phone", Phone);
                    HttpContext.Session.SetString("Name", Name);
                }
            }

            TempData["SignupSuccess"] = true;
            return RedirectToAction("Signup", "Home");
        }
        catch
        {
            return RedirectToAction("Signup", "Home");
        }
    }

    // ================================
    // ADD TO CART
    // ================================
    [HttpPost]
    public IActionResult AddToCart([FromBody] CartItem item)
    {
        var userId = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userId))
            return Json(new List<CartItem>());

        using (var conn = new MySqlConnection(connectionString))
        {
            conn.Open();

            // Check if item already exists in cart
            string checkQuery = "SELECT COUNT(*) FROM cart WHERE UserId=@UserId AND ProductName=@Product";
            var checkCmd = new MySqlCommand(checkQuery, conn);
            checkCmd.Parameters.AddWithValue("@UserId", userId);
            checkCmd.Parameters.AddWithValue("@Product", item.name);
            bool exists = Convert.ToInt32(checkCmd.ExecuteScalar()) > 0;

            if (exists)
            {
                string updateQuery = "UPDATE cart SET Quantity = Quantity + @Qty WHERE UserId=@UserId AND ProductName=@Product";
                var updateCmd = new MySqlCommand(updateQuery, conn);
                updateCmd.Parameters.AddWithValue("@Qty", item.quantity);
                updateCmd.Parameters.AddWithValue("@UserId", userId);
                updateCmd.Parameters.AddWithValue("@Product", item.name);
                updateCmd.ExecuteNonQuery();
            }
            else
            {
                string insertQuery = "INSERT INTO cart (UserId, ProductName, Price, Quantity, Image) " +
                                     "VALUES (@UserId, @Product, @Price, @Qty, @Image)";
                var insertCmd = new MySqlCommand(insertQuery, conn);
                insertCmd.Parameters.AddWithValue("@UserId", userId);
                insertCmd.Parameters.AddWithValue("@Product", item.name);
                insertCmd.Parameters.AddWithValue("@Price", item.price);
                insertCmd.Parameters.AddWithValue("@Qty", item.quantity);
                insertCmd.Parameters.AddWithValue("@Image", item.image);
                insertCmd.ExecuteNonQuery();
            }

            // Return updated cart
            string getQuery = "SELECT ProductName, Price, Quantity, Image FROM cart WHERE UserId=@UserId";
            var getCmd = new MySqlCommand(getQuery, conn);
            getCmd.Parameters.AddWithValue("@UserId", userId);

            var reader = getCmd.ExecuteReader();
            var cartList = new List<object>();
            while (reader.Read())
            {
                cartList.Add(new
                {
                    name = reader["ProductName"],
                    price = Convert.ToDecimal(reader["Price"]),
                    quantity = Convert.ToInt32(reader["Quantity"]),
                    image = reader["Image"].ToString()
                });
            }
            return Json(cartList);
        }
    }

    [HttpGet]
    public IActionResult GetCart()
    {
        var userId = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userId))
            return Json(new List<object>());

        var cart = new List<object>();
        using (var conn = new MySqlConnection(connectionString))
        {
            conn.Open();
            string query = "SELECT ProductName, Price, Quantity, Image FROM cart WHERE UserId=@UserId";
            using (var cmd = new MySqlCommand(query, conn))
            {
                cmd.Parameters.AddWithValue("@UserId", userId);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        cart.Add(new
                        {
                            name = reader["ProductName"],
                            price = Convert.ToDecimal(reader["Price"]),
                            quantity = Convert.ToInt32(reader["Quantity"]),
                            image = reader["Image"].ToString()
                        });
                    }
                }
            }
        }
        return Json(cart);
    }

    // ================================
    // LOGIN
    // ================================
    [HttpPost]
    public async Task<IActionResult> Signin(string Phone, string Password)
    {
        using (var conn = new MySqlConnection(connectionString))
        {
            conn.Open();

            string query = "SELECT Id, Name, ProfilePic, GoogleId, Role, Password FROM Users WHERE Phone=@Phone";
            using (var cmd = new MySqlCommand(query, conn))
            {
                cmd.Parameters.AddWithValue("@Phone", Phone);
                using (var reader = cmd.ExecuteReader())
                {
                    if (!reader.Read())
                    {
                        TempData["ErrorMessage"] = "Phone number not found!";
                        return RedirectToAction("Signin", "Home");
                    }

                    if (reader["Password"].ToString() != Password)
                    {
                        TempData["ErrorMessage"] = "Incorrect password!";
                        return RedirectToAction("Signin", "Home");
                    }

                    // SET SESSION
                    var userId = reader["Id"].ToString();
                    HttpContext.Session.SetString("UserId", userId);
                    HttpContext.Session.SetString("Phone", Phone);
                    HttpContext.Session.SetString("Name", reader["Name"].ToString());
                    HttpContext.Session.SetString("ProfilePic", reader["ProfilePic"]?.ToString() ?? "");
                    HttpContext.Session.SetString("Role", reader["Role"]?.ToString() ?? "User");

                    // SET CLAIMS
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Name, reader["Name"].ToString()),
                        new Claim("picture", reader["ProfilePic"]?.ToString() ?? ""),
                        new Claim(ClaimTypes.Role, reader["Role"]?.ToString() ?? "User")
                    };

                    await HttpContext.SignInAsync(
                        CookieAuthenticationDefaults.AuthenticationScheme,
                        new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme))
                    );

                    if (reader["Role"]?.ToString() == "Admin")
                        return RedirectToAction("AdminHomePage", "Admin");
                    else
                        return RedirectToAction("Index", "Dashboard");
                }
            }
        }
    }
}
