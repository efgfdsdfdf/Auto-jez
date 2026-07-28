// admin.js

// Initialize Lucide Icons
lucide.createIcons();

const ADMIN_PASSCODE = "1980";

// State
let inventory = [];
let editingId = null;

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const adminDashboard = document.getElementById('admin-dashboard');
const passcodeInput = document.getElementById('passcode-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const inventoryContainer = document.getElementById('admin-inventory-container');
const addCarBtn = document.getElementById('add-car-btn');

// Modal Elements
const carModal = document.getElementById('car-modal');
const modalOverlay = document.getElementById('modal-overlay');
const closeModal = document.getElementById('close-modal');
const cancelModal = document.getElementById('cancel-modal');
const carForm = document.getElementById('car-form');
const modalTitle = document.getElementById('modal-title');

// Inputs
const carIdInput = document.getElementById('car-id');
const carMakeInput = document.getElementById('car-make');
const carModelInput = document.getElementById('car-model');
const carCategoryInput = document.getElementById('car-category');
const carConditionInput = document.getElementById('car-condition');
const carPriceInput = document.getElementById('car-price');
const carImageInput = document.getElementById('car-image');
const carSpecsInput = document.getElementById('car-specs');
const carStatusInput = document.getElementById('car-status');
const carQuantityInput = document.getElementById('car-quantity');


// Initialization
function init() {
    showLogin(); // Always require passcode
    setupEventListeners();
}

function showLogin() {
    loginScreen.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
}

function showDashboard() {
    loginScreen.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    loadInventory();
}

function handleLogin() {
    const pass = passcodeInput.value;
    if (pass === ADMIN_PASSCODE) {
        // Clear passcode input for security
        passcodeInput.value = '';
        showDashboard();
    } else {
        loginError.innerText = "Incorrect passcode.";
    }
}

function handleLogout() {
    showLogin();
}

// Data Management
async function loadInventory() {
    try {
        const res = await fetch('/api/inventory');
        inventory = await res.json();
    } catch (e) {
        console.error("Failed to load DB:", e);
        inventory = [];
    }
    renderAdminTable();
}

async function saveInventory() {
    try {
        await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inventory)
        });
    } catch (e) {
        console.error("Failed to save DB:", e);
        alert("Error saving to database!");
    }
}

function renderAdminTable() {
    if (!inventoryContainer) return;
    inventoryContainer.innerHTML = '';
    
    if (inventory.length === 0) {
        inventoryContainer.innerHTML = '<div style="text-align:center; padding: 3rem; color: var(--text-muted);">No items in inventory. Add one to get started.</div>';
        return;
    }

    // Group inventory by category
    const grouped = {};
    inventory.forEach(car => {
        const cat = car.category || 'Uncategorized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(car);
    });

    // Render a table for each category
    for (const [category, items] of Object.entries(grouped)) {
        const section = document.createElement('div');
        section.style.marginBottom = '3rem';
        
        const header = document.createElement('h3');
        header.innerText = category;
        header.style.marginBottom = '1rem';
        header.style.color = 'var(--accent-primary)';
        header.style.borderBottom = '1px solid var(--border-color)';
        header.style.paddingBottom = '0.5rem';
        
        const table = document.createElement('table');
        table.className = 'admin-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Make & Model</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        
        items.forEach(car => {
            const conditionText = car.condition ? \`<br><small class="text-gray">\${car.condition}</small>\` : '';
            const isSold = car.status === 'sold';
            const statusBadge = isSold 
                ? '<span style="background: rgba(255,77,77,0.2); color: #ff4d4d; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">SOLD</span>'
                : '<span style="background: rgba(76,175,80,0.2); color: #4CAF50; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Available</span>';
            const soldBtn = isSold
                ? \`<button class="btn btn-secondary btn-small" style="background: rgba(76,175,80,0.2); border-color: #4CAF50; color: #4CAF50;" onclick="toggleSold('\${car.id}')">Relist</button>\`
                : \`<button class="btn btn-secondary btn-small" style="background: rgba(255,77,77,0.2); border-color: #ff4d4d; color: #ff4d4d;" onclick="toggleSold('\${car.id}')">Mark Sold</button>\`;
            
            const tr = document.createElement('tr');
            if (isSold) tr.style.opacity = '0.6';
            tr.innerHTML = \`
                <td><img src="\${car.media ? car.media[0] : car.image}" alt="\${car.make}" onerror="this.src='https://via.placeholder.com/60x40?text=Error'"></td>
                <td><strong>\${car.make}</strong> \${car.model}\${conditionText}</td>
                <td>₦\${car.price}</td>
                <td><span style="font-weight: 600; color: \${(car.quantity || 1) === 0 ? '#ff4d4d' : (car.quantity || 1) <= 2 ? '#FFA500' : '#4CAF50'};">\${car.quantity !== undefined ? car.quantity : 1}</span></td>
                <td>\${statusBadge}</td>
                <td>
                    <div class="action-btns">
                        \${soldBtn}
                        <button class="btn btn-secondary btn-small" onclick="openEditModal('\${car.id}')"><i data-lucide="edit"></i></button>
                        <button class="btn btn-primary btn-small" style="background-color: var(--error);" onclick="deleteCar('\${car.id}')"><i data-lucide="trash"></i></button>
                    </div>
                </td>
            \`;
            tbody.appendChild(tr);
        });
        
        section.appendChild(header);
        section.appendChild(table);
        inventoryContainer.appendChild(section);
    }
    
    lucide.createIcons();
}

// Modal Logic
function openAddModal() {
    editingId = null;
    document.getElementById('modal-title').innerText = "Add New Car";
    carForm.reset();
    carImageInput.value = '';
    if (typeof renderMediaPreview === 'function') renderMediaPreview();
    carModal.classList.remove('hidden');
    modalOverlay.classList.remove('hidden');
}

function renderMediaPreview() {
    const previewContainer = document.getElementById('media-preview-container');
    if (!previewContainer) return;
    previewContainer.innerHTML = '';
    const urls = carImageInput.value.split(',').map(s => s.trim()).filter(s => s);
    urls.forEach((url) => {
        const thumb = document.createElement('div');
        thumb.style = "width: 80px; height: 60px; border-radius: 4px; overflow: hidden; border: 1px solid var(--border-color); background: #000;";
        if (url.toLowerCase().endsWith('.mp4')) {
            thumb.innerHTML = `<video src="${url}" style="width: 100%; height: 100%; object-fit: cover;"></video>`;
        } else {
            thumb.innerHTML = `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
        previewContainer.appendChild(thumb);
    });
}

window.openEditModal = function(id) {
    const car = inventory.find(c => c.id === id);
    if (!car) return;
    
    editingId = id;
    modalTitle.innerText = "Edit Car";
    
    carIdInput.value = car.id;
    carMakeInput.value = car.make;
    carModelInput.value = car.model;
    carCategoryInput.value = car.category;
    if(carConditionInput) carConditionInput.value = car.condition || "Brand New";
    carPriceInput.value = car.price;
    carImageInput.value = car.media ? car.media.join(', ') : car.image;
    carSpecsInput.value = car.specs ? car.specs.join(', ') : '';
    if(carStatusInput) carStatusInput.value = car.status || 'available';
    if(carQuantityInput) carQuantityInput.value = car.quantity !== undefined ? car.quantity : 1;
    
    if (typeof renderMediaPreview === 'function') renderMediaPreview();
    
    carModal.classList.remove('hidden');
    modalOverlay.classList.remove('hidden');
}

function closeCarModal() {
    carModal.classList.add('hidden');
    modalOverlay.classList.add('hidden');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const specsArray = carSpecsInput.value.split(',').map(s => s.trim()).filter(s => s);
    const mediaArray = carImageInput.value.split(',').map(s => s.trim()).filter(s => s);
    
    const carData = {
        id: editingId || Date.now().toString(),
        make: carMakeInput.value,
        model: carModelInput.value,
        category: carCategoryInput.value,
        condition: carConditionInput ? carConditionInput.value : "Brand New",
        price: carPriceInput.value,
        media: mediaArray,
        image: mediaArray[0] || "",
        specs: specsArray,
        status: carStatusInput ? carStatusInput.value : 'available',
        quantity: carQuantityInput ? parseInt(carQuantityInput.value) || 0 : 1
    };
    
    if (editingId) {
        const index = inventory.findIndex(c => c.id === editingId);
        if (index > -1) {
            inventory[index] = carData;
        }
    } else {
        inventory.push(carData);
    }
    
    await saveInventory();
    renderAdminTable();
    closeCarModal();
}

window.deleteCar = async function(id) {
    if (confirm("Are you sure you want to delete this car?")) {
        inventory = inventory.filter(c => c.id !== id);
        await saveInventory();
        renderAdminTable();
        
        // Also remove from cart if it exists there
        const cartStr = localStorage.getItem('autojez_cart');
        if(cartStr) {
            let cart = JSON.parse(cartStr);
            cart = cart.filter(c => c.id !== id);
            localStorage.setItem('autojez_cart', JSON.stringify(cart));
        }
    }
}

window.toggleSold = async function(id) {
    const car = inventory.find(c => c.id === id);
    if (!car) return;
    car.status = car.status === 'sold' ? 'available' : 'sold';
    await saveInventory();
    renderAdminTable();
}

// Event Listeners
function setupEventListeners() {
    loginBtn.addEventListener('click', handleLogin);
    passcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    logoutBtn.addEventListener('click', handleLogout);
    
    addCarBtn.addEventListener('click', openAddModal);
    closeModal.addEventListener('click', closeCarModal);
    cancelModal.addEventListener('click', closeCarModal);
    modalOverlay.addEventListener('click', closeCarModal);
    
    carForm.addEventListener('submit', handleFormSubmit);

    // Media Upload Button
    const uploadBtn = document.getElementById('upload-media-btn');
    const mediaInput = document.getElementById('car-media-upload');
    const uploadStatus = document.getElementById('upload-status');
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', async () => {
            const files = mediaInput.files;
            if (files.length === 0) {
                alert("Please select files first.");
                return;
            }

            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('media', files[i]);
            }

            uploadStatus.innerText = "Uploading...";
            uploadBtn.disabled = true;

            try {
                // Fetch keys securely from our backend
                const configRes = await fetch('/api/config');
                const config = await configRes.json();
                
                if (!config.supabaseUrl) throw new Error("Could not connect to Vercel configuration.");

                // Initialize direct connection to Supabase to bypass Vercel entirely
                const supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
                
                const newUrls = [];
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    // Clean filename to prevent spaces/special chars from breaking URLs
                    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${cleanName}`;
                    
                    uploadStatus.innerText = `Uploading ${i+1} of ${files.length}...`;
                    
                    const { data, error } = await supabaseClient.storage.from('media').upload(fileName, file);
                    if (error) throw new Error(error.message);
                    
                    const { data: urlData } = supabaseClient.storage.from('media').getPublicUrl(fileName);
                    newUrls.push(urlData.publicUrl);
                }

                // Append new URLs to the textarea
                const currentUrls = carImageInput.value.trim();
                const joinedUrls = newUrls.join(', ');
                carImageInput.value = currentUrls ? currentUrls + ', ' + joinedUrls : joinedUrls;
                if (typeof renderMediaPreview === 'function') renderMediaPreview();
                
                uploadStatus.innerText = "Upload successful! Files attached.";
                mediaInput.value = ''; // clear input
                setTimeout(() => uploadStatus.innerText = "", 5000);
            } catch (err) {
                alert("Upload Error: " + err.message + "\\nMake sure your files aren't corrupted.");
                uploadStatus.innerText = "Upload failed.";
            } finally {
                uploadBtn.disabled = false;
            }
        });
    }

    const clearBtn = document.getElementById('clear-media-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            carImageInput.value = '';
            if (typeof renderMediaPreview === 'function') renderMediaPreview();
        });
    }

    // AI Enhance Button
    const aiEnhanceBtn = document.getElementById('ai-enhance-btn');
    if (aiEnhanceBtn) {
        aiEnhanceBtn.addEventListener('click', async () => {
            const draft = carSpecsInput.value.trim();
            if (!draft) {
                alert("Please write some rough specs or details first!");
                return;
            }
            
            aiEnhanceBtn.innerText = "⏳ Enhancing...";
            aiEnhanceBtn.disabled = true;
            
            try {
                const response = await fetch('/api/enhance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ draft })
                });
                
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                
                carSpecsInput.value = data.result;
            } catch (err) {
                alert("AI Error: " + err.message + "\nMake sure the backend server (node server.js) is running.");
            } finally {
                aiEnhanceBtn.innerText = "✨ Enhance with AI";
                aiEnhanceBtn.disabled = false;
            }
        });
    }
}

// Run
init();
