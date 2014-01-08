using System;
using Nivarc.Models;
using Nivarc.Repository.Repositories;
using Nivarc.Context;

namespace Nivarc.Repository
{
    public class UnitOfWorkPO : IDisposable
    {
        private nivarcContext context = new nivarcContext();
        private GenericRepository<patient> patientRepository;
        private GenericRepository<gender> genderRepository;
        private GenericRepository<maritalstatu> maritalStatusRepository;
        private GenericRepository<medicalprovider> medicalProviderRepository;
        private GenericRepository<title> titleRepository;

        public GenericRepository<patient> PatientRepository
        {
            get
            {
                if(this.patientRepository==null)
                {
                    this.patientRepository = new GenericRepository<patient>(context);
                }
                return patientRepository;
            }
        }

        public GenericRepository<gender> GenderRepository
        {
            get
            {
                if (this.genderRepository == null)
                {
                    this.genderRepository = new GenericRepository<gender>(context);
                }
                return genderRepository;
            }
        }

        public GenericRepository<maritalstatu> MaritalStatusRepository
        {
            get
            {
                if (this.maritalStatusRepository == null)
                {
                    this.maritalStatusRepository = new GenericRepository<maritalstatu>(context);
                }
                return maritalStatusRepository;
            }
        }

        public GenericRepository<medicalprovider> MedicalProviderRepository
        {
            get
            {
                if (this.medicalProviderRepository == null)
                {
                    this.medicalProviderRepository = new GenericRepository<medicalprovider>(context);
                }
                return medicalProviderRepository;
            }
        }

        public GenericRepository<title> TitleRepository
        {
            get
            {
                if (this.titleRepository == null)
                {
                    this.titleRepository = new GenericRepository<title>(context);
                }
                return titleRepository;
            }
        }
        public void Save()
        {
            context.SaveChanges();
        }

        private bool disposed = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed)
            {
                if (disposing)
                {
                    context.Dispose();
                }
            }
            this.disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
