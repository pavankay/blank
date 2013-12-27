CREATE TABLE [dbo].[Allergy] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Description] NVARCHAR (MAX) NOT NULL,
    CONSTRAINT [PK_dbo_Allergy] PRIMARY KEY CLUSTERED ([Id] ASC)
);

