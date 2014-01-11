using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class vaccineMap : EntityTypeConfiguration<vaccine>
    {
        public vaccineMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Description)
                .IsRequired()
                .HasMaxLength(1073741823);

            // Table & Column Mappings
            this.ToTable("vaccine", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Description).HasColumnName("Description");
            this.Property(t => t.VaccineTypeId).HasColumnName("VaccineTypeId");
            this.Property(t => t.MaxNoOfDoses).HasColumnName("MaxNoOfDoses");

            // Relationships
            this.HasRequired(t => t.vaccinetype)
                .WithMany(t => t.vaccines)
                .HasForeignKey(d => d.VaccineTypeId);

        }
    }
}
