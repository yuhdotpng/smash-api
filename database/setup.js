const { Sequelize, DataTypes } = require("sequelize");
require('dotenv').config();
const UserModel = require('./models/user');
const TournamentModel= require('./models/tournament');
const PlayerModel= require('./models/player');   

//Intitalizing database
const db = new Sequelize({ 
    dialect: 'sqlite', 
    storage: `database/${process.env.DB_NAME}` || 'smash.db', 
    logging: false
})

//Inserting Models
const User = db.define('User', UserModel);
const Tournament = db.define('Tournament', TournamentModel);
const Player = db.define('Player', PlayerModel);



//Defining player and user table relationship
User.hasOne(Player, {foreignKey: 'userId'});
Player.belongsTo(User, {foreignKey: 'userId'});

//Defining tournament and player relationship
Player.hasMany(Tournament, {foreignKey: 'playerId'});
Tournament.belongsTo(Player, {foreignKey:'playerId'});

//Defining tournament and user relationship
User.hasMany(Tournament, {foreignKey: 'orgId'});
Tournament.belongsTo(User, {foreignKey: 'orgId', as: 'organizer'});

// Initialize database
async function initializeDatabase() {
    try {
        await db.authenticate();
        console.log('Database connection established successfully.');
        
        await db.sync({ force: true });
        console.log('Database synchronized successfully.');
        
        await db.close();
    } catch (error) {
        console.error('Unable to connect to database:', error);
    }
}
if (require.main === module) {
initializeDatabase();
}


// Export for use in other files
module.exports = {
    db,
    User,
    Player,
    Tournament,
    initializeDatabase
};