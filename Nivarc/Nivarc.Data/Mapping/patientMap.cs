using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class patientMap : EntityTypeConfiguration<patient>
    {
        public patientMap()
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

            // Table & Column Mappings
            this.ToTable("patient", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.TitleId).HasColumnName("TitleId");
            this.Property(t => t.FirstName).HasColumnName("FirstName");
            this.Property(t => t.LastName).HasColumnName("LastName");
            this.Property(t => t.MiddleName).HasColumnName("MiddleName");
            this.Property(t => t.DateOfBirth).HasColumnName("DateOfBirth");
            this.Property(t => t.DateOfDeath).HasColumnName("DateOfDeath");
            this.Property(t => t.MaritalStatusId).HasColumnName("MaritalStatusId");
            this.Property(t => t.PrimaryCareProviderId).HasColumnName("PrimaryCareProviderId");
            this.Property(t => t.GenderId).HasColumnName("GenderId");

            // Relationships
            this.HasRequired(t => t.gender)
                .WithMany(t => t.patients)
                .HasForeignKey(d => d.GenderId);
            this.HasOptional(t => t.maritalstatu)
                .WithMany(t => t.patients)
                .HasForeignKey(d => d.MaritalStatusId);
            this.HasOptional(t => t.medicalprovider)
                .WithMany(t => t.patients)
                .HasForeignKey(d => d.PrimaryCareProviderId);
            this.HasOptional(t => t.title)
                .WithMany(t => t.patients)
                .HasForeignKey(d => d.TitleId);

        }
    }
}
