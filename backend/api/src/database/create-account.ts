import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';

async function createAccount() {
  // Parse command line arguments or use defaults
  // e.g.: node --env-file=.env dist/database/create-account.js email=... password=... role=... firstName=... lastName=...
  const args = process.argv.slice(2);
  const getArg = (key: string, defaultVal: string) => {
    const match = args.find((a) => a.startsWith(`--${key}=`) || a.startsWith(`${key}=`));
    return match ? match.split('=')[1] : defaultVal;
  };

  const email = getArg('email', 'abdulahadnauman10@gmail.com').trim().toLowerCase();
  const password = getArg('password', 'Password123!');
  const roleInput = getArg('role', 'ADMIN').toUpperCase();
  const role = roleInput === 'OPERATIONS' ? 'OPERATIONS' : 'ADMIN';
  const firstName = getArg('firstName', 'Abdul');
  const lastName = getArg('lastName', 'Ahad');

  const mongoUri = process.env['MONGODB_URI'];
  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('   Booran Account Creation Tool         ');
  console.log('========================================');
  console.log(`👤 Target Email:  ${email}`);
  console.log(`🛡️ Assigned Role: ${role}`);
  console.log(`🏷️ Name:          ${firstName} ${lastName}`);

  let supabaseUserId = `sub-${Date.now()}`;

  if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('<project-ref>')) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      console.log('\n🔐 Connecting to Supabase Auth Admin API...');
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          firstName,
          lastName,
          role,
        },
      });

      if (error) {
        if (error.message.includes('already exists') || error.message.includes('registered')) {
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existing = listData?.users.find((u) => u.email?.toLowerCase() === email);
          if (existing) {
            supabaseUserId = existing.id;
            console.log(`ℹ️ Supabase user already exists with ID: ${supabaseUserId}`);
            // Also update password if provided
            await supabaseAdmin.auth.admin.updateUserById(existing.id, {
              password,
              user_metadata: { firstName, lastName, role },
            });
            console.log(`🔑 Updated password and metadata in Supabase.`);
          }
        } else {
          console.error(`❌ Supabase error: ${error.message}`);
          process.exit(1);
        }
      } else if (data.user) {
        supabaseUserId = data.user.id;
        console.log(`✨ Supabase Auth user created successfully! UID: ${supabaseUserId}`);
      }
    } catch (err) {
      console.error('❌ Supabase client initialization failed:', err);
      process.exit(1);
    }
  } else {
    console.warn('⚠️ Supabase credentials not found; using fallback local ID.');
  }

  // Connect to MongoDB and upsert application user
  console.log('\n📦 Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  const usersCollection = db.collection('users');
  const result = await usersCollection.findOneAndUpdate(
    { email },
    {
      $set: {
        supabaseUserId,
        email,
        firstName,
        lastName,
        role,
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' },
  );

  console.log(`✅ MongoDB User record created/updated successfully!`);
  console.log(`   • ID:             ${result?._id}`);
  console.log(`   • Email:          ${result?.email}`);
  console.log(`   • Role:           ${result?.role}`);
  console.log(`   • Supabase UID:   ${result?.supabaseUserId}`);
  console.log(`   • Status:         ${result?.status}`);

  console.log('\n========================================');
  console.log('  🎉 Account Ready for Login!           ');
  console.log('========================================\n');

  await mongoose.disconnect();
}

createAccount().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
