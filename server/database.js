import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise() // Allows for async functions

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

export async function getGames(TeamID) {
    const query = `
        SELECT CONCAT(t2.TeamCity, " ", t2.TeamName) AS OpponentName, g.Location, g.GameDate, g.GameTime, g.GameType,
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
        ORDER BY g.GameDate 
    `
    const [rows] = await pool.query(query, [TeamID])
    return rows
}

export async function getTeams() {
    const query = `
        SELECT TeamID, CONCAT(TeamCity, " ", TeamName) AS Name
        FROM Teams
        ORDER BY Name;
    `;
    const [rows] = await pool.query(query);
    return rows;
}

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
