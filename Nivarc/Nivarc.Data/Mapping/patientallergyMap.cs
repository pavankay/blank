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
            this.Property(t => t.Description)
                .IsRequired()
                .HasMaxLength(1073741823);

            // Table & Column Mappings
            this.ToTable("patientallergy", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Description).HasColumnName("Description");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.AllergyTypeId).HasColumnName("AllergyTypeId");
            this.Property(t => t.AllergyReactionId).HasColumnName("AllergyReactionId");
            this.Property(t => t.FirstObserved).HasColumnName("FirstObserved");

            // Relationships
            this.HasOptional(t => t.allergyreaction)
                .WithMany(t => t.patientallergies)
                .HasForeignKey(d => d.AllergyReactionId);
            this.HasRequired(t => t.allergytype)
                .WithMany(t => t.patientallergies)
                .HasForeignKey(d => d.AllergyTypeId);
            this.HasRequired(t => t.patient)
                .WithMany(t => t.patientallergies)
                .HasForeignKey(d => d.PatientId);

        }
    }
}
