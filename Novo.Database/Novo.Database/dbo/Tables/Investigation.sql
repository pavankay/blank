CREATE TABLE [dbo].[Investigation] (
    [Id]                  INT            IDENTITY (1, 1) NOT NULL,
    [Description]         NVARCHAR (MAX) NOT NULL,
    [InvestigationTypeId] INT            NOT NULL,
    CONSTRAINT [PK_Investigation] PRIMARY KEY CLUSTERED ([Id] ASC)
);

