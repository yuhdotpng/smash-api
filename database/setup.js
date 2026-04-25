const { Sequelize, DataTypes } = require("sequelize");
require('dotenv').config();
const UserModel = require('./models/user');
const TournamentModel= require('./models/tournament');
const PlayerModel= require('./models/player');   

//Intitalizing database
const db = new Sequelize({ 
    dialect: 'sqlite', 
    storage: `database/${process.env.DB_NAME}` || 'smash.db', 
    logging: false // Not necessary, but shows SQL queries in the console 
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

// Initialize database
async function setupDatabase() { 
    try { 
        await db.authenticate(); 
        console.log('Connection to databaseestablished successfully.'); 

        await db.sync({ force: true })
        console.log('Database file created at:',`database/${process.env.DB_NAME}`); 

        await db.close(); 
    } catch (error) { 
         console.error('Unable to connect to the database:', error); 
    } 
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase();
}


// Export for use in other files
module.exports = {
    db,
    User,
    Player,
    Tournament,
    setupDatabase
};