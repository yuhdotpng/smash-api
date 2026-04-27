const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { db, User, Player, Tournament } = require('./database/setup');
require('dotenv').config();

const {requestLogger, 
    requireAuth} = require('./middleware/middleware')

const {requirePlayer, 
    requireTO, 
    requireAdmin} = require('./middleware/authoritzation');

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(express.json());
app.use(requestLogger);

const cors = require('cors');
app.use(cors());


// Test database connection
async function testConnection() {
    try {
        await db.authenticate();
        console.log('Connection to database established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Smash API is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

 //Root endpoint 
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Super Smash Brothers API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            register: 'POST /api/register',
            login: 'POST /api/login',
            logout: ' POST /api/logout',
            userProfile: 'GET /api/users/profile',
            users: 'GET /api/users (requires Admin)',
            players: 'GET /api/players',
            playerById: 'GET /api/players/id',
            playerProfile: 'GET /api/players/profile',
            createPlayer: 'POST /api/players',
            updatePlayerProfile: 'PUT /api/players/profile (requires player)',
            updatePlayer: 'PUT /api/players/:id (requires admin)',
            deletePlayerProfile: 'DELETE /api/players/profile (requires player)',
            deletePlayer: 'DELETE /api/players/:id',
            tournaments: 'GET /api/tournaments',
            tournamentById: 'GET /api/tournaments/:id',
            createTournament: 'POST /api/tournaments',
            updateTournament: 'PUT /api/tournaments/:id (requires TO for own tournaments, requires admin for any tournament)',
            deleteTournament: 'DELETE /api/tournaments/:id (requires TO for own tournaments, requires admin for any tournament)'

        }
    });
}); 
//Authenication endpoints
// POST /api/register - Register new user
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, location, role = 'user' } = req.body;
        
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ 
                error: 'Username, email, and password are required' 
            });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User with this email already exists' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            location,
            role
        });
        
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
        
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// POST /api/login - User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }
        
        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                name: user.name, 
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        res.json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// POST /api/logout - User logout
app.post('/api/logout', (req, res) => 
        res.json({ message: 'Logout successful' }))

// USER ROUTES

// GET /api/users/profile - Get current user profile 
app.get('/api/users/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email', 'location', 'role'] // Don't return password
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// GET /api/users - Get all users 
app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'location', 'role'] // Don't return passwords
        });
        
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET /api/users/:id - Get user by id
app.get('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const user = await User.findOne({
            where: {id: req.params.id},
            attributes: ['id', 'username', 'email', 'role'] // Don't return passwords
        });

         if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});


// PUT /api/users/profile - Update own user 
app.put('/api/users/profile', requireAuth, async (req, res) => {
    try {
        
        const { username, email, password, location, role} = req.body;
        
        const [updatedRowsCount] = await User.update(
            { username, email, password, location, role},
            { where: { id: req.user.id } }
        );
        if (req.body.role === 'TO' || req.body.role === 'admin'){
            return res.status(400).json({ error: 'cannot update own role' });
        }
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'user not found' });
        }

        const updatedUser = await User.findByPk(req.user.id);
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// PUT /api/users/:id - Update users by id
app.put('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const user = await User.findOne({
            where: {id: req.params.id}
        }); 

        const { username, location, role} = req.body;
        
        const [updatedRowsCount] = await User.update(
            {
                //ensuring admins cant update a user's email or password
                username: username || user.username, 
                email:  user.email, 
                password: user.password,
                location: location || user.location, 
                role: role || user.role
            },
            { where: { id: req.params.id } }
        );
        
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'user not found' });
        }
        
        const updatedUser = await User.findByPk(req.params.id);
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE /api/users/profile - Delete own profile
app.delete('/api/users/profile', requireAuth, async (req, res) => {
    try {
        const deletedRowsCount = await User.destroy({
            where: { id: req.user.id }
        });
        
        if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// DELETE /api/users/:id - Delete user by id
app.delete('/api/users/profile', requireAuth ,requireAdmin, async (req, res) => {
    try {
        const deletedRowsCount = await User.destroy({
            where: { id: req.params.id }
        });
        
        if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// PLAYER ROUTES

// GET /api/players - Get all players for authenticated user
app.get('/api/players', requireAuth, async (req, res) => {
    try {
        const players = await Player.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            message: 'Players retrieved successfully',
            players: players,
            total: players.length
        });
        
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

// GET /api/players/:id - Get single player
app.get('/api/players/:id', requireAuth, async (req, res) => {
    try {
        const player = await Player.findByPk(req.params.id, {
        
        });

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        
        res.json(player);
        
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ error: 'Failed to fetch player' });
    }
});

// GET /api/players/profile - Get single player
app.get('/api/players/profile', requireAuth, async (req, res) => {
    try {
        const player = await Player.findOne({ 
            where : {
                id: req.user.id
            }
        }, {
        
        });

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        
        res.json(player);
        
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ error: 'Failed to fetch player' });
    }
});

// POST /api/players - Create new player
app.post('/api/players', requireAuth, requirePlayer, async (req, res) => {
    try {
        const { name, conference, main, active_status = false } = req.body;
        
        // Validate input
        if (!name) {
            return res.status(400).json({ 
                error: 'Name is required' 
            });
        }
        
        // Create player
        const newPlayer = await Player.create({
            name,
            conference, 
            main,  
            active_status,
            userId: req.user.id 
        });
        
        res.status(201).json({
            message: 'Player created successfully',
            player: newPlayer
        });
        
    } catch (error) {
        console.error('Error creating player:', error);
        res.status(500).json({ error: 'Failed to create player' });
    }
});

// PUT /api/players/profile - Update own player profile
app.put('/api/players/profile', requireAuth, requirePlayer, async (req, res) => {
    try {
        const { name, conference, main, active_status } = req.body;
        
        const player = await Player.findByPk(req.user.id,{
            where: { 
                id: req.user.id,
            }
        });
        
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        
        // Update player profile
        await player.update({
            name: name || player.name,
            conference: conference !== undefined ? conference : player.conference,
            main: main !== undefined ? main : player.main,
            active_status : active_status || player.active_status
        });
        
        res.json({
            message: 'Player profile updated successfully',
            player: player
        });
        
    } catch (error) {
        console.error('Error updating player:', error);
        res.status(500).json({ error: 'Failed to update player' });
    }
});

// PUT /api/players/:id - Update player rankings
app.put('/api/players/:id', requireAuth, requireTO, async (req, res) => {
    try {
        const { previous_rankings} = req.body;
        
        const player = await Player.findByPk(req.params.id,{
            where: { 
                id: req.params.id,
            }
        });
        
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        
        // Update player profile
        //ensures TOs can only update player's tournament rankings
        await player.update({
            name: player.name,
            conference: player.conference,
            main: player.main,
            previous_rankings: previous_rankings || player.previous_rankings,
            season_ranking : player.season_ranking,
            active_status : player.active_status
        });
        
        res.json({
            message: 'Player profile updated successfully',
            player: player
        });
        
    } catch (error) {
        console.error('Error updating player:', error);
        res.status(500).json({ error: 'Failed to update player' });
    }
});

// PUT /api/players/admin/:id - Update player profiles
app.put('/api/players/admin/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, conference, main, previous_rankings, season_ranking, active_status } = req.body;
        
        const player = await Player.findByPk(req.params.id,{
            where: { 
                id: req.params.id,
            }
        });
        
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        
        // Update player profile
        await player.update({
            name: name || player.name,
            conference: conference !== undefined ? conference : player.conference,
            main: main !== undefined ? main : player.main,
            previous_rankings: previous_rankings || player.previous_rankings,
            season_ranking : season_ranking || player.season_ranking,
            active_status : active_status || player.active_status
        });
        
        res.json({
            message: 'Player profile updated successfully',
            player: player
        });
        
    } catch (error) {
        console.error('Error updating player:', error);
        res.status(500).json({ error: 'Failed to update player' });
    }
});

// DELETE /api/players/profile - Delete own player profile
app.delete('/api/players/profile', requireAuth, requirePlayer, async (req, res) => {
    try {
        // Find player
        const player = await Player.findOne({
            where: { 
                id: req.user.id,
            }
        });
        
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        
        // Delete player
        await player.destroy();
        
        res.json({
            message: 'Player deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ error: 'Failed to delete player' });
    }
});

// DELETE /api/players/:id - Delete player profile
app.delete('/api/players/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Find player
        const player = await Player.findOne({
            where: { 
                id: req.params.id,
            }
        });
        
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        
        // Delete player
        await player.destroy();
        
        res.json({
            message: 'Player deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ error: 'Failed to delete player' });
    }
});

// TOURNAMENT ROUTES

// GET /api/tournaments - Get all tournaments for authenticated user
app.get('/api/tournaments', requireAuth, async (req, res) => {
    try {
        const tournaments = await Tournament.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            message: 'Tournaments retrieved successfully',
            tournaments: tournaments,
            total: tournaments.length
        });
        
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
});

// GET /api/tournaments/:id - Get single tournament
app.get('/api/tournaments/:id', requireAuth, async (req, res) => {
    try {
        const tournament = await Tournament.findOne({
            where: { 
                id: req.params.id,
            }
        });
        
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }
        
        res.json(tournament);
        
    } catch (error) {
        console.error('Error fetching tournament:', error);
        res.status(500).json({ error: 'Failed to fetch tournament' });
    }
});

// POST /api/tournaments - Create new player
app.post('/api/tournaments', requireAuth, requireTO, async (req, res) => {
    try {
        const { name, location, entry_fee, attending_players, game_played, format, accept_reg = true } = req.body;
        
        // Validate input
        if (!name) {
            return res.status(400).json({ 
                error: 'Name is required' 
            });
        }
        
        // Create Tournament
        const newTournament = await Tournament.create({
            name, 
            location, 
            entry_fee, 
            attending_players, 
            game_played, 
            format, 
            accept_reg,
            organizer: req.user.username
        });
        
        res.status(201).json({
            message: 'Tournament created successfully',
            tournament: newTournament
        });
        
    } catch (error) {
        console.error('Error creating tournament:', error);
        res.status(500).json({ error: 'Failed to create tournament' });
    }
});

// PUT /api/tournaments/:id - Update tournaments 
app.put('/api/tournaments/:id', requireAuth, requireTO , async (req, res) => {
    try {
        const { name, location, entry_fee, attending_player, game_played, format, accept_reg }
         = req.body;

        const tournament = await Tournament.findByPk(req.params.id);
        if (!tournament) {
        return res.status(404).json({ error: 'Post not found' });
    }
        
        const [updatedRowsCount] = await Tournament.update(
            { name, location, entry_fee, attending_player, game_played, format, accept_reg },
            { where: { id: req.params.id } }
        );
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Tournament not found' });
        }
        // TOs can only edit their own tournaments, admins can edit any tournament
        if (req.user.role === 'TO' && tournament.orgId !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own tournaments' });
        }
        const updatedTournament = await Tournament.findByPk(req.params.id);
        res.json(updatedTournament);
    } catch (error) {
        console.error('Error updating tournament:', error);
        res.status(500).json({ error: 'Failed to update tournament' });
    }
});

// DELETE /api/tournaments/:id - Delete tournament profile
app.delete('/api/tournaments/:id',requireAuth, requireTO, async (req, res) => {
    try {
        // Find tournament
        const tournament = await Tournament.findOne({
            where: { 
                id: req.params.id, 
            }
        });
        
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }
        // TOs can only delete their own tournaments, admins can delete any tournament
        if (req.user.role === 'TO' && tournament.orgId !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own tournaments' });
        }
        
        // Delete tournament
        await tournament.destroy();
        
        res.json({
            message: 'Tournament deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting Tournament:', error);
        res.status(500).json({ error: 'Failed to delete tournament' });
    }
});

// Start server (
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
    });