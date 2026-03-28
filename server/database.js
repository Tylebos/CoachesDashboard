import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise() // Allows for async functions

////////////////////////////////////////////////////////////////////////////////////////
// HOME QUERIES
////////////////////////////////////////////////////////////////////////////////////////


/**
 * Function: getRecord
 * Purpose:
 *      SQL query to get a teams current record for display on the
 *      home dashboard team record card
 * @param: valid teamID
 * @return: row of team data
 */

export async function getRecord(TeamID) {
    const query = `
        SELECT 
            SUM(CASE WHEN TeamScore > OpponentScore THEN 1 ELSE 0 END) AS Wins,
            SUM(CASE WHEN TeamScore < OpponentScore THEN 1 ELSE 0 END) AS Losses,
            SUM(CASE WHEN TeamScore = OpponentScore THEN 1 ELSE 0 END) AS Ties
        FROM Games
        WHERE TeamID = ?
    `
    const [rows] = await pool.query(query, [TeamID]) // Pause here for query to finish
    return rows;
}

////////////////////////////////////////////////////////////////////////////////////////
// GAMES QUERIES
////////////////////////////////////////////////////////////////////////////////////////

/**
 * Function: getTeams
 * Purpose:
 *      SQL query to get the current teams from the teams table
 *      to display in the opponent name dropdown form
 * @param: None
 * @return: array of team data
 */

export async function getTeams() {
    const query = `
        SELECT TeamID, CONCAT(TeamCity, " ", TeamName) AS Name
        FROM Teams
        ORDER BY Name;
    `;
    const [rows] = await pool.query(query);
    return rows;
}

/**
 * Function: getGameIDs
 * Purpose:
 *      SQL query to get game information
 * @param: None
 * @return: array of game data
 */
export async function getGameIDs() {
    const query = `
        SELECT GameID, CONCAT(t.TeamCity, " ", t.TeamName, ' ', "vs", ' ', t2.TeamCity, " ", t2.TeamName ) AS Game
        FROM Games g
        INNER JOIN Teams t
            ON g.TeamID = t.TeamID
       	INNER JOIN Teams t2
       		ON g.OpponentID = t2.TeamID;
    `;
    const [rows] = await pool.query(query);
    return rows;
}

/**
 * Function: addGame
 * Purpose:
 *      SQL query to add a game to the games table
 * @param: valid teamID and array of game data
 * @return: gameID
 */

export async function addGame(gameData, teamID) {
    const query = `
        INSERT INTO Games (TeamID, OpponentID, Location, GameDate, GameTime, OpponentScore, TeamScore, GameType) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    
    const result = await pool.query(query, [
        teamID,
        gameData.opponentID,
        gameData.location,
        gameData.gameDate,
        gameData.gameTime,
        gameData.opponentScore,
        gameData.teamScore,
        gameData.gameType
    ]);

    return result.insertId;
}

/**
 * Function: deleteGame
 * Purpose:
 *      SQL query to delete a game from the games table
 * @param: valid gameID
 * @return: success/fail json
 */
export async function deleteGame(gameID) {
    const query = `
        DELETE FROM Games
        WHERE GameID = ?;
    `;
    const [result] = await pool.query(query, [gameID]);

    if (result.affectedRows === 0) {
        return { success: false, message: 'Game not found' };
    }

    return { success: true };
}

/**
 * Function: editGame
 * Purpose:
 *      SQL query to edit a user selected game in the games table
 * @param: valid gameID and data
 * @return: success/fail json
 */
export async function editGame(gameID, data) {
    const query = `
        UPDATE Games
        SET 
            OpponentID = ?,
            Location = ?,
            GameDate = ?,
            GameTime = ?,
            OpponentScore = ?,
            TeamScore = ?,
            GameType = ?
        WHERE GameID = ?
    `
    const [result] = await pool.query(query, [
        data.opponentID,
        data.location,
        data.gameDate,
        data.gameTime,
        data.opponentScore,
        data.teamScore,
        data.gameType,
        gameID
    ]);
    if (result.affectedRows === 0) {
        return { success: false, message: "Game not found" };
    }

    return { success: true };
}

/**
 * Function: getGames
 * Purpose:
 *      SQL query to return a table of game information to the 
 *      games table on the games page
 * @param: valid teamID
 * @return: array of team data
 */
export async function getGames(TeamID) {
    const query = `
        SELECT GameID, OpponentID, CONCAT(t2.TeamCity, " ", t2.TeamName) AS OpponentName, g.Location, g.GameDate, g.GameTime, g.GameType, TeamScore, OpponentScore,
            COALESCE(
            CASE 
                WHEN g.TeamScore IS NULL OR g.OpponentScore IS NULL THEN NULL
                WHEN g.TeamScore > g.OpponentScore THEN 'W'
                WHEN g.TeamScore < g.OpponentScore THEN 'L'
                WHEN g.TeamScore = g.OpponentScore THEN 'T'
                END,
                'TBD'
            ) AS Result
        FROM CoachesDashboard.Games g 
        INNER JOIN CoachesDashboard.Teams t 
            ON t.TeamID = g.TeamID 
        INNER JOIN CoachesDashboard.Teams t2
            ON t2.TeamID = g.OpponentID 
        WHERE g.TeamID = ?
        ORDER BY g.GameID 
    `
    const [rows] = await pool.query(query, [TeamID])
    return rows
}

////////////////////////////////////////////////////////////////////////////////////////
// ROSTER QUERIES
////////////////////////////////////////////////////////////////////////////////////////
export async function getAdminRoster(teamID) {
    const query = `
        SELECT 
            CONCAT(p.PlayerFirstName, " ", p.PlayerLastName) AS Name,
            p.PlayerClass,
            p.PlayerPhone,
            p.PlayerEmail,
            p.PlayerAddress,
            p.PlayerGPA,
            CASE 
                WHEN p.PlayerGPA < 2.5 THEN 'INELIGIBLE'
                ELSE 'ELIGIBLE'
            END AS Eligibility
        FROM CoachesDashboard.Players p
        WHERE p.TeamID = ?;
    `
    const [rows] = await pool.query(query, [teamID]);
    return rows
}

export async function getFullRoster(teamID) {
    const query = `
        SELECT 
            CONCAT(p.PlayerFirstName, " ", p.PlayerLastName) AS Name,
            p.PlayerJerseyNumber,
            ps.PositionName AS Position,
            ps.SideOfBall,
            p.PlayerClass,
            CASE 
                WHEN p.PlayerGPA < 2.5 THEN 'INELIGIBLE'
                ELSE 'ELIGIBLE'
            END AS Eligibility
        FROM Players p 
        INNER JOIN PlayerPositions pp
            on pp.PlayerID = p.PlayerID 
        INNER JOIN Positions ps
            on pp.PositionID = ps.PositionID 
        WHERE p.TeamID = ?;
    `;
    const [rows] = await pool.query(query, [teamID]);
    return rows;
}

export async function getOffensiveRoster(teamID) {
    const query = `
        SELECT 
            CONCAT(p.PlayerFirstName, " ", p.PlayerLastName) AS Name,
            p.PlayerJerseyNumber,
            ps.PositionName AS Position,
            p.PlayerClass,
            CASE 
                WHEN p.PlayerGPA < 2.5 THEN 'INELIGIBLE'
                ELSE 'ELIGIBLE'
            END AS Eligibility
        FROM Players p 
        INNER JOIN PlayerPositions pp
            on pp.PlayerID = p.PlayerID 
        INNER JOIN Positions ps
            on pp.PositionID = ps.PositionID 
        WHERE ps.SideOfBall = 'Offense' AND p.TeamID = ?;
    `;
    const [rows] = await pool.query(query, [teamID]);
    return rows;
}

export async function getDefensiveRoster(teamID) {
    const query = `
        SELECT 
            CONCAT(p.PlayerFirstName, " ", p.PlayerLastName) AS Name,
            p.PlayerJerseyNumber,
            ps.PositionName AS Position,
            ps.SideOfBall,
            p.PlayerClass,
            CASE 
                WHEN p.PlayerGPA < 2.5 THEN 'INELIGIBLE'
                ELSE 'ELIGIBLE'
            END AS Eligibility
        FROM Players p 
        INNER JOIN PlayerPositions pp
            on pp.PlayerID = p.PlayerID 
        INNER JOIN Positions ps
            on pp.PositionID = ps.PositionID 
        WHERE ps.SideOfBall = 'Defense' AND p.TeamID = ?;
    `;
    const [rows] = await pool.query(query, [teamID]);
    return rows;
}

/**
 * Function: LoadPlayerID
 * Purpose:
 *      SQL Query to fetch playerIDs for deletion
 * @param: teamID
 * @return: array of player ids
 */
export async function loadPlayerID(teamID) {
    const query = `
        SELECT PlayerID, CONCAT(PlayerFirstName, ' ', PlayerLastName) as Name
        FROM Players
        WHERE teamID = ?;
    `;

    const [ids] = await pool.query(query, [teamID]);

    return ids;
}

/**
 * Function: Add Player
 * Purpose:
 *      SQL Query to add a player to the player table
 * @param: valid teamID and playerData
 * @return: json success/fail message
 */
export async function addPlayer(teamID, playerData) {
    const connection = await pool.getConnection(); // We need a dedicated connection for the transaction
    try {
        await connection.beginTransaction();
        const [playerResult] = await connection.execute(`
            INSERT INTO Players (
            PlayerFirstName, PlayerLastName, PlayerAddress, PlayerGPA, PlayerPhone, 
            PlayerEmail, TeamID, PlayerJerseyNumber, PlayerClass
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            `,[
                playerData.PlayerFirstName,
                playerData.PlayerLastName,
                playerData.PlayerAddress,
                playerData.PlayerGPA,
                playerData.PlayerPhone,
                playerData.PlayerEmail,
                teamID,
                playerData.PlayerJerseyNumber,
                playerData.PlayerClass,
            ]);
            const playerID = playerResult.insertId;

            const [positionResult] = await connection.execute(`
                INSERT INTO PlayerPositions (PlayerID, PositionID)
                SELECT ?, pos.PositionID
                FROM Positions pos
                WHERE PositionName = ?
                `, 
                [playerID, playerData.PositionName]
            );
            if (positionResult.affectedRows === 0) {
                throw new Error("Position not found");
            }
            await connection.commit();
            return { success: true, playerID};
    } catch(error) {
        await connection.rollback();
        return { success: false, message: error.message };
    } finally {
        connection.release(); // Let go of the connection
    }
}

/**
 * Function: Delete Player
 * Purpose:
 *      SQL Query to delete a player from 
 */
export async function deletePlayer(playerID) {
    const query = `
        DELETE FROM Players
        WHERE PlayerID = ?
    `
    const [result] = await pool.query(query, [playerID]);

    if (result.affectedRows === 0) {
        return { success: false, message: 'Game not found' };
    }

    return { success: true };
}

////////////////////////////////////////////////////////////////////////////////////////
// USERS QUERIES
////////////////////////////////////////////////////////////////////////////////////////

/**
 * Function: findUserCreds
 * Purpose:
 *      SQL query to find a valid users credentials
 * @param: valid email or username
 * @return array of user data
 */

export async function findUserCreds(loginID) {
    const query = `
        SELECT * 
        FROM Users
        WHERE UserName = ? OR UserEmail = ?
    `
    const [rows] = await pool.query(query, [loginID, loginID])
    return rows.length ? rows[0] : null;
}
/**
 * Function: findUser
 * Purpose:
 *      SQL query to find a user from the Users Table
 * @param: valid user id
 * @return: array of user data
 */
export async function findUser(userID) {
    const query = `
        SELECT *
        FROM Users
        WHERE UserID = ?
    `
    const [rows] = await pool.query(query, [userID]);
    return rows.length ? rows[0] : null;
}

/**
 * Function: addRefreshToken
 * Purpose:
 *      SQL query to insert a new refresh token to the refresh table
 * @param: Array of refresh token data
 * @return: Success
 */
export async function addRefreshToken(refreshData) {
    const query = `
        INSERT INTO RefreshTokens (Token, UserID, ExpiresAt, CreatedOn)
        VALUES (?, ?, ?, ?)
    `;
    const [rows] = await pool.query(query, [
        refreshData.refreshToken,
        refreshData.userID,
        refreshData.expiresAt,
        refreshData.CreatedOn
    ]);
    
    return { success: true };
}


/**
 * Function: getRefreshToken
 * Purpose:
 *      SQL Query to confirm refresh token exists for a user
 * @param: refreshToken and userID to check
 * @return: Array of refresh data
 */
export async function getRefreshToken(refreshData) {
    const query = `
        SELECT * 
        FROM RefreshTokens
        WHERE Token = ? AND UserID = ?
    `;
    const [rows] = await pool.query(query, [
        refreshData.refreshToken,
        refreshData.userID
    ]);

    return rows.length ? rows : null;
}

/**
 * Function: deleteRefreshToken
 * Purpose:
 *      SQL query to delete a refreshToken
 * @param: Valid refreshToken
 * @return: Success
 */
export async function deleteRefreshToken(refreshToken) {
    const query = `
        DELETE FROM RefreshTokens
        WHERE Token = ?
    `;
    await pool.query(query, [refreshToken]);

    return { success: true };
}
