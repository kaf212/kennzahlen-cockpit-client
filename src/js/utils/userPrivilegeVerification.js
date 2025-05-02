export async function checkUserPrivileges() {
    /**
     * Sends a GET request to the admin-only endpoint in the API to determine, if the token in the sessionStorage
     * is an admin token or a standard token.
     * If the response returns a 200, the user has admin privileges. --> returns true
     * If it returns a 403, the user does not have admin privileges. --> returns false
     *
     * @returns {Boolean} - True, if the user has admin privileges, false otherwise.
     */
    // sendServerRequest() isn't used here because this wouldn't return the responses' status code
    const response = await fetch('/api/auth/admin', {headers: {"Authorization": `Bearer ${sessionStorage.getItem("token")}`}})
    const statusCode = response.status
    if (statusCode === 403) {
        return false
    }
    return true
}