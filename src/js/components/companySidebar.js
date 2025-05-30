import {addInfoBoxEventListener, sendServerRequest} from "../utils/serverResponseHandling.js"
import {checkUserPrivileges} from "../utils/userPrivilegeVerification.js";

async function deleteCompany(companyId) {
    /**
     * Sends a DELETE request to the API to delete the provided company.
     *
     * @param {String} companyId - The id of the company
     * @returns {void}
     */
    await sendServerRequest("DELETE", "http://localhost:5000/api/companies/" + companyId, null, false)
}

function addCompanyDeleteButtonEventListeners() {
    /**
     * Adds the eventListeners to the delete buttons inside the company sidebar by iterating over all
     * the buttons with the class "sidebar-delete-button". In each iteration, the corresponding company
     * sidebar item of the delete button is read from the DOM and the company's id and name are read from
     * its dataset. Then the eventListener is added with said id as argument.
     *
     * @returns {void}
     */
    Array.from(document.getElementsByClassName("sidebar-delete-button")).forEach(button => {
        button.addEventListener("click", (event)=>{
            // The parent of the delete button is the sidebar element of the company it belongs to.
            const companyItem = event.currentTarget.parentNode
            // The company's id and name are stored in the dataset of the sidebar element.
            const companyId = companyItem.dataset.companyId
            const companyName = companyItem.dataset.companyName

            if (confirm(`Sind Sie sicher, dass Sie das Unternehmen "${companyName}" löschen wollen?`)) {
                deleteCompany(companyId)
                companyItem.remove()
            }

        })
    })
}

async function getCompanies() {
    /**
     * Fetches all companies from the API and returns the JSON data.
     *
     * @returns {Array} An array of company objects.
     */
    const data = await sendServerRequest("GET", "http://localhost:5000/api/companies", null, false)
    return data
}


async function loadCompanySidebar() {
    /**
     * Loads or reloads the company sidebar.
     * After removing all elements within the sidebar, it iterates over all companies, that have been
     * fetched from the API and creates a new sidebar element for each company.
     * While doing so, each company's id and name are stored in the dataset of the sidebar html element
     * in "data-company-id" and "data-company-name".
     * After that, it iterates over all companies again and marks the currently selected one (from the URL params)
     * with the selected style.
     * Finally, it checks if the user has admin permissions and disables all admin-only inputs in the site if
     * that is not the case.
     *
     * @returns {void}
     */
    const companies = await getCompanies()
    if (companies) {
        const sidebar = document.getElementById("companyContainer")

        // Remove all companies from the sidebar to avoid duplicates
        const itemsToRemove = sidebar.querySelectorAll(".sidebar-item")
        itemsToRemove.forEach(item => item.remove())

        const url = new URL(window.location.href)
        const selectedCompanyId = url.searchParams.get("id")

        companies.forEach(company => {
            /* The use of the .innerHTML attribute has been removed here and substituted by
            the DOM APIs "createElement" and "appendChild" which automatically escape HTML contents
            to prevent XSS attacks. */
            const div = document.createElement("div")
            div.className = "sidebar-item"
            div.dataset.companyId = company._id
            div.dataset.companyName = company.name

            const innerDiv = document.createElement("div")
            innerDiv.className = "sidebar-item-content-wrapper company-sidebar-item"
            const bold = document.createElement("b")
            bold.textContent = company.name

            const button = document.createElement("button")
            button.className = "greyed-out sidebar-delete-button"
            button.textContent = "×"

            innerDiv.appendChild(bold)
            div.appendChild(innerDiv)
            div.appendChild(button)

            sidebar.appendChild(div)
        })

        // Iterate over all sidebar items and check if their ID is equal to the selected id in the URL params
        Array.from(document.getElementsByClassName("sidebar-item")).forEach(sidebarItem => {
            if (sidebarItem.dataset.companyId === selectedCompanyId) {
                // Add the selected class to the item if is the item of the selected company
                sidebarItem.classList.add("selected-sidebar-item")
            }
        })
    }

    const newCompanyTextField = document.getElementById("companyNameInput")
    const companySideBarDeleteButtons = Array.from(document.getElementsByClassName("sidebar-delete-button"))

    const userIsAdmin = await checkUserPrivileges()
    if (userIsAdmin === true) {
        // The delete buttons should only have eventListeners if the user is allowed to delete companies (admins)
        addCompanyDeleteButtonEventListeners()
        companySideBarDeleteButtons.forEach(button => {
            button.classList.remove("greyed-out")
        })
        // Only enable the new company text field if the user is allowed to create new companies (admins)
        newCompanyTextField.classList.remove("greyed-out")
        newCompanyTextField.removeAttribute("disabled")
    } else {
        // If the user doesn't have admin privileges, the delete buttons are greyed out
        companySideBarDeleteButtons.forEach(button => {
            button.classList.add("greyed-out")
        })
        // The new company text field is also greyed out and disabled
        newCompanyTextField.classList.add("greyed-out")
        newCompanyTextField.setAttribute("disabled", "true")
        }
    addCompanyElementEventListeners()
}

async function saveNewCompany(companyName) {
    /**
     * Sends a POST request to the API to create a new company with the provided name.
     *
     * @param {Object} companyName - The name of the new company
     * @returns {Promise} An empty promise
     */
    await sendServerRequest("POST", "http://localhost:5000/api/companies", {name: companyName})
}


function addCompanySidebarTextFieldEventListener() {
    /**
     * Adds an eventListener to the new company text field that is triggered, when enter is pressed.
     * When that is the case, it reads the text content of the text field, saves the new company via the API
     * and reloads the company sidebar.
     *
     * @returns {void}
     */
    const companyInputField = document.getElementById("companyNameInput")

    companyInputField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault()
            const companyName = companyInputField.value

            if (!companyName) {
                return null
            }
            saveNewCompany(companyName).then(loadCompanySidebar)
            companyInputField.value = ""

        }
    })

}

function addCompanyElementEventListeners() {
    /**
     * Iterates over all company sidebar elements and adds a click-eventListener that sets the URL params
     * "id" and "company" to the id and the name of the company that was clicked on.
     *
     * @returns {void}
     */
    Array.from(document.getElementsByClassName("sidebar-item")).forEach(companyItem => {
        const companyItemContentWrapper = companyItem.querySelector(".sidebar-item-content-wrapper")
        /* Add the EventListener for URI-parameter modification only to the content-wrapper,
        so that the delete button doesn't also have this EventListener (fix for issue #22). */
        companyItemContentWrapper.addEventListener("click", (event)=>{
            // Read the company's id and name from the element's dataset
            const companyId = companyItem.dataset.companyId
            const companyName = companyItem.dataset.companyName

            const url = new URL(window.location.href)
            url.searchParams.set("id", companyId)
            url.searchParams.set("company", companyName)

            window.history.replaceState(null, '', url.toString())
            window.location.reload()

        })
    })
}

addCompanySidebarTextFieldEventListener()
loadCompanySidebar()
addInfoBoxEventListener(loadCompanySidebar)
