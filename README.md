# Smash API
An API for the Super Smash Brothers competitive scene
## Pre setup
```bash
git clone https://github.com/yuhdotpng/smash-api.git
cd smash-api

```
## Setup Instructions
1. Install dependencies: `npm install`
2.  Create a `.env` file in the root directory:
PORT=3000 |
NODE_ENV=production |
DB_NAME=smash.db
4. Setup Database: `npm run setup`
5. Seed Database: `npm run seed`
6. Start the server: `npm start`
7. The database will be running at `http://localhost:3000`

## API endpoints
### Users

| Method | URL | Description |
|--------|-----|-------------|
| GET | /users | Get all users |
| GET | /users/:id | Get user by ID |
| POST | /users | Create a new user |
| PUT | /users/:id | Update a user |
| DELETE | /users/:id | Delete a user |

#### POST /api/users — request body (will return a 201 response including id and timestamp it was created)
```json
{
    "username": "testUser", 
    "email": "user@example.com", 
    "password": "password465", 
    "location": "MO",
    "role": "player"
}
```
#### PUT /api/users/5 — (updating the user you made with the POST, will return 200 response with a timestamp when it was updated)
```json
{
    "username": "testUser", 
    "email": "user@example.com", 
    "password": "password465", 
    "location": "MO",
    "role": "TO"
}
```

### Players
| Method | URL | Description |
|--------|-----|-------------|
| GET | /players | Get all players |
| GET | /players/:id | Get player by ID |
| POST | /players | Create a player user |
| PUT | /players/:id | Update a player |
| DELETE | /players/:id | Delete a player |

#### POST /api/players — request body (will return a 201 response including id and timestamp it was created)
```json
{
    "name": "Example_player",
    "conference": "con_1", 
    "main": "Kirby", 
    "previous_rankings":[1,5,6,8,2], 
    "season_ranking":25, 
    "active_status":false
}
```
#### PUT /api/players/3 — (updating the player you made with the POST, will return 200 response with a timestamp when it was updated)
```json
{
    "name": "Example_player",
    "conference": "con_1", 
    "main": "Kirby", 
    "previous_rankings":[1,5,6,8,2], 
    "season_ranking":25, 
    "active_status":true
}
```
### Tournaments
| Method | URL | Description |
|--------|-----|-------------|
| GET | /tournaments | Get all players |
| GET | /tournaments/:id | Get player by ID |
| POST | /tournaments | Create a player user |
| PUT | /tournamentss/:id | Update a player |
| DELETE | /tournaments/:id | Delete a player |

#### POST /api/tournaments — request body (will return a 201 response including id and timestamp it was created)
```json
{
    "name":"Example_tourney", 
    "location": "MO", 
    "entry_fee": 5, 
    "attending_player": ["Char", "Sushii"], 
    "game_played": "melee", 
    "format": "single", 
    "accept_reg": true
}
```
#### PUT /api/tournaments/3 — (updating the tournament you made with the POST, will return 200 response with a timestamp when it was updated)
```json
{
    "name":"Example_tourney", 
    "location": "MO", 
    "entry_fee": 5, 
    "attending_player": ["Char", "Sushii"], 
    "game_played": "melee", 
    "format": "single", 
    "accept_reg": false
}
```
---
### Planned improvements
- JWT token authentication
- Authorization for player, TO, and admin roles
- code clean up/compartmentalization
- Cloud Deployment
