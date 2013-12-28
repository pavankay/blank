CREATE TABLE [dbo].[Problem] (
    [Id]         INT           IDENTITY (1, 1) NOT NULL,
    [SnoMedCode] NVARCHAR (50) NOT NULL,
    [ICD9Code]   NVARCHAR (50) NULL,
    [ICD10Code]  NVARCHAR (50) NULL,
    CONSTRAINT [PK_Problem] PRIMARY KEY CLUSTERED ([Id] ASC)
);

