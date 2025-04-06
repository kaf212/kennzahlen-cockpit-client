async function handleServerResponse(res, displaySuccessMessage) {
    /*
    Gets called upon receiving a response from the server in saveNewCustomKeyFigure() to process the response.
    The response message will be displayed in the infobox in the UI and the font color will be green, if the status is
    20x and red if it's 40x.
    :param: res (Response): The HTTP-response from the backend
    :return: void
     */
    const statusCode = res.status.toString()
    const jsonData = await res.json()

    const infoBox = document.querySelector(".infobox")

    if (statusCode.startsWith("20") && displaySuccessMessage === true) {
        infoBox.classList.remove("error-message")
        infoBox.classList.add("success-message")
        infoBox.innerText = jsonData.message
        document.querySelector(".infobox-overlay").style.display = "flex"
    }
    else if (statusCode.startsWith("40")) {
        infoBox.classList.remove("success-message")
        infoBox.classList.add("error-message")
        infoBox.innerText = jsonData.message
        document.querySelector(".infobox-overlay").style.display = "flex"
    }

    return jsonData
}

export function addInfoBoxEventListener(callback) {
    const screenOverlay = document.getElementById("infoBoxOverlay")

    screenOverlay.addEventListener("click", ()=>{
        document.querySelector(".infobox-overlay").style.display = "none"
        callback()
    })
}

export async function sendServerRequest(method, url, body = null, displaySuccessMessage = true, contentTypeIsJson = true) {
    const headers = {
        "Authorization": "Bearer " + sessionStorage.getItem("token"),
    }

    if (contentTypeIsJson && body) {
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

