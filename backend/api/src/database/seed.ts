import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';

async function seed() {
  const mongoUri = process.env['MONGODB_URI'];
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not defined in environment.');
    process.exit(1);
  }

  console.log('📦 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB.');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }
  const usersCollection = db.collection('users');

  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  let supabaseAdminClient: ReturnType<typeof createClient> | null = null;

  if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('<project-ref>')) {
    try {
      supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      console.log('🔐 Connected to Supabase Admin API.');
    } catch (err) {
      console.warn('⚠️ Could not initialize Supabase Admin client:', (err as Error).message);
    }
  }

  const seedUsers = [
    {
      email: process.env['SEED_ADMIN_EMAIL'] || 'admin@booran.com',
      password: process.env['SEED_ADMIN_PASSWORD'] || 'Password123!',
      firstName: 'Sarah',
      lastName: 'Connor',
      role: 'ADMIN',
      fallbackSupabaseId: 'sub-admin-seed-01',
    },
    {
      email: process.env['SEED_OPERATIONS_EMAIL'] || 'ops@booran.com',
      password: process.env['SEED_OPERATIONS_PASSWORD'] || 'Password123!',
      firstName: 'Marcus',
      lastName: 'Vance',
      role: 'OPERATIONS',
      fallbackSupabaseId: 'sub-ops-seed-01',
    },
  ];

  for (const item of seedUsers) {
    let supabaseUserId = item.fallbackSupabaseId;

    if (supabaseAdminClient) {
      try {
        const { data, error } = await supabaseAdminClient.auth.admin.createUser({
          email: item.email,
          password: item.password,
          email_confirm: true,
          user_metadata: {
            firstName: item.firstName,
            lastName: item.lastName,
            role: item.role,
          },
        });

        if (error) {
          if (error.message.includes('already exists') || error.message.includes('registered')) {
            const { data: listData } = await supabaseAdminClient.auth.admin.listUsers();
            const existing = listData?.users.find((u) => u.email?.toLowerCase() === item.email.toLowerCase());
            if (existing) {
              supabaseUserId = existing.id;
              console.log(`ℹ️ Supabase user ${item.email} already exists (ID: ${supabaseUserId})`);
            }
          } else {
            console.warn(`⚠️ Supabase createUser error for ${item.email}:`, error.message);
          }
        } else if (data.user) {
          supabaseUserId = data.user.id;
          console.log(`✨ Created Supabase user ${item.email} (ID: ${supabaseUserId})`);
        }
      } catch (err) {
        console.warn(`⚠️ Supabase admin call failed for ${item.email}:`, (err as Error).message);
      }
    }

    // Upsert into MongoDB
    await usersCollection.updateOne(
      { email: item.email.toLowerCase() },
      {
        $set: {
          supabaseUserId,
          email: item.email.toLowerCase(),
          firstName: item.firstName,
          lastName: item.lastName,
          role: item.role,
          status: 'ACTIVE',
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    console.log(`✅ Upserted MongoDB application user: ${item.email} [Role: ${item.role}]`);
  }

  console.log('🎉 Seed completed successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
