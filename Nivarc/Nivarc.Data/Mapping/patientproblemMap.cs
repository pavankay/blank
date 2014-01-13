using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class patientproblemMap : EntityTypeConfiguration<patientproblem>
    {
        public patientproblemMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            // Table & Column Mappings
            this.ToTable("patientproblem", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.ProblemId).HasColumnName("ProblemId");
            this.Property(t => t.OnsetDate).HasColumnName("OnsetDate");

            // Relationships
            this.HasRequired(t => t.patient)
                .WithMany(t => t.patientproblems)
                .HasForeignKey(d => d.PatientId);
            this.HasRequired(t => t.problem)
                .WithMany(t => t.patientproblems)
                .HasForeignKey(d => d.ProblemId);

        }
    }
}
