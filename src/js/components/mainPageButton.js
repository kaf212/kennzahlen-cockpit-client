
function addMainPageButtonEventListener() {
    const button = document.getElementById("backToMainPageButton")
    button.addEventListener("click", ()=>{
        const referrerUrl = new URL(document.referrer)
        const mainPageUrl = new URL("index.html", window.location.origin)

        referrerUrl.searchParams.forEach((param, value) => {
            mainPageUrl.searchParams.set(param, value)
        })

        window.location = mainPageUrl.toString()
    })
}

addMainPageButtonEventListener()