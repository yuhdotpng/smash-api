const { Sequelize, DataTypes } = require('sequelize');
// Initialize database connection
const db = new Sequelize({
    dialect: 'sqlite',
    storage: `database/${process.env.DB_NAME}` || 'smash.db',
    logging: console.log
});

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