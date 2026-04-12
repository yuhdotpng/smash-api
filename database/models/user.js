const {  DataTypes } = require('sequelize');
const db = require('../setup')

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
        defaultValue: 'player',
        validate: {
            isIN: ['player', 'TO', 'admin']
        }
    }
});

module.exports = User;