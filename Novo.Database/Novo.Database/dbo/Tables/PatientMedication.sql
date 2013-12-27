CREATE TABLE [dbo].[PatientMedication] (
    [Id]             INT IDENTITY (1, 1) NOT NULL,
    [PatientId]      INT NOT NULL,
    [MedicationId]   INT NOT NULL,
    [PrescriptionId] INT NULL,
    CONSTRAINT [PK_PatientMedication] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PatientMedication_Medication] FOREIGN KEY ([MedicationId]) REFERENCES [dbo].[Medication] ([Id]),
    CONSTRAINT [FK_PatientMedication_Patient] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[Patient] ([Id]),
    CONSTRAINT [FK_PatientMedication_Prescription] FOREIGN KEY ([PrescriptionId]) REFERENCES [dbo].[Prescription] ([Id])
);

