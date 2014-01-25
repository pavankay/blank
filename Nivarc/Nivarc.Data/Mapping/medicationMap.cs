using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class medicationMap : EntityTypeConfiguration<medication>
    {
        public medicationMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Name)
                .IsRequired()
                .HasMaxLength(100);

            this.Property(t => t.Brand)
                .HasMaxLength(100);

            this.Property(t => t.Strength)
                .IsRequired()
                .HasMaxLength(100);

            // Table & Column Mappings
            this.ToTable("medication", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Name).HasColumnName("Name");
            this.Property(t => t.Brand).HasColumnName("Brand");
            this.Property(t => t.Strength).HasColumnName("Strength");
        }
    }
}
