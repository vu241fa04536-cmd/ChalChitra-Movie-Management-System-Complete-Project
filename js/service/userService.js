


async function getUserById(id) {
    try {
        const response = await axios.get(`${USER_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error, "Failed to fetch user profile.");
    }
}

async function updateUser(id, userData) {
    try {
        const response = await axios.put(`${USER_API_URL}/${id}`, userData);
        return response.data;
    } catch (error) {
        handleApiError(error, "Failed to update user profile.");
    }
}

async function loginUser(username, password) {
    try {
        const response = await axios.get(`${USER_API_URL}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
        return response.data;
    } catch (error) {
        handleApiError(error, "Login failed.");
    }
}

async function registerUser(username, password) {
    try {
        // First check if user exists
        const check = await axios.get(`${USER_API_URL}?username=${username}`);
        if (check.data.length > 0) {
            throw new Error("Username already exists");
        }
        
        const newUser = {
            username,
            password,
            favorites: [],
            watchlist: []
        };
        const response = await axios.post(USER_API_URL, newUser);
        return response.data;
    } catch (error) {
        handleApiError(error, error.message || "Registration failed.");
    }
}

