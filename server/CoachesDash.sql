CREATE DATABASE `CoachesDashboard` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;


-- CoachesDashboard.Positions definition

CREATE TABLE `Positions` (
  `PositionID` int NOT NULL AUTO_INCREMENT,
  `PositionName` varchar(25) NOT NULL,
  `SideOfBall` varchar(20) NOT NULL,
  PRIMARY KEY (`PositionID`),
  CONSTRAINT `Positions_CHECK` CHECK ((`SideOfBall` in (_utf8mb4'Offense',_utf8mb4'Defense',_utf8mb4'Special Teams')))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- CoachesDashboard.Teams definition

CREATE TABLE `Teams` (
  `TeamID` int NOT NULL AUTO_INCREMENT,
  `TeamName` varchar(45) NOT NULL,
  `TeamCity` varchar(50) NOT NULL,
  `TeamState` varchar(27) NOT NULL,
  PRIMARY KEY (`TeamID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- CoachesDashboard.Games definition

CREATE TABLE `Games` (
  `GameID` int NOT NULL AUTO_INCREMENT,
  `TeamID` int NOT NULL,
  `GameDate` date NOT NULL,
  `GameType` varchar(25) NOT NULL,
  `TeamScore` int DEFAULT NULL,
  `OpponentID` int NOT NULL,
  `OT` tinyint(1) NOT NULL DEFAULT '0',
  `OpponentScore` int DEFAULT NULL,
  `Location` varchar(255) NOT NULL DEFAULT '"TBD"',
  `GameTime` time NOT NULL DEFAULT '12:00:00',
  PRIMARY KEY (`GameID`),
  KEY `Games_Teams_FK` (`TeamID`),
  KEY `Games_Teams_FK_1` (`OpponentID`),
  CONSTRAINT `Games_Teams_FK` FOREIGN KEY (`TeamID`) REFERENCES `Teams` (`TeamID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `Games_Teams_FK_1` FOREIGN KEY (`OpponentID`) REFERENCES `Teams` (`TeamID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `Games_CHECK` CHECK ((`GameType` in (_utf8mb4'PreSeason',_utf8mb4'Regular Season',_utf8mb4'Post Season',_utf8mb4'District',_utf8mb4'State Championship')))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- CoachesDashboard.Players definition

CREATE TABLE `Players` (
  `PlayerID` int NOT NULL AUTO_INCREMENT,
  `PlayerFirstName` varchar(100) NOT NULL,
  `PlayerLastName` varchar(100) NOT NULL,
  `PlayerAddress` varchar(100) NOT NULL,
  `PlayerGPA` decimal(3,2) NOT NULL,
  `PlayerPhone` varchar(15) DEFAULT NULL,
  `PlayerEmail` varchar(255) DEFAULT NULL,
  `TeamID` int NOT NULL,
  `PlayerJerseyNumber` int NOT NULL,
  `PlayerClass` varchar(15) NOT NULL,
  PRIMARY KEY (`PlayerID`),
  UNIQUE KEY `Players_UNIQUE` (`TeamID`,`PlayerJerseyNumber`),
  CONSTRAINT `Players_Teams_FK` FOREIGN KEY (`TeamID`) REFERENCES `Teams` (`TeamID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Players_CHECK` CHECK ((`PlayerJerseyNumber` between 0 and 99)),
  CONSTRAINT `Players_CHECK_1` CHECK ((`PlayerClass` in (_utf8mb4'Freshman',_utf8mb4'Sophmore',_utf8mb4'Junior',_utf8mb4'Senior')))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- CoachesDashboard.Users definition

CREATE TABLE `Users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `TeamID` int DEFAULT NULL,
  `UserName` varchar(100) NOT NULL,
  `UserRole` varchar(15) NOT NULL,
  `Password` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UserEmail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Users_UNIQUE` (`UserName`),
  UNIQUE KEY `UserEmail_UNIQUE` (`UserEmail`),
  KEY `Users_Teams_FK` (`TeamID`),
  CONSTRAINT `Users_Teams_FK` FOREIGN KEY (`TeamID`) REFERENCES `Teams` (`TeamID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `User_Role_CHECK` CHECK ((`UserRole` in (_utf8mb4'Coach',_utf8mb4'Admin',_utf8mb4'Assistant Coach')))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- CoachesDashboard.Events definition

CREATE TABLE `Events` (
  `EventID` int NOT NULL AUTO_INCREMENT,
  `TeamID` int NOT NULL,
  `EventStartDateTime` datetime NOT NULL,
  `EventType` varchar(15) NOT NULL,
  `EventTitle` varchar(100) NOT NULL,
  `EventEndDateTime` datetime NOT NULL,
  `EventDescription` varchar(255) DEFAULT NULL,
  `EventLocation` varchar(255) NOT NULL,
  `EventPlatform` varchar(50) NOT NULL,
  `EventLink` varchar(2048) DEFAULT NULL,
  `EventCreatedBy` int NOT NULL,
  `GameID` int DEFAULT NULL,
  PRIMARY KEY (`EventID`),
  KEY `MeetinID_Users_FK` (`EventCreatedBy`),
  KEY `MeetinID_Games_FK` (`GameID`),
  KEY `MeetinID_Teams_FK` (`TeamID`),
  CONSTRAINT `MeetinID_Games_FK` FOREIGN KEY (`GameID`) REFERENCES `Games` (`GameID`),
  CONSTRAINT `MeetinID_Teams_FK` FOREIGN KEY (`TeamID`) REFERENCES `Teams` (`TeamID`),
  CONSTRAINT `MeetinID_Users_FK` FOREIGN KEY (`EventCreatedBy`) REFERENCES `Users` (`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MeetinID_CHECK` CHECK ((`EventType` in (_utf8mb4'Practice',_utf8mb4'Meeting',_utf8mb4'Game',_utf8mb4'Scrimmage'))),
  CONSTRAINT `MeetinID_CHECK_1` CHECK ((`EventLink` like _utf8mb4'http%'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- CoachesDashboard.GameStats definition

CREATE TABLE `GameStats` (
  `GameID` int NOT NULL,
  `PlayerID` int NOT NULL,
  `PassingYards` int NOT NULL DEFAULT '0',
  `RushingYards` int NOT NULL DEFAULT '0',
  `ReceivingYards` int NOT NULL DEFAULT '0',
  `PassingTDs` int NOT NULL DEFAULT '0',
  `IntsThrown` int NOT NULL DEFAULT '0',
  `FumblesLost` int NOT NULL DEFAULT '0',
  `Sacks` decimal(2,1) NOT NULL DEFAULT '0.0',
  `Interceptions` int NOT NULL DEFAULT '0',
  `FumblesRecovered` int NOT NULL DEFAULT '0',
  `Tds` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`GameID`,`PlayerID`),
  KEY `GameStats_Players_FK` (`PlayerID`),
  CONSTRAINT `GameStats_Games_FK` FOREIGN KEY (`GameID`) REFERENCES `Games` (`GameID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `GameStats_Players_FK` FOREIGN KEY (`PlayerID`) REFERENCES `Players` (`PlayerID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- CoachesDashboard.PlayerPositions definition

CREATE TABLE `PlayerPositions` (
  `PlayerID` int NOT NULL,
  `PositionID` int NOT NULL,
  PRIMARY KEY (`PlayerID`,`PositionID`),
  KEY `PlayerPositions_Positions_FK` (`PositionID`),
  CONSTRAINT `PlayerPositions_Players_FK` FOREIGN KEY (`PlayerID`) REFERENCES `Players` (`PlayerID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `PlayerPositions_Positions_FK` FOREIGN KEY (`PositionID`) REFERENCES `Positions` (`PositionID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- CoachesDashboard.RefreshTokens definition

CREATE TABLE `RefreshTokens` (
  `Token` varchar(255) NOT NULL,
  `UserID` int NOT NULL,
  `ExpiresAt` datetime NOT NULL,
  `CreatedOn` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Token`),
  KEY `RefreshTokens_Users_FK` (`UserID`),
  CONSTRAINT `RefreshTokens_Users_FK` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;