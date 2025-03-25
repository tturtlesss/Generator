// RandomFlow - Web-Based Randomization Generator
// Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
    // Core Application State
    const AppState = {
        currentInputType: 'text',
        items: [],
        user: null,
        theme: 'light'
    };

    // UI Element Selectors
    const UI = {
        inputTypeBtns: document.querySelectorAll('.input-type-btn'),
        inputPanels: document.querySelectorAll('.input-panel'),
        textInput: document.getElementById('text-input'),
        numberRangeStart: document.getElementById('range-start'),
        numberRangeEnd: document.getElementById('range-end'),
        individualNumbers: document.getElementById('individual-nums'),
        imageUpload: document.getElementById('image-upload'),
        mixedItemContainer: document.getElementById('mixed-items-container'),
        parsedItemsContainer: document.getElementById('parsed-items-container'),
        parsedItemsList: document.getElementById('parsed-items-list'),
        randomizeBtn: document.getElementById('randomize-btn'),
        resultsModal: document.getElementById('results-modal'),
        resultsContainer: document.getElementById('results-container'),
        themeToggle: document.getElementById('theme-toggle'),
        loginContainer: document.getElementById('login-container'),
        userProfile: document.getElementById('user-profile'),
        logoutButton: document.getElementById('logout-button')
    };

    // Utility Functions
    const Utils = {
        generateUniqueId: () => Math.random().toString(36).substr(2, 9),
        
        parseTextInput: (input) => {
            return input.split(/[,\n]/)
                .map(item => item.trim())
                .filter(item => item !== '');
        },

        parseNumberInput: (start, end, individualNums) => {
            if (individualNums) {
                return individualNums.split(',')
                    .map(num => parseInt(num.trim()))
                    .filter(num => !isNaN(num));
            }
            
            const numbers = [];
            for (let i = parseInt(start); i <= parseInt(end); i++) {
                numbers.push(i);
            }
            return numbers;
        },

        randomizeItems: (items, count, allowDuplicates) => {
            const results = [];
            const itemsCopy = [...items];

            for (let i = 0; i < count; i++) {
                if (itemsCopy.length === 0 && !allowDuplicates) break;

                if (allowDuplicates || itemsCopy.length > 0) {
                    const randomIndex = Math.floor(Math.random() * itemsCopy.length);
                    results.push(itemsCopy[randomIndex]);
                    
                    if (!allowDuplicates) {
                        itemsCopy.splice(randomIndex, 1);
                    }
                }
            }

            return results;
        },

        displayResults: (results) => {
            const resultsContainer = UI.resultsContainer;
            resultsContainer.innerHTML = '';
            resultsContainer.classList.remove('hidden');

            results.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.classList.add('result-item');

                if (typeof result === 'object' && result.type === 'image') {
                    resultElement.classList.add('image-result');
                    const img = document.createElement('img');
                    img.src = result.src;
                    resultElement.appendChild(img);
                } else {
                    resultElement.classList.add(typeof result === 'number' ? 'number-result' : 'text-result');
                    resultElement.textContent = result;
                }

                resultsContainer.appendChild(resultElement);
            });

            UI.resultsModal.classList.add('visible');
        }
    };

    // Event Listeners
    const initEventListeners = () => {
        // Input Type Selection
        UI.inputTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                AppState.currentInputType = type;

                UI.inputTypeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                UI.inputPanels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === `${type}-input-panel`) {
                        panel.classList.add('active');
                    }
                });
            });
        });

        // Text Input Parsing
        document.getElementById('parse-text-btn').addEventListener('click', () => {
            const items = Utils.parseTextInput(UI.textInput.value);
            updateParsedItems(items);
        });

        // Number Input Parsing
        document.getElementById('parse-numbers-btn').addEventListener('click', () => {
            const items = Utils.parseNumberInput(
                UI.numberRangeStart.value, 
                UI.numberRangeEnd.value, 
                UI.individualNumbers.value
            );
            updateParsedItems(items);
        });

        // Image Upload
        UI.imageUpload.addEventListener('change', handleImageUpload);

        // Randomize Button
        UI.randomizeBtn.addEventListener('click', performRandomization);

        // Close Results Modal
        document.querySelector('.close-modal').addEventListener('click', () => {
            UI.resultsModal.classList.remove('visible');
        });

        // Theme Toggle
        UI.themeToggle.addEventListener('click', toggleTheme);
    };

    const handleImageUpload = (event) => {
        const files = event.target.files;
        const previewContainer = document.getElementById('image-preview-container');
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewWrapper = document.createElement('div');
                    previewWrapper.classList.add('image-preview');
                    
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = '×';
                    removeBtn.classList.add('remove-image');
                    removeBtn.addEventListener('click', () => previewWrapper.remove());
                    
                    previewWrapper.appendChild(img);
                    previewWrapper.appendChild(removeBtn);
                    previewContainer.appendChild(previewWrapper);
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const updateParsedItems = (items) => {
        const parsedItemsList = UI.parsedItemsList;
        const parsedItemsContainer = UI.parsedItemsContainer;
        
        parsedItemsList.innerHTML = '';
        AppState.items = items;

        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('parsed-item');
            
            const textSpan = document.createElement('span');
            textSpan.textContent = item;
            
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '×';
            removeBtn.classList.add('remove-item');
            removeBtn.addEventListener('click', () => {
                itemElement.remove();
                AppState.items = AppState.items.filter(i => i !== item);
            });

            itemElement.appendChild(textSpan);
            itemElement.appendChild(removeBtn);
            parsedItemsList.appendChild(itemElement);
        });

        parsedItemsContainer.classList.remove('hidden');
        UI.randomizeBtn.disabled = items.length === 0;
        document.getElementById('items-count').textContent = items.length;
    };

    const performRandomization = () => {
        const selectionCount = document.getElementById('selection-count').value;
        const allowDuplicates = document.getElementById('allow-duplicates').checked;

        const results = Utils.randomizeItems(
            AppState.items, 
            Math.min(selectionCount, AppState.items.length), 
            allowDuplicates
        );

        Utils.displayResults(results);
    };

    const toggleTheme = () => {
        document.body.classList.toggle('dark-theme');
        AppState.theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('randomflow-theme', AppState.theme);
    };

    // Initialization
    const init = () => {
        initEventListeners();
        
        // Load saved theme
        const savedTheme = localStorage.getItem('randomflow-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    };

    // Start the application
    init();
});

// Google OAuth Integration (Placeholder)
function handleCredentialResponse(response) {
    // This is a placeholder. In a real implementation, you'd verify the token with your backend
    const userInfo = parseJwt(response.credential);
    
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('user-profile').classList.remove('hidden');
    
    document.getElementById('profile-image').src = userInfo.picture;
    document.getElementById('user-name').textContent = userInfo.name;
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

document.getElementById('logout-button').addEventListener('click', () => {
    document.getElementById('user-profile').classList.add('hidden');
    document.getElementById('login-container').classList.remove('hidden');
    // Add actual logout logic here
});
