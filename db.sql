CREATE DATABASE dvb_i_csr DEFAULT CHARACTER SET utf8 COLLATE utf8_swedish_ci;
USE dvb_i_csr;

CREATE TABLE `Organization`
(
 `Kind`              text NULL ,
 `ContactName`       text NULL ,
 `Jurisdiction`      text NULL ,
 `Address`           text NULL ,
 `ElectronicAddress` text NULL ,
 `Regulator`         tinyint NOT NULL ,
 `Id`                integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `EntityName`
(
 `Name`         text NOT NULL ,
 `Organization` integer NOT NULL ,
 `Type`         text NOT NULL ,
 `Id`           integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`),
KEY `fkIdx_21` (`Organization`),
CONSTRAINT `FK_19` FOREIGN KEY `fkIdx_21` (`Organization`) REFERENCES `Organization` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `ServiceListEntryPoints`
(
 `Id`                        integer NOT NULL AUTO_INCREMENT,
 `ServiceListRegistryEntity` integer NOT NULL ,

PRIMARY KEY (`Id`),
KEY `fkIdx_46` (`ServiceListRegistryEntity`),
CONSTRAINT `FK_44` FOREIGN KEY `fkIdx_46` (`ServiceListRegistryEntity`) REFERENCES `Organization` (`Id`)
) ENGINE=InnoDB;


CREATE TABLE `ProviderOffering`
(
 `Id`                  integer NOT NULL AUTO_INCREMENT,
 `Organization`        integer NOT NULL ,
 `ServiceListRegistry` integer NOT NULL ,

PRIMARY KEY (`Id`),
KEY `fkIdx_49` (`Organization`),
CONSTRAINT `FK_47` FOREIGN KEY `fkIdx_49` (`Organization`) REFERENCES `Organization` (`Id`),
KEY `fkIdx_58` (`ServiceListRegistry`),
CONSTRAINT `FK_56` FOREIGN KEY `fkIdx_58` (`ServiceListRegistry`) REFERENCES `ServiceListEntryPoints` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `ServiceListOffering`
(
 `Provider`      integer NOT NULL ,
 `regulatorList` tinyint NOT NULL ,
 `Delivery`      text NOT NULL ,
 `Status`        text NOT NULL ,
 `Id`            integer NOT NULL AUTO_INCREMENT ,

PRIMARY KEY (`Id`),
KEY `fkIdx_55` (`Provider`),
CONSTRAINT `FK_53` FOREIGN KEY `fkIdx_55` (`Provider`) REFERENCES `ProviderOffering` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `Genre`
(
 `Genre` text NOT NULL ,
 `ServiceList`  integer NOT NULL ,
 `Id`    integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`),
KEY `fkIdx_136` (`ServiceList`),
CONSTRAINT `FK_134` FOREIGN KEY `fkIdx_136` (`ServiceList`) REFERENCES `ServiceListOffering` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `Language`
(
 `Language`     text NOT NULL ,
 `ServiceList`  integer NOT NULL ,
 `Id`           integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`),
KEY `fkIdx_176` (`ServiceList`),
CONSTRAINT `FK_174` FOREIGN KEY `fkIdx_176` (`ServiceList`) REFERENCES `ServiceListOffering` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `ServiceListName`
(
 `ServiceList` integer NOT NULL ,
 `Name` text NOT NULL ,
 `Lang` text NOT NULL ,
 `Id`   integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`),
KEY `fkIdx_75` (`ServiceList`),
CONSTRAINT `FK_73` FOREIGN KEY `fkIdx_75` (`ServiceList`) REFERENCES `ServiceListOffering` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `ServiceListURI`
(
 `URI`  text NOT NULL ,
 `ServiceList` integer NOT NULL ,
 `Id`   integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`),
KEY `fkIdx_69` (`ServiceList`),
CONSTRAINT `FK_67` FOREIGN KEY `fkIdx_69` (`ServiceList`) REFERENCES `ServiceListOffering` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `TargetCountry`
(
 `ServiceList`    integer NOT NULL ,
 `Country` text NOT NULL ,
 `Id`      integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`),
KEY `fkIdx_118` (`ServiceList`),
CONSTRAINT `FK_116` FOREIGN KEY `fkIdx_118` (`ServiceList`) REFERENCES `ServiceListOffering` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `User`
(
 `Name`          text NOT NULL ,
 `Hash`          text NOT NULL ,
 `Role`          text NOT NULL ,
 `Organization`  integer NOT NULL ,
 `Providers`     text NOT NULL ,
 `Email`         text NOT NULL ,
 `Session`       integer NOT NULL ,
 `Id`            integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `EventHistory`
(
 `Event`         text NOT NULL ,
 `ServiceList`   integer NOT NULL ,
 `Name`          text NOT NULL ,
 `Time`          text NOT NULL ,
 `User`          integer NOT NULL ,
 `UserName`      text NOT NULL ,
 `ContentJson`   text NOT NULL ,
 `Id`            integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`)
) ENGINE=InnoDB;


ALTER TABLE `EntityName`
  DROP FOREIGN KEY `FK_19`;

ALTER TABLE `EntityName`
  ADD CONSTRAINT `FK_19` FOREIGN KEY `fkIdx_21` (`Organization`) REFERENCES `Organization` (`Id`) ON DELETE CASCADE;

ALTER TABLE `ServiceListEntryPoints`
  DROP FOREIGN KEY `FK_44`;

ALTER TABLE `ServiceListEntryPoints`
  ADD CONSTRAINT `FK_44` FOREIGN KEY `fkIdx_46` (`ServiceListRegistryEntity`) REFERENCES `Organization` (`Id`) ON DELETE CASCADE;

ALTER TABLE `ProviderOffering`
  DROP FOREIGN KEY `FK_47`;

ALTER TABLE `ProviderOffering`
  ADD CONSTRAINT `FK_47` FOREIGN KEY `fkIdx_49` (`Organization`) REFERENCES `Organization` (`Id`) ON DELETE CASCADE;

ALTER TABLE `ServiceListOffering`
  DROP FOREIGN KEY `FK_53`;

ALTER TABLE `ServiceListOffering`
  ADD CONSTRAINT `FK_53` FOREIGN KEY `fkIdx_55` (`Provider`) REFERENCES `ProviderOffering` (`Id`) ON DELETE CASCADE;

ALTER TABLE `Genre`
  DROP FOREIGN KEY `FK_134`;

ALTER TABLE `Genre`
  ADD CONSTRAINT `FK_134` FOREIGN KEY `fkIdx_136` (`ServiceList`) REFERENCES `ServiceListOffering` (`Id`) ON DELETE CASCADE;

ALTER TABLE `Language`
  DROP FOREIGN KEY `FK_174`;

ALTER TABLE `Language`
  ADD CONSTRAINT `FK_174` FOREIGN KEY `fkIdx_176` (`ServiceList`) REFERENCES `ServiceListOffering` (`Id`) ON DELETE CASCADE;

ALTER TABLE `ServiceListURI`
  DROP FOREIGN KEY `FK_67`;

ALTER TABLE `ServiceListURI`
  ADD CONSTRAINT `FK_67` FOREIGN KEY `fkIdx_69` (`ServiceList`) REFERENCES `ServiceListOffering` (`Id`) ON DELETE CASCADE;

ALTER TABLE `TargetCountry`
  DROP FOREIGN KEY `FK_116`;

ALTER TABLE `TargetCountry`
  ADD CONSTRAINT `FK_116` FOREIGN KEY `fkIdx_118` (`ServiceList`) REFERENCES `ServiceListOffering` (`Id`) ON DELETE CASCADE;

ALTER TABLE `ServiceListName`
  DROP FOREIGN KEY `FK_73`;

ALTER TABLE `ServiceListName`
  ADD CONSTRAINT `FK_73` FOREIGN KEY `fkIdx_75` (`ServiceList`) REFERENCES `ServiceListOffering` (`Id`) ON DELETE CASCADE;

/*alter table to migrate from older versions without dropping database*/
ALTER TABLE `ServiceListOffering`
  ADD `Status` text NOT NULL;

ALTER TABLE `User`
  ADD `Providers` text NOT NULL;

ALTER TABLE `User`
  DROP COLUMN `Organizations`;

ALTER TABLE `User`
  ADD `Organization` TEXT NOT NULL;

INSERT INTO Organization(Kind,ContactName,Jurisdiction,Address,ElectronicAddress,Regulator,Id) VALUES ('Repository provider','Contact','Jurisdiction','Address','Electronic address',1,1);
INSERT INTO EntityName(Name,Type,Organization,Id) VALUES("Repository provider","",1,1);
INSERT INTO ServiceListEntryPoints(ServiceListRegistryEntity,Id) VALUES (1,1);

INSERT INTO User(Name,Hash,Role,Id,Providers,Organization) VALUES ('admin','$2a$08$B5kXMji7bHC8yOO1xIqeO.Vy3oPc.rkQUTG4bNG1hZWNBmcz9eaZe','admin',1,"",1);
