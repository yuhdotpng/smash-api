const bcrypt = require('bcryptjs');
const { db, User, Player, Tournament } = require('./setup');


async function seedDatabase() {
    try {
        // Force sync to reset database
        await db.sync({ force: true });
        console.log('Database reset successfully.');

        // Create sample users
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const users = await User.bulkCreate([
            {
                username: 'Kaden',
                email: 'kaden@example.com',
                password: hashedPassword,
                role: 'player',
                location: 'gladstone'
            },
            {
                username: 'Aiden',
                email: 'aiden@example.com',
                password: hashedPassword,
                role: 'admin',
                location: 'KC'
            },
            {
                name: 'Cyrus',
                email: 'cyrus@example.com',
                password: hashedPassword,
                role: 'TO',
                location: 'Liberty'
            },
            {
                username: 'Marcus',
                email: 'marcus@example.com',
                password: hashedPassword,
                role: 'user'
            }
        ]);

        // Create sample players
        await Player.bulkCreate([
            // Assigned Player profiles
            {
                name: 'MasterofChar',
                conference: 'KC',
                main: ['Zelda', 'Cloud'],
                previous_rankings: [1,2,4,2,6],
                season_ranking: 9,
                userId: users[0].id
            },
            // This one is intentionally wrong for now
            {
               name: 'Char2',
               conference: 'KC',
               main: ['Zelda', 'Cloud'],
               previous_rankings: [2,6,2,3,7,10],
               season_ranking: 15,
               userId: users[2].id,
               status: 'active'
            }
        ]);

        //Creat sample tournaments
        await Tournament.bulkCreate([
            //Assigned Tournaments
            {
                name: 'Tourney 1',
                location: 'Wisconsin',
                entry_fee: 25.50,
                attending_players: ['Player1', 'Player2', 'Player3'],
                game_played: 'ultimate',
                format: 'single',
                userId: users[2].id
            },
            {
                name: 'Tourney 2',
                location: 'California',
                entry_fee: 50.00,
                attending_players: ['PlayerA', 'PlayerB', 'PlayerC'],
                game_played: 'melee',
                format: 'single',
                userId: users[3].id
            }
        ]);

        console.log('Database seeded successfully!');
        console.log('Sample users created:');
        console.log('- kaden@example.com / password123');
        console.log('- aiden@example.com / password123');
        console.log('- cyrus@example.com / password123');
        console.log('- marcus@example.com / password123');
        
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await db.close();
    }
}

seedDatabase();