const express = require('express');
const app = express();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
//Middlware
app.use(express.json());

//Logging middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  
    // Log request body for POST and PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
         console.log('Request Body:',
   JSON.stringify(req.body, null, 2));
}
  
    next(); // Pass control to next middleware
};

// JWT Authentication Middleware
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Access denied. No token provided.' 
        });
    }
     // Get the token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired. Please log in again.' 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token. Please log in again.' 
            });
        } else {
            return res.status(401).json({ 
                error: 'Token verification failed.' 
            });
        }
    }
}

const userValidation = [
    body('username')
        .isString()
        .isLength({min: 3})
        .withMessage('Username must be a string with at least 3 characters'),
    body('email')
        .isString()
        .isLength({min: 5})
        .withMessage('Email must be a valid email address'),
    body('password')
        .isHash()
        .isLength({min: 7})
        .withMessage('Password must be at least 7 characters long'),
    body('location')
        .isString()
        .withMessage('Location must be a string'),
    body('role')
        .isString()
        .isIn(['user','player','TO','admin'])
        .withMessage('User must be a user, player, TO, or admin')
]

const playerValidation = [
    body('name')
        .isString()
        .isLength({min: 3})
        .withMessage('Name must be a string with at least 3 characters'),
    body('conference')
        .isString()
        .withMessage('Conference must be a string'),
    body('main')
        .isString()
        .isLength({min: 3})
        .withMessage('Main must be a string with at least 3 characters'),
    body('previous_rankings')
        .isJSON()
        .withMessage('Previous Rankings must be a list of integers'),
    body('active_status')
        .isBoolean()
        .default(false)
        .withMessage('Active Status must be true or false')
]

const tournamentValidation = [
    body('name')
        .isString()
        .isLength({min: 3})
        .withMessage('Name must be a string with at least 3 characters'),
    body('location')
        .isString()
        .withMessage('Location must be a string'),
    body('entry_fee')
        .isFloat({min : 0.0})
        .withMessage('Entry fee must be a non negative float'),
    body('attending_players')
        .isArray({min: 1})
        .withMessage('Attending players must be an array with at least one player'),
    body('game_played')
        .isString()
        .isIn('original', 'melee', 'brawl', '4', 'ultimate', 'projectM'),
    body('format')
        .isString()
        .isIn('single', 'double', 'round robin', 'pools', 'swiss'),
    body('accept_reg')
        .isBoolean()
        .default(true)
        .withMessage('Accepting registration status must be true or false')
]

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        const errorMessages =
    errors.array().map(error => error.msg);
    
        return res.status(400).json({
            error: 'Validation failed',
            messages: errorMessages
        });
    }
  
    // Set default value for completed if not provided
    if (req.body.completed === undefined) {
        req.body.completed = false;
    }
  
    next();
};


module.exports = {requestLogger, 
    requireAuth, 
    userValidation, 
    playerValidation,
    tournamentValidation,
    handleValidationErrors};