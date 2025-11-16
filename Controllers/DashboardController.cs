using Microsoft.AspNetCore.Mvc;

namespace _.Controllers
{
    public class DashboardController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
