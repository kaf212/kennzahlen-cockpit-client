export async function checkUserPrivileges() {
    // sendServerRequest() isn't used here because this wouldn't return the responses' status code
    const response = await fetch('http://localhost:5000/api/auth/admin', {headers: {"Authorization": `Bearer ${sessionStorage.getItem("token")}`}})
    const statusCode = response.status
    if (statusCode === 401) {
        return false
    }
    return true
}