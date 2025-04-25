import {addInfoBoxEventListener, sendServerRequest} from "../utils/serverResponseHandling.js";
import {translations} from "../pages/customFigureBuilder.js";

function reverseParseFormulaString(formulaStr) {
    /**
     * Translates english account names in the formula string to their german translations
     * using the translations object and re-adds the missing whitespaces in front
     *
     * @param {string} formulaStr - The formula string with english accounts
     * @returns {string} - The formula string translated into german with whitespaces
     */

    for (const [accountGroup, accounts] of Object.entries(translations)) {
        for (const [germanAccount, englishAccount] of Object.entries(accounts)) {
            if (formulaStr.includes(englishAccount)) {
                // Replace English account name with German translation
                formulaStr = formulaStr.replace(new RegExp(englishAccount, 'g'), germanAccount)
            }
        }
    }

    // Add whitespace before and after arithmetic operators
    const operators = ["+", "-", "*", "/"]
    let result = ""

    for (let i = 0; i < formulaStr.length; i++) {
        const char = formulaStr[i]
        if (operators.includes(char)) {
            result += ` ${char} ` // Add whitespace before and after the operator
        } else {
            result += char // Add the character without any whitespaces
        }
    }

    formulaStr = result

    return formulaStr
}


async function getCustomKeyFigures() {
    const data = await sendServerRequest("GET", "/api/customKeyFigures", null, false)
    return data
}

async function loadSidebar() {
    const customKeyFigures = await getCustomKeyFigures()
    if (customKeyFigures) {
        const sidebar = document.getElementById("customKeyFigureContainer")

        // Remove all custom key figures from the sidebar to avoid duplicates
        const itemsToRemove = sidebar.querySelectorAll(".sidebar-item")
        itemsToRemove.forEach(item => item.remove())

        customKeyFigures.forEach(customKeyFigure => {
            const reverseParsedFormula = reverseParseFormulaString(customKeyFigure.formula)
            const htmlToInsert = `<div class="sidebar-item" 
                                           data-custom-key-figure-id="${customKeyFigure._id}"
                                           data-custom-key-figure-name="${customKeyFigure.name}">
                                           <div class="sidebar-item-content-wrapper">
                                           <b>${customKeyFigure.name}</b>${reverseParsedFormula}
                                           </div>
                                           <button class="sidebar-delete-button">×</button>
                                           </div>`

            sidebar.innerHTML += htmlToInsert
        })
    }
    addCustomKeyFigureEventListeners()
    addEndEditModeButtonEventListener()
    addCustomKeyFigureDeleteButtonEventListeners()

}

function deleteCustomKeyFigure(customKeyFigureId) {
    const url = "/api/customKeyFigures/" + customKeyFigureId
    sendServerRequest("DELETE", url, null, false)
}

async function editCustomKeyFigure(customKeyFigureId) {
    const customKeyFigure = await sendServerRequest("GET", `/api/customKeyFigures/${customKeyFigureId}`, null, false)

    const nameField = document.getElementById("formulaNameField")
    const formulaField = document.getElementById("formulaField")

    nameField.value = customKeyFigure.name
    formulaField.value = reverseParseFormulaString(customKeyFigure.formula) // Translate formula back to german

    let typeRadioButton = document.getElementById("customKeyFigureTypePercentage")

    if (customKeyFigure.type === "numeric") {
        typeRadioButton = document.getElementById("customKeyFigureTypeNumeric")
    }

    typeRadioButton.checked = true

}

function addCustomKeyFigureDeleteButtonEventListeners() {
    Array.from(document.getElementsByClassName("sidebar-delete-button")).forEach(button => {
        button.addEventListener("click", (event)=>{
            const customKeyFigureItem = event.currentTarget.parentNode
            const customKeyFigureId = customKeyFigureItem.dataset.customKeyFigureId
            const customKeyFigureName = customKeyFigureItem.dataset.customKeyFigureName

            if (confirm(`Sind Sie sicher, dass sie die Custom-Kennzahl "${customKeyFigureName}" löschen wollen?`)) {
                deleteCustomKeyFigure(customKeyFigureId)
                customKeyFigureItem.remove()
            }

        })
    })
}

export function endEditMode() {
    const endEditModeButton = document.getElementById("endEditModeButton")

    const url = new URL(window.location.href)
    url.searchParams.delete("editMode")
    window.history.replaceState(null, '', url.toString())
    endEditModeButton.classList.add("invisible")

    Array.from(document.getElementsByClassName("sidebar-item")).forEach(item => {
        item.classList.remove("edit-mode")
    })

    const customKeyFigureForm = document.getElementById("customFigureBuilderForm")
    customKeyFigureForm.reset()
    const pageHeader = document.getElementById("customKeyFigureBuilderHeader")
    pageHeader.innerText = "Neue Kennzahl erstellen"
}

function setPageToEditMode(customKeyFigureId, customKeyFigureName, sidebarItem) {
    // Remove the edit-mode class from all other sidebar items
    Array.from(document.getElementsByClassName("sidebar-item")).forEach(item => {
        item.classList.remove("edit-mode")
    })

    sidebarItem.classList.add("edit-mode")

    const pageHeader = document.getElementById("customKeyFigureBuilderHeader")
    pageHeader.innerText = `${customKeyFigureName} bearbeiten`

    const url = new URL(window.location.href)
    url.searchParams.set('editMode', 'true')
    url.searchParams.set('id', customKeyFigureId)
    window.history.replaceState(null, '', url.toString())

    const endEditModeButton = document.getElementById("endEditModeButton")
    endEditModeButton.classList.remove("invisible")
}



function addCustomKeyFigureEventListeners() {
    Array.from(document.getElementsByClassName("sidebar-item-content-wrapper")).forEach(item => {
        item.addEventListener("click", async (event)=>{
            const customKeyFigureId = event.currentTarget.parentNode.dataset.customKeyFigureId
            const customKeyFigureName = event.currentTarget.parentNode.dataset.customKeyFigureName
            await editCustomKeyFigure(customKeyFigureId)

            setPageToEditMode(customKeyFigureId, customKeyFigureName, item.parentNode)

        })
    })
}

function addEndEditModeButtonEventListener() {
    const endEditModeButton = document.getElementById("endEditModeButton")
    endEditModeButton.addEventListener("click", endEditMode)
}

addInfoBoxEventListener(loadSidebar)
loadSidebar()