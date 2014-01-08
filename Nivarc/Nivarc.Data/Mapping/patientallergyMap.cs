using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class patientallergyMap : EntityTypeConfiguration<patientallergy>
    {
        public patientallergyMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            // Table & Column Mappings
            this.ToTable("patientallergy", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.AllergyId).HasColumnName("AllergyId");

            // Relationships
            this.HasRequired(t => t.allergy)
                .WithMany(t => t.patientallergies)
                .HasForeignKey(d => d.AllergyId);
            this.HasRequired(t => t.patient)
                .WithMany(t => t.patientallergies)
                .HasForeignKey(d => d.PatientId);

        }
    }
}
