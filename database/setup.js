const { Sequelize, DataTypes } = require('sequelize');
const dataTypes = require('sqlize/lib/data-types');
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
            isIN: ['user', 'player', 'tournament organizer', 'admin']
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
        type: DataTypes.ARRAY(DataTypes.INTEGER),
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
            isIN: ['singles', 'doubles', 'round robin', 'pools', 'swiss']
        },
        allowNull: false
    },
    accept_reg: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
});