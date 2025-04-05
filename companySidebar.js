import {addInfoBoxEventListener, sendServerRequest} from "./serverResponseHandling.js"


function deleteCompany(companyId) {
    fetch("http://localhost:5000/companies/" + companyId, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
        .then(res=>handleServerResponse(res))
        .catch(err=>console.error(err))
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
                                           <button class="sidebar-delete-button">×</button>
                                           </div>`

            sidebar.innerHTML += htmlToInsert
        })
    }
    addCompanyDeleteButtonEventListeners()
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
        companyItem.addEventListener("click", (event)=>{
            const companyId = companyItem.dataset.companyId
            const companyName = companyItem.dataset.companyName

            window.location.href = `${window.location.pathname}?id=${companyId}?company=${companyName}`
        })
    })
}

addCompanySidebarTextFieldEventListener()
loadCompanySidebar()
addInfoBoxEventListener(loadCompanySidebar)
