/**
 * Author: Tyler Bosford
 * Project: Coaches Dashboard
 * File: roster.js
 * Description:
 *      Front-End JavaScript for the roster page. Manage table and 
 *      GUI for importing table data
 * github: Tylebos
 */
////////////////////////////////////////////////////////////////////////////////////////////
// Table
////////////////////////////////////////////////////////////////////////////////////////////
import { checkAuth } from "./auth.js";
let RosterTable;

const fullrosterColumns = [

    {title: "Name", field: "Name", width: 150, resizable: false},
    {title: "Number", field: "PlayerJerseyNumber", width: 100, resizable: false},
    {title: "Position", field: "Position", width: 125, resizable: false},
    {title: "SideOfBall", field: "SideOfBall", width: 125, resizable: false},
    {title: "Class", field: "PlayerClass", width: 100, resizable: false},
    {title: "Phone", field: "PlayerPhone", width: 125, resizable: false},
    {title: "Email", field: "PlayerEmail", width: 200, resizable: false},
    {title: "Address", field: "PlayerAddress", width: 250, resizable: false},
    {title: "GPA", field: "PlayerGPA", width: 50, resizable: false},
    {title: "Eligibility", field: "Eligibility", width: 125, resizable: false}
];

const offensiveRosterColumns = [

    {title: "Name", field: "Name", width: 175, resizable: false},
    {title: "Number", field: "PlayerJerseyNumber", width: 100, resizable: false},
    {title: "Position", field: "Position", width: 125, resizable: false},
    {title: "Class", field: "PlayerClass", width: 100, resizable: false},
    {title: "Phone", field: "PlayerPhone", width: 125, resizable: false},
    {title: "Email", field: "PlayerEmail", width: 200, resizable: false},
    {title: "Address", field: "PlayerAddress", width: 250, resizable: false},
    {title: "GPA", field: "PlayerGPA", width: 100, resizable: false},
    {title: "Eligibility", field: "Eligibility", width: 125, resizable: false}
];

const defensiveRosterColumns = [

    {title: "Name", field: "Name", width: 175, resizable: false},
    {title: "Number", field: "PlayerJerseyNumber", width: 100, resizable: false},
    {title: "Position", field: "Position", width: 125, resizable: false},
    {title: "Class", field: "PlayerClass", width: 100, resizable: false},
    {title: "Phone", field: "PlayerPhone", width: 125, resizable: false},
    {title: "Email", field: "PlayerEmail", width: 200, resizable: false},
    {title: "Address", field: "PlayerAddress", width: 250, resizable: false},
    {title: "GPA", field: "PlayerGPA", width: 100, resizable: false},
    {title: "Eligibility", field: "Eligibility", width: 125, resizable: false}
];
async function initRosterTable() {
    RosterTable = new Tabulator("#roster-table", {
        layout: "fitcolumns",
        columns: fullrosterColumns,
        headerSort: false,
        rowFormatter: function(row){
            let data = row.getData();
            if (data.Eligibility === 'INELIGIBLE') {
                row.getElement().style.backgroundColor = "rgba(255, 0, 0, 0.2)"; // light red
            } else {
                row.getElement().style.backgroundColor = "rgba(0, 255, 0, 0.2)";
            }
        }
    });
    RosterTable.on("rowClick", function(e, row) {
        const playerData = row.getData();
        openEditModal(playerData);
    });
}


async function loadFullRoster(teamID) {
    const accessToken = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`/api/players/${teamID}/roster`, {
            headers: { Authorization: accessToken }
        });
        if (!res.ok) {
            throw new Error(`HTTP Error! ${res.status}`);
        }
        const players = await res.json();
        RosterTable.setColumns(fullrosterColumns);
        RosterTable.setData(players);
    } catch (error) {
        
    }
}

async function loadOffensiveRoster(teamID) {
    const accessToken = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`/api/players/${teamID}/off-roster`, {
            headers: { Authorization: accessToken }
        });
        if (!res.ok) {
            throw new Error(`HTTP Error! ${res.status}`);
        }
        const players = await res.json();
        RosterTable.setColumns(offensiveRosterColumns);
        RosterTable.setData(players);
    } catch (error) {
        
    }
}

async function loadDefensiveRoster(teamID) {
    const accessToken = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`/api/players/${teamID}/def-roster`, {
            headers: { Authorization: accessToken }
        });
        if (!res.ok) {
            throw new Error(`HTTP Error! ${res.status}`);
        }
        const players = await res.json();
        RosterTable.setColumns(defensiveRosterColumns);
        RosterTable.setData(players);
    } catch (error) {
        
    }
}

async function loadPlayerID() {
    const accessToken = localStorage.getItem('accessToken');
    const teamID = localStorage.getItem('teamID');

    try {
        const res = await fetch(`/api/players/${teamID}/playerID`, {
            headers: { Authorization: accessToken }
        });
        if (!res.ok) throw new Error(`HTTP Error! ${res.status}`);

        const ids = await res.json();
        const select = document.getElementById('player-select');

        // Clear existing options 
        select.innerHTML = "";

        const defaultOption = document.createElement("option");
        defaultOption.textContent = "Select Player";
        defaultOption.value = "";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        // Populate the playes
        ids.forEach(id => {
            const option = document.createElement("option");
            option.value = id.PlayerID;
            option.textContent = id.Name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to load players", error);
    }
}

async function loadPositionIDs() {
    const accessToken = localStorage.getItem('accessToken');


    try {
        const res = await fetch(`/api/positions`, {
            headers: { Authorization: accessToken }
        });
        if (!res.ok) throw new Error(`HTTP Error! ${res.status}`);

        const positionIDs = await res.json();
        const select = document.getElementById('position');

        // Clear existing options 
        select.innerHTML = "";

        const defaultOption = document.createElement("option");
        defaultOption.textContent = "Select Position";
        defaultOption.value = "";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        // Populate the playes
        positionIDs.forEach(id => {
            const option = document.createElement("option");
            option.value = id.PositionID;
            option.textContent = id.Position;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to load positions", error);
    }
}
////////////////////////////////////////////////////////////////////////////////////////////
// Form
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

const modal = document.getElementById("roster-modal");
const openBTN = document.getElementById("open-modal-btn");
const closeBTN = document.querySelector(".close-btn");
const form = document.getElementById("player-form");
const reset = document.getElementById("reset-btn");
const submitBTN = document.getElementById('submit-btn');
const exportBTN = document.getElementById('export-roster');

openBTN.addEventListener('click', () => modal.style.display = 'flex');
closeBTN.addEventListener('click', () => { modal.style.display = 'none'; form.reset(); });
window.addEventListener('click', (e) => { if(e.target === modal) { modal.style.display = 'none'; form.reset(); } });
reset.addEventListener('click', () => form.reset());

submitBTN.addEventListener('click', async () => {
    const teamID = localStorage.getItem("teamID");
    const accessToken = localStorage.getItem("accessToken");

    const playerData = {
       PlayerFirstName: form.PlayerFirstName.value,
       PlayerLastName: form.PlayerLastName.value,
       PlayerAddress: form.PlayerAddress.value,
       PlayerGPA: form.PlayerGPA.value,
       PlayerPhone: form.PlayerPhone.value,
       PlayerEmail: form.PlayerEmail.value,
       teamID,
       PlayerJerseyNumber: form.PlayerJerseyNumber.value,
       PlayerClass: form.Class.value,
       PositionID: form.Position.value,
    };
    let res;
    try {
        const isEditing = form.dataset.editingId;

        if (isEditing) {
            playerData.Old_Position = form.dataset.old_Position || null;
            res = await fetch(`/api/players/${isEditing}/editPlayer`, {
                method: "PUT",
                headers: {  
                    "Content-Type": "application/json",
                    Authorization: accessToken
                },
                body: JSON.stringify(playerData)
            });
        } else {
             res = await fetch(`/api/players/${teamID}/addPlayer`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    Authorization: accessToken
                },
                body: JSON.stringify(playerData)
            });
        }
        if (!res.ok) throw new Error(`HTTP Error! ${res.status}`);
        await loadFullRoster(teamID);
    } catch (error) {
        console.error("Failed to add player", error);
    }
    form.reset();
    modal.style.display = 'none';
    delete form.dataset.editingId;
    delete form.dataset.old_Position;
});

let csv_name = 'FullRoster.csv';
exportBTN.addEventListener('click', () => {
    RosterTable.download('csv', csv_name);
});
////////////////////////////////////////////////////////////////////////////////////////////
// Delete Player
////////////////////////////////////////////////////////////////////////////////////////////
const deleteModal = document.getElementById("delete-modal");
const openDeleteModal = document.getElementById("delete-player");
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
    const playerID = delForm.playerID.value;
    try {
        const res = await fetch(`/api/players/${playerID}/deletePlayer`, {
            method: "DELETE",
            headers: {
                Authorization: accessToken
            }
        })
        if (!res.ok) throw new Error(`HTTP Error! ${res.status}`);
        console.log("Player deleted successfully");
        await loadFullRoster(teamID);
        await loadPlayerID();
        await loadPositionIDs();
    } catch (error) {
        console.error("Failed to delete game", error);
    }
    deleteModal.style.display = "none";
    delForm.reset();
});

////////////////////////////////////////////////////////////////////////////////////////////
// Update Player
////////////////////////////////////////////////////////////////////////////////////////////
function openEditModal(player) {
    modal.style.display = "flex";
    // Pre-fill form
    form.PlayerFirstName.value = player.PlayerFirstName;
    form.PlayerLastName.value = player.PlayerLastName;
    form.PlayerAddress.value = player.PlayerAddress;
    form.PlayerGPA.value = player.PlayerGPA;
    form.PlayerPhone.value = player.PlayerPhone;
    form.PlayerEmail.value = player.PlayerEmail;
    form.PlayerJerseyNumber.value = player.PlayerJerseyNumber;
    form.Class.value = player.PlayerClass;
    form.Position.value = player.PositionID;

    form.dataset.old_Position = player.PositionID;
    form.dataset.editingId = player.PlayerID;
    document.getElementById("player-title").textContent = "Edit Player";
    submitBTN.textContent = "Update Player";
}
////////////////////////////////////////////////////////////////////////////////////////////
// Init Page
////////////////////////////////////////////////////////////////////////////////////////////

async function initPage() {
    await checkAuth(); // blocks if token missing

    const pageContainer = document.getElementById('page-container');

    const teamID = localStorage.getItem("teamID");
    if(!teamID) {
        console.warn("No teamID found. Redirecting to login.");
        window.location.href = '/';
        return;
    }

    pageContainer.style.display = 'block';

    await initRosterTable();
    await loadFullRoster(teamID);
    await loadPlayerID();
    await loadPositionIDs();


    const fullBtn = document.getElementById("full");
    const offBtn = document.getElementById("off");
    const defBtn = document.getElementById("def");

    fullBtn.addEventListener("click", async () => {
        csv_name = 'FullRoster.csv'
        await loadFullRoster(teamID);
    });

    offBtn.addEventListener("click", async () => {
        csv_name = 'OffenseRoster.csv'
        await loadOffensiveRoster(teamID);
    });

    defBtn.addEventListener("click", async () => {
        csv_name = 'DefenseRoster.csv'
        await loadDefensiveRoster(teamID);
    });
}

// run only after DOM is ready
document.addEventListener('DOMContentLoaded', initPage);