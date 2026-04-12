const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize database connection
const db = new Sequelize({
    dialect: 'sqlite',
    storage: `database/${process.env.DB_NAME}` || 'smash.db',
    logging: false
});

// Importing models
const User = require('./models/user')(sequelize, DataTypes);
const Player = require('./models/player')(sequelize, DataTypes);
const Tournament = require('./models/tournament')(sequelize, DataTypes);

//Defining player and user table relationship
if (User.role === 'player'){
    User.hasOne(Player, {foreignKey: 'userId'});
    Player.belongsTo(User, {foreignKey: 'userId'});
};

//Defining tournament and player relationship
Player.hasMany(Tournament, {foreignKey: 'playerId'});
Tournament.belongsTo(Player, {foreignKey:'playerId'});

//Defining tournament and user relationship
if (User.role === 'TO') {
    User.hasMany(Tournament, {foreignKey: 'userId'});
    Tournament.belongsTo(User, {foreignKey: 'userId'});
};

// Export for use in other files
module.exports = db;

// Create database and tables
async function setupDatabase() {
    try {
        await db.authenticate();
        console.log('Connection to database established successfully.');
        
        await db.sync({ force: true });
        console.log('Database and tables created successfully.');
        
        await db.close();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase();
}
