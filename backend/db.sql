--DROP database dvb_i_csr;
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
 `delivery`      text NOT NULL ,
 `Id`            integer NOT NULL AUTO_INCREMENT ,

PRIMARY KEY (`Id`),
KEY `fkIdx_55` (`Provider`),
CONSTRAINT `FK_53` FOREIGN KEY `fkIdx_55` (`Provider`) REFERENCES `ProviderOffering` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `EntityName`
(
 `name`         text NOT NULL ,
 `organization` integer NOT NULL ,
 `type`         text NOT NULL ,
 `Id`           integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`),
KEY `fkIdx_21` (`organization`),
CONSTRAINT `FK_19` FOREIGN KEY `fkIdx_21` (`organization`) REFERENCES `Organization` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `Genre`
(
 `genre` text NOT NULL ,
 `list`  integer NOT NULL ,
 `Id`    integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`),
KEY `fkIdx_136` (`list`),
CONSTRAINT `FK_134` FOREIGN KEY `fkIdx_136` (`list`) REFERENCES `ServiceListOffering` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `language`
(
 `language` text NOT NULL ,
 `list`     integer NOT NULL ,
 `Id`       integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`),
KEY `fkIdx_176` (`list`),
CONSTRAINT `FK_174` FOREIGN KEY `fkIdx_176` (`list`) REFERENCES `ServiceListOffering` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `ServiceListName`
(
 `list` integer NOT NULL ,
 `Name` text NOT NULL ,
 `lang` text NOT NULL ,
 `Id`   integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`),
KEY `fkIdx_75` (`list`),
CONSTRAINT `FK_73` FOREIGN KEY `fkIdx_75` (`list`) REFERENCES `ServiceListOffering` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `ServiceListURI`
(
 `URI`  text NOT NULL ,
 `list` integer NOT NULL ,
 `Id`   integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`),
KEY `fkIdx_69` (`list`),
CONSTRAINT `FK_67` FOREIGN KEY `fkIdx_69` (`list`) REFERENCES `ServiceListOffering` (`Id`)
) ENGINE=InnoDB;

CREATE TABLE `TargetCountry`
(
 `list`    integer NOT NULL ,
 `country` text NOT NULL ,
 `Id`      integer NOT NULL AUTO_INCREMENT,

PRIMARY KEY (`Id`),
KEY `fkIdx_118` (`list`),
CONSTRAINT `FK_116` FOREIGN KEY `fkIdx_118` (`list`) REFERENCES `ServiceListOffering` (`Id`)
) ENGINE=InnoDB;


--Default values, create ServiceListEntryPoint and Organization for it
INSERT INTO Organization(Kind,ContactName,Jurisdiction,Address,ElectronicAddress,Regulator) VALUES ('Repository provider','Contact','Jurisdiction','Address','Electronic address',1);
INSERT INTO ServiceListEntryPoints(ServiceListRegistryEntity) VALUES (1);



