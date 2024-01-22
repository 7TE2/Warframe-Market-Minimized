const proxyUrl = 'https://cors-proxy.fringe.zone/';
const apiUrl = 'https://api.warframe.market/v1/items/';
const dropSourcesUrl = 'https://api.warframestat.us/drops/search/';

function checkPrice() {
    var itemName = document.getElementById('itemName').value;

    if (!itemName) {
        alert('Please enter an item name.');
        return;
    }

    // Convert to lowercase and replace spaces with underscores
    itemName = itemName.toLowerCase().replace(/\s+/g, '_');

    var fullApiUrl = proxyUrl + apiUrl + itemName + '/orders';

    fetch(fullApiUrl)
        .then(response => response.json())
        .then(data => {
            displayPriceResult(data, itemName);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error fetching data. Please try again.');
        });
}

function displayDropSources(data, itemName) {
    var dropSourcesContainer = document.getElementById('dropSources');

    // Check if the container exists
    if (!dropSourcesContainer) {
        console.error('Drop sources container not found.');
        return;
    }

    dropSourcesContainer.innerHTML = ''; // Clear previous results

    if (data.length > 0) {
        // Sort the data by item, chance, place, and rarity
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

        // Create table header
        var headerRow = table.insertRow(0);
        var headers = ['Item', 'Chance (%)', 'Place', 'Rarity'];
        headers.forEach(headerText => {
            var header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });

        // Populate the table
        data.forEach(source => {
            var row = table.insertRow(-1);

            var itemCell = row.insertCell(0);
            var chanceCell = row.insertCell(1);
            var placeCell = row.insertCell(2);
            var rarityCell = row.insertCell(3);

            itemCell.textContent = source.item || itemName;
            chanceCell.textContent = source.chance.toFixed(2);
            placeCell.textContent = source.place;
            rarityCell.textContent = source.rarity;
        });

        dropSourcesContainer.appendChild(table);
    } else {
        dropSourcesContainer.textContent = `No drop sources available for ${itemName}.`;
    }
}

function copyMessage(user, orderType, itemName, mod_rank, platinum) {
    // Switch order type
    var oppositeOrderType = orderType === 'buy' ? 'sell' : 'buy';

    // Replace "undefined" with the actual item or mod name
    itemName = itemName || document.getElementById('itemName').value;

    var message = `/w ${user} Hey there! I want to ${oppositeOrderType}: "${itemName} (rank ${mod_rank})" for ${platinum} platinum. (Sent from Dataframe.rf.gd!)`;

    navigator.clipboard.writeText(message).then(function() {
        alert('Message copied to clipboard!');
    }).catch(function(err) {
        console.error('Unable to copy message to clipboard', err);
        alert('Error copying message to clipboard. Please try again.');
    });
}


function filterOrders(orders) {
    var buyOrders = document.getElementById('buyOrders').checked;
    var sellOrders = document.getElementById('sellOrders').checked;
    var ingameOnly = document.getElementById('ingameOnly').checked;

    return orders.filter(order => {
        // Check online status only if the onlineOnly checkbox is checked
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

document.getElementById('checkPriceBtn').addEventListener('click', checkPrice);
document.getElementById('showDropSourcesBtn').addEventListener('click', showDropSources);

function showDropSources() {
    var itemName = document.getElementById('itemName').value;

    if (!itemName) {
        alert('Please enter an item name.');
        return;
    }

    // Convert to lowercase and replace spaces with spaces
    itemName = itemName.toLowerCase().replace(/\s+/g, '%20');

    var fullDropSourcesUrl = dropSourcesUrl + itemName;

    fetch(fullDropSourcesUrl)
        .then(response => response.json())
        .then(data => {
            displayDropSources(data, itemName);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error fetching drop sources. Please try again.');
        });
}

function displayDropSources(data) {
      var dropSourcesContainer = document.getElementById('dropSources');

        // Check if the container exists
        if (!dropSourcesContainer) {
            console.error('Drop sources container not found.');
            return;
        }

        dropSourcesContainer.innerHTML = ''; // Clear previous results

        if (data.length > 0) {
        // Sort the data by item, chance, place, and rarity
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

        // Create table header
        var headerRow = table.insertRow(0);
        var headers = ['Item', 'Chance (%)', 'Place', 'Rarity'];
        headers.forEach(headerText => {
            var header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });

        // Populate the table
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
function fetchDropSources(itemName) {
    var fullDropSourcesUrl = dropSourcesUrl + itemName;

    fetch(fullDropSourcesUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayDropSources(data);
        })
        .catch(error => {
            console.error('Error fetching drop sources:', error);
            alert('Error fetching drop sources. Please try again.');
        });
}








// Rest of the code remains unchanged


function displayPriceResult(data, itemName) {
    var priceResultContainer = document.getElementById('priceResult');
    priceResultContainer.innerHTML = ''; // Clear previous results

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





function copyMessage(user, orderType, itemName, mod_rank, platinum) {
    // Switch order type
    var oppositeOrderType = orderType === 'buy' ? 'sell' : 'buy';

    // Replace "undefined" with the actual item or mod name
    itemName = itemName || document.getElementById('itemName').value;

    var message = `/w ${user} Hey there! I want to ${oppositeOrderType}: "${itemName} (rank ${mod_rank})" for ${platinum} platinum. (Sent from Dataframe.rf.gd!)`;

    navigator.clipboard.writeText(message).then(function() {
        alert('Message copied to clipboard!');
    }).catch(function(err) {
        console.error('Unable to copy message to clipboard', err);
        alert('Error copying message to clipboard. Please try again.');
    });
}


function filterOrders(orders) {
    var buyOrders = document.getElementById('buyOrders').checked;
    var sellOrders = document.getElementById('sellOrders').checked;
    var ingameOnly = document.getElementById('ingameOnly').checked;

    return orders.filter(order => {
        // Check online status only if the onlineOnly checkbox is checked
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
