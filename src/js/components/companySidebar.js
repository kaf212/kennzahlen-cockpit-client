import {addInfoBoxEventListener, sendServerRequest} from "../utils/serverResponseHandling.js"
import {checkUserPrivileges} from "../utils/userPrivilegeVerification.js";

async function deleteCompany(companyId) {
    await sendServerRequest("DELETE", "http://localhost:5000/companies/" + companyId, null, false)
}

function addCompanyDeleteButtonEventListeners() {
    Array.from(document.getElementsByClassName("sidebar-delete-button")).forEach(button => {
        button.addEventListener("click", (event)=>{
            const companyItem = event.currentTarget.parentNode
            const companyId = companyItem.dataset.companyId
            const companyName = companyItem.dataset.companyName

            if (confirm(`Sind Sie sicher, dass sie die Custom-Kennzahl "${companyName}" löschen wollen?`)) {
                deleteCompany(companyId)
                companyItem.remove()
            }

        })
    })
}

async function getCompanies() {
    const data = await sendServerRequest("GET", "http://localhost:5000/companies", null, false)
    return data
}


async function loadCompanySidebar() {
    const companies = await getCompanies()
    if (companies) {
        const sidebar = document.getElementById("companyContainer")

        // Remove all companies from the sidebar to avoid duplicates
        const itemsToRemove = sidebar.querySelectorAll(".sidebar-item")
        itemsToRemove.forEach(item => item.remove())

        companies.forEach(company => {
            const htmlToInsert = `<div class="sidebar-item" 
                                           data-company-id="${company._id}"
                                           data-company-name="${company.name}">
                                           <div class="sidebar-item-content-wrapper company-sidebar-item">
                                           <b>${company.name}</b>
                                           </div>
                                           <button class="greyed-out sidebar-delete-button">×</button>
                                           </div>`

            sidebar.innerHTML += htmlToInsert
        })
    }

    const userIsAdmin = await checkUserPrivileges()
    if (userIsAdmin === true) {
        // The delete buttons should only have eventListeners if the user is allowed to delete companies
        addCompanyDeleteButtonEventListeners()
        Array.from(document.getElementsByClassName("sidebar-delete-button")).forEach(button => {
            button.classList.remove("greyed-out")
        })
    } else {
        // If the user doesn't have admin privileges, the delete buttons are greyed out
        Array.from(document.getElementsByClassName("sidebar-delete-button")).forEach(button => {
            button.classList.add("greyed-out")
        })
        }
    addCompanyElementEventListeners()
}

async function saveNewCompany(companyName) {
    await sendServerRequest("POST", "http://localhost:5000/companies", {name: companyName})
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

            window.location.href = `${window.location.pathname}?id=${companyId}&company=${companyName}`
        })
    })
}

addCompanySidebarTextFieldEventListener()
loadCompanySidebar()
addInfoBoxEventListener(loadCompanySidebar)
