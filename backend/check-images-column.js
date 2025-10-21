import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkAndAddImagesColumn() {
    try {
        // Parse database URL
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL not found in environment variables');
        }

        // Extract connection details from URL
        const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
        if (!urlMatch) {
            throw new Error('Invalid DATABASE_URL format');
        }

        const [, user, password, host, port, database] = urlMatch;

        console.log('🔌 Connecting to database...');
        const connection = await mysql.createConnection({
            host,
            port: parseInt(port),
            user,
            password,
            database
        });

        console.log('✅ Connected to database');

        // Check if images column exists
        console.log('🔍 Checking if images column exists in Product table...');
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'Product' 
            AND COLUMN_NAME = 'images'
        `, [database]);

        if (columns.length > 0) {
            console.log('✅ images column already exists in Product table');
        } else {
            console.log('❌ images column does NOT exist in Product table');
            console.log('➕ Adding images column...');
            
            await connection.query(`
                ALTER TABLE \`Product\` 
                ADD COLUMN \`images\` TEXT NULL COMMENT 'JSON array of image URLs'
            `);
            
            console.log('✅ images column added successfully!');
        }

        // Check if tags.name has unique constraint
        console.log('🔍 Checking if tags.name has unique constraint...');
        const [indexes] = await connection.query(`
            SELECT INDEX_NAME, COLUMN_NAME
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = ?
            AND TABLE_NAME = 'tags'
            AND COLUMN_NAME = 'name'
            AND NON_UNIQUE = 0
        `, [database]);

        if (indexes.length > 0) {
            console.log('✅ tags.name already has unique constraint');
        } else {
            console.log('❌ tags.name does NOT have unique constraint');
            console.log('➕ Adding unique constraint to tags.name...');
            
            try {
                await connection.query(`
                    ALTER TABLE \`tags\` 
                    ADD UNIQUE KEY \`tags_name_key\` (\`name\`)
                `);
                console.log('✅ Unique constraint added to tags.name successfully!');
            } catch (error) {
                if (error.code === 'ER_DUP_KEYNAME') {
                    console.log('⚠️ Unique constraint already exists (different name)');
                } else {
                    throw error;
                }
            }
        }

        await connection.end();
        console.log('✅ Database check completed successfully!');
        console.log('🔄 Please restart your backend server now.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

checkAndAddImagesColumn();

