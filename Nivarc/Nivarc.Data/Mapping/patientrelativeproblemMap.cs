using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class patientrelativeproblemMap : EntityTypeConfiguration<patientrelativeproblem>
    {
        public patientrelativeproblemMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            // Table & Column Mappings
            this.ToTable("patientrelativeproblem", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.PatientId).HasColumnName("PatientId");
            this.Property(t => t.ProblemId).HasColumnName("ProblemId");
            this.Property(t => t.RelationTypeId).HasColumnName("RelationTypeId");

            // Relationships
            this.HasRequired(t => t.patient)
                .WithMany(t => t.patientrelativeproblems)
                .HasForeignKey(d => d.PatientId);
            this.HasRequired(t => t.problem)
                .WithMany(t => t.patientrelativeproblems)
                .HasForeignKey(d => d.ProblemId);
            this.HasRequired(t => t.relationtype)
                .WithMany(t => t.patientrelativeproblems)
                .HasForeignKey(d => d.RelationTypeId);

        }
    }
}
