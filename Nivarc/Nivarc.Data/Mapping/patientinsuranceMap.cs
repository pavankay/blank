using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class patientinsuranceMap : EntityTypeConfiguration<patientinsurance>
    {
        public patientinsuranceMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.InsurancePlanId)
                .HasMaxLength(60);

            // Table & Column Mappings
            this.ToTable("patientinsurance", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.InsuranceProviderId).HasColumnName("InsuranceProviderId");
            this.Property(t => t.InsurancePlanTypeId).HasColumnName("InsurancePlanTypeId");
            this.Property(t => t.InsurancePlanId).HasColumnName("InsurancePlanId");
            this.Property(t => t.PlanEffectiveDate).HasColumnName("PlanEffectiveDate");
            this.Property(t => t.PlanExpirationDate).HasColumnName("PlanExpirationDate");

            // Relationships
            this.HasOptional(t => t.insuranceplantype)
                .WithMany(t => t.patientinsurances)
                .HasForeignKey(d => d.InsurancePlanTypeId);
            this.HasRequired(t => t.insuranceprovider)
                .WithMany(t => t.patientinsurances)
                .HasForeignKey(d => d.InsuranceProviderId);
            this.HasRequired(t => t.patient)
                .WithMany(t => t.patientinsurances)
                .HasForeignKey(d => d.PatientId);

        }
    }
}
