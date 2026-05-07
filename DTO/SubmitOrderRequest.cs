public class SubmitOrderRequest
{
    public string FullName       { get; set; } = string.Empty;
    // public string Phone       ← remove this
    public string StreetAddress  { get; set; } = string.Empty;
    public string State          { get; set; } = string.Empty;
    public string City           { get; set; } = string.Empty;
    public string ZipCode        { get; set; } = string.Empty;
    public string PaymentMethod  { get; set; } = string.Empty;
    public string? DeliveryNotes { get; set; }
}