const { Sequelize, DataTypes } = require('sequelize');

const User = {
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
};

module.exports = User;