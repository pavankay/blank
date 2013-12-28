CREATE TABLE [dbo].[AddressType] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Description] NVARCHAR (MAX) NOT NULL,
    CONSTRAINT [PK_dbo_AddressType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

