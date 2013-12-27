CREATE TABLE [dbo].[Prescription] (
    [Id]               INT           IDENTITY (1, 1) NOT NULL,
    [PatientId]        INT           NULL,
    [VisitId]          INT           NULL,
    [MedicationId]     INT           NOT NULL,
    [Dosage]           NVARCHAR (50) NULL,
    [DosageUnitTypeId] INT           NULL,
    CONSTRAINT [PK_Prescription] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Prescription_DosageUnitType] FOREIGN KEY ([DosageUnitTypeId]) REFERENCES [dbo].[DosageUnitType] ([Id]),
    CONSTRAINT [FK_Prescription_Medication] FOREIGN KEY ([MedicationId]) REFERENCES [dbo].[Medication] ([Id]),
    CONSTRAINT [FK_Prescription_Patient] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[Patient] ([Id]),
    CONSTRAINT [FK_Prescription_Visit] FOREIGN KEY ([VisitId]) REFERENCES [dbo].[Visit] ([Id])
);

