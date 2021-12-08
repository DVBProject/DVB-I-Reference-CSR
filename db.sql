DROP database dvb_i_csr;
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
 `Organizations` text NOT NULL ,
 `Id`            integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `EventHistory`
(
 `Event`         text NOT NULL ,
 `ServiceList`   integer NOT NULL ,
 `Time`          text NOT NULL ,
 `User`          integer NOT NULL ,
 `Id`            integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`)
) ENGINE=InnoDB;

INSERT INTO Organization(Kind,ContactName,Jurisdiction,Address,ElectronicAddress,Regulator) VALUES ('Repository provider','Contact','Jurisdiction','Address','Electronic address',1);
INSERT INTO EntityName(Name,Type,Organization) VALUES("Repository provider","",1);
INSERT INTO ServiceListEntryPoints(ServiceListRegistryEntity) VALUES (1);

INSERT INTO Organization(Kind,ContactName,Jurisdiction,Address,ElectronicAddress,Regulator) VALUES ('Servicelist provider','Contact','Jurisdiction','Address','Electronic address',0);
INSERT INTO EntityName(Name,Type,Organization) VALUES("Servicelist provider","",2);
INSERT INTO ProviderOffering(Organization,ServiceListRegistry) VALUES(2,1);

INSERT INTO Organization(Kind,ContactName,Jurisdiction,Address,ElectronicAddress,Regulator) VALUES ('Servicelist provider2','Contact','Jurisdiction','Address','Email',1);
INSERT INTO EntityName(Name,Type,Organization) VALUES("Servicelist provider 2","",3);
INSERT INTO ProviderOffering(Organization,ServiceListRegistry) VALUES(3,1);
