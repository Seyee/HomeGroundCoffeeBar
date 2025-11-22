using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

public class AccountController : Controller
{
    private readonly string connectionString;

    public AccountController(IConfiguration configuration)
    {
        connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    // ==========================================
    // LOGOUT
    // ==========================================
    public async Task<IActionResult> Logout()
    {
        HttpContext.Session.Clear();
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Signin", "Home");
    }


    // ==========================================
    // GOOGLE LOGIN
    // ==========================================
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

            var checkCmd = new MySqlCommand("SELECT COUNT(*) FROM Users WHERE GoogleId=@GoogleId", conn);
            checkCmd.Parameters.AddWithValue("@GoogleId", googleId);
            var exists = Convert.ToInt32(checkCmd.ExecuteScalar()) > 0;

            if (!exists)
            {
                var insertCmd = new MySqlCommand(
                    "INSERT INTO Users (GoogleId, Name, Email, ProfilePic, CreatedAt) VALUES (@GoogleId, @Name, @Email, @Pic, NOW())",
                    conn
                );

                insertCmd.Parameters.AddWithValue("@GoogleId", googleId);
                insertCmd.Parameters.AddWithValue("@Name", name);
                insertCmd.Parameters.AddWithValue("@Email", email);
                insertCmd.Parameters.AddWithValue("@Pic", profilePic ?? "");
                insertCmd.ExecuteNonQuery();
            }
        }

        // SESSION DATA
        HttpContext.Session.SetString("GoogleId", googleId ?? "");
        HttpContext.Session.SetString("Name", name ?? "");
        HttpContext.Session.SetString("Email", email ?? "");
        HttpContext.Session.SetString("ProfilePic", profilePic ?? "");

        return RedirectToAction("Index", "Dashboard");
    }


    // ==========================================
    // SIGN UP
    // ==========================================
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


    // ==========================================
    // LOGIN (NORMAL EMAIL/PASSWORD)
    // ==========================================
    [HttpPost]
public async Task<IActionResult> Signin(string Phone, string Password)
{
    using (var conn = new MySqlConnection(connectionString))
    {
        conn.Open();

        string query = "SELECT Name, ProfilePic, Password, GoogleId, Role FROM Users WHERE Phone = @Phone";

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

                // VALUES
                string name = reader["Name"].ToString() ?? "";
                string dbPic = reader["ProfilePic"]?.ToString();
                string googleId = reader["GoogleId"]?.ToString();
                string role = reader["Role"]?.ToString() ?? "User";

                string profilePic;

                if (!string.IsNullOrEmpty(googleId) && !string.IsNullOrEmpty(dbPic))
                {
                    profilePic = dbPic; // Google pic saved in DB
                }
                else
                {
                    // Normal user fallback
                    profilePic = !string.IsNullOrEmpty(dbPic)
                        ? dbPic
                        : "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg";
                }


                // SET SESSION
                HttpContext.Session.SetString("Phone", Phone);
                HttpContext.Session.SetString("Name", name);
                HttpContext.Session.SetString("ProfilePic", profilePic);
                HttpContext.Session.SetString("Role", role);

                TempData["SuccessMessage"] = "Welcome back!";

                // ================
                //   SET CLAIMS  
                // ================
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, name),
                    new Claim("picture", profilePic),
                    new Claim(ClaimTypes.Role, role)
                };

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme))
                );

                 if (role == "Admin")
                {
                    return RedirectToAction("AdminHomePage", "Admin");
                }
                else
                {
                    return RedirectToAction("Index", "Dashboard");
                }
        }
        
    }

    
}


}



}
