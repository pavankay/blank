﻿using Microsoft.AspNet.Identity.EntityFramework;

namespace Nivarc.Web.Models
{
    // You can add profile data for the user by adding more properties to your User class, please visit http://go.microsoft.com/fwlink/?LinkID=317594 to learn more.
    public class ApplicationUser : User
    {  
    }

    public class ApplicationDbContext : IdentityDbContext<User, UserClaim, UserSecret, UserLogin, Role, UserRole, Token, UserManagement>
    {
    }
}