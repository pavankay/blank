using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class immunizationMap : EntityTypeConfiguration<immunization>
    {
        public immunizationMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.SubstanceLotNumber)
                .HasMaxLength(200);

            this.Property(t => t.Note)
                .HasMaxLength(1073741823);

            // Table & Column Mappings
            this.ToTable("immunization", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.VaccineId).HasColumnName("VaccineId");
            this.Property(t => t.DoseNumber).HasColumnName("DoseNumber");
            this.Property(t => t.AdministeredUnits).HasColumnName("AdministeredUnits");
            this.Property(t => t.ImmunizationRouteId).HasColumnName("ImmunizationRouteId");
            this.Property(t => t.ImmunizationSiteId).HasColumnName("ImmunizationSiteId");
            this.Property(t => t.SubstanceLotNumber).HasColumnName("SubstanceLotNumber");
            this.Property(t => t.VaccinationDate).HasColumnName("VaccinationDate");
            this.Property(t => t.OrderedProviderId).HasColumnName("OrderedProviderId");
            this.Property(t => t.AdministeredProviderId).HasColumnName("AdministeredProviderId");
            this.Property(t => t.Note).HasColumnName("Note");

            // Relationships
            this.HasRequired(t => t.immunizationsite)
                .WithMany(t => t.immunizations)
                .HasForeignKey(d => d.ImmunizationSiteId);
            this.HasOptional(t => t.medicalprovider)
                .WithMany(t => t.immunizations)
                .HasForeignKey(d => d.OrderedProviderId);
            this.HasOptional(t => t.medicalprovider1)
                .WithMany(t => t.immunizations1)
                .HasForeignKey(d => d.AdministeredProviderId);
            this.HasRequired(t => t.patient)
                .WithMany(t => t.immunizations)
                .HasForeignKey(d => d.PatientId);
            this.HasRequired(t => t.vaccine)
                .WithMany(t => t.immunizations)
                .HasForeignKey(d => d.VaccineId);

        }
    }
}
