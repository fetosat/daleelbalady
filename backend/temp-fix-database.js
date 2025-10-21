// Temporary fix for missing database columns
// This script will help add the missing columns programmatically

import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

async function fixMissingColumns() {
    let connection;
    
    try {
        // Create database connection
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL not found in environment variables');
        }
        
        // Parse the database URL
        const url = new URL(dbUrl);
        const connectionConfig = {
            host: url.hostname,
            port: url.port || 3306,
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1), // Remove the leading '/'
        };
        
        connection = await mysql.createConnection(connectionConfig);
        console.log('✅ Connected to database');
        
        // Check if columns exist and add them if missing
        const columnsToAdd = [
            {
                name: 'googleId',
                definition: 'VARCHAR(191) NULL UNIQUE',
                comment: 'Google OAuth ID'
            },
            {
                name: 'facebookId', 
                definition: 'VARCHAR(191) NULL UNIQUE',
                comment: 'Facebook OAuth ID'
            },
            {
                name: 'authProvider',
                definition: 'VARCHAR(191) NULL',
                comment: 'Authentication provider (local, google, facebook)'
            },
            {
                name: 'designId',
                definition: 'VARCHAR(191) NULL',
                comment: 'Design system ID'
            }
        ];
        
        for (const column of columnsToAdd) {
            try {
                // Check if column exists
                const [rows] = await connection.execute(`
                    SELECT COUNT(*) as count 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE table_name = 'User' 
                    AND table_schema = ? 
                    AND column_name = ?
                `, [connectionConfig.database, column.name]);
                
                if (rows[0].count === 0) {
                    // Add the missing column
                    await connection.execute(`
                        ALTER TABLE \`User\` 
                        ADD COLUMN \`${column.name}\` ${column.definition}
                        COMMENT '${column.comment}'
                    `);
                    console.log(`✅ Added column: ${column.name}`);
                } else {
                    console.log(`ℹ️  Column ${column.name} already exists`);
                }
            } catch (error) {
                console.error(`❌ Error adding column ${column.name}:`, error.message);
            }
        }
        
        // Verify the columns were added
        console.log('\n📋 Final column verification:');
        const [finalCheck] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE table_name = 'User' 
            AND table_schema = ?
            AND column_name IN ('googleId', 'facebookId', 'authProvider', 'designId')
            ORDER BY COLUMN_NAME
        `, [connectionConfig.database]);
        
        console.table(finalCheck);
        
    } catch (error) {
        console.error('❌ Database fix failed:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the fix
fixMissingColumns()
    .then(() => {
        console.log('\n✅ Database column fix completed!');
        console.log('You can now restart your server with: yarn dev');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    });
