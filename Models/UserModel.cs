namespace Models
{
    public class UserModel
    {
        public int Id { get; set; }        
        public string Name {get; set;}
        public string? Phone { get; set; }
        public string Password {get; set;}
        public string ProfilePic {get; set;}
        public string GoogleId { get; set; }
        public DateTime? CreatedAt { get; set; }                                              
        public string Role {get; set;}
        public int Points { get; set; } = 0; 
    }
}