using System;
using System.Threading.Tasks;
using System.Linq.Expressions;
using System.Linq;
using System.Collections.Generic;
using Nivarc.Models;
using System.Data.Entity;
using System.Web.Caching;

namespace Nivarc.Repository.Repositories
{
    public class CachedRepository<TEntity> where TEntity : class
    {
        private DbContext context;
        private DbSet<TEntity> dbSet;
        private Cache cache = System.Web.HttpRuntime.Cache;
        private string key = typeof(TEntity).Name;
        private bool isChanged = true;
        private Expression<Func<TEntity, bool>> _filter;
        private Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> _orderByQuerable;

        public bool IsChanged
        {
            get { return isChanged; }
        }
        public CachedRepository(DbContext context)
        {
            this.context = context;
            this.dbSet = context.Set<TEntity>();
        }

        public virtual CachedRepository<TEntity> Filter(Expression<Func<TEntity, bool>> filter)
        {
            _filter = filter;
            return this;
        }

        public virtual CachedRepository<TEntity> OrderBy(Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy)
        {
            _orderByQuerable = orderBy;
            return this;
        }

        public virtual IEnumerable<TEntity> Get()
        {
            return Get(_filter, _orderByQuerable);
        }

        private IEnumerable<TEntity> Get(
            Expression<Func<TEntity, bool>> filter = null,
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null)
        {
            var cachedValue = GetCachedValue();
            if (cachedValue != null)
            {
                return cachedValue.ToList();
            }
            IQueryable<TEntity> query = dbSet;
            lock (new object())
            {
                //1 hr sliding expiration
                cache.Add(key, query.ToList(), null, Cache.NoAbsoluteExpiration, new TimeSpan(1, 0, 0), CacheItemPriority.Default, null);
            }
            return query.ToList();
        }

        private IEnumerable<TEntity> GetCachedValue()
        {
            IEnumerable<TEntity> value = null;
            if (cache != null && cache[key] != null)
            {
                value = (IEnumerable<TEntity>)cache[key];
            }
            return value;
        }

        public virtual TEntity GetByID(object id)
        {
            return dbSet.Find(id);
        }

        public virtual void Insert(TEntity entity)
        {
            isChanged = true;
            dbSet.Add(entity);
        }

        public virtual void Delete(object id)
        {
            TEntity entityToDelete = dbSet.Find(id);
            Delete(entityToDelete);
        }

        public virtual void Delete(TEntity entityToDelete)
        {
            isChanged = true;
            if (context.Entry(entityToDelete).State == EntityState.Detached)
            {
                dbSet.Attach(entityToDelete);
            }
            dbSet.Remove(entityToDelete);
        }

        public void RemoveFromCache()
        { 
            if(isChanged)
            {
                cache.Remove(key);
            }
        }

        public virtual void Update(TEntity entityToUpdate)
        {
            isChanged = true;
            dbSet.Attach(entityToUpdate);
            context.Entry(entityToUpdate).State = EntityState.Modified;
        }
    }
}
