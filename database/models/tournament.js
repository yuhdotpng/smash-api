const { DataTypes } = require('sequelize');
// Initialize database connection


// Tournament Model
const Tournament = {
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
};

module.exports = Tournament;