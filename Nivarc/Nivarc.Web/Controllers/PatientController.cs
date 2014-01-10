using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using Nivarc;
using Nivarc.Repository;
using Nivarc.Models;
using System.Linq.Expressions;

namespace Nivarc.Controllers
{
    public class PatientController : Controller
    {
        private UnitOfWork unitOfWork = new UnitOfWork();

        public ActionResult Autocomplete(string term)
        {
            int x=0;
            var model = unitOfWork.Repository<medicalprovider>().Filter(m => m.FirstName.StartsWith(term)).GetPage(1, 10, out x).Select(m => m.FirstName + m.LastName);
            //return Json(model, JsonRequestBehavior.AllowGet);

            string content = string.Join<string>(@"\n", model);
            return Content(content);
        }

        // GET: /Patient/
        public ActionResult Index(string searchTerm = null)
        {
            var patients = unitOfWork.Repository<patient>().Filter(p => p.FirstName.StartsWith(searchTerm) || searchTerm == null).Include(p => p.maritalstatu).Include(p => p.medicalprovider).Get();

            return View(patients.ToList());
        }

        // GET: /Patient/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            patient patient = unitOfWork.Repository<patient>().GetByID(id);
            if (patient == null)
            {
                return HttpNotFound();
            }
            return View(patient);
        }

        // GET: /Patient/Create
        public ActionResult Create()
        {
            ViewBag.MaritalStatusId = new SelectList(unitOfWork.CachedRepository<maritalstatu>().Get(), "Id", "Description");
            ViewBag.PrimaryCareProviderId = new SelectList(unitOfWork.Repository<medicalprovider>().Get(), "Id", "FirstName");
            ViewBag.GenderId = new SelectList(unitOfWork.CachedRepository<gender>().Get(), "Id", "Description");
            ViewBag.TitleId = new SelectList(unitOfWork.CachedRepository<title>().Get(), "Id", "Description");
            return View();
        }

        // POST: /Patient/Create
        // To protect from over posting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        // 
        // Example: public ActionResult Update([Bind(Include="ExampleProperty1,ExampleProperty2")] Model model)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(patient patient)
        {
            if (ModelState.IsValid)
            {
                unitOfWork.Repository<patient>().Insert(patient);
                unitOfWork.Save();
                return RedirectToAction("Index");
            }

            ViewBag.MaritalStatusId = new SelectList(unitOfWork.CachedRepository<maritalstatu>().Get(), "Id", "Description");
            ViewBag.PrimaryCareProviderId = new SelectList(unitOfWork.Repository<medicalprovider>().Get(), "Id", "FirstName");
            ViewBag.GenderId = new SelectList(unitOfWork.CachedRepository<gender>().Get(), "Id", "Description");
            ViewBag.TitleId = new SelectList(unitOfWork.CachedRepository<title>().Get(), "Id", "Description");
            return View(patient);
        }

        // GET: /Patient/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            patient patient = unitOfWork.Repository<patient>().GetByID(id);
            if (patient == null)
            {
                return HttpNotFound();
            }
            ViewBag.MaritalStatusId = new SelectList(unitOfWork.CachedRepository<maritalstatu>().Get(), "Id", "Description");
            ViewBag.PrimaryCareProviderId = new SelectList(unitOfWork.Repository<medicalprovider>().Get(), "Id", "FirstName");
            ViewBag.GenderId = new SelectList(unitOfWork.CachedRepository<gender>().Get(), "Id", "Description");
            ViewBag.TitleId = new SelectList(unitOfWork.CachedRepository<title>().Get(), "Id", "Description");
            return View(patient);
        }

        // POST: /Patient/Edit/5
        // To protect from over posting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        // 
        // Example: public ActionResult Update([Bind(Include="ExampleProperty1,ExampleProperty2")] Model model)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(patient patient)
        {
            unitOfWork.Repository<patient>().Update(patient);
            unitOfWork.Save();
            ViewBag.MaritalStatusId = new SelectList(unitOfWork.CachedRepository<maritalstatu>().Get(), "Id", "Description");
            ViewBag.PrimaryCareProviderId = new SelectList(unitOfWork.Repository<medicalprovider>().Get(), "Id", "FirstName");
            ViewBag.GenderId = new SelectList(unitOfWork.CachedRepository<gender>().Get(), "Id", "Description");
            ViewBag.TitleId = new SelectList(unitOfWork.CachedRepository<title>().Get(), "Id", "Description");
            return View(patient);
        }

        // GET: /Patient/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            patient patient = unitOfWork.Repository<patient>().GetByID(id);
            if (patient == null)
            {
                return HttpNotFound();
            }
            return View(patient);
        }

        // GET: /Patient/EHR/5
        public ActionResult EHR(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            patient patient = unitOfWork.Repository<patient>().GetByID(id);
            if (patient == null)
            {
                return HttpNotFound();
            }

            ViewBag.MaritalStatusId = new SelectList(unitOfWork.CachedRepository<maritalstatu>().Get(), "Id", "Description");
            ViewBag.PrimaryCareProviderId = new SelectList(unitOfWork.Repository<medicalprovider>().Get(), "Id", "FirstName");
            ViewBag.GenderId = new SelectList(unitOfWork.CachedRepository<gender>().Get(), "Id", "Description");
            ViewBag.TitleId = new SelectList(unitOfWork.CachedRepository<title>().Get(), "Id", "Description");
            ViewData["a"] = unitOfWork.CachedRepository<addresstype>().Get();
            //.Where(a=> a.Description.Contains("Permanent")).FirstOrDefault();
            //ViewData["EmailTypeId"] = 1;// db.EmailTypes.Where(a => a.Description == "Perosnal Email").FirstOrDefault().Id;
            //ViewData["PhoneTypeId"] = 1;// db.PhoneTypes.Where(a => a.Description == "Mobile Phone").FirstOrDefault().Id;
            ViewBag.AddressTypeId = 1;
            ViewBag.EmailTypeId = 1;
            ViewBag.PhoneTypeId = 1;

            return View(patient);
        }

        // POST: /Patient/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            patient patient = unitOfWork.Repository<patient>().GetByID(id);
            unitOfWork.Repository<patient>().Delete(patient);
            unitOfWork.Save();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            unitOfWork.Dispose();
            base.Dispose(disposing);
        }
    }
}
