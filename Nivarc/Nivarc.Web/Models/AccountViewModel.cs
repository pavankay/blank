using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.Identity.EntityFramework;

namespace Nivarc.Web.Models
{
    public class AccountViewModel
    {
        public List<Role> Roles { get; set; }
        public User User { get; set; }
    }
}