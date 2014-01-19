CREATE DATABASE  IF NOT EXISTS `nivarc` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `nivarc`;
-- MySQL dump 10.13  Distrib 5.6.13, for Win32 (x86)
--
-- Host: localhost    Database: nivarc
-- ------------------------------------------------------
-- Server version	5.6.15

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresstype`
--

DROP TABLE IF EXISTS `addresstype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addresstype` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresstype`
--

LOCK TABLES `addresstype` WRITE;
/*!40000 ALTER TABLE `addresstype` DISABLE KEYS */;
INSERT INTO `addresstype` VALUES (1,'Current'),(2,'Home'),(3,'Mailing'),(4,'Permanent'),(5,'Office');
/*!40000 ALTER TABLE `addresstype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `allergyreaction`
--

DROP TABLE IF EXISTS `allergyreaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `allergyreaction` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allergyreaction`
--

LOCK TABLES `allergyreaction` WRITE;
/*!40000 ALTER TABLE `allergyreaction` DISABLE KEYS */;
INSERT INTO `allergyreaction` VALUES (1,'blood infection'),(2,'cough'),(3,'diarrhoea'),(4,'fatigue'),(5,'fever'),(6,'gas'),(7,'insomnia');
/*!40000 ALTER TABLE `allergyreaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `allergytype`
--

DROP TABLE IF EXISTS `allergytype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `allergytype` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allergytype`
--

LOCK TABLES `allergytype` WRITE;
/*!40000 ALTER TABLE `allergytype` DISABLE KEYS */;
INSERT INTO `allergytype` VALUES (1,'Drug Allergy'),(2,'Food Allergy'),(3,'Animal Allergy'),(4,'Plant Allergy'),(5,'Environmental Allergy'),(6,'Miscellaneous Allergy');
/*!40000 ALTER TABLE `allergytype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dosageunittype`
--

DROP TABLE IF EXISTS `dosageunittype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dosageunittype` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dosageunittype`
--

LOCK TABLES `dosageunittype` WRITE;
/*!40000 ALTER TABLE `dosageunittype` DISABLE KEYS */;
/*!40000 ALTER TABLE `dosageunittype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dosevalue`
--

DROP TABLE IF EXISTS `dosevalue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dosevalue` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  `exatdose` varchar(100) DEFAULT NULL,
  `mindose` varchar(100) DEFAULT NULL,
  `maxdose` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dosevalue`
--

LOCK TABLES `dosevalue` WRITE;
/*!40000 ALTER TABLE `dosevalue` DISABLE KEYS */;
/*!40000 ALTER TABLE `dosevalue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emailtype`
--

DROP TABLE IF EXISTS `emailtype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `emailtype` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emailtype`
--

LOCK TABLES `emailtype` WRITE;
/*!40000 ALTER TABLE `emailtype` DISABLE KEYS */;
INSERT INTO `emailtype` VALUES (1,'Business'),(2,'Personal'),(3,'Other');
/*!40000 ALTER TABLE `emailtype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gender`
--

DROP TABLE IF EXISTS `gender`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gender` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gender`
--

LOCK TABLES `gender` WRITE;
/*!40000 ALTER TABLE `gender` DISABLE KEYS */;
INSERT INTO `gender` VALUES (1,'Male'),(2,'Female'),(3,'Other');
/*!40000 ALTER TABLE `gender` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `immunization`
--

DROP TABLE IF EXISTS `immunization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `immunization` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `PatientId` int(11) NOT NULL,
  `VaccineId` int(11) NOT NULL,
  `DoseNumber` int(11) DEFAULT NULL,
  `AdministeredUnits` int(11) NOT NULL,
  `ImmunizationRouteId` int(11) NOT NULL,
  `ImmunizationSiteId` int(11) NOT NULL,
  `SubstanceLotNumber` varchar(200) DEFAULT NULL,
  `VaccinationDate` date NOT NULL,
  `OrderedProviderId` int(11) DEFAULT NULL,
  `AdministeredProviderId` int(11) DEFAULT NULL,
  `Note` longtext,
  PRIMARY KEY (`Id`),
  KEY `FK_Immunization_Patient` (`PatientId`),
  KEY `FK_Immunization_Vaccine` (`VaccineId`),
  KEY `FK_Immunization_ImmunizationRoute` (`ImmunizationRouteId`),
  KEY `FK_Immunization_ImmunizationSite` (`ImmunizationSiteId`),
  KEY `FK_Immunization_MedicalProvider1` (`OrderedProviderId`),
  KEY `FK_Immunization_MedicalProvider2` (`AdministeredProviderId`),
  CONSTRAINT `FK_Immunization_ImmunizationRoute` FOREIGN KEY (`ImmunizationRouteId`) REFERENCES `immunizationroute` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Immunization_ImmunizationSite` FOREIGN KEY (`ImmunizationSiteId`) REFERENCES `immunizationsite` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Immunization_MedicalProvider1` FOREIGN KEY (`OrderedProviderId`) REFERENCES `medicalprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Immunization_MedicalProvider2` FOREIGN KEY (`AdministeredProviderId`) REFERENCES `medicalprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Immunization_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Immunization_Vaccine` FOREIGN KEY (`VaccineId`) REFERENCES `vaccine` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `immunization`
--

LOCK TABLES `immunization` WRITE;
/*!40000 ALTER TABLE `immunization` DISABLE KEYS */;
/*!40000 ALTER TABLE `immunization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `immunizationroute`
--

DROP TABLE IF EXISTS `immunizationroute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `immunizationroute` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(200) NOT NULL,
  PRIMARY KEY (`Id`,`Description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `immunizationroute`
--

LOCK TABLES `immunizationroute` WRITE;
/*!40000 ALTER TABLE `immunizationroute` DISABLE KEYS */;
/*!40000 ALTER TABLE `immunizationroute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `immunizationsite`
--

DROP TABLE IF EXISTS `immunizationsite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `immunizationsite` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(200) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `immunizationsite`
--

LOCK TABLES `immunizationsite` WRITE;
/*!40000 ALTER TABLE `immunizationsite` DISABLE KEYS */;
/*!40000 ALTER TABLE `immunizationsite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insuranceplantype`
--

DROP TABLE IF EXISTS `insuranceplantype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `insuranceplantype` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insuranceplantype`
--

LOCK TABLES `insuranceplantype` WRITE;
/*!40000 ALTER TABLE `insuranceplantype` DISABLE KEYS */;
/*!40000 ALTER TABLE `insuranceplantype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insuranceprovider`
--

DROP TABLE IF EXISTS `insuranceprovider`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `insuranceprovider` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insuranceprovider`
--

LOCK TABLES `insuranceprovider` WRITE;
/*!40000 ALTER TABLE `insuranceprovider` DISABLE KEYS */;
/*!40000 ALTER TABLE `insuranceprovider` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `investigation`
--

DROP TABLE IF EXISTS `investigation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `investigation` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  `InvestigationTypeId` int(11) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `investigation`
--

LOCK TABLES `investigation` WRITE;
/*!40000 ALTER TABLE `investigation` DISABLE KEYS */;
/*!40000 ALTER TABLE `investigation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobrole`
--

DROP TABLE IF EXISTS `jobrole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobrole` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobrole`
--

LOCK TABLES `jobrole` WRITE;
/*!40000 ALTER TABLE `jobrole` DISABLE KEYS */;
INSERT INTO `jobrole` VALUES (1,'Allergy & Immunology'),(2,'Anesthesiology'),(3,'Audiology'),(4,'Cardiology'),(5,'Cardiovascular Surgery'),(6,'Colon & Rectal Surgery'),(7,'Critical Care Medicine'),(8,'Dermatology'),(9,'Ear, Nose & Throat'),(10,'Emergency Medicine'),(11,'Endocrinology'),(12,'Family Practice'),(13,'Gastroenterology'),(14,'General Surgery'),(15,'Genetics'),(16,'Geriatrics'),(17,'Gynecologic Oncology'),(18,'Gynecology'),(19,'Hand Surgery'),(20,'Hematology/Oncology'),(21,'Immunology'),(22,'Infectious Disease'),(23,'Internal Medicine'),(24,'Licensed Clinical Social Work'),(25,'Licensed Professional Counseling'),(26,'Marriage & Family Therapy'),(27,'Maternal Fetal Medicine'),(28,'Midwifery'),(29,'Neonatal Medicine'),(30,'Nephrology'),(31,'Neurology'),(32,'Neurooncology'),(33,'Neuroophthalmology'),(34,'Neurosurgery'),(35,'Nurse Anesthetist'),(36,'Nurse Midwife'),(37,'Obstetrics & Gynecology'),(38,'Occupational Therapy'),(39,'Oculoplastic Surgery'),(40,'Oncology'),(41,'Ophthalmology'),(42,'Ophthalmology - Retina Vitreous'),(43,'Optometry'),(44,'Oral-Maxillofacial Surgery'),(45,'Orthopedic Surgery'),(46,'Otolaryngology'),(47,'Pain Management'),(48,'Pathology'),(49,'Pediatrics'),(50,'Physical Medicine & Rehabilitation'),(51,'Physical Therapy'),(52,'Plastic Surgery'),(53,'Podiatry'),(54,'Psychiatric Registered Nurse'),(55,'Psychiatry'),(56,'Psychology'),(57,'Pulmonology'),(58,'Radiation Oncology'),(59,'Radiology'),(60,'Reproductive Endocrinology'),(61,'Rheumatology'),(62,'Speech & Language Therapy'),(63,'Sports Medicine'),(64,'Urology'),(65,'Vascular Surgery');
/*!40000 ALTER TABLE `jobrole` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labpanel`
--

DROP TABLE IF EXISTS `labpanel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `labpanel` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Orders & Observations';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labpanel`
--

LOCK TABLES `labpanel` WRITE;
/*!40000 ALTER TABLE `labpanel` DISABLE KEYS */;
/*!40000 ALTER TABLE `labpanel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labresultflag`
--

DROP TABLE IF EXISTS `labresultflag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `labresultflag` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labresultflag`
--

LOCK TABLES `labresultflag` WRITE;
/*!40000 ALTER TABLE `labresultflag` DISABLE KEYS */;
INSERT INTO `labresultflag` VALUES (1,'Abnormal'),(2,'Critical'),(3,'High'),(4,'Indeterminate'),(5,'Low'),(6,'Normal');
/*!40000 ALTER TABLE `labresultflag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labresultstatus`
--

DROP TABLE IF EXISTS `labresultstatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `labresultstatus` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labresultstatus`
--

LOCK TABLES `labresultstatus` WRITE;
/*!40000 ALTER TABLE `labresultstatus` DISABLE KEYS */;
INSERT INTO `labresultstatus` VALUES (1,'Complete'),(2,'Pending'),(3,'Quantity not sufficient'),(4,'Patient Refused Test');
/*!40000 ALTER TABLE `labresultstatus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labresultunit`
--

DROP TABLE IF EXISTS `labresultunit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `labresultunit` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labresultunit`
--

LOCK TABLES `labresultunit` WRITE;
/*!40000 ALTER TABLE `labresultunit` DISABLE KEYS */;
INSERT INTO `labresultunit` VALUES (1,'B/min'),(2,'breaths/min'),(3,'Cel'),(4,'cells/ul'),(5,'cm'),(6,'cmH2O'),(7,'fl'),(8,'g/dl'),(9,'h'),(10,'HB/min'),(11,'HPF'),(12,'iU'),(13,'iU/l'),(14,'iU/ml'),(15,'kcells/ul'),(16,'kg'),(17,'k/mm3'),(18,'k/ul'),(19,'kU/l'),(20,'l'),(21,'lg(iU)'),(22,'l/min'),(23,'l/s'),(24,'M'),(25,'m2'),(26,'Mcells/ul'),(27,'meq/l'),(28,'mg'),(29,'mg/24h'),(30,'mg/d'),(31,'mg/dl'),(32,'mg/g'),(33,'mg/gcreat'),(34,'mg/l'),(35,'min'),(36,'miU/ml'),(37,'ml'),(38,'ml/dl'),(39,'ml/HB'),(40,'ml/min'),(41,'mmHg'),(42,'mmol/l'),(43,'mm/h'),(44,'mol/mm3'),(45,'mol/ul'),(46,'mosm/kg'),(47,'M/mm3'),(48,'M/ul'),(49,'mU/l'),(50,'mU/ml'),(51,'ng/dl'),(52,'ng/l'),(53,'ng/ml'),(54,'ng/ml/h'),(55,'ng/nl'),(56,'nmol/l'),(57,'nU/ml'),(58,'pcnt'),(59,'/HPF'),(60,'/LPF'),(61,'/mm3'),(62,'/s'),(63,'/ul'),(64,'pg'),(65,'pg/dl'),(66,'pg/ml'),(67,'pmol/ml'),(68,'s'),(69,'titer'),(70,'ug/d'),(71,'ug/dl'),(72,'ug/g'),(73,'ug/l'),(74,'ug/ml'),(75,'uiU/ml'),(76,'umol/l'),(77,'umol/m'),(78,'units'),(79,'units/l'),(80,'U/ml'),(81,'uunits'),(82,'uunits/ml'),(83,'uU/ml'),(84,'W');
/*!40000 ALTER TABLE `labresultunit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labtest`
--

DROP TABLE IF EXISTS `labtest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `labtest` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  `LabPanelId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_LabTest_LabPanel` (`LabPanelId`),
  CONSTRAINT `FK_LabTest_LabPanel` FOREIGN KEY (`LabPanelId`) REFERENCES `labpanel` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Orders & Observations';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labtest`
--

LOCK TABLES `labtest` WRITE;
/*!40000 ALTER TABLE `labtest` DISABLE KEYS */;
/*!40000 ALTER TABLE `labtest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maritalstatus`
--

DROP TABLE IF EXISTS `maritalstatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `maritalstatus` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maritalstatus`
--

LOCK TABLES `maritalstatus` WRITE;
/*!40000 ALTER TABLE `maritalstatus` DISABLE KEYS */;
INSERT INTO `maritalstatus` VALUES (1,'Single'),(2,'Married'),(3,'Divorced'),(4,'Widowed'),(5,'Other');
/*!40000 ALTER TABLE `maritalstatus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalencounter`
--

DROP TABLE IF EXISTS `medicalencounter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicalencounter` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `VisitId` int(11) NOT NULL,
  `MedicalEncounterTypeId` int(11) NOT NULL,
  `MedicalEncounterPurposeId` int(11) DEFAULT NULL,
  `PatientProblemID` int(11) DEFAULT NULL,
  `MedicalProviderId` int(11) DEFAULT NULL,
  `Notes` longtext,
  PRIMARY KEY (`Id`),
  KEY `FK_MedicalEncounter_Vist` (`VisitId`),
  KEY `FK_MedicalEncounter_MedicalProvider` (`MedicalProviderId`),
  KEY `FK_MedicalEncounter_MedicalEncounerType` (`MedicalEncounterTypeId`),
  KEY `FK_MedicalEncounter_MedicalEncounterPurpose` (`MedicalEncounterPurposeId`),
  KEY `FK_MedicalEncounter_PatientProblem` (`PatientProblemID`),
  CONSTRAINT `FK_MedicalEncounter_MedicalEncounterPurpose` FOREIGN KEY (`MedicalEncounterPurposeId`) REFERENCES `medicalencounterpurpose` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_MedicalEncounter_MedicalEncounterType` FOREIGN KEY (`MedicalEncounterTypeId`) REFERENCES `medicalencountertype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_MedicalEncounter_MedicalProvider` FOREIGN KEY (`MedicalProviderId`) REFERENCES `medicalprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_MedicalEncounter_PatientProblem` FOREIGN KEY (`PatientProblemID`) REFERENCES `patientproblem` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_MedicalEncounter_Visit` FOREIGN KEY (`VisitId`) REFERENCES `visit` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalencounter`
--

LOCK TABLES `medicalencounter` WRITE;
/*!40000 ALTER TABLE `medicalencounter` DISABLE KEYS */;
INSERT INTO `medicalencounter` VALUES (1,1,1,1,1,1,'Notes');
/*!40000 ALTER TABLE `medicalencounter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalencounterpurpose`
--

DROP TABLE IF EXISTS `medicalencounterpurpose`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicalencounterpurpose` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(200) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalencounterpurpose`
--

LOCK TABLES `medicalencounterpurpose` WRITE;
/*!40000 ALTER TABLE `medicalencounterpurpose` DISABLE KEYS */;
INSERT INTO `medicalencounterpurpose` VALUES (1,'Active immunization'),(2,'Decontamination'),(3,'Follow the campaign protocol'),(4,'Follow Up'),(5,'Quarantine'),(6,'Isolation procedure'),(7,'Preventive procedure'),(8,'Therapy');
/*!40000 ALTER TABLE `medicalencounterpurpose` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalencountertype`
--

DROP TABLE IF EXISTS `medicalencountertype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicalencountertype` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalencountertype`
--

LOCK TABLES `medicalencountertype` WRITE;
/*!40000 ALTER TABLE `medicalencountertype` DISABLE KEYS */;
INSERT INTO `medicalencountertype` VALUES (1,'Inpatient'),(2,'Ambulatory'),(3,'face-to-face'),(4,'virtual'),(5,'Outpatient');
/*!40000 ALTER TABLE `medicalencountertype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalfacility`
--

DROP TABLE IF EXISTS `medicalfacility`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicalfacility` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `FacilityName` longtext NOT NULL,
  `WebUrl` longtext,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalfacility`
--

LOCK TABLES `medicalfacility` WRITE;
/*!40000 ALTER TABLE `medicalfacility` DISABLE KEYS */;
INSERT INTO `medicalfacility` VALUES (2,'M/s. Medical Faclity Name',NULL);
/*!40000 ALTER TABLE `medicalfacility` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalprovider`
--

DROP TABLE IF EXISTS `medicalprovider`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicalprovider` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `MedicalProviderTypeId` int(11) NOT NULL,
  `TitleId` int(11) DEFAULT NULL,
  `FirstName` longtext,
  `LastName` longtext,
  `MiddleName` varchar(100) DEFAULT NULL,
  `DateOfBirth` date DEFAULT NULL,
  `GenderId` int(11) NOT NULL,
  `WebUrl` longtext,
  PRIMARY KEY (`Id`),
  KEY `FK_MedicalProvider_Gender` (`GenderId`),
  KEY `FK_MedicalProvider_MedicalProviderType` (`MedicalProviderTypeId`),
  KEY `FK_MedicalProvider_Title` (`TitleId`),
  CONSTRAINT `FK_MedicalProvider_Gender` FOREIGN KEY (`GenderId`) REFERENCES `gender` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_MedicalProvider_MedicalProviderType` FOREIGN KEY (`MedicalProviderTypeId`) REFERENCES `medicalprovidertype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_MedicalProvider_Title` FOREIGN KEY (`TitleId`) REFERENCES `title` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalprovider`
--

LOCK TABLES `medicalprovider` WRITE;
/*!40000 ALTER TABLE `medicalprovider` DISABLE KEYS */;
INSERT INTO `medicalprovider` VALUES (1,1,1,'First Name','Last Name','Middle Name','1980-01-01',1,'');
/*!40000 ALTER TABLE `medicalprovider` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalprovideraddress`
--

DROP TABLE IF EXISTS `medicalprovideraddress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicalprovideraddress` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Line1` longtext NOT NULL,
  `Line2` longtext,
  `City` longtext NOT NULL,
  `State` char(4) NOT NULL,
  `PostalCode` varchar(64) DEFAULT NULL,
  `MedicalProviderId` int(11) NOT NULL,
  `AddressTypeId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_MedicalProviderAddress_AddressType` (`AddressTypeId`),
  KEY `FK_MedicalProviderAddress_MedicalProvider` (`MedicalProviderId`),
  CONSTRAINT `FK_MedicalProviderAddress_AddressType` FOREIGN KEY (`AddressTypeId`) REFERENCES `addresstype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_MedicalProviderAddress_MedicalProvider` FOREIGN KEY (`MedicalProviderId`) REFERENCES `medicalprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalprovideraddress`
--

LOCK TABLES `medicalprovideraddress` WRITE;
/*!40000 ALTER TABLE `medicalprovideraddress` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicalprovideraddress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalprovideremail`
--

DROP TABLE IF EXISTS `medicalprovideremail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicalprovideremail` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `MedicalProviderId` int(11) NOT NULL,
  `Number` varchar(64) NOT NULL,
  `EmailTypeId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_MedicalProviderEmail_EmailType` (`EmailTypeId`),
  KEY `FK_MedicalProviderEmail_MedicalProvider` (`MedicalProviderId`),
  CONSTRAINT `FK_MedicalProviderEmail_EmailType` FOREIGN KEY (`EmailTypeId`) REFERENCES `emailtype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_MedicalProviderEmail_MedicalProvider` FOREIGN KEY (`MedicalProviderId`) REFERENCES `medicalprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalprovideremail`
--

LOCK TABLES `medicalprovideremail` WRITE;
/*!40000 ALTER TABLE `medicalprovideremail` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicalprovideremail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalprovidermedicalfacility`
--

DROP TABLE IF EXISTS `medicalprovidermedicalfacility`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicalprovidermedicalfacility` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `MedicalProviderId` int(11) NOT NULL,
  `MedicalFacilityId` int(11) NOT NULL,
  `JobRoleId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_MedicalProviderMedicalFacility_JobRole` (`JobRoleId`),
  KEY `FK_MedicalProviderMedicalFacility_MedicalFacility` (`MedicalFacilityId`),
  KEY `FK_MedicalProviderMedicalFacility_MedicalProvider` (`MedicalProviderId`),
  CONSTRAINT `FK_MedicalProviderMedicalFacility_JobRole` FOREIGN KEY (`JobRoleId`) REFERENCES `jobrole` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_MedicalProviderMedicalFacility_MedicalFacility` FOREIGN KEY (`MedicalFacilityId`) REFERENCES `medicalfacility` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_MedicalProviderMedicalFacility_MedicalProvider` FOREIGN KEY (`MedicalProviderId`) REFERENCES `medicalprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalprovidermedicalfacility`
--

LOCK TABLES `medicalprovidermedicalfacility` WRITE;
/*!40000 ALTER TABLE `medicalprovidermedicalfacility` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicalprovidermedicalfacility` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalproviderphone`
--

DROP TABLE IF EXISTS `medicalproviderphone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicalproviderphone` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `MedicalProviderId` int(11) NOT NULL,
  `Number` varchar(64) NOT NULL,
  `PhoneTypeId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_MedicalProviderPhone_PhoneType` (`PhoneTypeId`),
  KEY `FK_MedicalProviderPhone_MedicalProvider` (`MedicalProviderId`),
  CONSTRAINT `FK_MedicalProviderPhone_MedicalProvider` FOREIGN KEY (`MedicalProviderId`) REFERENCES `medicalprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_MedicalProviderPhone_PhoneType` FOREIGN KEY (`PhoneTypeId`) REFERENCES `phonetype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalproviderphone`
--

LOCK TABLES `medicalproviderphone` WRITE;
/*!40000 ALTER TABLE `medicalproviderphone` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicalproviderphone` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalprovidertype`
--

DROP TABLE IF EXISTS `medicalprovidertype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicalprovidertype` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalprovidertype`
--

LOCK TABLES `medicalprovidertype` WRITE;
/*!40000 ALTER TABLE `medicalprovidertype` DISABLE KEYS */;
INSERT INTO `medicalprovidertype` VALUES (1,'PRIMARY CARE'),(2,'NURSING CARE'),(3,'DRUG THERAPY'),(4,'SPECIALTY CARE');
/*!40000 ALTER TABLE `medicalprovidertype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medication`
--

DROP TABLE IF EXISTS `medication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medication` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Brand` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medication`
--

LOCK TABLES `medication` WRITE;
/*!40000 ALTER TABLE `medication` DISABLE KEYS */;
/*!40000 ALTER TABLE `medication` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nivarcroles`
--

DROP TABLE IF EXISTS `nivarcroles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nivarcroles` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nivarcroles`
--

LOCK TABLES `nivarcroles` WRITE;
/*!40000 ALTER TABLE `nivarcroles` DISABLE KEYS */;
INSERT INTO `nivarcroles` VALUES (4,'Patient'),(5,'FamilyMember'),(6,'Doctor'),(7,'Clinician'),(8,'LabTechnician'),(9,'MedicalFacilityAdmin'),(10,'InsuranceFirmAdmin'),(11,'SuperAdmin');
/*!40000 ALTER TABLE `nivarcroles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nivarcuserroles`
--

DROP TABLE IF EXISTS `nivarcuserroles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nivarcuserroles` (
  `RoleId` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  PRIMARY KEY (`RoleId`,`UserId`),
  KEY `FK_UserRoles_NivarcRoles` (`RoleId`),
  KEY `FK_UserRoles_NivarcUsers` (`UserId`),
  CONSTRAINT `FK_UserRoles_NivarcRoles` FOREIGN KEY (`RoleId`) REFERENCES `nivarcroles` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_UserRoles_NivarcUsers` FOREIGN KEY (`UserId`) REFERENCES `nivarcusers` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nivarcuserroles`
--

LOCK TABLES `nivarcuserroles` WRITE;
/*!40000 ALTER TABLE `nivarcuserroles` DISABLE KEYS */;
/*!40000 ALTER TABLE `nivarcuserroles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nivarcusers`
--

DROP TABLE IF EXISTS `nivarcusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nivarcusers` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserName` longtext NOT NULL,
  `Password` varchar(128) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nivarcusers`
--

LOCK TABLES `nivarcusers` WRITE;
/*!40000 ALTER TABLE `nivarcusers` DISABLE KEYS */;
/*!40000 ALTER TABLE `nivarcusers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `TitleId` int(11) DEFAULT NULL,
  `FirstName` longtext,
  `LastName` longtext,
  `MiddleName` varchar(100) DEFAULT NULL,
  `DateOfBirth` date DEFAULT NULL,
  `DateOfDeath` date DEFAULT NULL,
  `MaritalStatusId` int(11) DEFAULT NULL,
  `PrimaryCareProviderId` int(11) DEFAULT NULL,
  `GenderId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_Patient_Gender` (`GenderId`),
  KEY `FK_Patient_MaritalStatus` (`MaritalStatusId`),
  KEY `FK_Patient_MedicalProvider` (`PrimaryCareProviderId`),
  KEY `FK_Patient_Title` (`TitleId`),
  CONSTRAINT `FK_Patient_Gender` FOREIGN KEY (`GenderId`) REFERENCES `gender` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Patient_MaritalStatus` FOREIGN KEY (`MaritalStatusId`) REFERENCES `maritalstatus` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Patient_MedicalProvider` FOREIGN KEY (`PrimaryCareProviderId`) REFERENCES `medicalprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Patient_Title` FOREIGN KEY (`TitleId`) REFERENCES `title` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES (1,1,'First Name','Last Name','Middle name','1980-01-01',NULL,1,1,1);
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientaddress`
--

DROP TABLE IF EXISTS `patientaddress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patientaddress` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Line1` longtext NOT NULL,
  `Line2` longtext,
  `City` longtext NOT NULL,
  `State` char(4) NOT NULL,
  `PostalCode` varchar(64) DEFAULT NULL,
  `PatientId` int(11) NOT NULL,
  `AddressTypeId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_PatientAddress_AddressType` (`AddressTypeId`),
  KEY `FK_PatientAddress_Patient` (`PatientId`),
  CONSTRAINT `FK_PatientAddress_AddressType` FOREIGN KEY (`AddressTypeId`) REFERENCES `addresstype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientAddress_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientaddress`
--

LOCK TABLES `patientaddress` WRITE;
/*!40000 ALTER TABLE `patientaddress` DISABLE KEYS */;
INSERT INTO `patientaddress` VALUES (1,'Line1','Line2','City','AP','123456',1,4);
/*!40000 ALTER TABLE `patientaddress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientallergy`
--

DROP TABLE IF EXISTS `patientallergy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patientallergy` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  `PatientId` int(11) NOT NULL,
  `AllergyTypeId` int(11) NOT NULL,
  `AllergyReactionId` int(11) DEFAULT NULL,
  `FirstObserved` date DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_PatientAllergy_Patient` (`PatientId`),
  KEY `FK_PatientAllergy_AllergyType` (`AllergyTypeId`),
  KEY `FK_PatientAllergy_AllergyReaction` (`AllergyReactionId`),
  CONSTRAINT `FK_PatientAllergy_Allergy` FOREIGN KEY (`AllergyTypeId`) REFERENCES `allergytype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientAllergy_AllergyReaction` FOREIGN KEY (`AllergyReactionId`) REFERENCES `allergyreaction` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientAllergy_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientallergy`
--

LOCK TABLES `patientallergy` WRITE;
/*!40000 ALTER TABLE `patientallergy` DISABLE KEYS */;
/*!40000 ALTER TABLE `patientallergy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientemail`
--

DROP TABLE IF EXISTS `patientemail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patientemail` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `PatientId` int(11) NOT NULL,
  `EmailAddress` varchar(200) NOT NULL,
  `EmailTypeId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_PatientEmail_EmailType` (`EmailTypeId`),
  KEY `FK_PatientEmail_Patient` (`PatientId`),
  CONSTRAINT `FK_PatientEmail_EmailType` FOREIGN KEY (`EmailTypeId`) REFERENCES `emailtype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientEmail_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientemail`
--

LOCK TABLES `patientemail` WRITE;
/*!40000 ALTER TABLE `patientemail` DISABLE KEYS */;
INSERT INTO `patientemail` VALUES (1,1,'someone@example.com',2);
/*!40000 ALTER TABLE `patientemail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientinsurance`
--

DROP TABLE IF EXISTS `patientinsurance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patientinsurance` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `PatientId` int(11) NOT NULL,
  `InsuranceProviderId` int(11) NOT NULL,
  `InsurancePlanTypeId` int(11) DEFAULT NULL,
  `InsurancePlanId` varchar(60) DEFAULT NULL,
  `PlanEffectiveDate` date DEFAULT NULL,
  `PlanExpirationDate` date DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_PatientInsurance_Patient` (`PatientId`),
  KEY `FK_PatientInsurance_InsuranceProvider` (`InsuranceProviderId`),
  KEY `FK_PatientInsurance_InsurancePlanType` (`InsurancePlanTypeId`),
  CONSTRAINT `FK_PatientInsurance_InsurancePlanType` FOREIGN KEY (`InsurancePlanTypeId`) REFERENCES `insuranceplantype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientInsurance_InsuranceProvider` FOREIGN KEY (`InsuranceProviderId`) REFERENCES `insuranceprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientInsurance_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientinsurance`
--

LOCK TABLES `patientinsurance` WRITE;
/*!40000 ALTER TABLE `patientinsurance` DISABLE KEYS */;
/*!40000 ALTER TABLE `patientinsurance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientmedication`
--

DROP TABLE IF EXISTS `patientmedication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patientmedication` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `PatientId` int(11) NOT NULL,
  `MedicationId` int(11) NOT NULL,
  `PrescriptionId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_PatientMedication_Medication` (`MedicationId`),
  KEY `FK_PatientMedication_Patient` (`PatientId`),
  KEY `FK_PatientMedication_Prescription` (`PrescriptionId`),
  CONSTRAINT `FK_PatientMedication_Medication` FOREIGN KEY (`MedicationId`) REFERENCES `medication` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientMedication_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientMedication_Prescription` FOREIGN KEY (`PrescriptionId`) REFERENCES `prescription` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientmedication`
--

LOCK TABLES `patientmedication` WRITE;
/*!40000 ALTER TABLE `patientmedication` DISABLE KEYS */;
/*!40000 ALTER TABLE `patientmedication` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientnotes`
--

DROP TABLE IF EXISTS `patientnotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patientnotes` (
  `Id` int(11) NOT NULL,
  `PatientId` int(11) NOT NULL,
  `VisitId` int(11) DEFAULT NULL,
  `MedicalProviderId` int(11) NOT NULL,
  `NotesDateTime` datetime NOT NULL,
  `NotesText` longtext,
  PRIMARY KEY (`Id`),
  KEY `FK_PatientNotes_Visit` (`VisitId`),
  CONSTRAINT `FK_PatientNotes_Visit` FOREIGN KEY (`VisitId`) REFERENCES `visit` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientnotes`
--

LOCK TABLES `patientnotes` WRITE;
/*!40000 ALTER TABLE `patientnotes` DISABLE KEYS */;
/*!40000 ALTER TABLE `patientnotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientpersonidentifier`
--

DROP TABLE IF EXISTS `patientpersonidentifier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patientpersonidentifier` (
  `Id` int(11) NOT NULL,
  `PatientId` int(11) NOT NULL,
  `PersonIdentifierTypeId` int(11) NOT NULL,
  `Number` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_PatientPersonIdentifier_Patient` (`PatientId`),
  KEY `FK_PatientPersonIdentifier_PersonIdentifierType` (`PersonIdentifierTypeId`),
  CONSTRAINT `FK_PatientPersonIdentifier_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientPersonIdentifier_PersonIdentifierType` FOREIGN KEY (`PersonIdentifierTypeId`) REFERENCES `personidentifiertype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientpersonidentifier`
--

LOCK TABLES `patientpersonidentifier` WRITE;
/*!40000 ALTER TABLE `patientpersonidentifier` DISABLE KEYS */;
/*!40000 ALTER TABLE `patientpersonidentifier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientphone`
--

DROP TABLE IF EXISTS `patientphone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patientphone` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `PatientId` int(11) NOT NULL,
  `Number` varchar(64) NOT NULL,
  `PhoneTypeId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_PatientPhone_PhoneType` (`PhoneTypeId`),
  KEY `FK_PatientPhone_Patient` (`PatientId`),
  CONSTRAINT `FK_PatientPhone_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientPhone_PhoneType` FOREIGN KEY (`PhoneTypeId`) REFERENCES `phonetype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientphone`
--

LOCK TABLES `patientphone` WRITE;
/*!40000 ALTER TABLE `patientphone` DISABLE KEYS */;
INSERT INTO `patientphone` VALUES (1,1,'8867286836',3);
/*!40000 ALTER TABLE `patientphone` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientproblem`
--

DROP TABLE IF EXISTS `patientproblem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patientproblem` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `PatientId` int(11) NOT NULL,
  `ProblemId` int(11) NOT NULL,
  `OnsetDate` date DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_PatientProblem_Patient` (`PatientId`),
  KEY `FK_PatientProblem_Problem` (`ProblemId`),
  CONSTRAINT `FK_PatientProblem_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientProblem_Problem` FOREIGN KEY (`ProblemId`) REFERENCES `problem` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientproblem`
--

LOCK TABLES `patientproblem` WRITE;
/*!40000 ALTER TABLE `patientproblem` DISABLE KEYS */;
INSERT INTO `patientproblem` VALUES (1,1,1,'2013-06-01'),(2,1,4,'2013-12-01'),(3,1,8,'2014-01-01'),(4,1,1,'2014-01-14');
/*!40000 ALTER TABLE `patientproblem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientrelativeproblem`
--

DROP TABLE IF EXISTS `patientrelativeproblem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patientrelativeproblem` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `PatientId` int(11) NOT NULL,
  `ProblemId` int(11) NOT NULL,
  `RelationTypeId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_PatientRelativeProblemHistory_Patient` (`PatientId`),
  KEY `FK_PatientRelativeProblemHistory_Problem` (`ProblemId`),
  KEY `FK_PatientRelativeProblemHistory_RelationType` (`RelationTypeId`),
  CONSTRAINT `FK_PatientRelativeProblemHistory_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientRelativeProblemHistory_Problem` FOREIGN KEY (`ProblemId`) REFERENCES `problem` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientRelativeProblemHistory_RelationType` FOREIGN KEY (`RelationTypeId`) REFERENCES `relationtype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientrelativeproblem`
--

LOCK TABLES `patientrelativeproblem` WRITE;
/*!40000 ALTER TABLE `patientrelativeproblem` DISABLE KEYS */;
/*!40000 ALTER TABLE `patientrelativeproblem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personidentifiertype`
--

DROP TABLE IF EXISTS `personidentifiertype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personidentifiertype` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personidentifiertype`
--

LOCK TABLES `personidentifiertype` WRITE;
/*!40000 ALTER TABLE `personidentifiertype` DISABLE KEYS */;
/*!40000 ALTER TABLE `personidentifiertype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phonetype`
--

DROP TABLE IF EXISTS `phonetype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phonetype` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phonetype`
--

LOCK TABLES `phonetype` WRITE;
/*!40000 ALTER TABLE `phonetype` DISABLE KEYS */;
INSERT INTO `phonetype` VALUES (1,'Home'),(2,'Work'),(3,'Mobile'),(4,'Alternative');
/*!40000 ALTER TABLE `phonetype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription`
--

DROP TABLE IF EXISTS `prescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prescription` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `PatientId` int(11) DEFAULT NULL,
  `VisitId` int(11) DEFAULT NULL,
  `MedicationId` int(11) NOT NULL,
  `Dosage` varchar(100) DEFAULT NULL,
  `DosageUnitTypeId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_Prescription_DosageUnitType` (`DosageUnitTypeId`),
  KEY `FK_Prescription_Medication` (`MedicationId`),
  KEY `FK_Prescription_Patient` (`PatientId`),
  KEY `FK_Prescription_Visit` (`VisitId`),
  CONSTRAINT `FK_Prescription_DosageUnitType` FOREIGN KEY (`DosageUnitTypeId`) REFERENCES `dosageunittype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Prescription_Medication` FOREIGN KEY (`MedicationId`) REFERENCES `medication` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Prescription_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Prescription_Visit` FOREIGN KEY (`VisitId`) REFERENCES `visit` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problem`
--

DROP TABLE IF EXISTS `problem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `problem` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `SnoMedCode` varchar(100) NOT NULL,
  `ICD9Code` varchar(100) DEFAULT NULL,
  `ICD10Code` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problem`
--

LOCK TABLES `problem` WRITE;
/*!40000 ALTER TABLE `problem` DISABLE KEYS */;
INSERT INTO `problem` VALUES (1,'Meningoencephalitis',NULL,NULL),(2,'Meningoencephalitis due to acquired toxoplasmosis',NULL,NULL),(3,'Meningoencephalocele',NULL,NULL),(4,'Meningomyelitis',NULL,NULL),(5,'Meningomyelocele',NULL,NULL),(6,'Meningovascular syphilis - quaternary stage',NULL,NULL),(7,'Menkes kinky-hair syndrome',NULL,NULL),(8,'Menometrorrhagia',NULL,NULL),(9,'Menopausal and postmenopausal disorders',NULL,NULL),(10,'Menopausal flushing',NULL,NULL),(11,'Menopausal problem',NULL,NULL);
/*!40000 ALTER TABLE `problem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `relationtype`
--

DROP TABLE IF EXISTS `relationtype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `relationtype` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `relationtype`
--

LOCK TABLES `relationtype` WRITE;
/*!40000 ALTER TABLE `relationtype` DISABLE KEYS */;
INSERT INTO `relationtype` VALUES (1,'Associate'),(2,'Brother'),(3,'Child'),(4,'Employee'),(5,'Employer'),(6,'Emergency contact'),(7,'Extended family'),(8,'Father'),(9,'Foster child'),(10,'Friend'),(11,'Grandchild'),(12,'Grandparent'),(13,'Guardian'),(14,'Handicapped Dependent'),(15,'Life Partner'),(16,'Manager'),(17,'Mother'),(18,'None'),(19,'Other'),(20,'Owner'),(21,'Parent'),(22,'Self'),(23,'Sibling'),(24,'Sister'),(25,'Spouse'),(26,'Stepchild'),(27,'Trainer');
/*!40000 ALTER TABLE `relationtype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `title`
--

DROP TABLE IF EXISTS `title`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `title` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `title`
--

LOCK TABLES `title` WRITE;
/*!40000 ALTER TABLE `title` DISABLE KEYS */;
INSERT INTO `title` VALUES (1,'Mr.'),(2,'Miss.'),(3,'Mrs.');
/*!40000 ALTER TABLE `title` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vaccine`
--

DROP TABLE IF EXISTS `vaccine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vaccine` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  `VaccineTypeId` int(11) NOT NULL,
  `MaxNoOfDoses` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_Vaccine_VaccineType` (`VaccineTypeId`),
  CONSTRAINT `FK_Vaccine_VaccineType` FOREIGN KEY (`VaccineTypeId`) REFERENCES `visittype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaccine`
--

LOCK TABLES `vaccine` WRITE;
/*!40000 ALTER TABLE `vaccine` DISABLE KEYS */;
/*!40000 ALTER TABLE `vaccine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vaccinetype`
--

DROP TABLE IF EXISTS `vaccinetype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vaccinetype` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(200) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaccinetype`
--

LOCK TABLES `vaccinetype` WRITE;
/*!40000 ALTER TABLE `vaccinetype` DISABLE KEYS */;
/*!40000 ALTER TABLE `vaccinetype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit`
--

DROP TABLE IF EXISTS `visit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `visit` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `PatientId` int(11) NOT NULL,
  `MedicalProviderId` int(11) NOT NULL,
  `MedicalFacilityId` int(11) NOT NULL,
  `StartDateTime` datetime NOT NULL,
  `VisitTypeId` int(11) NOT NULL,
  `ReferredByMedicalProviderId` int(11) DEFAULT NULL,
  `ReferredByMedicalFacilityId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_Visit_MedicalFacility` (`ReferredByMedicalFacilityId`),
  KEY `FK_Visit_MedicalFacility1` (`MedicalFacilityId`),
  KEY `FK_Visit_MedicalProvider` (`MedicalProviderId`),
  KEY `FK_Visit_MedicalProvider1` (`ReferredByMedicalProviderId`),
  KEY `FK_Visit_Patient` (`PatientId`),
  KEY `FK_Visit_VisitType` (`VisitTypeId`),
  CONSTRAINT `FK_Visit_MedicalFacility` FOREIGN KEY (`ReferredByMedicalFacilityId`) REFERENCES `medicalfacility` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Visit_MedicalFacility1` FOREIGN KEY (`MedicalFacilityId`) REFERENCES `medicalfacility` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Visit_MedicalProvider` FOREIGN KEY (`MedicalProviderId`) REFERENCES `medicalprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Visit_MedicalProvider1` FOREIGN KEY (`ReferredByMedicalProviderId`) REFERENCES `medicalprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Visit_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Visit_VisitType` FOREIGN KEY (`VisitTypeId`) REFERENCES `visittype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit`
--

LOCK TABLES `visit` WRITE;
/*!40000 ALTER TABLE `visit` DISABLE KEYS */;
INSERT INTO `visit` VALUES (1,1,1,2,'2013-01-13 00:00:00',1,NULL,NULL);
/*!40000 ALTER TABLE `visit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visittype`
--

DROP TABLE IF EXISTS `visittype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `visittype` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(200) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visittype`
--

LOCK TABLES `visittype` WRITE;
/*!40000 ALTER TABLE `visittype` DISABLE KEYS */;
INSERT INTO `visittype` VALUES (1,'Primary Care'),(2,'Medical Specialty'),(3,'Emergency Care');
/*!40000 ALTER TABLE `visittype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vitalsigncode`
--

DROP TABLE IF EXISTS `vitalsigncode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vitalsigncode` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` varchar(200) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vitalsigncode`
--

LOCK TABLES `vitalsigncode` WRITE;
/*!40000 ALTER TABLE `vitalsigncode` DISABLE KEYS */;
INSERT INTO `vitalsigncode` VALUES (1,'Body Temperature'),(2,'Blood Pressure - Diastolic'),(3,'Blood Pressure - Systolic'),(4,'Blood Oxygen Saturation'),(5,'Head Circumference'),(6,'Heart Rate'),(7,'Height'),(8,'Height (Lying)'),(9,'Pulse'),(10,'Respiratory Rate'),(11,'Weight Measured');
/*!40000 ALTER TABLE `vitalsigncode` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vitalsignobservation`
--

DROP TABLE IF EXISTS `vitalsignobservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vitalsignobservation` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `EncounterId` int(11) NOT NULL,
  `VitalSignCodeId` int(11) NOT NULL,
  `Value` double DEFAULT NULL,
  `LabResultUnitId` int(11) DEFAULT NULL,
  `LabResultFlagId` int(11) DEFAULT NULL,
  `LabResultStatusId` int(11) DEFAULT NULL,
  `ReferenceMinimum` double DEFAULT NULL,
  `ReferenceMaximum` double DEFAULT NULL,
  `ObservationDate` date NOT NULL,
  `TextValue` longtext,
  `Notes` longtext,
  PRIMARY KEY (`Id`),
  KEY `FK_VitalSignObservation_MedicalEncounter` (`EncounterId`),
  KEY `FK_VitalSignObservation_VitalSignCode` (`VitalSignCodeId`),
  KEY `FK_VitalSignObservation_LabResultUnit` (`LabResultUnitId`),
  KEY `FK_VitalSignObservation_LabResultFlag` (`LabResultFlagId`),
  KEY `FK_VitalSignObservation_LabResultStatus` (`LabResultStatusId`),
  CONSTRAINT `FK_VitalSignObservation_LabResultFlag` FOREIGN KEY (`LabResultFlagId`) REFERENCES `labresultflag` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_VitalSignObservation_LabResultStatus` FOREIGN KEY (`LabResultStatusId`) REFERENCES `labresultstatus` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_VitalSignObservation_LabResultUnit` FOREIGN KEY (`LabResultUnitId`) REFERENCES `labresultunit` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_VitalSignObservation_MedicalEncounter` FOREIGN KEY (`EncounterId`) REFERENCES `medicalencounter` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_VitalSignObservation_VitalSignCode` FOREIGN KEY (`VitalSignCodeId`) REFERENCES `vitalsigncode` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vitalsignobservation`
--

LOCK TABLES `vitalsignobservation` WRITE;
/*!40000 ALTER TABLE `vitalsignobservation` DISABLE KEYS */;
INSERT INTO `vitalsignobservation` VALUES (1,1,1,99,3,6,1,NULL,NULL,'2014-01-13',NULL,NULL);
/*!40000 ALTER TABLE `vitalsignobservation` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-01-19 13:13:58
