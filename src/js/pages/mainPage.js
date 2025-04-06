function logout() {
    sessionStorage.removeItem("token");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("logoutButton").addEventListener("click", logout);
})

document.addEventListener("DOMContentLoaded", function () {
    // Tabs wechseln
    function showTab(tab) {
        document.getElementById("graph-section").classList.add("hidden");
        document.getElementById("table-section").classList.add("hidden");

        document.getElementById(tab + "-section").classList.remove("hidden");

        document.querySelectorAll(".tab-button").forEach(button => {
            button.classList.remove("border-gray-800");
            button.classList.add("border-transparent");
        });

        document.getElementById("tab-" + tab).classList.add("border-gray-800");
        document.getElementById("tab-" + tab).classList.remove("border-transparent");
    }

    if (document.getElementById("tab-graph") && document.getElementById("tab-table")) {
        showTab('graph');

        document.getElementById("tab-graph").addEventListener("click", function() {
            showTab('graph');
        });

        document.getElementById("tab-table").addEventListener("click", function() {
            showTab('table');
        });
    }

});