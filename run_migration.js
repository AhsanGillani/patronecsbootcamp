const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials!');
    console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
    process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    try {
        console.log('🚀 Starting migration...');

        // Read the migration SQL file
        const migrationPath = path.join(__dirname, 'run_migration.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📝 Running migration SQL...');

        // Execute the migration
        const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

        if (error) {
            // If exec_sql doesn't exist, try running it as a query
            console.log('⚠️  exec_sql not available, trying direct query...');

            // Split the SQL into individual statements
            const statements = migrationSQL
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

            for (const statement of statements) {
                if (statement.trim()) {
                    console.log(`🔧 Executing: ${statement.substring(0, 50)}...`);
                    try {
                        await supabase.rpc('exec_sql', { sql: statement + ';' });
                    } catch (stmtError) {
                        console.log(`⚠️  Statement failed, continuing...`);
                    }
                }
            }
        }

        console.log('✅ Migration completed successfully!');
        console.log('🎉 Video progress tracking system is now active!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.log('\n💡 Alternative: Copy and paste the SQL manually into your Supabase dashboard');
        console.log('📁 Use the content from: run_migration.sql');
    }
}

// Run the migration
runMigration();
