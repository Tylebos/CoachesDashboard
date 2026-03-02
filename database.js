import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise() // Allows for async functions

async function getTeams() {
    const [rows] = await pool.query("SELECT * FROM Teams")
    return rows
}

const teams = await getTeams()
console.log(teams)
