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
            int x = 0;
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
            ViewBag.AddressTypeId = new SelectList(unitOfWork.CachedRepository<addresstype>().Get(), "Id", "Description");
            ViewBag.PhoneTypeId = new SelectList(unitOfWork.CachedRepository<phonetype>().Get(), "Id", "Description");
            ViewBag.EmailTypeId = new SelectList(unitOfWork.CachedRepository<emailtype>().Get(), "Id", "Description");
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
            ViewBag.AddressTypeId = new SelectList(unitOfWork.CachedRepository<addresstype>().Get(), "Id", "Description");
            ViewBag.PhoneTypeId = new SelectList(unitOfWork.CachedRepository<phonetype>().Get(), "Id", "Description");
            ViewBag.EmailTypeId = new SelectList(unitOfWork.CachedRepository<emailtype>().Get(), "Id", "Description");
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
            
            ViewBag.AddressTypeId = unitOfWork.CachedRepository<addresstype>().Get().Where(a => a.Description == "Permanent").FirstOrDefault().Id;
            ViewBag.EmailTypeId = unitOfWork.CachedRepository<emailtype>().Get().Where(a => a.Description == "Personal").FirstOrDefault().Id;
            ViewBag.PhoneTypeId = unitOfWork.CachedRepository<phonetype>().Get().Where(a => a.Description == "Mobile").FirstOrDefault().Id;
            
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

        public ActionResult AddPatientMedication()
        {
            ViewBag.MedicationId = new SelectList(unitOfWork.Repository<medication>().Get().Select(x => new { Id = x.Id, Name = string.Format("{0}-{1}", x.Name, x.Strength) }), "Id", "Name");
            return PartialView("_AddPatientMedication");
        }

        [HttpPost]
        public ActionResult AddPatientMedication(patientmedication medication)
        {
            unitOfWork.Repository<patientmedication>().Insert(medication);
            unitOfWork.Save();
            unitOfWork = new UnitOfWork();
            return PartialView("_PatientMedication", unitOfWork.Repository<patientmedication>().Filter(x => x.PatientId == medication.PatientId).Get());
        }

        public ActionResult CreateVisit()
        {
            int patientId = int.Parse(RouteData.Values["id"].ToString());
            ViewBag.MedicalFacilityId = new SelectList(unitOfWork.CachedRepository<medicalfacility>().Get(), "Id", "FacilityName");
            ViewBag.MedicalProviderId = new SelectList(unitOfWork.CachedRepository<medicalprovider>().Get().Select(x => new { Id = x.Id, Name = string.Format("{0} {1}", x.FirstName, x.LastName) }), "Id", "Name");
            ViewBag.VisitTypeId = new SelectList(unitOfWork.CachedRepository<visittype>().Get(), "Id", "Description");
            ViewBag.ReferredByMedicalFacilityId = new SelectList(unitOfWork.CachedRepository<medicalfacility>().Get(), "Id", "FacilityName");
            ViewBag.ReferredByMedicalProviderId = new SelectList(unitOfWork.CachedRepository<medicalprovider>().Get().Select(x => new { Id = x.Id, Name = string.Format("{0} {1}", x.FirstName, x.LastName) }), "Id", "Name");
            ViewBag.MedicalEncounterTypeId = new SelectList(unitOfWork.CachedRepository<medicalencountertype>().Get(), "Id", "Description");
            ViewBag.MedicalEncounterPurposeId = new SelectList(unitOfWork.CachedRepository<medicalencounterpurpose>().Get(), "Id", "Description");
            ViewBag.ProblemId = new SelectList(unitOfWork.CachedRepository<problem>().Get(), "Id", "SnoMedCode");
            ViewBag.PatientProblemID = new SelectList(unitOfWork.Repository<patientproblem>().Filter(x => x.PatientId == patientId).Get().Select(x => new { Id = x.Id, ProblemName = x.problem.SnoMedCode }), "Id", "ProblemName");
            return PartialView("_CreateVisit");
        }
        public ActionResult CreateMedicalEncounter()
        {
            int patientId = int.Parse(RouteData.Values["id"].ToString());
            ViewBag.MedicalEncounterTypeId = new SelectList(unitOfWork.CachedRepository<medicalencountertype>().Get(), "Id", "Description");
            ViewBag.MedicalEncounterPurposeId = new SelectList(unitOfWork.CachedRepository<medicalencounterpurpose>().Get(), "Id", "Description");
            ViewBag.MedicalProviderId = new SelectList(unitOfWork.CachedRepository<medicalprovider>().Get().Select(x => new { Id = x.Id, Name = string.Format("{0} {1}", x.FirstName, x.LastName) }), "Id", "Name");
            ViewBag.ProblemId = new SelectList(unitOfWork.CachedRepository<problem>().Get(), "Id", "SnoMedCode");
            ViewBag.PatientProblemID = new SelectList(unitOfWork.Repository<patientproblem>().Filter(x => x.PatientId == patientId).Get().Select(x => new { Id = x.Id, ProblemName = x.problem.SnoMedCode }), "Id", "ProblemName");
            return PartialView("_CreateMedicalEncounter");
        }

        [HttpPost]
        public ActionResult CreateVisit([Bind(Exclude="Id")] medicalencounter patientVisit)
        {
            int patientId = int.Parse(RouteData.Values["id"].ToString());
            unitOfWork.Repository<medicalencounter>().Insert(patientVisit);
            unitOfWork.Save();
            unitOfWork = new UnitOfWork();
            return PartialView("_PatientNotes", unitOfWork.Repository<visit>().Filter(x => x.PatientId == patientId).Get());
        }

        public ActionResult AddPatientVitalSign()
        {
            ViewBag.VitalSignCodeId = new SelectList(unitOfWork.Repository<vitalsigncode>().Get().Select(x => new { Id = x.Id, Description = string.Format("{0}", x.Description) }), "Id", "Description");
            ViewBag.LabResultStatusId = new SelectList(unitOfWork.Repository<labresultstatu>().Get().Select(x => new { Id = x.Id, Description = string.Format("{0}", x.Description) }), "Id", "Description");
            ViewBag.LabResultUnitId = new SelectList(unitOfWork.Repository<labresultunit>().Get().Select(x => new { Id = x.Id, Description = string.Format("{0}", x.Description) }), "Id", "Description");
            ViewBag.LabResultFlagId = new SelectList(unitOfWork.CachedRepository<labresultflag>().Get(), "Id", "Description", 6 /* Default: Normal */);
            return PartialView("_AddPatientVitalSigns");
        }

        [HttpPost]
        public ActionResult AddPatientVitalSign([Bind(Exclude = "Id")] vitalsignobservation vitalSign)
        {
            int patientId = int.Parse(RouteData.Values["id"].ToString());
            unitOfWork.Repository<vitalsignobservation>().Insert(vitalSign);
            unitOfWork.Save();
            unitOfWork = new UnitOfWork();
            return PartialView("_PatientVitals", unitOfWork.Repository<vitalsignobservation>().Filter(x => x.PatientId == patientId).Get());
        }

        public ActionResult AddPatientProblem()
        {
            ViewBag.ProblemId = new SelectList(unitOfWork.CachedRepository<problem>().Get(), "Id", "SnoMedCode");
            return PartialView("_AddPatientProblem");
        }

        [HttpPost]
        public ActionResult AddPatientProblem([Bind(Exclude = "Id")]patientproblem patientProblem)
        {
            int patientId = int.Parse(RouteData.Values["id"].ToString());
            unitOfWork.Repository<patientproblem>().Insert(patientProblem);
            unitOfWork.Save();
            unitOfWork = new UnitOfWork();
            return PartialView("_PatientProblem", unitOfWork.Repository<patientproblem>().Filter(x => x.PatientId == patientId).Get());
        }

        public ActionResult PatientAddressEntryRow()
        {
            ViewBag.AddressTypeId = new SelectList(unitOfWork.CachedRepository<addresstype>().Get(), "Id", "Description");
            return PartialView("_PatientAddressCreate");
        }

        public ActionResult PatientPhoneEntryRow()
        {
            ViewBag.PhoneTypeId = new SelectList(unitOfWork.CachedRepository<phonetype>().Get(), "Id", "Description");
            return PartialView("_PatientContactCreate");
        }

        public ActionResult PatientEmailEntryRow()
        {
            ViewBag.EmailTypeId = new SelectList(unitOfWork.CachedRepository<emailtype>().Get(), "Id", "Description");
            return PartialView("_PatientEmailCreate");
        }

        public ActionResult PatientInsuranceEntryRow()
        {
            ViewBag.InsuranceProviderId = new SelectList(unitOfWork.CachedRepository<insuranceprovider>().Get(), "Id", "Description");
            ViewBag.InsurancePlanTypeId = new SelectList(unitOfWork.CachedRepository<insuranceplantype>().Get(), "Id", "Description");
            return PartialView("_PatientInsuranceCreate");
        }

        protected override void Dispose(bool disposing)
        {
            unitOfWork.Dispose();
            base.Dispose(disposing);
        }
    }
}
