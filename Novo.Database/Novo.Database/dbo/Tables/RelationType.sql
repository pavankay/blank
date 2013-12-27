CREATE TABLE [dbo].[RelationType] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Description] NVARCHAR (MAX) NOT NULL,
    CONSTRAINT [PK_dbo_RelationType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

