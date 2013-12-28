CREATE TABLE [dbo].[PatientAllergy] (
    [Id]        INT IDENTITY (1, 1) NOT NULL,
    [PatientId] INT NOT NULL,
    [AllergyId] INT NOT NULL,
    CONSTRAINT [PK_PatientAllergy] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PatientAllergy_Allergy] FOREIGN KEY ([AllergyId]) REFERENCES [dbo].[Allergy] ([Id]),
    CONSTRAINT [FK_PatientAllergy_Patient] FOREIGN KEY ([PatientId]) REFERENCES [dbo].[Patient] ([Id])
);

