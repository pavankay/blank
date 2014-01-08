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

        // GET: /Patient/
        public ActionResult Index()
        {
            //var patients = unitOfWork.Repository<patient>().Get(null, null, new List<Expression<Func<patient, object>>>() { { x => x.gender }, { x => x.maritalstatu } }, null, null);
            var addresstypes = unitOfWork.CachedRepository<addresstype>().Get();
            var patients = unitOfWork.Repository<patient>().Filter(x => x.FirstName == "Vasu").Get();
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
            ViewBag.GenderId = new SelectList(unitOfWork.Repository<gender>().Get(), "Id", "Description");
            ViewBag.MaritalStatusId = new SelectList(unitOfWork.Repository<maritalstatu>().Get(), "Id", "Description");
            ViewBag.PrimaryCareProviderId = new SelectList(unitOfWork.Repository<medicalprovider>().Get(), "Id", "FirstName");
            ViewBag.TitleId = new SelectList(unitOfWork.Repository<title>().Get(), "Id", "Description");
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

            ViewBag.GenderId = new SelectList(unitOfWork.Repository<gender>().Get(), "Id", "Description", patient.GenderId);
            ViewBag.MaritalStatusId = new SelectList(unitOfWork.Repository<maritalstatu>().Get(), "Id", "Description", patient.MaritalStatusId);
            ViewBag.PrimaryCareProviderId = new SelectList(unitOfWork.Repository<medicalprovider>().Get(), "Id", "FirstName", patient.PrimaryCareProviderId);
            ViewBag.TitleId = new SelectList(unitOfWork.Repository<title>().Get(), "Id", "Description", patient.TitleId);
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
            ViewBag.GenderId = new SelectList(unitOfWork.Repository<gender>().Get(), "Id", "Description", patient.GenderId);
            ViewBag.MaritalStatusId = new SelectList(unitOfWork.Repository<maritalstatu>().Get(), "Id", "Description", patient.MaritalStatusId);
            ViewBag.PrimaryCareProviderId = new SelectList(unitOfWork.Repository<medicalprovider>().Get(), "Id", "FirstName", patient.PrimaryCareProviderId);
            ViewBag.TitleId = new SelectList(unitOfWork.Repository<title>().Get(), "Id", "Description", patient.TitleId);
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

            ViewBag.GenderId = new SelectList(unitOfWork.Repository<gender>().Get(), "Id", "Description", patient.GenderId);
            ViewBag.MaritalStatusId = new SelectList(unitOfWork.Repository<maritalstatu>().Get(), "Id", "Description", patient.MaritalStatusId);
            ViewBag.PrimaryCareProviderId = new SelectList(unitOfWork.Repository<medicalprovider>().Get(), "Id", "FirstName", patient.PrimaryCareProviderId);
            ViewBag.TitleId = new SelectList(unitOfWork.Repository<title>().Get(), "Id", "Description", patient.TitleId);
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
            base.Dispose(disposing);
        }
    }
}
