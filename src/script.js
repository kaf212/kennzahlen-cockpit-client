import {sendServerRequest, addInfoBoxEventListener} from "./js/utils/serverResponseHandling.js";

document.addEventListener("DOMContentLoaded", () => {
    const companyInput = document.getElementById("companyNameInput");
    const companyList = document.getElementById("companyList");

    const defaultCompanies = [

    ];

    let companies = JSON.parse(localStorage.getItem("companies"));

    if (!companies) {
        companies = defaultCompanies;
        localStorage.setItem("companies", JSON.stringify(companies));
    }

    renderCompanies();


    function saveCompanies() {
        localStorage.setItem("companies", JSON.stringify(companies));
    }

    function renderCompanies() {
        companyList.innerHTML = "";
        companies.forEach((name, index) => {
            const li = document.createElement("li");
            li.className = "company-list-item";

            const link = document.createElement("a");
            link.href = "#";
            link.textContent = name;
            link.className = "company-link";

            const delBtn = document.createElement("button");
            delBtn.textContent = "×";
            delBtn.className = "delete-button";
            delBtn.addEventListener("click", () => {
                const confirmed = confirm(`Möchtest du "${name}" wirklich löschen?`);
                if (confirmed) {
                    companies.splice(index, 1);
                    saveCompanies();
                    renderCompanies();
                }
            });


            li.appendChild(link);
            li.appendChild(delBtn);
            companyList.appendChild(li);
        });
    }
});







