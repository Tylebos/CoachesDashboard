/**
 * Author: Tyler Bosford
 * Project: Coaches Dashboard
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
    gamesTable = new Tabulator("#game-table", {
        layout: "fitColumns",
        columns: [
            { title: "Opponent", field: "OpponentName", width: 275, resizable: false},
            { title: "Location", field: "Location", width: 275, resizable: false },
            { title: "Date", field: "GameDate", width: 250, resizable: false },
            { title: "Time", field: "GameTime", width: 250, resizable: false },
            { title: "Result", field: "Result", width: 100, resizable: false },
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

    gamesTable.on("rowClick", function(e, row) {
        const gameData = row.getData();
        openEditModal(gameData)
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

async function loadGameIDs() {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const res = await fetch('/api/gameIDs', {
            headers: { Authorization: accessToken }
        });
        if (!res.ok) throw new Error(`HTTP Error! ${res.status}`);

        const games = await res.json();
        const select = document.getElementById("game-select");

        // Clear existing options
        select.innerHTML = "";

        const defaultOption = document.createElement("option");
        defaultOption.textContent = "Select Game";
        defaultOption.value = "";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        // Populate games
        games.forEach(game => {
            const option = document.createElement("option");
            option.value = game.GameID;
            option.textContent = game.Game;
            select.appendChild(option);
        });

    } catch (err) {
        console.error("Failed to load games", err);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////
// Add Form
////////////////////////////////////////////////////////////////////////////////////////////
const menuBtn = document.getElementById("menu-btn");
const menuDropdown = document.getElementById("menu-dropdown");

menuBtn.addEventListener("click", () => {
    menuDropdown.style.display =
        menuDropdown.style.display === "flex" ? "none" : "flex";
});

window.addEventListener("click", (e) => {
    if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
        menuDropdown.style.display = "none";
    }
});

const modal = document.getElementById("game-modal");
const openBTN = document.getElementById("open-modal-btn");
const closeBTN = document.querySelector(".close-btn");
const form = document.getElementById("game-form");
const reset = document.getElementById("reset-btn");
const submitBTN = document.getElementById('submit-btn');
const exportBTN = document.getElementById('export-game');

openBTN.addEventListener('click', () => modal.style.display = 'flex');
closeBTN.addEventListener('click', () => { modal.style.display = 'none'; form.reset(); });
window.addEventListener('click', (e) => { if(e.target === modal) { modal.style.display = 'none'; form.reset(); } });
reset.addEventListener('click', () => form.reset());
exportBTN.addEventListener('click', () => {
    gamesTable.download('csv', 'games.csv');
});

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
        const selectedDate = new Date(form.GameDate.value);
        const currentYear = new Date().getFullYear();

        if (selectedDate.getFullYear() !== currentYear) {
            alert("You can only add games for the current season.");
            return;
        }
        const isEditing = form.dataset.editingId;
        let res;
        if (isEditing) {
            res = await fetch(`/api/game/${isEditing}/editGame`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: accessToken
                },
                body: JSON.stringify(gameData)
            });
        } else {
             res = await fetch(`/api/team/${teamID}/addgame`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: accessToken
                },
                body: JSON.stringify(gameData)
            });
        }
        if (!res.ok) throw new Error(`HTTP Error! ${res.status}`);

        await loadGames(teamID);
        await loadGameIDs();
    } catch (err) {
        console.error("Failed to add game", err);
    }

    form.reset();
    modal.style.display = 'none';
});

////////////////////////////////////////////////////////////////////////////////////////////
// Delete Form
////////////////////////////////////////////////////////////////////////////////////////////
const deleteModal = document.getElementById("delete-modal");
const openDeleteModal = document.getElementById("delete-game");
const closeDeleteModal = document.querySelector(".del-close-btn");
const delForm = document.getElementById("delete-form");
const deleteSubBTN = document.getElementById("delete-sub");

openDeleteModal.addEventListener('click', () => deleteModal.style.display = "flex");
closeDeleteModal.addEventListener('click', () => { deleteModal.style.display = "none"; delForm.reset(); });
// Close if user clicks outside of the window
window.addEventListener('click', (e) => { if(e.target === deleteModal) { deleteModal.style.display = 'none'; delForm.reset(); } });

deleteSubBTN.addEventListener('click', async () => {
    const accessToken = localStorage.getItem("accessToken");
    const teamID = localStorage.getItem("teamID");
    const gameID = delForm.GameID.value;
    try {
        const res = await fetch(`/api/game/${gameID}/deleteGame`, {
            method: "DELETE",
            headers: {
                Authorization: accessToken
            }
        })
        if (!res.ok) throw new Error(`HTTP Error! ${res.status}`);
        console.log("Game deleted successfully");
        await loadGames(teamID);
        await loadGameIDs();
    } catch (error) {
        console.error("Failed to delete game", error);
    }
    deleteModal.style.display = "none";
    delForm.reset();
})

////////////////////////////////////////////////////////////////////////////////////////////
// Edit Game
////////////////////////////////////////////////////////////////////////////////////////////
function openEditModal(game) {
    modal.style.display = "flex";

    // Pre-fill form
    form.OpponentID.value = game.OpponentID;
    form.Location.value = game.Location;
    form.GameDate.value = game.GameDate;
    form.GameTime.value = game.GameTime;
    form.TeamScore.value = game.TeamScore || "";
    form.OpponentScore.value = game.OpponentScore || "";
    form.GameType.value = game.GameType;

    // Store the game ID on the form for put later
    form.dataset.editingId = game.GameID;

    document.getElementById("game-title").textContent = "Edit Game";
    submitBTN.textContent = "Update Game";
}


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
    await loadTeams();
    await loadGameIDs();
    await loadGames(teamID);
}

document.addEventListener('DOMContentLoaded', initPage);