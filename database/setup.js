const { Sequelize, DataTypes } = require("sequelize");
require('dotenv').config();
//Intitalizing database
const db = new Sequelize({ 
    dialect: 'sqlite', 
    storage: `database/${process.env.DB_NAME}` || 'smash.db', 
    logging: false // Not necessary, but shows SQL queries in the console 
})

const User = db.define('User',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username:{
        type: DataTypes.TEXT,
        allowNull: false
    },
    email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    location: {
        type: DataTypes.TEXT,
    },
    role: {
        type: DataTypes.ENUM('player', 'TO', 'admin'),
        defaultValue: 'player',
    }
});

// Players Model
const Player = db.define('Player',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    conference: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    main: {
        type: DataTypes.STRING,
        allowNull: false
    },
    previous_rankings: {
        type: DataTypes.JSON,
        allowNull: false
    },
    season_ranking: {
        type: DataTypes.INTEGER,
    },
    active_status: {
        type: DataTypes. BOOLEAN,
        defaultValue: false,
    }
});

// Tournament Model
const Tournament = db.define('Tournament', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    location: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    entry_fee: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    attending_players: {
        type: DataTypes.JSON
    },
    game_played: {
        type: DataTypes.ENUM ('original', 'melee', 'brawl', '4', 'ultimate', 'projectM')
        ,
        allowNull: false
    },
    format: {
        type: DataTypes.ENUM('single', 'double', 'round robin', 'pools', 'swiss'),
        allowNull: false
    },
    accept_reg: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

//Defining player and user table relationship
if (User.role === 'player'){
    User.hasOne(Player, {foreignKey: 'userId'});
    Player.belongsTo(User, {foreignKey: 'userId'});
};

//Defining tournament and user relationship
if (User.role === 'TO') {
    User.hasMany(Tournament, {foreignKey: 'userId'});
    Tournament.belongsTo(User, {foreignKey: 'userId'});
};

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