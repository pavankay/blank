using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class medicalproviderMap : EntityTypeConfiguration<medicalprovider>
    {
        public medicalproviderMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.FirstName)
                .HasMaxLength(1073741823);

            this.Property(t => t.LastName)
                .HasMaxLength(1073741823);

            this.Property(t => t.MiddleName)
                .HasMaxLength(100);

            this.Property(t => t.WebUrl)
                .HasMaxLength(1073741823);

            // Table & Column Mappings
            this.ToTable("medicalprovider", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.MedicalProviderTypeId).HasColumnName("MedicalProviderTypeId");
            this.Property(t => t.TitleId).HasColumnName("TitleId");
            this.Property(t => t.FirstName).HasColumnName("FirstName");
            this.Property(t => t.LastName).HasColumnName("LastName");
            this.Property(t => t.MiddleName).HasColumnName("MiddleName");
            this.Property(t => t.DateOfBirth).HasColumnName("DateOfBirth");
            this.Property(t => t.GenderId).HasColumnName("GenderId");
            this.Property(t => t.WebUrl).HasColumnName("WebUrl");

            // Relationships
            this.HasRequired(t => t.gender)
                .WithMany(t => t.medicalproviders)
                .HasForeignKey(d => d.GenderId);
            this.HasRequired(t => t.medicalprovidertype)
                .WithMany(t => t.medicalproviders)
                .HasForeignKey(d => d.MedicalProviderTypeId);
            this.HasOptional(t => t.title)
                .WithMany(t => t.medicalproviders)
                .HasForeignKey(d => d.TitleId);

        }
    }
}
