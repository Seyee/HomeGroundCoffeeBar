namespace HomeGroundCoffeeBar.DTO
{
    public class PaymentRequest
    {
        public required int Amount { get; set; }
        public required string PaymentMethod { get; set; }
    }
}