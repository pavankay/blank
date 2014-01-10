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
-- Table structure for table `allergy`
--

DROP TABLE IF EXISTS `allergy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `allergy` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Description` longtext NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allergy`
--

LOCK TABLES `allergy` WRITE;
/*!40000 ALTER TABLE `allergy` DISABLE KEYS */;
INSERT INTO `allergy` VALUES (1,'Drug Allergy'),(2,'Food allergy'),(3,'Animal Allergy'),(4,'Plant Allergy'),(5,'Environmental Allergy'),(6,'Miscellaneous Allergy');
/*!40000 ALTER TABLE `allergy` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobrole`
--

LOCK TABLES `jobrole` WRITE;
/*!40000 ALTER TABLE `jobrole` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobrole` ENABLE KEYS */;
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
-- Table structure for table `medicalfacility`
--

DROP TABLE IF EXISTS `medicalfacility`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicalfacility` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `TitleId` int(11) NOT NULL,
  `WebUrl` longtext,
  PRIMARY KEY (`Id`),
  KEY `FK_MedicalFacility_Title` (`TitleId`),
  CONSTRAINT `FK_MedicalFacility_Title` FOREIGN KEY (`TitleId`) REFERENCES `title` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalfacility`
--

LOCK TABLES `medicalfacility` WRITE;
/*!40000 ALTER TABLE `medicalfacility` DISABLE KEYS */;
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
  CONSTRAINT `FK_MedicalProviderPhone_PhoneType` FOREIGN KEY (`PhoneTypeId`) REFERENCES `phonetype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_MedicalProviderPhone_MedicalProvider` FOREIGN KEY (`MedicalProviderId`) REFERENCES `medicalprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
INSERT INTO `patientaddress` VALUES (1,'Line1','Line2','City','AP','123456',1,1);
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
  `PatientId` int(11) NOT NULL,
  `AllergyId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_PatientAllergy_Allergy` (`AllergyId`),
  KEY `FK_PatientAllergy_Patient` (`PatientId`),
  CONSTRAINT `FK_PatientAllergy_Allergy` FOREIGN KEY (`AllergyId`) REFERENCES `allergy` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
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
INSERT INTO `patientemail` VALUES (1,1,'someone@example.com',1);
/*!40000 ALTER TABLE `patientemail` ENABLE KEYS */;
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
  CONSTRAINT `FK_PatientPhone_PhoneType` FOREIGN KEY (`PhoneTypeId`) REFERENCES `phonetype` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientPhone_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientphone`
--

LOCK TABLES `patientphone` WRITE;
/*!40000 ALTER TABLE `patientphone` DISABLE KEYS */;
INSERT INTO `patientphone` VALUES (1,1,'000-000-0000',1);
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
  PRIMARY KEY (`Id`),
  KEY `FK_PatientProblem_Patient` (`PatientId`),
  KEY `FK_PatientProblem_Problem` (`ProblemId`),
  CONSTRAINT `FK_PatientProblem_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_PatientProblem_Problem` FOREIGN KEY (`ProblemId`) REFERENCES `problem` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientproblem`
--

LOCK TABLES `patientproblem` WRITE;
/*!40000 ALTER TABLE `patientproblem` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problem`
--

LOCK TABLES `problem` WRITE;
/*!40000 ALTER TABLE `problem` DISABLE KEYS */;
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
  CONSTRAINT `FK_Visit_MedicalFacility` FOREIGN KEY (`ReferredByMedicalFacilityId`) REFERENCES `medicalfacility` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Visit_MedicalFacility1` FOREIGN KEY (`MedicalFacilityId`) REFERENCES `medicalfacility` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Visit_MedicalProvider` FOREIGN KEY (`MedicalProviderId`) REFERENCES `medicalprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Visit_MedicalProvider1` FOREIGN KEY (`ReferredByMedicalProviderId`) REFERENCES `medicalprovider` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_Visit_Patient` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`Id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit`
--

LOCK TABLES `visit` WRITE;
/*!40000 ALTER TABLE `visit` DISABLE KEYS */;
/*!40000 ALTER TABLE `visit` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-01-11  2:04:13