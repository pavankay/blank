CREATE TABLE [dbo].[DosageUnitType] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Description] NVARCHAR (MAX) NOT NULL,
    CONSTRAINT [PK_dbo_DosageUnitType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

