import {addInfoBoxEventListener, sendServerRequest} from "../utils/serverResponseHandling.js"
import {checkUserPrivileges} from "../utils/userPrivilegeVerification.js";
import {escapeHtml} from "../utils/escapeHtml.js";

async function deleteCompany(companyId) {
    await sendServerRequest("DELETE", "http://localhost:5000/api/companies/" + companyId, null, false)
}

function addCompanyDeleteButtonEventListeners() {
    Array.from(document.getElementsByClassName("sidebar-delete-button")).forEach(button => {
        button.addEventListener("click", (event)=>{
            const companyItem = event.currentTarget.parentNode
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
    const data = await sendServerRequest("GET", "http://localhost:5000/api/companies", null, false)
    return data
}


async function loadCompanySidebar() {
    const companies = await getCompanies()
    if (companies) {
        const sidebar = document.getElementById("companyContainer")

        // Remove all companies from the sidebar to avoid duplicates
        const itemsToRemove = sidebar.querySelectorAll(".sidebar-item")
        itemsToRemove.forEach(item => item.remove())

        const url = new URL(window.location.href)
        const selectedCompanyId = url.searchParams.get("id")

        companies.forEach(company => {
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
    await sendServerRequest("POST", "http://localhost:5000/api/companies", {name: companyName})
}


function addCompanySidebarTextFieldEventListener() {
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
    Array.from(document.getElementsByClassName("sidebar-item")).forEach(companyItem => {
        const companyItemContentWrapper = companyItem.querySelector(".sidebar-item-content-wrapper")
        /* Add the EventListener for URI-parameter modification only to the content-wrapper,
        so that the delete button doesn't also have this EventListener (fix for issue #22). */
        companyItemContentWrapper.addEventListener("click", (event)=>{
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
