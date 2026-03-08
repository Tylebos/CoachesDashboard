/**
 * Author: Tyler Bosford
 * Project: Coaches Dashboard
 * Date Started: 19 Jan 2026
 * Date Modified: 8 March 2026
 * File: games.js
 * Description:
 *      Front-End JavaScript for the games page. Manage table and 
 *      GUI for importing table data
 * github: Tylebos
 */

////////////////////////////////////////////////////////////////////////////////////////////
// Table
////////////////////////////////////////////////////////////////////////////////////////////
import { checkAuth } from "./auth.js";

let gamesTable;

function initGamesTable() {
    gamesTable = new Tabulator("#games-table", {
        layout: "fitColumns",
        columns: [
            { title: "Opponent", field: "OpponentName", width: 275, resizable: false},
            { title: "Location", field: "Location", width: 275, resizable: false },
            { title: "Date", field: "GameDate", width: 250, resizable: false },
            { title: "Time", field: "GameTime", width: 250, resizable: false },
            { title: "Result", field: "Result", width: 200, resizable: false },
            { title: "GameType", field: "GameType", width: 200, resizable: false }
        ],
        headerSort: false,
        rowFormatter: function(row){
            let data = row.getData();
            if (data.Result === 'W') {
                row.getElement().style.backgroundColor = "rgba(0, 255, 0, 0.2)";
            } else if (data.Result === 'L') {
                row.getElement().style.backgroundColor = "rgba(255, 0, 0, 0.2)";
            }
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////////////
// API Requests
////////////////////////////////////////////////////////////////////////////////////////////
async function loadGames(teamID) {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const res = await fetch(`/api/teams/${teamID}/games`, {
            headers: { Authorization: accessToken }
        });
        if (!res.ok) throw new Error(`HTTP Error! ${res.status}`);

        const games = await res.json();
        games.forEach(game => {
            let jsDate = new Date(game.GameDate);
            game.GameDate = jsDate.toISOString().split("T")[0];
        });

        gamesTable.setData(games);
    } catch (err) {
        console.error("Failed to load team games", err);
    }
}

async function loadTeams() {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const res = await fetch('/api/teams', {
            headers: { Authorization: accessToken }
        });
        if (!res.ok) throw new Error(`HTTP Error! ${res.status}`);

        const teams = await res.json();
        const select = document.getElementById("opponent-select");
        teams.forEach(team => {
            const option = document.createElement("option");
            option.value = team.TeamID;
            option.textContent = team.Name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Failed to load teams", err);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////
// Form
////////////////////////////////////////////////////////////////////////////////////////////
const modal = document.getElementById("game-modal");
const openBTN = document.getElementById("open-modal-btn");
const closeBTN = document.querySelector(".close-btn");
const form = document.getElementById("game-form");
const reset = document.getElementById("reset-btn");
const submitBTN = document.getElementById('submit-btn');

openBTN.addEventListener('click', () => modal.style.display = 'flex');
closeBTN.addEventListener('click', () => { modal.style.display = 'none'; form.reset(); });
window.addEventListener('click', (e) => { if(e.target === modal) { modal.style.display = 'none'; form.reset(); } });
reset.addEventListener('click', () => form.reset());

submitBTN.addEventListener('click', async () => {
    const teamID = localStorage.getItem("teamID");
    const accessToken = localStorage.getItem('accessToken');

    const gameData = {
        opponentID: form.OpponentID.value,
        location: form.Location.value,
        gameDate: form.GameDate.value,
        gameTime: form.GameTime.value,
        opponentScore: form.OpponentScore.value || null,
        teamScore: form.TeamScore.value || null,
        gameType: form.GameType.value
    };

    console.log("Game data loaded", gameData);

    try {
        const res = await fetch(`/api/team/${teamID}/addgame`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: accessToken
            },
            body: JSON.stringify(gameData)
        });
        if (!res.ok) throw new Error(`HTTP Error! ${res.status}`);

        await loadGames(teamID);
    } catch (err) {
        console.error("Failed to add game", err);
    }

    form.reset();
    modal.style.display = 'none';
});

////////////////////////////////////////////////////////////////////////////////////////////
// INIT PAGE
////////////////////////////////////////////////////////////////////////////////////////////
async function initPage() {
    await checkAuth();

    const pageContainer = document.getElementById('page-container');
    const teamID = localStorage.getItem("teamID");

    if (!teamID) {
        console.warn("No teamID found. Redirecting to login.");
        window.location.href = '/';
        return;
    }

    pageContainer.style.display = 'block';

    initGamesTable();
    await loadGames(teamID);
    await loadTeams();
}

document.addEventListener('DOMContentLoaded', initPage);