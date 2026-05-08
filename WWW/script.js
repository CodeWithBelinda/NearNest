function filterHouses() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const areaSelect = document.getElementById('areaSelect').value.toLowerCase();
    const priceSelect = document.getElementById('priceSelect').value;
    
    const houses = document.querySelectorAll('.house-card');
    let foundCount = 0;

    houses.forEach(house => {
        const name = house.getAttribute('data-name').toLowerCase();
        const area = house.getAttribute('data-area').toLowerCase();
        const price = parseInt(house.getAttribute('data-price'));

        const matchesName = name.includes(searchInput);
        const matchesArea = areaSelect === "" || area === areaSelect;
        const matchesPrice = priceSelect === "" || price <= parseInt(priceSelect);

        if (matchesName && matchesArea && matchesPrice) {
            house.style.display = "block";
            foundCount++;
        } else {
            house.style.display = "none";
        }
    });

    // Show/Hide "No Results" message
    const noResults = document.getElementById('noResults');
    noResults.style.display = foundCount === 0 ? "block" : "none";
}

function resetFilters() {
    document.getElementById('searchInput').value = "";
    document.getElementById('areaSelect').value = "";
    document.getElementById('priceSelect').value = "";
    filterHouses();
}

function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        window.scrollTo({
            top: element.offsetTop - 80, // Adjust for sticky nav
            behavior: "smooth"
        });
    }
}