const { Sequelize, DataTypes } = require('sequelize');


// Players Model
const Player = {
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
    },
    season_ranking: {
        type: DataTypes.INTEGER,
    },
    active_status: {
        type: DataTypes. BOOLEAN,
        defaultValue: false,
    }
};

module.exports = Player;