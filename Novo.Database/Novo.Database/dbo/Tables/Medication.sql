CREATE TABLE [dbo].[Medication] (
    [Id]    INT           IDENTITY (1, 1) NOT NULL,
    [Name]  NVARCHAR (50) NOT NULL,
    [Brand] NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_Medication] PRIMARY KEY CLUSTERED ([Id] ASC)
);

