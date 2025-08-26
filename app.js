/**
 * login - Authenticates a user with username and password.
 * @param {string} username
 * @param {string} password
 * @param {function} getUserByUsername - async function to fetch user by username
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
async function login(username, password, getUserByUsername) {
    if (!username || !password) {
        return { success: false, error: 'Username and password are required.' };
    }

    try {
        const user = await getUserByUsername(username);
        if (!user) {
            return { success: false, error: 'User not found.' };
        }

        // Replace this with your password check logic (e.g., bcrypt.compare)
        const isPasswordValid = user.password === password;
        if (!isPasswordValid) {
            return { success: false, error: 'Invalid password.' };
        }

        // Remove sensitive info before returning user object
        const { password: _, ...safeUser } = user;
        return { success: true, user: safeUser };
    } catch (err) {
        return { success: false, error: 'Authentication failed.' };
    }
}

module.exports = { login };

// Remember to register a database. 
