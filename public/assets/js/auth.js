/**
 * Author: Tyler Bosford
 * Project: Coaches Dashboard
 * Date Started: 19 Jan 2026
 * Date Modified: 3 March 2026
 * File: home.js
 * Description:
 *          Authentication tools for all front end pages
 * github: Tylebos
 */

/**
 * Function: checkAuth
 * Purpose:
 *      Verify the user possesses a valid JWT on the client side prior to loading
 *      a protected page.
 * @param: none
 * @returns: none
 */

export async function checkAuth() {
    let accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        window.location.href = "/";
        return;
    }
    // Attempt request
    let res = await fetch('/api/auth/me', {
        headers: {
            Authorization: accessToken
        }
    });
    if (!res.ok) {
        // Something went wrong see if we need new tokens.
        const refreshTok = await fetch('/api/auth/refresh-token', {
            method: 'POST',
            credentials: 'include'
        });

        if (!refreshTok.ok) {
            localStorage.clear();
            window.location.href = '/';
            return;
        }

        // Refresh succeeded
        const refreshData = await refreshTok.json();
        accessToken = refreshData.accessToken;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request
        res = await fetch('/api/auth/me', {
            headers: {
                Authorization: accessToken
            }
        });
        // Failed again
        if (!res.ok) {
            localStorage.clear();
            window.location.href = '/';
            return;
        }
    }
}