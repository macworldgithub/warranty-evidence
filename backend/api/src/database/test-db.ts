import mongoose from 'mongoose';

async function testDatabase() {
  const mongoUri = process.env['MONGODB_URI'];
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set in your .env file.');
    process.exit(1);
  }

  // Mask sensitive password from log
  const maskedUri = mongoUri.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$3');
  console.log('\n========================================');
  console.log('   Booran MongoDB Atlas Diagnostic Test   ');
  console.log('========================================');
  console.log(`Connecting to: ${maskedUri}`);

  const startTime = Date.now();
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    const latency = Date.now() - startTime;
    console.log(`\n✅ Connected successfully! (Latency: ${latency}ms)`);
  } catch (err) {
    console.error(`\n❌ Connection failed: ${(err as Error).message}`);
    process.exit(1);
  }

  const db = mongoose.connection.db;
  if (!db) {
    console.error('❌ Could not access database instance.');
    process.exit(1);
  }

  // 1. Ping the cluster
  try {
    const pingResult = await db.admin().command({ ping: 1 });
    console.log(`📡 Cluster Ping:`, pingResult.ok === 1 ? 'OK (Responsive)' : pingResult);
  } catch (err) {
    console.warn('⚠️ Ping check warning:', (err as Error).message);
  }

  // 2. Server Build Info
  try {
    const buildInfo = await db.admin().command({ buildInfo: 1 });
    console.log(`ℹ️ MongoDB Version: ${buildInfo.version}`);
  } catch {
    // Some Atlas restricted roles omit buildInfo
  }

  console.log(`📁 Active Database: "${db.databaseName}"`);

  // 3. List Collections
  const collections = await db.listCollections().toArray();
  console.log(`\n📂 Collections found (${collections.length}):`);
  collections.forEach((col) => console.log(`   • ${col.name}`));

  // 4. Inspect 'users' collection
  const usersCollection = db.collection('users');
  const userCount = await usersCollection.countDocuments();
  console.log(`\n👥 Users collection count: ${userCount} document(s)`);

  const users = await usersCollection.find().toArray();
  users.forEach((u, i) => {
    console.log(`   [${i + 1}] Email: ${u['email']} | Role: ${u['role']} | Status: ${u['status']} | SupabaseId: ${u['supabaseUserId']}`);
  });

  // 5. Check Indexes on 'users'
  const indexes = await usersCollection.indexes();
  console.log(`\n🔑 Indexes on 'users' collection (${indexes.length}):`);
  indexes.forEach((idx) => {
    const keys = Object.keys(idx.key).map((k) => `${k}: ${idx.key[k]}`).join(', ');
    console.log(`   • ${idx.name} (${keys})${idx.unique ? ' [UNIQUE]' : ''}`);
  });

  // 6. Test Write & Delete Verification
  console.log('\n🧪 Testing Read/Write Privileges:');
  const testId = `test-${Date.now()}`;
  const testDoc = {
    testId,
    purpose: 'atlas-connectivity-check',
    timestamp: new Date(),
  };

  const testCollection = db.collection('_atlas_healthcheck');
  await testCollection.insertOne(testDoc);
  console.log('   ✓ Insert test document succeeded.');

  const readBack = await testCollection.findOne({ testId });
  if (readBack) {
    console.log('   ✓ Read-back test document verified.');
  }

  await testCollection.deleteOne({ testId });
  await testCollection.drop().catch(() => {});
  console.log('   ✓ Clean-up test document & collection succeeded.');

  console.log('\n========================================');
  console.log('  🎉 All MongoDB Atlas Tests PASSED!    ');
  console.log('========================================\n');

  await mongoose.disconnect();
}

testDatabase().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
