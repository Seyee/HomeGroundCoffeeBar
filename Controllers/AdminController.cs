using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using HomeGroundCoffeeBar.Models;
using MySql.Data.MySqlClient;
using Models;

namespace HomeGroundCoffeeBar.Controllers
{
    public class AdminController : Controller
    {
        private string connectionString = "server=localhost;database=homegroundcoffeebar;user=root;password=homeground;port=3306;";

        // Admin Home Page with Users Table
        public IActionResult AdminHomePage()
        {
            List<UserModel> users = new List<UserModel>();

            using (var conn = new MySqlConnection(connectionString))
            {
                conn.Open();
                var cmd = new MySqlCommand("SELECT Id, Name, Phone, Password, Role, CreatedAt, ProfilePic FROM Users", conn);

                using (var reader = cmd.ExecuteReader())
                {
                while (reader.Read())
                {
                    users.Add(new UserModel
                    {
                        Id = reader["Id"].ToString(),
                        Name = reader["Name"].ToString(),
                        Phone = reader["Phone"].ToString(),
                        Password = reader["Password"].ToString(),
                        Role = reader["Role"].ToString(),
                        CreatedAt = reader["CreatedAt"] == DBNull.Value 
                                    ? (DateTime?)null 
                                    : Convert.ToDateTime(reader["CreatedAt"]),
                        ProfilePic = reader["ProfilePic"].ToString()
                    });
                }

                }
            }

            return View(users); // ipapasa sa view
        }

        [HttpPost]
        public IActionResult EditUser([FromBody] UserModel user)
        {

            if (string.IsNullOrWhiteSpace(user.Name))
            {
                return BadRequest(new { message = "Name is required." });
            }

            if (user.Name.Length < 3)
            {
                return BadRequest(new { message = "Name must be at least 3 characters." });
            }

            if (user.Name.Length > 18)
            {
                return BadRequest(new { message = "Name must not exceed 18 characters." });
            }

            if (string.IsNullOrEmpty(user.Phone) || user.Phone.Length != 11)
            {
                return BadRequest(new { message = "Phone number must be exactly 11 digits." });
            }

            using (var conn = new MySqlConnection(connectionString))
            {
                conn.Open();

                // Check for duplicates (Phone or Name)
                var checkCmd = new MySqlCommand(
                    "SELECT COUNT(*) FROM Users WHERE (Phone=@phone OR Name=@name) AND Id<>@id", conn);
                checkCmd.Parameters.AddWithValue("@id", user.Id);
                checkCmd.Parameters.AddWithValue("@phone", user.Phone);
                checkCmd.Parameters.AddWithValue("@name", user.Name);

                var count = Convert.ToInt32(checkCmd.ExecuteScalar());
                if (count > 0)
                {
                    return Conflict(new { message = "Duplicate Name or Phone detected!" });
                }

                // Update user safely
                var cmd = new MySqlCommand(
                    "UPDATE Users SET Name=@name, Phone=@phone, Password=@password, Role=@role WHERE Id=@id", conn);
                cmd.Parameters.AddWithValue("@id", user.Id);
                cmd.Parameters.AddWithValue("@name", user.Name);
                cmd.Parameters.AddWithValue("@phone", user.Phone);
                cmd.Parameters.AddWithValue("@password", user.Password);
                cmd.Parameters.AddWithValue("@role", user.Role);
                cmd.ExecuteNonQuery();
            }

            return Ok(new { message = "User updated successfully!" });
        }

        [HttpPost]
        public IActionResult DeleteUser([FromBody] UserModel user)
        {
            if (user == null || string.IsNullOrEmpty(user.Id))
                return BadRequest(new { message = "Invalid user Id." });

            using (var conn = new MySqlConnection(connectionString))
            {
                conn.Open();

                // Check if user exists
                var checkCmd = new MySqlCommand("SELECT COUNT(*) FROM Users WHERE Id=@id", conn);
                checkCmd.Parameters.AddWithValue("@id", user.Id);
                var exists = Convert.ToInt32(checkCmd.ExecuteScalar());
                if (exists == 0)
                    return NotFound(new { message = "User not found." });

                // Delete user
                var cmd = new MySqlCommand("DELETE FROM Users WHERE Id=@id", conn);
                cmd.Parameters.AddWithValue("@id", user.Id);
                cmd.ExecuteNonQuery();
            }

            return Ok(new { message = "User deleted successfully!" });
        }

    }
}
