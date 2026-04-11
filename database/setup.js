const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize database connection
const db = new Sequelize({
    dialect: 'sqlite',
    storage: `database/${process.env.DB_NAME}` || 'smash.db',
    logging: false
});

// User Model
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
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.TEXT,
    },
    role: {
        type: DataTypes.TEXT,
        defaultValue: 'user',
        validate: {
            isIN: ['user', 'player', 'TO', 'admin']
        }
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
        type: DataTypes.STRING,
        allowNull: false
    },
    conference: {
        type: DataTypes.STRING,
        allowNull: false
    },
    main: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false
    },
    previous_rankings: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: false
    },
    season_ranking: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.TEXT,
        defaultValue: 'inactive',
        validate: {
            isIN: ['active', 'inactive']
        }
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
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entry_fee: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    attending_players: {
        type: DataTypes.ARRAY(DataTypes.TEXT)
    },
    game_played: {
        type: DataTypes.TEXT,
        validate: {
            isIN: ['original', 'melee', 'brawl', '4', 'ultimate', 'projectM']
        },
        allowNull: false
    },
    format: {
        type: DataTypes.TEXT,
        validate: {
            isIN: ['single', 'double', 'round robin', 'pools', 'swiss']
        },
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

//Defining tournament and player relationship
Player.hasMany(Tournament, {foreignKey: 'playerId'});
Tournament.belongsTo(Player, {foreignKey:'playerId'});

//Defining tournament and user relationship
if (User.role === 'TO') {
    User.hasMany(Tournament, {foreignKey: 'userId'});
    Tournament.belongsTo(User, {foreignKey: 'userId'});
};

// Export for use in other files
module.exports = { db, User, Player, Tournament };

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