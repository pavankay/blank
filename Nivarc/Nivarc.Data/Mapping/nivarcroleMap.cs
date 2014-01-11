using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class nivarcroleMap : EntityTypeConfiguration<nivarcrole>
    {
        public nivarcroleMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Description)
                .IsRequired()
                .HasMaxLength(100);

            // Table & Column Mappings
            this.ToTable("nivarcroles", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Description).HasColumnName("Description");

            // Relationships
            this.HasMany(t => t.nivarcusers)
                .WithMany(t => t.nivarcroles)
                .Map(m =>
                    {
                        m.ToTable("nivarcuserroles", "nivarc");
                        m.MapLeftKey("RoleId");
                        m.MapRightKey("UserId");
                    });


        }
    }
}
