--begin tran
--rollback
-- commit
--select * from MaritialStatus
--truncate table patient
--truncate table MaritialStatus
--truncate table [gender] 
--truncate table [addresstype]
--truncate table [allergy]
--truncate table [relationtype]
--truncate table [medicalprovidertype]
--truncate table [jobrole]

--delete from patient

--delete from MaritialStatus
--delete from  [gender] 
--delete from  [addresstype]
--delete from  [allergy]
--delete from  [relationtype]
--delete from  [medicalprovidertype]
--delete from  [jobrole]


INSERT INTO [gender]  VALUES ('Male');

INSERT INTO [gender]  VALUES ('Female');

INSERT INTO [gender]  VALUES ('Other');

INSERT INTO [MaritialStatus]  VALUES ('Single');

INSERT INTO [MaritialStatus]  VALUES ('Married');

INSERT INTO [MaritialStatus]  VALUES ('Divorced');

INSERT INTO [MaritialStatus]  VALUES ('Widowed');

INSERT INTO [MaritialStatus]  VALUES ('Other');

INSERT INTO [addresstype]  VALUES ('Current');

INSERT INTO [addresstype]  VALUES ('Home');

INSERT INTO [addresstype]  VALUES ('Mailing');

INSERT INTO [addresstype]  VALUES ('Permanent');

INSERT INTO [addresstype]  VALUES ('Office');

INSERT INTO [allergy]  VALUES ('Drug Allergy');

INSERT INTO [allergy]  VALUES ('Food allergy');

INSERT INTO [allergy]  VALUES ('Animal Allergy');

INSERT INTO [allergy]  VALUES ('Plant Allergy');

INSERT INTO [allergy]  VALUES ('Environmental Allergy');

INSERT INTO [allergy]  VALUES ('Miscellaneous Allergy');


INSERT INTO [relationtype]  VALUES ('Associate');

INSERT INTO [relationtype]  VALUES ('Brother');

INSERT INTO [relationtype]  VALUES ('Child');

INSERT INTO [relationtype]  VALUES ('Employee');

INSERT INTO [relationtype]  VALUES ('Employer');

INSERT INTO [relationtype]  VALUES ('Emergency contact');

INSERT INTO [relationtype]  VALUES ('Extended family');

INSERT INTO [relationtype]  VALUES ('Father');

INSERT INTO [relationtype]  VALUES ('Foster child');

INSERT INTO [relationtype]  VALUES ('Friend');

INSERT INTO [relationtype]  VALUES ('Grandchild');

INSERT INTO [relationtype]  VALUES ('Grandparent');

INSERT INTO [relationtype]  VALUES ('Guardian');

INSERT INTO [relationtype]  VALUES ('Handicapped Dependent');

INSERT INTO [relationtype]  VALUES ('Life Partner');

INSERT INTO [relationtype]  VALUES ('Manager');

INSERT INTO [relationtype]  VALUES ('Mother');

INSERT INTO [relationtype]  VALUES ('None');

INSERT INTO [relationtype]  VALUES ('Other');

INSERT INTO [relationtype]  VALUES ('Owner');

INSERT INTO [relationtype]  VALUES ('Parent');

INSERT INTO [relationtype]  VALUES ('Self');

INSERT INTO [relationtype]  VALUES ('Sibling');

INSERT INTO [relationtype]  VALUES ('Sister');

INSERT INTO [relationtype]  VALUES ('Spouse');

INSERT INTO [relationtype]  VALUES ('Stepchild');

INSERT INTO [relationtype]  VALUES ('Trainer');

--INSERT INTO [JobRole]  VALUES ('Patient');

--INSERT INTO [JobRole]  VALUES ('FamilyMember');

--INSERT INTO [JobRole]  VALUES ('Doctor');

--INSERT INTO [JobRole]  VALUES ('Clinician');

--INSERT INTO [JobRole]  VALUES ('LabTechnician');

--INSERT INTO [JobRole]  VALUES ('MedicalFacilityAdmin');

--INSERT INTO [JobRole]  VALUES ('InsuranceFirmAdmin');

--INSERT INTO [JobRole]  VALUES ('SuperAdmin');

INSERT INTO [medicalprovidertype]  VALUES ('PRIMARY CARE');

INSERT INTO [medicalprovidertype]  VALUES ('NURSING CARE');

INSERT INTO [medicalprovidertype]  VALUES ('DRUG THERAPY');

INSERT INTO [medicalprovidertype]  VALUES ('SPECIALTY CARE');

INSERT INTO [jobrole]  VALUES ('Allergy & Immunology');

INSERT INTO [jobrole]  VALUES ('Anesthesiology');

INSERT INTO [jobrole]  VALUES ('Audiology');

INSERT INTO [jobrole]  VALUES ('Cardiology');

INSERT INTO [jobrole]  VALUES ('Cardiovascular Surgery');

INSERT INTO [jobrole]  VALUES ('Colon & Rectal Surgery');

INSERT INTO [jobrole]  VALUES ('Critical Care Medicine');

INSERT INTO [jobrole]  VALUES ('Dermatology');

INSERT INTO [jobrole]  VALUES ('Ear, Nose & Throat');

INSERT INTO [jobrole]  VALUES ('Emergency Medicine');

INSERT INTO [jobrole]  VALUES ('Endocrinology');

INSERT INTO [jobrole]  VALUES ('Family Practice');

INSERT INTO [jobrole]  VALUES ('Gastroenterology');

INSERT INTO [jobrole]  VALUES ('General Surgery');

INSERT INTO [jobrole]  VALUES ('Genetics');

INSERT INTO [jobrole]  VALUES ('Geriatrics');

INSERT INTO [jobrole]  VALUES ('Gynecologic Oncology');

INSERT INTO [jobrole]  VALUES ('Gynecology');

INSERT INTO [jobrole]  VALUES ('Hand Surgery');

INSERT INTO [jobrole]  VALUES ('Hematology/Oncology');

INSERT INTO [jobrole]  VALUES ('Immunology');

INSERT INTO [jobrole]  VALUES ('Infectious Disease');

INSERT INTO [jobrole]  VALUES ('Internal Medicine');

INSERT INTO [jobrole]  VALUES ('Licensed Clinical Social Work');

INSERT INTO [jobrole]  VALUES ('Licensed Professional Counseling');

INSERT INTO [jobrole]  VALUES ('Marriage & Family Therapy');

INSERT INTO [jobrole]  VALUES ('Maternal Fetal Medicine');

INSERT INTO [jobrole]  VALUES ('Midwifery');

INSERT INTO [jobrole]  VALUES ('Neonatal Medicine');

INSERT INTO [jobrole]  VALUES ('Nephrology');

INSERT INTO [jobrole]  VALUES ('Neurology');

INSERT INTO [jobrole]  VALUES ('Neurooncology');

INSERT INTO [jobrole]  VALUES ('Neuroophthalmology');

INSERT INTO [jobrole]  VALUES ('Neurosurgery');

INSERT INTO [jobrole]  VALUES ('Nurse Anesthetist');

INSERT INTO [jobrole]  VALUES ('Nurse Midwife');

INSERT INTO [jobrole]  VALUES ('Obstetrics & Gynecology');

INSERT INTO [jobrole]  VALUES ('Occupational Therapy');

INSERT INTO [jobrole]  VALUES ('Oculoplastic Surgery');

INSERT INTO [jobrole]  VALUES ('Oncology');

INSERT INTO [jobrole]  VALUES ('Ophthalmology');

INSERT INTO [jobrole]  VALUES ('Ophthalmology - Retina Vitreous');

INSERT INTO [jobrole]  VALUES ('Optometry');

INSERT INTO [jobrole]  VALUES ('Oral-Maxillofacial Surgery');

INSERT INTO [jobrole]  VALUES ('Orthopedic Surgery');

INSERT INTO [jobrole]  VALUES ('Otolaryngology');

INSERT INTO [jobrole]  VALUES ('Pain Management');

INSERT INTO [jobrole]  VALUES ('Pathology');

INSERT INTO [jobrole]  VALUES ('Pediatrics');

INSERT INTO [jobrole]  VALUES ('Physical Medicine & Rehabilitation');

INSERT INTO [jobrole]  VALUES ('Physical Therapy');

INSERT INTO [jobrole]  VALUES ('Plastic Surgery');

INSERT INTO [jobrole]  VALUES ('Podiatry');

INSERT INTO [jobrole]  VALUES ('Psychiatric Registered Nurse');

INSERT INTO [jobrole]  VALUES ('Psychiatry');

INSERT INTO [jobrole]  VALUES ('Psychology');

INSERT INTO [jobrole]  VALUES ('Pulmonology');

INSERT INTO [jobrole]  VALUES ('Radiation Oncology');

INSERT INTO [jobrole]  VALUES ('Radiology');

INSERT INTO [jobrole]  VALUES ('Reproductive Endocrinology');

INSERT INTO [jobrole]  VALUES ('Rheumatology');

INSERT INTO [jobrole]  VALUES ('Speech & Language Therapy');

INSERT INTO [jobrole]  VALUES ('Sports Medicine');

INSERT INTO [jobrole]  VALUES ('Urology');

INSERT INTO [jobrole]  VALUES ('Vascular Surgery');



insert into PatientAddress values ('Address Line1', 'Address Line2', 'Seattle', 'WA', 98007, 4, 14)