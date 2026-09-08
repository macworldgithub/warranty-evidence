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
      email: 'admin@booran.com',
      password: process.env['SEED_ADMIN_PASSWORD'] || 'Password123!',
      firstName: 'Sarah',
      lastName: 'Connor',
      role: 'ADMIN',
      fallbackSupabaseId: 'sub-admin-seed-01',
    },
    {
      email: 'abdulahadnauman10@gmail.com',
      password: 'Password123!',
      firstName: 'Abdul',
      lastName: 'Ahad',
      role: 'ADMIN',
      fallbackSupabaseId: 'sub-admin-ahad-01',
    },
    {
      email: 'manager@booran.com',
      password: process.env['SEED_MANAGER_PASSWORD'] || 'Password123!',
      firstName: 'David',
      lastName: 'Park',
      role: 'MANAGER',
      fallbackSupabaseId: 'sub-manager-seed-01',
    },
    {
      email: 'clerk@booran.com',
      password: process.env['SEED_CLERK_PASSWORD'] || 'Password123!',
      firstName: 'Marcus',
      lastName: 'Vance',
      role: 'CLERK',
      fallbackSupabaseId: 'sub-clerk-seed-01',
    },
    {
      email: 'abdulahad.operations@gmail.com',
      password: 'Password123!',
      firstName: 'Abdul',
      lastName: 'Operations',
      role: 'CLERK',
      fallbackSupabaseId: 'sub-clerk-ahad-01',
    },
    {
      email: 'advisor@booran.com',
      password: process.env['SEED_ADVISOR_PASSWORD'] || 'Password123!',
      firstName: 'Elena',
      lastName: 'Rodriguez',
      role: 'ADVISOR',
      fallbackSupabaseId: 'sub-advisor-seed-01',
    },
    {
      email: 'tech@booran.com',
      password: process.env['SEED_TECHNICIAN_PASSWORD'] || 'Password123!',
      firstName: 'James',
      lastName: 'Miller',
      role: 'TECHNICIAN',
      fallbackSupabaseId: 'sub-tech-seed-01',
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
              // Synchronize user_metadata and password in Supabase
              await supabaseAdminClient.auth.admin.updateUserById(existing.id, {
                password: item.password,
                user_metadata: {
                  firstName: item.firstName,
                  lastName: item.lastName,
                  role: item.role,
                },
              });
              console.log(`ℹ️ Supabase user ${item.email} updated with role: ${item.role} (ID: ${supabaseUserId})`);
            }
          } else {
            console.warn(`⚠️ Supabase createUser error for ${item.email}:`, error.message);
          }
        } else if (data.user) {
          supabaseUserId = data.user.id;
          console.log(`✨ Created Supabase user ${item.email} [Role: ${item.role}] (ID: ${supabaseUserId})`);
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

  // ------------------------------------------------------------------------
  // 2. Seed Dealership Sites
  // ------------------------------------------------------------------------
  console.log('\n🏢 Seeding Dealership Sites...');
  const sitesCollection = db.collection('sites');

  const seedSites = [
    {
      code: 'CRANBOURNE',
      name: 'Booran BYD Cranbourne',
      address: {
        street: '215 South Gippsland Hwy',
        suburb: 'Cranbourne',
        state: 'VIC',
        postcode: '3977',
      },
      status: 'ACTIVE',
      brands: ['BYD'],
      phone: '(03) 5996 0000',
      email: 'service.cranbourne@booran.com.au',
    },
    {
      code: 'MELBOURNE',
      name: 'Booran BYD Melbourne City',
      address: {
        street: '450 Elizabeth Street',
        suburb: 'Melbourne',
        state: 'VIC',
        postcode: '3000',
      },
      status: 'ACTIVE',
      brands: ['BYD'],
      phone: '(03) 9320 0000',
      email: 'service.melbourne@booran.com.au',
    },
    {
      code: 'DANDENONG',
      name: 'Booran Motors Dandenong Multi-Franchise',
      address: {
        street: '120 Lonsdale Street',
        suburb: 'Dandenong',
        state: 'VIC',
        postcode: '3175',
      },
      status: 'ACTIVE',
      brands: ['BYD', 'HYUNDAI', 'MG', 'CHERY'],
      phone: '(03) 9794 0000',
      email: 'service.dandenong@booran.com.au',
    },
  ];

  for (const site of seedSites) {
    await sitesCollection.updateOne(
      { code: site.code },
      {
        $set: {
          ...site,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
    console.log(`✅ Upserted Site: ${site.name} (${site.code})`);
  }

  // ------------------------------------------------------------------------
  // 3. Seed Automotive Brands
  // ------------------------------------------------------------------------
  console.log('\n🚘 Seeding Brands...');
  const brandsCollection = db.collection('brands');

  const seedBrands = [
    {
      code: 'BYD',
      name: 'BYD',
      manufacturer: 'BYD Auto Co., Ltd.',
      status: 'ACTIVE',
      applicableSites: ['CRANBOURNE', 'MELBOURNE', 'DANDENONG'],
      activePackVersion: 'v1',
      logoUrl: '/brands/byd.png',
    },
    {
      code: 'HYUNDAI',
      name: 'Hyundai',
      manufacturer: 'Hyundai Motor Company',
      status: 'ACTIVE',
      applicableSites: ['DANDENONG'],
      activePackVersion: 'v1',
      logoUrl: '/brands/hyundai.png',
    },
    {
      code: 'MG',
      name: 'MG Motor',
      manufacturer: 'SAIC Motor UK',
      status: 'ACTIVE',
      applicableSites: ['DANDENONG'],
      activePackVersion: 'v1',
      logoUrl: '/brands/mg.png',
    },
    {
      code: 'CHERY',
      name: 'Chery',
      manufacturer: 'Chery Automobile',
      status: 'ACTIVE',
      applicableSites: ['DANDENONG'],
      activePackVersion: 'v1',
      logoUrl: '/brands/chery.png',
    },
  ];

  const brandDocs: Record<string, any> = {};
  for (const b of seedBrands) {
    const res = await brandsCollection.findOneAndUpdate(
      { code: b.code },
      {
        $set: {
          ...b,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' },
    );
    brandDocs[b.code] = res;
    console.log(`✅ Upserted Brand: ${b.name} (${b.code})`);
  }

  // ------------------------------------------------------------------------
  // 4. Seed Brand Packs (BYD Pack v1 + Common Fallback)
  // ------------------------------------------------------------------------
  console.log('\n📦 Seeding Brand Packs...');
  const packsCollection = db.collection('brand_packs');

  const bydBrandDoc = brandDocs['BYD'];
  if (bydBrandDoc) {
    const bydPackV1 = {
      brandId: bydBrandDoc._id,
      brandCode: 'BYD',
      version: 'v1',
      status: 'PUBLISHED',
      description: 'Official Booran BYD Warranty Evidence Capture Pack v1.0 (Production Seed)',
      applicableSites: ['CRANBOURNE', 'MELBOURNE', 'DANDENONG'],
      vehicleRules: {
        vinRequired: true,
        vinOcrEnabled: true,
        odometerRequired: true,
        frontPhotoRequired: true,
        supportedPowertrains: ['EV', 'PHEV', 'HYBRID', 'ICE'],
        decodeVin: true,
      },
      tier1Items: [
        {
          key: 'VIN_PHOTO',
          title: 'VIN Plate Photo',
          description: 'High-clarity photo of compliance label or windshield VIN',
          required: true,
          mediaType: 'IMAGE',
          minimumCount: 1,
          maximumCount: 2,
          instructions: 'Ensure full 17 alphanumeric characters are sharp and glare-free',
          order: 1,
          qualityRules: { ocrRequired: true },
        },
        {
          key: 'ODOMETER_PHOTO',
          title: 'Odometer Cluster Photo',
          description: 'Instrument cluster illuminated in Ready state displaying current distance',
          required: true,
          mediaType: 'IMAGE',
          minimumCount: 1,
          maximumCount: 1,
          instructions: 'Capture whole cluster with headlights off to avoid digital glare',
          order: 2,
          qualityRules: {},
        },
        {
          key: 'FRONT_OF_CAR',
          title: 'Front-of-Vehicle Overview',
          description: '45-degree angled view showing registration plate and vehicle body',
          required: true,
          mediaType: 'IMAGE',
          minimumCount: 1,
          maximumCount: 2,
          instructions: 'Vehicle must be in workshop bay with license plate clearly readable',
          order: 3,
          qualityRules: {},
        },
        {
          key: 'FAULT_CLOSEUP',
          title: 'Defect Close-up Photo',
          description: 'Macro focus on suspected defect, crack, tear, or leak',
          required: true,
          mediaType: 'IMAGE',
          minimumCount: 1,
          maximumCount: 4,
          instructions: 'Use shop inspection lamp for optimal lighting; avoid finger obstruction',
          order: 4,
          qualityRules: {},
        },
        {
          key: 'FAULT_LOCATION',
          title: 'Fault Location Context Photo',
          description: 'Medium distance photo establishing defect position relative to chassis',
          required: true,
          mediaType: 'IMAGE',
          minimumCount: 1,
          maximumCount: 2,
          instructions: 'Allow OEM claim assessors to identify component location immediately',
          order: 5,
          qualityRules: {},
        },
      ],
      faultTypes: [
        {
          key: 'OIL_LEAK',
          name: 'Oil leaks or seepage',
          description: 'Lubricant or thermal management fluid seepage from powertrain or drive unit',
          tier: 'TIER_2',
          active: true,
          order: 1,
          tier2Items: [
            {
              key: 'LEAK_DRY_REFERENCE',
              title: 'Dry-Area Clean Reference Photo',
              description: 'Adjacent clean / dry surface showing normal boundary',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 2,
              instructions: 'Wipe surrounding dust to demonstrate contrast with fluid trail',
              order: 1,
              qualityRules: {},
            },
            {
              key: 'LEAK_ORIGIN',
              title: 'Suspected Leak Origin Photo',
              description: 'Point of origin (gasket mating surface, shaft seal, or banjo bolt)',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 3,
              instructions: 'Trace highest wet point using chalk mark or technician pointer',
              order: 2,
              qualityRules: {},
            },
            {
              key: 'LEAK_FLUID_EXTENT',
              title: 'Fluid Spread & Surrounding Contamination',
              description: 'Overall extent of fluid spread and any affected wiring / belts',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 2,
              instructions: 'Capture underbody shield staining and drip accumulation',
              order: 3,
              qualityRules: {},
            },
          ],
        },
        {
          key: 'ECU_SENSOR',
          name: 'ECU or sensor internal faults',
          description: 'Electronic control module internal errors, communication drops, or sensor drift',
          tier: 'TIER_2',
          active: true,
          order: 2,
          tier2Items: [
            {
              key: 'CONNECTOR_CONDITION',
              title: 'Harness & Connector Face Inspection',
              description: 'Connector locking tab, seal integrity, and wire strain relief',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 2,
              instructions: 'Inspect for water intrusion, corrosion, or backing out terminals',
              order: 1,
              qualityRules: {},
            },
            {
              key: 'PIN_FACE_CHECK',
              title: 'Pin Terminal Alignment & Terminal Tension',
              description: 'Close-up of header pins showing straightness and gold-plate condition',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 2,
              instructions: 'Check for fretting corrosion or bent pins',
              order: 2,
              qualityRules: {},
            },
            {
              key: 'DTC_FREEZE_FRAME',
              title: 'Diagnostic Freeze Frame / Live Data Screenshot',
              description: 'Scan tool display showing confirmed DTC code and freeze frame parameters',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 3,
              instructions: 'Capture diagnostic software showing vehicle VIN match on top header',
              order: 3,
              qualityRules: {},
            },
          ],
        },
        {
          key: 'SOFTWARE_UPDATE',
          name: 'Software updates or program refreshes',
          description: 'OTA failure, calibration reflash, or VDS software programming requirement',
          tier: 'TIER_2',
          active: true,
          order: 3,
          tier2Items: [
            {
              key: 'SOFTWARE_BEFORE_VERSION',
              title: 'Pre-Flash Software Calibration ID',
              description: 'System software version screen prior to reflash procedure',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 1,
              instructions: 'Take photo of OEM diagnostic tool showing old firmware version string',
              order: 1,
              qualityRules: {},
            },
            {
              key: 'SOFTWARE_AFTER_VERSION',
              title: 'Post-Flash Software Calibration ID',
              description: 'System software version screen after successful flash procedure',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 1,
              instructions: 'Confirm newly flashed calibration matches OEM technical bulletin',
              order: 2,
              qualityRules: {},
            },
            {
              key: 'VDS_CONFIRMATION',
              title: 'VDS Tool Flash Completion Report',
              description: 'Final programming confirmation screen with green pass indicator',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 2,
              instructions: 'Include programming log timestamp and battery maintainer connection',
              order: 3,
              qualityRules: {},
            },
          ],
        },
        {
          key: 'BATTERY_HV',
          name: 'Battery and high-voltage components',
          description: 'Blade battery pack, drive motor, inverter, PDU, or HV harness anomalies',
          tier: 'TIER_2',
          active: true,
          order: 4,
          tier2Items: [
            {
              key: 'HV_ISOLATION_CONFIRMATION',
              title: 'Zero Potential / MSD Switch Isolation Photo',
              description: 'Manual Service Disconnect pulled and locked out, CAT IV multimeter verification',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 2,
              instructions: 'Display calibrated multimeter reading < 10V DC at test terminals',
              order: 1,
              qualityRules: {},
            },
            {
              key: 'HV_PACK_SERIAL',
              title: 'Traction Battery Pack QR / Serial Label',
              description: 'Primary battery enclosure QR label and batch serial number',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 1,
              instructions: 'Ensure barcode and 24-digit pack identifier are readable',
              order: 2,
              qualityRules: { barcodeRequired: true },
            },
            {
              key: 'HV_MODULE_TELEMETRY',
              title: 'Cell Voltage Delta & Temp Log Screenshot',
              description: 'Live diagnostic telemetry showing cell 1..N voltage spread and module temperatures',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 3,
              instructions: 'Record delta mV difference between highest and lowest cell',
              order: 3,
              qualityRules: {},
            },
          ],
        },
        {
          key: 'CHARGING_SYSTEM',
          name: 'Charging system faults',
          description: 'OBC on-board charger, CCID, DC fast charge inlet, or contactor weld failure',
          tier: 'TIER_2',
          active: true,
          order: 5,
          tier2Items: [
            {
              key: 'CHARGE_PORT_INLET',
              title: 'AC / DC Charging Port Pin Inspection',
              description: 'CCS2 charge receptacle showing pins, thermal sensor, and locking solenoid',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 2,
              instructions: 'Inspect for arcing, heat discoloration, or broken latch mechanism',
              order: 1,
              qualityRules: {},
            },
            {
              key: 'CHARGING_SESSION_SCREEN',
              title: 'Dispenser Session Status or Error Display',
              description: 'EVSE charger screen showing fault code or vehicle communication error',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 2,
              instructions: 'Capture vehicle instrument cluster error and wallbox display together',
              order: 2,
              qualityRules: {},
            },
          ],
        },
        {
          key: 'POWERTRAIN_CHASSIS_BODY',
          name: 'Powertrain, chassis or body component faults',
          description: 'Suspension bushes, steering rack, subframe, driveshafts, or body panel misalignment',
          tier: 'TIER_2',
          active: true,
          order: 6,
          tier2Items: [
            {
              key: 'COMPONENT_MOUNTING',
              title: 'Subframe / Mount Bushing Alignment',
              description: 'Chassis mounting bracket, bush play, or torn rubber element',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 2,
              instructions: 'Capture unloaded state and loaded with pry bar tension if showing deflection',
              order: 1,
              qualityRules: {},
            },
            {
              key: 'PART_IDENTIFIER',
              title: 'Installed Component Part Number Stamp',
              description: 'White paint stamp or stamped part number on affected component',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 1,
              instructions: 'Verify OEM revision letter is clearly visible',
              order: 2,
              qualityRules: {},
            },
          ],
        },
        {
          key: 'GENERAL_OTHER',
          name: 'General / other faults',
          description: 'Miscellaneous cabin electronics, audio head unit, trim, or uncategorized warranty defects',
          tier: 'TIER_2',
          active: true,
          order: 7,
          tier2Items: [
            {
              key: 'GENERAL_OVERVIEW',
              title: 'Component Operational Overview',
              description: 'General photo demonstrating failure symptom or cabin cosmetic defect',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 2,
              instructions: 'Capture sufficient context for warranty clerk underwriting review',
              order: 1,
              qualityRules: {},
            },
          ],
        },
      ],
      conditionalRules: [
        {
          id: 'cond-part-replaced',
          name: 'Replaced Component Serial Capture',
          description: 'Required when physical component replacement is claimed to OEM',
          condition: {
            field: 'partBeingReplaced',
            operator: 'EQUALS',
            value: true,
          },
          actions: [
            {
              type: 'REQUIRE_EVIDENCE',
              evidenceKey: 'OLD_PART_SERIAL',
              reason: 'OEM warranty core return & batch tracking requirement',
            },
            {
              type: 'REQUIRE_EVIDENCE',
              evidenceKey: 'NEW_PART_SERIAL',
              reason: 'OEM warranty proof of new genuine parts installation',
            },
          ],
        },
        {
          id: 'cond-noise-fault',
          name: 'Operational Noise Video Recording',
          description: 'Required for audible knocking, squeaks, whines, or operational abnormalities',
          condition: {
            field: 'isNoiseOrOperationalFault',
            operator: 'EQUALS',
            value: true,
          },
          actions: [
            {
              type: 'REQUIRE_EVIDENCE',
              evidenceKey: 'OPERATION_VIDEO',
              reason: 'OEM acoustics audit verification',
            },
          ],
        },
        {
          id: 'cond-diagnostics',
          name: 'Diagnostic Scan Report Requirement',
          description: 'Mandatory when fault generated diagnostic trouble codes',
          condition: {
            field: 'hasDiagnostics',
            operator: 'EQUALS',
            value: true,
          },
          actions: [
            {
              type: 'REQUIRE_EVIDENCE',
              evidenceKey: 'DIAGNOSTIC_REPORT',
              reason: 'OEM electronic fault underwriting proof',
            },
          ],
        },
        {
          id: 'cond-repair-stage-complete',
          name: 'Post-Repair Validation Evidence',
          description: 'Captured when vehicle repair stage is marked Complete',
          condition: {
            field: 'repairStage',
            operator: 'EQUALS',
            value: 'COMPLETE',
          },
          actions: [
            {
              type: 'REQUIRE_EVIDENCE',
              evidenceKey: 'AFTER_REPAIR_EVIDENCE',
              reason: 'OEM proof of rectification and road test sign-off',
            },
          ],
        },
      ],
      namingRules: [
        { evidenceKey: 'VIN_PHOTO', template: '{RO}VIN.{ext}', descriptor: 'VIN' },
        { evidenceKey: 'ODOMETER_PHOTO', template: '{RO}Odo.{ext}', descriptor: 'Odometer' },
        { evidenceKey: 'FRONT_OF_CAR', template: '{RO}FrontOfCar.{ext}', descriptor: 'FrontOfCar' },
        { evidenceKey: 'FAULT_CLOSEUP', template: '{RO}FaultClose.{ext}', descriptor: 'FaultClose' },
        { evidenceKey: 'FAULT_LOCATION', template: '{RO}FaultLocation.{ext}', descriptor: 'FaultLocation' },
        { evidenceKey: 'OLD_PART_SERIAL', template: '{RO}OldPartSerial.{ext}', descriptor: 'OldPartSerial' },
        { evidenceKey: 'NEW_PART_SERIAL', template: '{RO}NewPartSerial.{ext}', descriptor: 'NewPartSerial' },
        { evidenceKey: 'DIAGNOSTIC_REPORT', template: '{RO}DTC.{ext}', descriptor: 'DTC' },
        { evidenceKey: 'OPERATION_VIDEO', template: '{RO}KnockingNoise.{ext}', descriptor: 'NoiseVideo' },
        { evidenceKey: 'BEFORE_REPAIR', template: '{RO}Before.{ext}', descriptor: 'BeforeRepair' },
        { evidenceKey: 'AFTER_REPAIR_EVIDENCE', template: '{RO}After.{ext}', descriptor: 'AfterRepair' },
      ],
      createdBy: 'admin@booran.com',
      publishedBy: 'admin@booran.com',
      publishedAt: new Date(),
      changelog: 'Initial production-ready BYD Warranty Evidence Capture Pack v1.0',
    };

    await packsCollection.updateOne(
      { brandCode: 'BYD', version: 'v1' },
      {
        $set: {
          ...bydPackV1,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
    console.log('✅ Upserted Published Brand Pack: BYD v1');
  }

  // Common Tier 1 fallback pack for non-BYD brands
  const commonBrandDoc = brandDocs['HYUNDAI'] || brandDocs['MG'];
  if (commonBrandDoc) {
    const commonPackV1 = {
      brandId: commonBrandDoc._id,
      brandCode: 'COMMON',
      version: 'v1',
      status: 'PUBLISHED',
      description: 'Standard Common Tier 1 Baseline Evidence Pack for Non-BYD Dealership Rooftops',
      applicableSites: [],
      vehicleRules: {
        vinRequired: true,
        vinOcrEnabled: true,
        odometerRequired: true,
        frontPhotoRequired: true,
        supportedPowertrains: ['ICE', 'HYBRID', 'PHEV', 'EV'],
        decodeVin: true,
      },
      tier1Items: [
        {
          key: 'VIN_PHOTO',
          title: 'VIN Plate Photo',
          description: 'Windshield or door jamb identification plate',
          required: true,
          mediaType: 'IMAGE',
          minimumCount: 1,
          maximumCount: 2,
          instructions: 'Ensure full 17 characters are visible',
          order: 1,
          qualityRules: { ocrRequired: true },
        },
        {
          key: 'ODOMETER_PHOTO',
          title: 'Odometer Cluster Photo',
          description: 'Instrument cluster showing vehicle odometer',
          required: true,
          mediaType: 'IMAGE',
          minimumCount: 1,
          maximumCount: 1,
          instructions: 'Cluster must be powered on',
          order: 2,
          qualityRules: {},
        },
        {
          key: 'FRONT_OF_CAR',
          title: 'Front-of-Vehicle Overview',
          description: 'Overall view of front showing license plate',
          required: true,
          mediaType: 'IMAGE',
          minimumCount: 1,
          maximumCount: 2,
          instructions: 'Vehicle in workshop service bay',
          order: 3,
          qualityRules: {},
        },
        {
          key: 'FAULT_CLOSEUP',
          title: 'Defect Close-up Photo',
          description: 'Close-up of defect area',
          required: true,
          mediaType: 'IMAGE',
          minimumCount: 1,
          maximumCount: 4,
          instructions: 'Focus closely on component fault',
          order: 4,
          qualityRules: {},
        },
      ],
      faultTypes: [
        {
          key: 'GENERAL_DEFECT',
          name: 'General Mechanical or Electrical Defect',
          description: 'Generic warranty fault category for baseline claims',
          tier: 'TIER_2',
          active: true,
          order: 1,
          tier2Items: [
            {
              key: 'FAULT_DETAIL',
              title: 'Detailed Inspection Photo',
              description: 'Technician evidence illustrating failure symptom',
              required: true,
              mediaType: 'IMAGE',
              minimumCount: 1,
              maximumCount: 2,
              instructions: 'Clear shot of defective area',
              order: 1,
              qualityRules: {},
            },
          ],
        },
      ],
      conditionalRules: [],
      namingRules: [
        { evidenceKey: 'VIN_PHOTO', template: '{RO}VIN.{ext}', descriptor: 'VIN' },
        { evidenceKey: 'ODOMETER_PHOTO', template: '{RO}Odo.{ext}', descriptor: 'Odometer' },
        { evidenceKey: 'FRONT_OF_CAR', template: '{RO}Front.{ext}', descriptor: 'FrontOfCar' },
        { evidenceKey: 'FAULT_CLOSEUP', template: '{RO}Fault.{ext}', descriptor: 'FaultClose' },
      ],
      createdBy: 'admin@booran.com',
      publishedBy: 'admin@booran.com',
      publishedAt: new Date(),
      changelog: 'Baseline Common Tier 1 Pack',
    };

    await packsCollection.updateOne(
      { brandCode: 'COMMON', version: 'v1' },
      {
        $set: {
          ...commonPackV1,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
    console.log('✅ Upserted Published Brand Pack: COMMON v1');
  }

  console.log('🎉 Seed completed successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
