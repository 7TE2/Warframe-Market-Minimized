const proxyUrl = 'https://cors-proxy.fringe.zone/';
const apiUrl = 'https://api.warframe.market/v1/items/';
const dropSourcesUrl = 'https://api.warframestat.us/drops/search/';

document.getElementById('checkPriceBtn').addEventListener('click', checkPrice);
document.getElementById('showDropSourcesBtn').addEventListener('click', showDropSources);

function checkPrice() {
    var itemName = document.getElementById('itemName').value;
    var selectedPlatform = document.getElementById('platformDropdown').value;

    if (!itemName) {
        alertify.alert("Error!", "Please enter an item name.", function() {
            alertify.message("OK");
        })
        return;
    }

    itemName = itemName.toLowerCase().replace(/\s+/g, '_');
    var fullApiUrl = proxyUrl + apiUrl + itemName + '/orders';

    fetch(fullApiUrl, {
            headers: {
                'platform': selectedPlatform,
            }
        })
        .then(response => response.json())
        .then(data => {
            displayPriceResult(data, itemName);
        })
        .catch(error => {
            console.error('Error:', error);
            alertify.alert("Error!", "Error fetching data. Please try again.", function() {
                alertify.message("OK");
            });
        });
}

function showDropSources() {
    var itemName = document.getElementById('itemName').value;
    var selectedPlatform = document.getElementById('platformDropdown').value;

    if (!itemName) {
        alertify.alert("Error!", "Please enter an item name.", function() {
            alertify.message("OK");
        });
        return;
    }

    itemName = itemName.toLowerCase().replace(/\s+/g, '%20');
    var fullDropSourcesUrl = dropSourcesUrl + itemName;

    fetch(fullDropSourcesUrl, {
            headers: {
                'platform': selectedPlatform,
            }
        })
        .then(response => response.json())
        .then(data => {
            displayDropSources(data, itemName);
        })
        .catch(error => {
            console.error('Error:', error);
            alertify.alert("Error!", "Error fetching drop sources. Please try again.", function() {
                alertify.message("OK");
            });
        });
}

function displayDropSources(data, itemName) {
    var dropSourcesContainer = document.getElementById('dropSources');
    dropSourcesContainer.innerHTML = '';

    if (data.length > 0) {
        data.sort((a, b) => {
            if (a.item !== b.item) {
                return a.item.localeCompare(b.item);
            }
            if (a.chance !== b.chance) {
                return b.chance - a.chance;
            }
            if (a.place !== b.place) {
                return a.place.localeCompare(b.place);
            }
            return a.rarity.localeCompare(b.rarity);
        });

        var table = document.createElement('table');
        table.classList.add('drop-sources-table');

        var headerRow = table.insertRow(0);
        var headers = ['Item', 'Chance (%)', 'Place', 'Rarity'];
        headers.forEach(headerText => {
            var header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });

        data.forEach(source => {
            var row = table.insertRow(-1);

            var itemCell = row.insertCell(0);
            var chanceCell = row.insertCell(1);
            var placeCell = row.insertCell(2);
            var rarityCell = row.insertCell(3);

            itemCell.textContent = source.item;
            chanceCell.textContent = source.chance.toFixed(2);
            placeCell.textContent = source.place;
            rarityCell.textContent = source.rarity;
        });

        dropSourcesContainer.appendChild(table);
    } else {
        dropSourcesContainer.textContent = 'No drop sources available for this item.';
    }
}

function displayPriceResult(data, itemName) {
    var priceResultContainer = document.getElementById('priceResult');
    priceResultContainer.innerHTML = '';

    if (data.payload && data.payload.orders && data.payload.orders.length > 0) {
        var filteredOrders = filterOrders(data.payload.orders);
        var sortedOrders = sortOrders(filteredOrders);

        var orderList = document.createElement('ul');
        sortedOrders.forEach(order => {
            var listItem = document.createElement('li');
            listItem.textContent = ` Item: ${order.item || itemName} | User: ${order.user.ingame_name} | Rank: ${order.mod_rank} | Platinum: ${order.platinum} | Order Type: ${order.order_type} | Status: ${order.user.status} | Platform: ${order.platform}`;
            listItem.addEventListener('click', function() {
                copyMessage(order.user.ingame_name, order.order_type, order.item, order.mod_rank, order.platinum);
            });
            orderList.appendChild(listItem);
        });

        priceResultContainer.appendChild(orderList);
    } else {
        priceResultContainer.textContent = `No pricing information available for ${itemName}.`;
    }
}

function filterOrders(orders) {
    var buyOrders = document.getElementById('buyOrders').checked;
    var sellOrders = document.getElementById('sellOrders').checked;
    var ingameOnly = document.getElementById('ingameOnly').checked;

    return orders.filter(order => {
        if (ingameOnly) {
            return (
                ((buyOrders && order.order_type === 'buy') || (sellOrders && order.order_type === 'sell')) &&
                order.user.status === 'ingame'
            );
        } else {
            return (buyOrders && order.order_type === 'buy') || (sellOrders && order.order_type === 'sell');
        }
    });
}

function sortOrders(orders) {
    var sortBy = document.getElementById('sortBy').value;

    return orders.sort((a, b) => {
        switch (sortBy) {
            case 'platinumAsc':
                return a.platinum - b.platinum;
            case 'platinumDesc':
                return b.platinum - a.platinum;
            case 'rankAsc':
                return a.mod_rank - b.mod_rank;
            case 'rankDesc':
                return b.mod_rank - a.mod_rank;
            default:
                return 0;
        }
    });
}
// Update the fetchStatistics function to pass the item name
function fetchStatistics(itemName) {
    const apiUrl = `https://cors-proxy.fringe.zone/https://api.warframe.market/v1/items/${itemName}/statistics`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Check if the 'payload' property exists in the response data
            if (data.payload && data.payload.statistics && data.payload.statistics['48hours']) {
                const statistics = data.payload.statistics['48hours'];

                // Select the element where you want to display the statistics
                const statisticsContainer = document.getElementById('statistics-container');

                // Clear previous content
                statisticsContainer.innerHTML = '';

                // Check if statistics is empty
                if (statistics.length === 0) {
                    statisticsContainer.textContent = 'No statistics available for this item.';
                } else {
                    // Iterate over the statistics and display them
                    statistics.forEach(statistic => {
                        const statisticElement = document.createElement('div');
                        statisticElement.textContent = `Date: ${statistic.datetime}, Volume: ${statistic.volume}, Min Price: ${statistic.min_price}, Max Price: ${statistic.max_price}`;
                        statisticsContainer.appendChild(statisticElement);
                    });
                }
            } else {
                console.error('Error: Missing or invalid data in the API response');
            }
        })
        .catch(error => {
            console.error('Error fetching statistics:', error);
        });
}



function displayStatistics(statistics) {
    const statisticsList = document.getElementById('statistics-list');
    statisticsList.innerHTML = ''; // Clear previous content

    if (statistics.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No statistics available';
        statisticsList.appendChild(listItem);
    } else {
        statistics.forEach(stat => {
            const listItem = document.createElement('li');
            listItem.textContent = `Date: ${stat.datetime}, Volume: ${stat.volume}, Avg Price: ${stat.avg_price}`;
            statisticsList.appendChild(listItem);
        });
    }
}



