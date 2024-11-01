let token = localStorage.getItem('token');

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + 'Page').classList.add('active');
}

function updateNavigation(isLoggedIn) {
    document.getElementById('loginNav').style.display = isLoggedIn ? 'none' : 'inline';
    document.getElementById('registerNav').style.display = isLoggedIn ? 'none' : 'inline';
    document.getElementById('filesNav').style.display = isLoggedIn ? 'inline' : 'none';
    document.getElementById('logoutNav').style.display = isLoggedIn ? 'inline' : 'none';

    if (isLoggedIn) {
        showPage('files');
        loadFiles();
    } else {
        showPage('login');
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await axios.post('/api/auth/login', { email, password });
        token = response.data.token;
        localStorage.setItem('token', token);
        updateNavigation(true);
    } catch (error) {
        document.getElementById('loginError').textContent =
            error.response?.data?.error || 'Erreur de connexion';
    }
}

async function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        await axios.post('/api/auth/register', { email, password });
        showPage('login');
        document.getElementById('loginEmail').value = email;
        document.getElementById('registerError').textContent = '';
    } catch (error) {
        document.getElementById('registerError').textContent =
            error.response?.data?.error || 'Erreur d\'inscription';
    }
}

function logout() {
    localStorage.removeItem('token');
    token = null;
    updateNavigation(false);
}

async function loadFiles() {
    try {
        const response = await axios.get('/api/files', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const filesList = document.getElementById('filesList');
        filesList.innerHTML = '';

        response.data.forEach(file => {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.innerHTML = `
                <div>
                    <strong>${file.original_name}</strong>
                    <br>
                    <small>Taille: ${formatBytes(file.size)}</small>
                </div>
                <div>
                    <button onclick="createShare('${file.id}')">Partager</button>
                    <button onclick="deleteFile('${file.id}')">Supprimer</button>
                </div>
            `;
            filesList.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

async function uploadFile() {
    const fileInput = document.getElementById('fileUpload');
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        document.getElementById('uploadError').textContent = '';
        document.getElementById('uploadSuccess').textContent = '';

        await axios.post('/api/files/upload', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        document.getElementById('uploadSuccess').textContent = 'Fichier uploadé avec succès!';
        fileInput.value = '';
        loadFiles();
    } catch (error) {
        document.getElementById('uploadError').textContent =
            error.response?.data?.error || 'Erreur lors de l\'upload';
    }
}

async function createShare(fileId) {
    try {
        const response = await axios.post('/api/shares',
            { fileId, expiresIn: 24 * 3600 },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const shareUrl = `${window.location.origin}/api/shares/${response.data.token}`;
        alert(`Lien de partage (valide 24h):\n${shareUrl}`);
    } catch (error) {
        alert('Erreur lors de la création du lien de partage');
    }
}

async function deleteFile(fileId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier?')) return;

    try {
        await axios.delete(`/api/files/${fileId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        loadFiles();
    } catch (error) {
        alert('Erreur lors de la suppression du fichier');
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

updateNavigation(!!token);
