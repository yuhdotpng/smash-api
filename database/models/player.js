const { Sequelize, DataTypes } = require('sequelize');
// Initialize database connection
const db = new Sequelize({
    dialect: 'sqlite',
    storage: `database/${process.env.DB_NAME}` || 'smash.db',
    logging: false
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
    },
    status: {
        type: DataTypes.TEXT,
        defaultValue: 'inactive',
        validate: {
            isIN: ['active', 'inactive']
        }
    }
});

module.exports = Player;