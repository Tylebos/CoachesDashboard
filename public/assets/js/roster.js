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

async function initRosterTable() {
    let rosterTable = new Tabulator("#roster-table", {
        layout: "fitcolumns",
        columns: [
            {title: "FirstName", field: "PlayerName", width: 200, resizable: false},
            {title: "Address", field: "PlayerAddress", width: 250, resizable: false},
            {title: "GPA", field: "PlayerGPA", width: 150, resizable: false},
            {title: "Phone", field: "PlayerPhone", width: 150, resizable: false},
            {title: "Email", field: "PlayerEmail", width: 200, resizable: false},
            {title: "Eligibility", field: "PlayerEligible", width: 150, resizable: false},
            {title: "JerseyNumber", field: "PlayerJerseyNumber", width: 150, resizable: false},
            {title: "Class", field: "PlayerClass", width: 150, resizable: false}
        ],
        headerSort: false,
        rowFormatter: function(row){
            let data = row.getData();
            if (data.GPA < 2.0) {
                row.getElement().stylebackgroundColor = "rgba(255, 0, 0, 0.2)"; // light red
            }
        }
    });
}

async function initPage() {
    await checkAuth(); // blocks if token missing

    const pageContainer = document.getElementById('page-container');
    

    const teamID = localStorage.getItem("teamID");
    if(!teamID) {
        console.warn("No teamID found. Redirecting to login.");
        window.location.href = '/';
        return;
    }
    pageContainer.style.display = 'block'; // only after auth passes

    initRosterTable();
}

// run only after DOM is ready
document.addEventListener('DOMContentLoaded', initPage);