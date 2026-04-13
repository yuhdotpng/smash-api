const { Sequelize, DataTypes } = require('sequelize');
// Initialize database connection
const db = new Sequelize({
    dialect: 'sqlite',
    storage: `database/${process.env.DB_NAME}` || 'smash.db',
    logging: false
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

module.exports = Tournament;