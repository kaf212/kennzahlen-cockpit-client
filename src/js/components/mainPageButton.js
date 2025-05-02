
function addMainPageButtonEventListener() {
    /**
     * Adds a click-eventListener to the "back to main page" button in every subpage.
     * When triggered, it reads the URL of the referrer (the site where the user came from),
     * reads the search parameters from said URL, iterates over all parameters and writes
     * them into the URL of the main page (index.html). After that, it switches location
     * to the main page URL. This enables switching between subpages with the URL parameters
     * remaining intact, so the user will still see the data he has selected before, when he returns
     * to the main page.
     *
     * @returns {void}
     */
    const button = document.getElementById("backToMainPageButton")
    button.addEventListener("click", ()=>{
        // URL of the page that redirected to the subpage (in almost every case: the main page)
        const referrerUrl = new URL(document.referrer)
        // The URL of the main page
        const mainPageUrl = new URL("index.html", window.location.origin)

        // Iterate over all URL params in the referrer URL and set them to the new main page URL
        referrerUrl.searchParams.forEach((value, param) => {
            mainPageUrl.searchParams.set(param, value)
        })

        // Switch location to the new main page URL
        window.location = mainPageUrl.toString()
    })
}

addMainPageButtonEventListener()