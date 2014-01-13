using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class vitalsignobservationMap : EntityTypeConfiguration<vitalsignobservation>
    {
        public vitalsignobservationMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.TextValue)
                .HasMaxLength(1073741823);

            this.Property(t => t.Notes)
                .HasMaxLength(1073741823);

            // Table & Column Mappings
            this.ToTable("vitalsignobservation", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.EncounterId).HasColumnName("EncounterId");
            this.Property(t => t.VitalSignCodeId).HasColumnName("VitalSignCodeId");
            this.Property(t => t.Value).HasColumnName("Value");
            this.Property(t => t.LabResultUnitId).HasColumnName("LabResultUnitId");
            this.Property(t => t.LabResultFlagId).HasColumnName("LabResultFlagId");
            this.Property(t => t.LabResultStatusId).HasColumnName("LabResultStatusId");
            this.Property(t => t.ReferenceMinimum).HasColumnName("ReferenceMinimum");
            this.Property(t => t.ReferenceMaximum).HasColumnName("ReferenceMaximum");
            this.Property(t => t.ObservationDate).HasColumnName("ObservationDate");
            this.Property(t => t.TextValue).HasColumnName("TextValue");
            this.Property(t => t.Notes).HasColumnName("Notes");

            // Relationships
            this.HasOptional(t => t.labresultflag)
                .WithMany(t => t.vitalsignobservations)
                .HasForeignKey(d => d.LabResultFlagId);
            this.HasOptional(t => t.labresultstatu)
                .WithMany(t => t.vitalsignobservations)
                .HasForeignKey(d => d.LabResultStatusId);
            this.HasOptional(t => t.labresultunit)
                .WithMany(t => t.vitalsignobservations)
                .HasForeignKey(d => d.LabResultUnitId);
            this.HasRequired(t => t.medicalencounter)
                .WithMany(t => t.vitalsignobservations)
                .HasForeignKey(d => d.EncounterId);
            this.HasRequired(t => t.vitalsigncode)
                .WithMany(t => t.vitalsignobservations)
                .HasForeignKey(d => d.VitalSignCodeId);

        }
    }
}
