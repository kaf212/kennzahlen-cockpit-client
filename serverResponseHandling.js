export  function handleServerResponse(res) {
    /*
    Gets called upon receiving a response from the server in saveNewCustomKeyFigure() to process the response.
    The response message will be displayed in the infobox in the UI and the font color will be green, if the status is
    20x and red if it's 40x.
    :param: res (Response): The HTTP-response from the backend
    :return: void
     */
    const statusCode = res.status.toString()
    res.json().then(data=>{
        const infoBox = document.querySelector(".infobox")

        if (statusCode.startsWith("20")) {
            infoBox.classList.remove("error-message")
            infoBox.classList.add("success-message")
        }
        else if (statusCode.startsWith("40")) {
            infoBox.classList.remove("success-message")
            infoBox.classList.add("error-message")
        }

        document.querySelector(".infobox-overlay").style.display = "flex"
        infoBox.innerText = data.message
    })
}

export function addInfoBoxEventListener(callback) {
    const screenOverlay = document.getElementById("infoBoxOverlay")

    screenOverlay.addEventListener("click", ()=>{
        document.querySelector(".infobox-overlay").style.display = "none"
        callback()
    })
}