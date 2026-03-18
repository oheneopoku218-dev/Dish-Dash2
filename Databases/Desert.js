function loadDesert(){
    fetch ("Desert.json")
    .then(res=>res.json())
    .then(data=>{
        const container = document.getElementById("desert-list");
        container.innerHTML="";
        data.forEach(recipe=>{
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML=`
            <img src="${recipe.image}" alt="${recipe.name}">
            <div class="desert-info">
            <h3>${recipe.name}</h3>
            <p>${recipe.description}</p>
            </div>
            `;
            container.appendChild(card);
        });
    })
    .catch(err=>console.error("Error loading desert recipes:",err));
}
