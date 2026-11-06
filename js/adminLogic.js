


let moviesData = [];

async function initAdmin() {
    const adminLoginBox = document.getElementById('passwordScreen');
    const adminPanel = document.getElementById('adminPanel');
    const adminLoginBtn = document.getElementById('verifyAdminBtn');
    
        // Auth check
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (sessionStorage.getItem('adminAuth') === 'true') {
        adminLoginBox.style.display = 'none';
        adminPanel.style.display = 'block';
        if (adminLogoutBtn) adminLogoutBtn.style.display = 'block';
        document.body.classList.remove('admin-body');
        document.body.style.background = 'url("../assets/admin-panel-bg.jpg") no-repeat center center fixed';
        document.body.style.backgroundSize = 'cover';
        await loadAdminMovies();
    }
    
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminAuth');
            window.location.reload();
        });
    }
    
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            const pwd = document.getElementById('adminPassword').value;
            // Legacy reference check: In the modern MERN app, authentication is verified securely by the Express server via POST /api/auth/admin-login
            const validKey = sessionStorage.getItem('adminSecurityKey') || 'admin123';
            if (pwd && (pwd === validKey || pwd === 'admin123')) {
                sessionStorage.setItem('adminAuth', 'true');
                window.location.reload();
            } else {
                handleValidationError({message: "Invalid admin password!"});
            }
        });
    }

    const adminSearchInput = document.getElementById('adminSearchInput');
    const adminSearchBtn = document.getElementById('adminSearchBtn');
    if (adminSearchInput && adminSearchBtn) {
        adminSearchInput.addEventListener('keyup', (e) => {
            renderAdminMovies(e.target.value);
        });
        adminSearchBtn.addEventListener('click', () => {
            renderAdminMovies(adminSearchInput.value);
        });
    }
    
    const movieForm = document.getElementById('movieForm');
    if (movieForm) {
        movieForm.addEventListener('submit', handleMovieSubmit);
    }
}

async function loadAdminMovies() {
    moviesData = await getAllMovies() || [];
    renderAdminMovies();
}

function renderAdminMovies(searchTerm = '') {
    const adminMoviesUl = document.getElementById('adminMoviesUl');
    if (!adminMoviesUl) return;
    adminMoviesUl.innerHTML = '';
    
    const filtered = moviesData.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    filtered.forEach(movie => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${movie.title} (${movie.releaseYear}) - [${movie.status}]</span>
            <div>
                <button class="btn" style="background: #28a745; padding: 5px 10px;" data-action="edit" data-id="${movie.id}">Edit</button>
                <button class="btn" style="background: #dc3545; padding: 5px 10px;" data-action="delete" data-id="${movie.id}">Delete</button>
            </div>
        `;
        adminMoviesUl.appendChild(li);
    });

    adminMoviesUl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const action = e.target.getAttribute('data-action');
            const id = e.target.getAttribute('data-id');
            if (action === 'edit') editMovie(id);
            else if (action === 'delete') await removeMovie(id);
        });
    });
}

async function handleMovieSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('movieId').value;
    
    const formData = {
        title: document.getElementById('movieTitle').value,
        genre: document.getElementById('movieGenre').value,
        language: document.getElementById('movieLanguage').value,
        releaseYear: parseInt(document.getElementById('movieYear').value),
        rating: parseFloat(document.getElementById('movieRating').value),
        duration: document.getElementById('movieDuration').value,
        description: document.getElementById('movieDescription').value,
        poster: document.getElementById('moviePoster').value,
        trailer: document.getElementById('movieTrailer').value,
        status: document.getElementById('movieStatus').value,
        type: document.getElementById('movieType').value,
        uploadDate: new Date().toISOString(),
        watchLinks: {
            youtube: "https://www.youtube.com",
            netflix: "https://www.netflix.com",
            hotstar: "https://www.hotstar.com"
        }
    };
    
    if (id) {
        if (await updateMovie(id, formData)) {
            alert('Movie updated!');
            document.getElementById('movieForm').reset();
            document.getElementById('movieId').value = '';
            await loadAdminMovies();
        }
    } else {
        if (await addMovie(formData)) {
            alert('Movie added!');
            document.getElementById('movieForm').reset();
            await loadAdminMovies();
        }
    }
}

function editMovie(id) {
    const movie = moviesData.find(m => m.id == id);
    if (!movie) return;
    
    document.getElementById('movieId').value = movie.id;
    document.getElementById('movieTitle').value = movie.title;
    document.getElementById('movieGenre').value = movie.genre;
    document.getElementById('movieLanguage').value = movie.language;
    document.getElementById('movieYear').value = movie.releaseYear;
    document.getElementById('movieRating').value = movie.rating;
    document.getElementById('movieDuration').value = movie.duration || '';
    document.getElementById('movieDescription').value = movie.description || '';
    document.getElementById('moviePoster').value = movie.poster;
    document.getElementById('movieTrailer').value = movie.trailer;
    document.getElementById('movieStatus').value = movie.status || 'released';
    document.getElementById('movieType').value = movie.type || 'movie';
}

async function removeMovie(id) {
    if (confirm('Are you sure you want to delete this movie?')) {
        if (await deleteMovie(id)) {
            await loadAdminMovies();
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}




