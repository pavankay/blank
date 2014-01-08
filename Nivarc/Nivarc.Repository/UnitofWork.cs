using System;
using Nivarc.Models;
using Nivarc.Repository.Repositories;
using Nivarc.Context;
using System.Collections;

namespace Nivarc.Repository
{
    public class UnitOfWork : IDisposable
    {
        private nivarcContext context = new nivarcContext();
        private Hashtable repositories;

        public GenericRepository<T> Repository<T>() where T : class
        {
            if (repositories == null)
            {
                repositories = new Hashtable();
            }
            var type = typeof(T).Name;
            if(!repositories.ContainsKey(type))
            {
                var repositoryType = new GenericRepository<T>(context);
                repositories.Add(type, repositoryType);
            }
            return (GenericRepository<T>) repositories[type];
        }

        public CachedRepository<T> CachedRepository<T>() where T : class
        {
            if (repositories == null)
            {
                repositories = new Hashtable();
            }
            var type = typeof(T).Name;
            if (!repositories.ContainsKey(type))
            {
                var repositoryType = new CachedRepository<T>(context);
                repositories.Add(type, repositoryType);
            }
            return (CachedRepository<T>)repositories[type];
        }

        public void Save()
        {
            context.SaveChanges();
            foreach(var key in repositories.Keys)
            {
                if (repositories[key].GetType().GetGenericTypeDefinition() == typeof(CachedRepository<>))
                {
                    //remove cache
                    System.Reflection.MethodInfo method = repositories[key].GetType().GetMethod("RemoveFromCache");
                    method.Invoke(repositories[key], null);
                }
            }
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
