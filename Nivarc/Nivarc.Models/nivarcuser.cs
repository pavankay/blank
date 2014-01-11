using System;
using System.Collections.Generic;

namespace Nivarc.Models
{
    public partial class nivarcuser
    {
        public nivarcuser()
        {
            this.nivarcroles = new List<nivarcrole>();
        }

        public int Id { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public virtual ICollection<nivarcrole> nivarcroles { get; set; }
    }
}
