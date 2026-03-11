/**
 * Author: Tyler Bosford
 * Project: Coaches Dashboard
 * Date Started: 19 Jan 2026
 * Date Modified: 3 March 2026
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

const adminColumns = [
    {title: "Name", field: "Name", width: 200, resizable: false},
    {title: "PlayerClass", field: "PlayerClass", width: 250, resizable: false},
    {title: "PlayerPhone", field: "PlayerPhone", width: 150, resizable: false},
    {title: "PlayerEmail", field: "PlayerEmail", width: 250, resizable: false},
    {title: "PlayerAddress", field: "PlayerAddress", width: 150, resizable: false},
    {title: "GPA", field: "PlayerGPA", width: 200, resizable: false},
    {title: "Eligibility", field: "Eligibility", width: 150, resizable: false}
];

const fullrosterColumns = [
    {title: "Name", field: "Name", width: 200, resizable: false},
    {title: "PlayerJerseyNumber", field: "PlayerJerseyNumber", width: 250, resizable: false},
    {title: "Position", field: "Position", width: 150, resizable: false},
    {title: "SideOfBall", field: "SideOfBall", width: 250, resizable: false},
    {title: "PlayerClass", field: "PlayerClass", width: 150, resizable: false},
    {title: "Eligibility", field: "Eligibility", width: 150, resizable: false}
];

const offensiveRosterColumns = [
    {title: "Name", field: "Name", width: 250, resizable: false},
    {title: "PlayerJerseyNumber", field: "PlayerJerseyNumber", width: 200, resizable: false},
    {title: "Position", field: "Position", width: 250, resizable: false},
    {title: "PlayerClass", field: "PlayerClass", width: 200, resizable: false},
    {title: "Eligibility", field: "Eligibility", width: 200, resizable: false}
];

const defensiveRosterColumns = [
    {title: "Name", field: "Name", width: 250, resizable: false},
    {title: "PlayerJerseyNumber", field: "PlayerJerseyNumber", width: 200, resizable: false},
    {title: "Position", field: "Position", width: 250, resizable: false},
    {title: "PlayerClass", field: "PlayerClass", width: 200, resizable: false},
    {title: "Eligibility", field: "Eligibility", width: 200, resizable: false}
];
async function initRosterTable() {
    RosterTable = new Tabulator("#roster-table", {
        layout: "fitcolumns",
        columns: adminColumns,
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
}

async function loadAdminRoster(teamID) {
    const accessToken = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`/api/players/${teamID}/admin`, {
            headers: { Authorization: accessToken }
        });
        if (!res.ok) {
            throw new Error(`HTTP Error! ${res.status}`);
        }
        const players = await res.json();
        RosterTable.setColumns(adminColumns);
        RosterTable.setData(players);
    } catch (error) {
        
    }
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
////////////////////////////////////////////////////////////////////////////////////////////
// Form
////////////////////////////////////////////////////////////////////////////////////////////

const modal = document.getElementById("roster-modal");
const openBTN = document.getElementById("open-modal-btn");
const closeBTN = document.querySelector(".close-btn");
const form = document.getElementById("player-form");
const reset = document.getElementById("reset-btn");
const submitBTN = document.getElementById('submit-btn');

openBTN.addEventListener('click', () => modal.style.display = 'flex');
closeBTN.addEventListener('click', () => { modal.style.display = 'none'; form.reset(); });
window.addEventListener('click', (e) => { if(e.target === modal) { modal.style.display = 'none'; form.reset(); } });
reset.addEventListener('click', () => form.reset());



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
    await loadAdminRoster(teamID);

    const adminBtn = document.getElementById("ad");
    const fullBtn = document.getElementById("full");
    const offBtn = document.getElementById("off");
    const defBtn = document.getElementById("def");


    adminBtn.addEventListener("click", async () => {
        await loadAdminRoster(teamID);
    });

    fullBtn.addEventListener("click", async () => {
        await loadFullRoster(teamID);
    });

    offBtn.addEventListener("click", async () => {
        await loadOffensiveRoster(teamID);
    });

    defBtn.addEventListener("click", async () => {
        await loadDefensiveRoster(teamID);
    });
}

// run only after DOM is ready
document.addEventListener('DOMContentLoaded', initPage);