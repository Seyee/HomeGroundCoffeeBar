namespace Models
{
    public class UserModel
    {
        public string Id {get; set;}
        public string Name {get; set;}
        public string Phone {get; set;}
        public string Password {get; set;}
        public string ProfilePic {get; set;}
        public DateTime CreatedAt { get; set; }
        public string Role {get; set;}
    }
}