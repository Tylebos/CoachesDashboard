/**
 * Author: Tyler Bosford
 * Project: Coaches Dashboard
 * File: Users.js
 * Description:
 *      Front-End JavaScript for the User page. Manage table and 
 *      GUI for importing table data
 * github: Tylebos
 */

////////////////////////////////////////////////////////////////////////////////////////////
// Table
////////////////////////////////////////////////////////////////////////////////////////////
import { checkAuth } from "./auth.js";

let userTable;
const userColumns = [
    {title: "UserName", field: "UserName", width: 400, resizable: false},
    {title: "UserRole", field: "UserRole", width: 400, resizabable: false},
    {title: "UserEmail", field: "UserEmail", width: 400, resizabable: false}
];

function initUsersTable () {
    userTable = new Tabulator("#user-table", {
        layout: "fitColumns",
        columns: userColumns,
        headerSort: false,
    });
}

async function loadUsers () {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const res = await fetch(`/api/users/loadUser`, {
            headers: { Authorization: accessToken}
        });
        if (!res.ok) throw new Error(`HTTP Error! ${res.status}`)
        const users = await res.json();
        userTable.setData(users);
    } catch (error) {
        console.error("Failed to load team games", error);
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

const modal = document.getElementById("user-modal");
const openBTN = document.getElementById("open-modal-btn");
const closeBTN = document.querySelector(".close-btn");
const form = document.getElementById("user-form");
const reset = document.getElementById("reset-btn");
const submitBTN = document.getElementById('submit-btn');
const exportBTN = document.getElementById('export-users');

openBTN.addEventListener('click', () => modal.style.display = 'flex');
closeBTN.addEventListener('click', () => { modal.style.display = 'none'; form.reset(); });
window.addEventListener('click', (e) => { if(e.target === modal) { modal.style.display = 'none'; form.reset(); } });
reset.addEventListener('click', () => form.reset());
exportBTN.addEventListener('click', () => {
    userTable.download('csv', 'users.csv');
});

submitBTN.addEventListener('click', async () => {
    const teamID = localStorage.getItem('teamID');
    const accessToken = localStorage.getItem('accessToken');

    const userData = {
        teamID,
        UserName: form.UserName.value,
        UserEmail: form.UserEmail.value,
        Password: form.UserPassword.value,
        UserRole: form.UserRole.value
    };

    try {
        const res = await fetch(`/api/users/${teamID}/addUser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: accessToken
            },
            body: JSON.stringify(userData)
        });
        if (!res.ok) throw new Error(`HTTP Error! ${res.status}`)
        await loadUsers();
    } catch (error) {
        console.error("Failed to add user", error);
    }
    form.reset();
    modal.style.display = 'none';
})




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

    initUsersTable();
    loadUsers();
}

document.addEventListener('DOMContentLoaded', initPage);