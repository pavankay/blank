using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class dosevalueMap : EntityTypeConfiguration<dosevalue>
    {
        public dosevalueMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Description)
                .IsRequired()
                .HasMaxLength(1073741823);

            this.Property(t => t.exatdose)
                .HasMaxLength(100);

            this.Property(t => t.mindose)
                .HasMaxLength(100);

            this.Property(t => t.maxdose)
                .HasMaxLength(100);

            // Table & Column Mappings
            this.ToTable("dosevalue", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Description).HasColumnName("Description");
            this.Property(t => t.exatdose).HasColumnName("exatdose");
            this.Property(t => t.mindose).HasColumnName("mindose");
            this.Property(t => t.maxdose).HasColumnName("maxdose");
        }
    }
}
