using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using Nivarc.Models.Mapping;
using Nivarc.Models;

namespace Nivarc.Context
{
    public partial class nivarcContext : DbContext
    {
        static nivarcContext()
        {
            Database.SetInitializer<nivarcContext>(null);
        }

        public nivarcContext()
            : base("Name=nivarcContext")
        {
        }

        public DbSet<addresstype> addresstypes { get; set; }
        public DbSet<allergy> allergies { get; set; }
        public DbSet<dosageunittype> dosageunittypes { get; set; }
        public DbSet<emailtype> emailtypes { get; set; }
        public DbSet<gender> genders { get; set; }
        public DbSet<investigation> investigations { get; set; }
        public DbSet<jobrole> jobroles { get; set; }
        public DbSet<maritalstatu> maritalstatus { get; set; }
        public DbSet<medicalfacility> medicalfacilities { get; set; }
        public DbSet<medicalprovider> medicalproviders { get; set; }
        public DbSet<medicalprovideraddress> medicalprovideraddresses { get; set; }
        public DbSet<medicalprovideremail> medicalprovideremails { get; set; }
        public DbSet<medicalprovidermedicalfacility> medicalprovidermedicalfacilities { get; set; }
        public DbSet<medicalproviderphone> medicalproviderphones { get; set; }
        public DbSet<medicalprovidertype> medicalprovidertypes { get; set; }
        public DbSet<medication> medications { get; set; }
        public DbSet<patient> patients { get; set; }
        public DbSet<patientaddress> patientaddresses { get; set; }
        public DbSet<patientallergy> patientallergies { get; set; }
        public DbSet<patientemail> patientemails { get; set; }
        public DbSet<patientmedication> patientmedications { get; set; }
        public DbSet<patientnote> patientnotes { get; set; }
        public DbSet<patientpersonidentifier> patientpersonidentifiers { get; set; }
        public DbSet<patientphone> patientphones { get; set; }
        public DbSet<patientproblem> patientproblems { get; set; }
        public DbSet<patientrelativeproblem> patientrelativeproblems { get; set; }
        public DbSet<personidentifiertype> personidentifiertypes { get; set; }
        public DbSet<phonetype> phonetypes { get; set; }
        public DbSet<prescription> prescriptions { get; set; }
        public DbSet<problem> problems { get; set; }
        public DbSet<relationtype> relationtypes { get; set; }
        public DbSet<title> titles { get; set; }
        public DbSet<visit> visits { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Configurations.Add(new addresstypeMap());
            modelBuilder.Configurations.Add(new allergyMap());
            modelBuilder.Configurations.Add(new dosageunittypeMap());
            modelBuilder.Configurations.Add(new emailtypeMap());
            modelBuilder.Configurations.Add(new genderMap());
            modelBuilder.Configurations.Add(new investigationMap());
            modelBuilder.Configurations.Add(new jobroleMap());
            modelBuilder.Configurations.Add(new maritalstatuMap());
            modelBuilder.Configurations.Add(new medicalfacilityMap());
            modelBuilder.Configurations.Add(new medicalproviderMap());
            modelBuilder.Configurations.Add(new medicalprovideraddressMap());
            modelBuilder.Configurations.Add(new medicalprovideremailMap());
            modelBuilder.Configurations.Add(new medicalprovidermedicalfacilityMap());
            modelBuilder.Configurations.Add(new medicalproviderphoneMap());
            modelBuilder.Configurations.Add(new medicalprovidertypeMap());
            modelBuilder.Configurations.Add(new medicationMap());
            modelBuilder.Configurations.Add(new patientMap());
            modelBuilder.Configurations.Add(new patientaddressMap());
            modelBuilder.Configurations.Add(new patientallergyMap());
            modelBuilder.Configurations.Add(new patientemailMap());
            modelBuilder.Configurations.Add(new patientmedicationMap());
            modelBuilder.Configurations.Add(new patientnoteMap());
            modelBuilder.Configurations.Add(new patientpersonidentifierMap());
            modelBuilder.Configurations.Add(new patientphoneMap());
            modelBuilder.Configurations.Add(new patientproblemMap());
            modelBuilder.Configurations.Add(new patientrelativeproblemMap());
            modelBuilder.Configurations.Add(new personidentifiertypeMap());
            modelBuilder.Configurations.Add(new phonetypeMap());
            modelBuilder.Configurations.Add(new prescriptionMap());
            modelBuilder.Configurations.Add(new problemMap());
            modelBuilder.Configurations.Add(new relationtypeMap());
            modelBuilder.Configurations.Add(new titleMap());
            modelBuilder.Configurations.Add(new visitMap());
        }
    }
}
