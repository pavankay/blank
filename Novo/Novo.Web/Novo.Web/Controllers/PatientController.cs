using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using Novo.Web.EF;

namespace Novo.Web.Controllers
{
    public class PatientController : Controller
    {
        private DBEntities db = new DBEntities();

        public ActionResult Autocomplete(string term)
        {
            var model = db.MedicalProviders
                          .Where(m => m.FirstName.StartsWith(term))
                          .Take(10)
                          .Select(m => m.FirstName + m.LastName);

            //return Json(model, JsonRequestBehavior.AllowGet);

            string content = string.Join<string>(@"\n", model);
            return Content(content);
        }

        // GET: /Patient/
        public ActionResult Index(string searchTerm = null)
        {
            var patients = db.Patients.Where(p => p.FirstName.StartsWith(searchTerm) || searchTerm == null).Include(p => p.MaritialStatu).Include(p => p.MedicalProvider);
            patients.ToList().ForEach(item => item.Title = GetTitle(item.Title));

            
            return View(patients.ToList());
        }

        private string GetTitle(string title)
        {
            switch(title)
            {
                case "1": title = "Mr."; break;
                case "2": title = "Mrs"; break;
                case "3": title = "Dr"; break;
                case "4": title = "Prof."; break;
                case "5": title = "Rev"; break;
            }

            return title;
        }

        // GET: /Patient/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Patient patient = db.Patients.Find(id);
            if (patient == null)
            {
                return HttpNotFound();
            }
            return View(patient);
        }

        // GET: /Patient/Create
        public ActionResult Create()
        {
            ViewBag.MaritalStatusId = new SelectList(db.MaritialStatus, "Id", "Description");
            ViewBag.PrimaryCareProviderId = new SelectList(db.MedicalProviders, "Id", "FirstName");
            ViewBag.GenderId = new SelectList(db.Genders, "Id", "Description");
            return View();
        }

        // POST: /Patient/Create
        // To protect from over posting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        // 
        // Example: public ActionResult Update([Bind(Include="ExampleProperty1,ExampleProperty2")] Model model)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(Patient patient)
        {
            if (ModelState.IsValid)
            {
                db.Patients.Add(patient);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            ViewBag.MaritalStatusId = new SelectList(db.MaritialStatus, "Id", "Description", patient.MaritalStatusId);
            ViewBag.PrimaryCareProviderId = new SelectList(db.MedicalProviders, "Id", "Title", patient.PrimaryCareProviderId);
            ViewBag.GenderId = new SelectList(db.Genders, "Id", "Description", patient.GenderId);
            return View(patient);
        }

        // GET: /Patient/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Patient patient = db.Patients.Find(id);
            if (patient == null)
            {
                return HttpNotFound();
            }
            ViewBag.MaritalStatusId = new SelectList(db.MaritialStatus, "Id", "Description", patient.MaritalStatusId);
            ViewBag.PrimaryCareProviderId = new SelectList(db.MedicalProviders, "Id", "Title", patient.PrimaryCareProviderId);
            return View(patient);
        }

        // POST: /Patient/Edit/5
        // To protect from over posting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        // 
        // Example: public ActionResult Update([Bind(Include="ExampleProperty1,ExampleProperty2")] Model model)
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(Patient patient)
        {
            if (ModelState.IsValid)
            {
                db.Entry(patient).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.MaritalStatusId = new SelectList(db.MaritialStatus, "Id", "Description", patient.MaritalStatusId);
            ViewBag.PrimaryCareProviderId = new SelectList(db.MedicalProviders, "Id", "Title", patient.PrimaryCareProviderId);
            return View(patient);
        }

        // GET: /Patient/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Patient patient = db.Patients.Find(id);
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
            Patient patient = db.Patients.Find(id);
            if (patient == null)
            {
                return HttpNotFound();
            }
            
            ViewBag.MaritalStatusId = new SelectList(db.MaritialStatus, "Id", "Description", patient.MaritalStatusId);
            ViewBag.PrimaryCareProviderId = new SelectList(db.MedicalProviders, "Id", "Title", patient.PrimaryCareProviderId);
            ViewData["a"] = db.AddressTypes;//.Where(a=> a.Description.Contains("Permanent")).FirstOrDefault();
            //ViewData["EmailTypeId"] = 1;// db.EmailTypes.Where(a => a.Description == "Perosnal Email").FirstOrDefault().Id;
            //ViewData["PhoneTypeId"] = 1;// db.PhoneTypes.Where(a => a.Description == "Mobile Phone").FirstOrDefault().Id;
            ViewBag.AddressTypeId = 14;
            ViewBag.EmailTypeId = 1;
            ViewBag.PhoneTypeId = 1;

            return View(patient);
        }

        // POST: /Patient/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            Patient patient = db.Patients.Find(id);
            db.Patients.Remove(patient);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}
