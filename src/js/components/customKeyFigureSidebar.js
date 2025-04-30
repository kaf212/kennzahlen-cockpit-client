import {addInfoBoxEventListener, sendServerRequest} from "../utils/serverResponseHandling.js";
import {
    refreshReferenceValueTextField,
    translations
} from "../pages/customFigureBuilder.js";
import {escapeHtml} from "../utils/escapeHtml.js";

function reverseParseFormulaString(formulaStr) {
    /**
     * Translates english account names in the formula string to their german translations
     * using the translations object and re-adds the missing whitespaces in front
     *
     * @param {string} formulaStr - The formula string with english accounts
     * @returns {string} - The formula string translated into german with whitespaces
     */

    formulaStr = reverseParseAnnualProfitAndLossFormulas(formulaStr)

    // Reverse-parse the formula by iterating over the translations object and replacing substrings.
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


function reverseParseAnnualProfitAndLossFormulas(formulaStr) {

    /* Before the formula is reverse-parsed, it has to be searched for the annual profit or loss
    formulas, because they would get destroyed during the regular reverse-parsing. (They include
    the substrings "earnings" and "expense") */
    const annualProfitFormula = translations["expense"]["Jahresgewinn"]
    const annualLossFormula = translations["earnings"]["Jahresverlust"]

    if (formulaStr.includes(annualLossFormula)) {
        formulaStr = formulaStr.replace(annualLossFormula, "Jahresverlust")
    }
    if (formulaStr.includes(annualProfitFormula)) {
        formulaStr = formulaStr.replace(annualProfitFormula, "Jahresgewinn")
    }

    return formulaStr
}

async function getCustomKeyFigures() {
    const data = await sendServerRequest("GET", "http://localhost:5000/api/customKeyFigures", null, false)
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
            const secureCustomKeyFigureName = escapeHtml(customKeyFigure.name)

            const reverseParsedFormula = reverseParseFormulaString(customKeyFigure.formula)
            const div = document.createElement("div")
            div.className = "sidebar-item"
            div.dataset.customKeyFigureId = customKeyFigure._id
            div.dataset.customKeyFigureName = customKeyFigure.name

            const innerDiv = document.createElement("div")
            innerDiv.className = "sidebar-item-content-wrapper"

            const bold = document.createElement("b")
            bold.textContent = customKeyFigure.name

            innerDiv.appendChild(bold)

            const formulaSpan = document.createElement("span")
            formulaSpan.textContent = reverseParsedFormula

            innerDiv.appendChild(formulaSpan)

            const button = document.createElement("button")
            button.className = "sidebar-delete-button"
            button.textContent = "×"

            div.appendChild(innerDiv)
            div.appendChild(button)

            sidebar.appendChild(div)
        })
    }
    addCustomKeyFigureEventListeners()
    addEndEditModeButtonEventListener()
    addCustomKeyFigureDeleteButtonEventListeners()

}

function deleteCustomKeyFigure(customKeyFigureId) {
    const url = "http://localhost:5000/api/customKeyFigures/" + customKeyFigureId
    sendServerRequest("DELETE", url, null, false)
}

async function editCustomKeyFigure(customKeyFigureId) {
    const customKeyFigure = await sendServerRequest("GET", `http://localhost:5000/api/customKeyFigures/${customKeyFigureId}`, null, false)

    const nameField = document.getElementById("formulaNameField")
    const formulaField = document.getElementById("formulaField")
    const referenceValueFiled = document.getElementById("referenceValueTextField")

    nameField.value = customKeyFigure.name
    formulaField.value = reverseParseFormulaString(customKeyFigure.formula) // Translate formula back to german


    if (!customKeyFigure.hasOwnProperty("reference_value") || customKeyFigure.reference_value === "-") {
        document.getElementById("referenceValueDeactivated").checked = true
        // If the custom key figure does not have a reference value, set the text field to deactivated
        refreshReferenceValueTextField()
    } else {
        document.getElementById("referenceValueActivated").checked = true
        refreshReferenceValueTextField()
        // Insert the reference value into the text field if the custom key figure has one
        referenceValueFiled.value = customKeyFigure.reference_value
    }

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

            if (confirm(`Sind Sie sicher, dass Sie die Custom-Kennzahl "${customKeyFigureName}" löschen wollen?`)) {
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
        item.classList.remove("selected-sidebar-item")
    })

    const customKeyFigureForm = document.getElementById("customFigureBuilderForm")
    customKeyFigureForm.reset()
    const pageHeader = document.getElementById("customKeyFigureBuilderHeader")
    pageHeader.innerText = "Neue Kennzahl erstellen"

    refreshReferenceValueTextField()
}

function setPageToEditMode(customKeyFigureId, customKeyFigureName, sidebarItem) {
    // Remove the edit-mode class from all other sidebar items
    Array.from(document.getElementsByClassName("sidebar-item")).forEach(item => {
        item.classList.remove("selected-sidebar-item")
    })

    sidebarItem.classList.add("selected-sidebar-item")

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