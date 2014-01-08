using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class medicalproviderphoneMap : EntityTypeConfiguration<medicalproviderphone>
    {
        public medicalproviderphoneMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Number)
                .IsRequired()
                .HasMaxLength(64);

            // Table & Column Mappings
            this.ToTable("medicalproviderphone", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.MedicalProviderId).HasColumnName("MedicalProviderId");
            this.Property(t => t.Number).HasColumnName("Number");
            this.Property(t => t.PhoneTypeId).HasColumnName("PhoneTypeId");

            // Relationships
            this.HasRequired(t => t.medicalprovider)
                .WithMany(t => t.medicalproviderphones)
                .HasForeignKey(d => d.MedicalProviderId);
            this.HasRequired(t => t.phonetype)
                .WithMany(t => t.medicalproviderphones)
                .HasForeignKey(d => d.PhoneTypeId);

        }
    }
}
