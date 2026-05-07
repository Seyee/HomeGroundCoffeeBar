using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace HomeGroundCoffeeBar.Models;

public class Order
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string OrderId { get; set; } = string.Empty;

    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string Address { get; set; } = string.Empty;

    [Required]
    public string PaymentMethod { get; set; } = string.Empty;

    public string? DeliveryNotes { get; set; }

    // Stored as JSON string in the DB column
    public string ItemsJson { get; set; } = "[]";

    // Not mapped — just for convenience in C#
    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public List<OrderItemSnapshot> Items
    {
        get => JsonSerializer.Deserialize<List<OrderItemSnapshot>>(ItemsJson) ?? new();
        set => ItemsJson = JsonSerializer.Serialize(value);
    }

    public decimal Subtotal    { get; set; }
    public decimal DeliveryFee { get; set; } = 50m;
    public decimal Total       { get; set; }
    public int     PointsEarned { get; set; }

    public string Status { get; set; } = "Pending";

    public int UserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


// Snapshot of a cart item at time of order — no FK needed
public class OrderItemSnapshot
{
    public string ProductName { get; set; } = string.Empty;
    public decimal Price      { get; set; }
    public int Quantity       { get; set; }
    public string? Image      { get; set; }
}