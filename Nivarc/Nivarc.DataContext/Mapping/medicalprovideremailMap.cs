using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace Nivarc.Models.Mapping
{
    public class medicalprovideremailMap : EntityTypeConfiguration<medicalprovideremail>
    {
        public medicalprovideremailMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Number)
                .IsRequired()
                .HasMaxLength(64);

            // Table & Column Mappings
            this.ToTable("medicalprovideremail", "nivarc");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.MedicalProviderId).HasColumnName("MedicalProviderId");
            this.Property(t => t.Number).HasColumnName("Number");
            this.Property(t => t.EmailTypeId).HasColumnName("EmailTypeId");

            // Relationships
            this.HasRequired(t => t.emailtype)
                .WithMany(t => t.medicalprovideremails)
                .HasForeignKey(d => d.EmailTypeId);
            this.HasRequired(t => t.medicalprovider)
                .WithMany(t => t.medicalprovideremails)
                .HasForeignKey(d => d.MedicalProviderId);

        }
    }
}
