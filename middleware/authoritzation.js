
// Role-based middleware functions

function requirePlayer(req, res, next) {
    // Check if user is authenticated first
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user has at least Player role
    if (req.user.role === 'player'||req.user.role === 'TO' || req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            error: 'Access denied. Player role required.' 
        });
    }
}

function requireTO(req, res, next) {
    // Check if user is authenticated first
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user has TO or admin role
    if (req.user.role === 'TO' || req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            error: 'Access denied. TO role required.' 
        });
    }
}

function requireAdmin(req, res, next) {
    // Check if user is authenticated first
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user has admin role
    if (req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            error: 'Access denied. Admin role required.' 
        });
    }
};

module.exports = {requirePlayer,
    requireTO,
    requireAdmin
}