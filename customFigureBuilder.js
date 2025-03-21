const translations = {
    "Anlagevermögen": "fixed_assets",
    "Umlaufvermögen": "current_assets",
    "Bank": "bank",
    "Verb. L+L": "liabilities"
}

Array.from(document.getElementsByClassName("accountButton")).forEach(button => {
    button.addEventListener("click", (event)=>{
        const formulaField = document.getElementById("formulaField")
        formulaField.value += translations[event.currentTarget.innerText]
    })
})

Array.from(document.getElementsByClassName("operatorButton")).forEach(button => {
    button.addEventListener("click", (event)=>{
        const operator = event.currentTarget.innerText
        const formulaField = document.getElementById("formulaField")
        formulaField.value += operator
    })
})
