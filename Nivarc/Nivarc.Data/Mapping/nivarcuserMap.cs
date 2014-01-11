using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class nivarcuserMap : EntityTypeConfiguration<nivarcuser>
    {
        public nivarcuserMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.UserName)
                .IsRequired()
                .HasMaxLength(1073741823);

            this.Property(t => t.Password)
                .IsRequired()
                .HasMaxLength(128);

            // Table & Column Mappings
            this.ToTable("nivarcusers", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.UserName).HasColumnName("UserName");
            this.Property(t => t.Password).HasColumnName("Password");
        }
    }
}
