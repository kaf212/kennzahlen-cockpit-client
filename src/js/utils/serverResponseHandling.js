async function handleServerResponse(res, displaySuccessMessage) {
    /**
     * Gets called upon receiving a response from the server in saveNewCustomKeyFigure() to process the response.
     * The response message will be displayed in the infobox in the UI and the font color will be green, if the status is
     * 20x and red if it's 40x.
     *
     * @param {Response} res - The HTTP-response from the backend
     * @returns {JSON} The JSON data from the response
     */
    const statusCode = res.status.toString()
    const jsonData = await res.json()

    const infoBox = document.querySelector(".infobox")

    // Display a success message if the statuscode starts with 2 and displaySuccessMessage is set to true
    if (statusCode.startsWith("2") && displaySuccessMessage === true) {
        infoBox.classList.remove("error-message")
        infoBox.classList.add("success-message")
        infoBox.innerText = jsonData.message
        document.querySelector(".infobox-overlay").style.display = "flex"
    }
    // If the statuscode starts with a 4 or a 5, display an error message
    else if (statusCode.startsWith("4") || statusCode.startsWith("5")) {
        infoBox.classList.remove("success-message")
        infoBox.classList.add("error-message")
        infoBox.innerText = jsonData.message
        document.querySelector(".infobox-overlay").style.display = "flex"
    }

    return jsonData
}

export function addInfoBoxEventListener(callback) {
    /**
     * Adds a click-eventListener to the full screen overlay so that the
     * error or success message can be acknowledged by clicking anywhere on the screen.
     *
     * @param {Function} callback - The function that is to be executed after the message was acknowledged
     * @returns {void}
     */
    const screenOverlay = document.getElementById("infoBoxOverlay")

    screenOverlay.addEventListener("click", ()=>{
        document.querySelector(".infobox-overlay").style.display = "none"
        callback()
    })
}

export async function sendServerRequest(method, url, body = null, displaySuccessMessage = true, contentTypeIsJson = true) {
    /**
     * Uniformly handles communication with the server via the API. The request can be customized to fit almost
     * every need in the client. The function automatically inserts the JWT into the authorization header
     * of the request and sets the contentType to JSON as default.
     * In the default case, a success message will be displayed in the GUI if the request was successful.
     * This can be disabled with the parameter "displaySuccessMessage". Error messages will always be displayed.
     *
     * @param {String} method - The HTTP method
     * @param {String} url - The URL that the request should be sent to
     * @param {Object} body - The request body (default is null)
     * @param {Boolean} displaySuccessMessage - Should a success message be displayed? (default is true)
     * @param {Boolean} contentTypeIsJson - Is the contentType application/json? (default is true)
     * @returns {JSON} The JSON data from the response
     */
    const headers = {
        "Authorization": "Bearer " + sessionStorage.getItem("token"),
    }

    // If the content type is JSON and a body has been provided:
    if (contentTypeIsJson && body) {
        // Convert the body to a string and set the content-type header to application/json
        body = JSON.stringify(body)
        headers["Content-Type"] = "application/json"
    }

    const res = await fetch(url, {
        method,
        headers: headers,
        body: body ? body : undefined, // Only send body if one is provided in the parameters
    })

    const data = await handleServerResponse(res, displaySuccessMessage)
    return data
}

