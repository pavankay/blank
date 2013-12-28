CREATE TABLE [dbo].[MedicalFacility] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Title]  NVARCHAR (50)  NOT NULL,
    [WebUrl] NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_MedicalFacility] PRIMARY KEY CLUSTERED ([Id] ASC)
);

