document.addEventListener("DOMContentLoaded", function() {
   console.log("Main.js loaded");
   setupnavbar();
   runPageScripts();
});
function setupnavbar() {
const navlinks = document.querySelectorAll(".nav-link");
// correcting section starting here//
navlinks.forEach(link => {
    link.addEventListener("click",() => {
        const page = link.dataset.nav;
        if (!page)return;
        loadPage(page);
    });
});
}
function loadPage(pageName) {
fetch(`${pageName}.html`)
.then(res=>res.text())
.then(html=>{
 const content= document.getElementById("content");
 content.innerHTML = html;
 content.dataset.page = pageName;
    runPageScripts();
})
// correcting section ending here//
.catch(err=>console.error("Error loading page:",err));
}
function runPageScripts() {
    const page = document.getElementById("content").dataset.page;
    switch(page) {
        case "Breakfast":
        if (typeof loadBreakfast === "function") loadBreakfast();
        break;
        case "Lunch":
        if (typeof loadLunch === "function") loadLunch();
        break;
        case "Dinner":
        if (typeof loadDinner === "function") loadDinner();
        break;
        case "Desserts":
        if (typeof loadDesserts === "function") loadDesserts();
        break;
        case "Account":
        if (typeof loadAccount === "function") loadAccount();
        break;
        case "Settings":
        if (typeof loadSettings === "function") loadSettings();
        break;
        case "":
            default:
            console.warn("No scripts to run for page:",page);
        }
    }
