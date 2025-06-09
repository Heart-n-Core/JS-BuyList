let shoppingList = [
    { name: "Помідори", quantity: 2, bought: true },
    { name: "Печиво", quantity: 2, bought: false },
    { name: "Сир", quantity: 1, bought: false }
];

const mainContent = document.querySelector('.main-content');
const remainingItemsList = document.getElementById('remaining-items-list');
const boughtItemsList = document.getElementById('bought-items-list');
const inputItemName = document.getElementById('input-item-name');
const addNNewButton = document.getElementById('add-new-button');

const tooltipMap = {
    '.minus': 'Зменшити кількість відповідного товару',
    '.plus': 'Збільшити кількість відповідного товару',
    '.bought': 'Позначити товар як придбаний',
    '.not-bought': 'Позначити товар як НЕ придбаний',
    '#add-new-button': 'Додати новий товар',
    '.remove': 'Видалити відповідний товар зі списку',
    '.item-name-editable': 'Натисніть, щоб відредагувати назву'
};

const tooltip = document.createElement('div');
tooltip.className = 'tooltip';
document.body.appendChild(tooltip);

function attachTooltip(element, text) {
    if (!element) return;

    element.setAttribute('data-tooltip', text);

    element.removeEventListener('mouseenter', showTooltip);
    element.removeEventListener('mouseleave', hideTooltip);

    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
}

function showTooltip(e) {
    const el = e.currentTarget;
    const text = el.getAttribute('data-tooltip');
    tooltip.textContent = text;

    const rect = el.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + window.scrollY + 'px';

    tooltip.classList.add('show');
}

function hideTooltip() {
    tooltip.classList.remove('show');
}

function renderShoppingList() {
    document.querySelectorAll('.item-row').forEach(row => row.remove());
    remainingItemsList.innerHTML = '';
    boughtItemsList.innerHTML = '';

    shoppingList.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.classList.add('item-row');
        // if (item.bought) {
        //     itemRow.classList.add('bought-item-row');
        // }
        const itemNameDiv = document.createElement('div');
        itemNameDiv.classList.add('item-name');
        itemNameDiv.textContent = item.name;
        if (!item.bought) {
            itemNameDiv.classList.add('item-name-editable');
            attachTooltip(itemNameDiv, tooltipMap['.item-name-editable']); // Attach tooltip
        }
        itemRow.innerHTML = `
            <div class="quantity-controls">
                <button class="minus">-</button>
                <div class="quantity-display">${item.quantity}</div>
                <button class="plus">+</button>
            </div>
            <div class="action-buttons">
                <button class="${item.bought ? 'not-bought':'bought' }">${item.bought ? 'Не куплено':'Куплено' }</button>
                <button class="remove">×</button>
            </div>
        `;
        itemRow.prepend(itemNameDiv);
        mainContent.appendChild(itemRow);
        const minusButton = itemRow.querySelector('.minus');
        const plusButton = itemRow.querySelector('.plus');
        const statusButton = itemRow.querySelector('.action-buttons button:first-child');
        const removeButton = itemRow.querySelector('.remove');
        minusButton.addEventListener('click', () => adjustQuantity(item.name, -1));
        plusButton.addEventListener('click', () => adjustQuantity(item.name, 1));
        statusButton.addEventListener('click', () => toggleBoughtStatus(item.name));
        removeButton.addEventListener('click', () => removeItem(item.name));
        attachTooltip(minusButton, tooltipMap['.minus']);
        attachTooltip(plusButton, tooltipMap['.plus']);
        attachTooltip(statusButton, item.bought ? tooltipMap['.not-bought']:tooltipMap['.bought'] );
        attachTooltip(removeButton, tooltipMap['.remove']);

        if (!item.bought) {
            itemNameDiv.addEventListener('click', () => {
                const currentName = item.name;
                const inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.value = currentName;
                inputField.classList.add('edit-item-name-input'); 
                itemNameDiv.replaceWith(inputField);
                inputField.focus();
                inputField.select();

                const handleBlur = () => {
                    const newName = inputField.value.trim();
                    if (newName === '' || newName === currentName) {
                        inputField.replaceWith(itemNameDiv);
                    } else {
                        const isDuplicate = shoppingList.some(
                            (listItem, idx) => listItem.name.toLowerCase() === newName.toLowerCase() && listItem.name !== currentName
                        );

                        if (isDuplicate) {
                            alert(`Товар з назвою "${newName}" вже існує у списку.`);
                            inputField.replaceWith(itemNameDiv);
                            renderShoppingList();
                        } else {
                            const itemIndex = shoppingList.findIndex(listItem => listItem.name === currentName);
                            if (itemIndex > -1) {
                                shoppingList[itemIndex].name = newName;
                            }
                            renderShoppingList();
                        }
                    }
                    inputField.removeEventListener('blur', handleBlur);
                    inputField.removeEventListener('keypress', handleKeypress);
                };

                const handleKeypress = (e) => {
                    if (e.key === 'Enter') {
                        inputField.blur();
                    }
                };

                inputField.addEventListener('blur', handleBlur);
                inputField.addEventListener('keypress', handleKeypress);
            });
        }
        const itemTag = document.createElement('div');
        itemTag.classList.add('item-tag');
        itemTag.innerHTML = `${item.name} <span>${item.quantity}</span>`;

        if (item.bought) {
            itemTag.classList.add('bought-item');
            boughtItemsList.appendChild(itemTag);
        } else {
            remainingItemsList.appendChild(itemTag);
        }
    });
    attachTooltip(addNNewButton, tooltipMap['#add-new-button']);

    saveShoppingList();
}

function addItem(itemName) {
    if (itemName.trim() === '') {
        alert('Будь ласка, введіть назву товару.');
        return;
    }
    const existingItem = shoppingList.find(item => item.name.toLowerCase() === itemName.toLowerCase());
    if (existingItem) {
        alert('Цей товар вже є у списку!');
        return;
    }

    shoppingList.push({ name: itemName, quantity: 1, bought: false });
    inputItemName.value = '';
    renderShoppingList();
    inputItemName.focus;
}

function adjustQuantity(itemName, change) {
    const itemIndex = shoppingList.findIndex(item => item.name === itemName);
    if (itemIndex > -1) {
        shoppingList[itemIndex].quantity += change;
        if (shoppingList[itemIndex].quantity < 1) {
            shoppingList[itemIndex].quantity = 1;
        }
        renderShoppingList();
    }
}

function toggleBoughtStatus(itemName) {
    const itemIndex = shoppingList.findIndex(item => item.name === itemName);
    if (itemIndex > -1) {
        shoppingList[itemIndex].bought = !shoppingList[itemIndex].bought;
        renderShoppingList();
    }
}

function removeItem(itemName) {
    if (confirm(`Ви впевнені, що хочете видалити "${itemName}"?`)) {
        shoppingList = shoppingList.filter(item => item.name !== itemName);
        renderShoppingList();
    }
}

function saveShoppingList() {
    localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
    console.log("Shopping list saved to localStorage.");
}

function loadShoppingList() {
    const savedList = localStorage.getItem("shoppingList");
    if (savedList) {
        shoppingList = JSON.parse(savedList);
        console.log("Shopping list loaded from localStorage:", shoppingList);
    } else {
        console.log("No shopping list found in localStorage. Using default list.");
    }
}

addNNewButton.addEventListener('click', () => addItem(inputItemName.value));

inputItemName.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addItem(inputItemName.value);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadShoppingList();
    renderShoppingList();
});