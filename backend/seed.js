require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/UserModel');
const Platform = require('./models/PlatformModel');
const Subscription = require('./models/SubscriptionModel');
const connectDB = require('./config/db');

const BASE_DATE_MS = new Date('2026-05-23T14:00:00.000Z').getTime();

const platformsData = [
  {
    name: 'Netflix',
    logo: '/assets/logos/netflix.png',
    status: 'active',
    accentColor: '#E50914',
    description: 'Unlimited movies, TV shows, and mobile games. Stream in Ultra HD quality with Spatial Audio.',
    monthlyPrice: 15.49,
    plans: [
      { name: 'Basic', pricingMonthly: 9.99, pricingYearly: 99.99 },
      { name: 'Standard', pricingMonthly: 15.49, pricingYearly: 154.99 },
      { name: 'Premium', pricingMonthly: 19.99, pricingYearly: 199.99 }
    ]
  },
  {
    name: 'Amazon Prime Video',
    logo: '/assets/logos/prime.png',
    status: 'active',
    accentColor: '#00A8E1',
    description: 'Watch popular movies and TV shows, including award-winning Amazon Originals with X-Ray analytics.',
    monthlyPrice: 14.99,
    plans: [
      { name: 'Monthly Plan', pricingMonthly: 14.99, pricingYearly: 139.99 }
    ]
  },
  {
    name: 'Disney+ Hotstar',
    logo: '/assets/logos/hotstar.png',
    status: 'active',
    accentColor: '#0A2240',
    description: 'Stream live sports, exclusive Hotstar Specials, Disney favorites, Pixar, Marvel, Star Wars and National Geographic.',
    monthlyPrice: 12.99,
    plans: [
      { name: 'Super', pricingMonthly: 8.99, pricingYearly: 49.99 },
      { name: 'Premium', pricingMonthly: 12.99, pricingYearly: 99.99 }
    ]
  },
  {
    name: 'Sony LIV',
    logo: '/assets/logos/sonyliv.png',
    status: 'active',
    accentColor: '#FFD700',
    description: 'High-octane live sporting events, international shows, original web series, and blockbuster movies.',
    monthlyPrice: 4.99,
    plans: [
      { name: 'LIV Premium', pricingMonthly: 4.99, pricingYearly: 29.99 }
    ]
  },
  {
    name: 'Zee5',
    logo: '/assets/logos/zee5.png',
    status: 'active',
    accentColor: '#8230C6',
    description: 'Largest collection of regional Indian films, original shows, and live TV channels across 12 languages.',
    monthlyPrice: 5.99,
    plans: [
      { name: 'Premium HD', pricingMonthly: 5.99, pricingYearly: 39.99 }
    ]
  },
  {
    name: 'Viki Rakuten',
    logo: '/assets/logos/viki.png',
    status: 'active',
    accentColor: '#0A98F7',
    description: 'Best Asian entertainment, including K-dramas, C-dramas, J-dramas, variety shows, and award-winning movies.',
    monthlyPrice: 4.99,
    plans: [
      { name: 'Viki Pass Standard', pricingMonthly: 4.99, pricingYearly: 49.99 },
      { name: 'Viki Pass Plus', pricingMonthly: 9.99, pricingYearly: 99.99 }
    ]
  },
  {
    name: 'iQIYI',
    logo: '/assets/logos/iqiyi.png',
    status: 'active',
    accentColor: '#00C234',
    description: 'Top-tier Asian movies, TV series, dramas, and high-quality anime with multi-language subtitles.',
    monthlyPrice: 5.99,
    plans: [
      { name: 'Standard', pricingMonthly: 5.99, pricingYearly: 59.99 },
      { name: 'Premium', pricingMonthly: 8.99, pricingYearly: 89.99 }
    ]
  },
  {
    name: 'Crunchyroll',
    logo: '/assets/logos/crunchyroll.png',
    status: 'active',
    accentColor: '#F47521',
    description: 'World\'s largest library of anime, streaming episodes next-day with multi-language dubs and offline viewing.',
    monthlyPrice: 9.99,
    plans: [
      { name: 'Fan Plan', pricingMonthly: 7.99, pricingYearly: 79.99 },
      { name: 'Mega Fan Plan', pricingMonthly: 9.99, pricingYearly: 99.99 }
    ]
  }
];

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Platform popularity weights
const platformWeights = {
  'Netflix': 0.90,
  'Amazon Prime Video': 0.75,
  'Disney+ Hotstar': 0.60,
  'Crunchyroll': 0.40,
  'Sony LIV': 0.35,
  'Zee5': 0.30,
  'Viki Rakuten': 0.25,
  'iQIYI': 0.20
};

const isPlanPremium = (platformName, planName) => {
  const pName = planName.toLowerCase();
  if (pName.includes('premium') || pName.includes('plus') || pName.includes('mega') || pName.includes('super')) {
    return true;
  }
  if (platformName === 'Amazon Prime Video' || platformName === 'Sony LIV' || platformName === 'Zee5') {
    return true;
  }
  return false;
};

const seedData = async () => {
  try {
    const connStr = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(connStr);
    console.log('MongoDB Connected via Seeder');

    await User.deleteMany();
    await Platform.deleteMany();
    await Subscription.deleteMany();

    console.log('Existing collections cleared');

    // 1. Create Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('admin123', salt);
    await User.create({
      name: 'System Admin',
      email: 'admin@osm.com',
      password: hashedAdminPassword,
      role: 'admin',
      avatar: '',
      membershipType: 'premium',
      activeDays: 0,
      renewalCount: 0,
      preferredPlatform: 'Netflix',
      darkMode: true
    });
    console.log('Admin user seeded (admin@osm.com / admin123)');

    // 2. Create Platform Documents
    const platforms = await Platform.insertMany(platformsData);
    console.log('OTT Platforms seeded');

    const netflix = platforms.find(p => p.name === 'Netflix');
    const prime = platforms.find(p => p.name === 'Amazon Prime Video');
    const hotstar = platforms.find(p => p.name === 'Disney+ Hotstar');
    const crunchyroll = platforms.find(p => p.name === 'Crunchyroll');
    const sonyLiv = platforms.find(p => p.name === 'Sony LIV');
    const iqiyi = platforms.find(p => p.name === 'iQIYI');

    // 3. Create Presenter User: Alex Mercer
    const hashedDemoPassword = await bcrypt.hash('password123', salt);
    const alexMercer = await User.create({
      numericId: 1,
      name: 'Alex Mercer',
      email: 'demo@osm.com',
      password: hashedDemoPassword,
      role: 'user',
      avatar: '',
      membershipType: 'premium',
      activeDays: 90,
      renewalCount: 7,
      preferredPlatform: 'Netflix',
      darkMode: true,
      joinedDate: new Date(BASE_DATE_MS - 90 * 24 * 60 * 60 * 1000),
      lastActive: new Date(BASE_DATE_MS - 15 * 60 * 1000)
    });

    // Subscriptions for Alex Mercer
    // A. Netflix Premium (Active, Premium)
    await Subscription.create({
      userId: alexMercer._id,
      platformId: netflix._id,
      subscriptionType: 'Premium',
      isPremium: true,
      status: 'active',
      renewalCount: 2,
      activeDays: 60,
      startDate: new Date(BASE_DATE_MS - 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(BASE_DATE_MS + 30 * 24 * 60 * 60 * 1000),
      cancelled: false,
      autoRenew: true,
      subscriptionCost: 19.99,
      renewalType: 'auto'
    });

    // B. Amazon Prime Video (Active, Premium)
    await Subscription.create({
      userId: alexMercer._id,
      platformId: prime._id,
      subscriptionType: 'Monthly Plan',
      isPremium: true,
      status: 'active',
      renewalCount: 1,
      activeDays: 45,
      startDate: new Date(BASE_DATE_MS - 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(BASE_DATE_MS + 15 * 24 * 60 * 60 * 1000),
      cancelled: false,
      autoRenew: false,
      subscriptionCost: 14.99,
      renewalType: 'manual'
    });

    // C. Disney+ Hotstar (Active, Premium)
    await Subscription.create({
      userId: alexMercer._id,
      platformId: hotstar._id,
      subscriptionType: 'Super',
      isPremium: true,
      status: 'active',
      renewalCount: 1,
      activeDays: 30,
      startDate: new Date(BASE_DATE_MS - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(BASE_DATE_MS + 30 * 24 * 60 * 60 * 1000),
      cancelled: false,
      autoRenew: true,
      subscriptionCost: 8.99,
      renewalType: 'auto'
    });

    // D. Crunchyroll (Active, Premium)
    await Subscription.create({
      userId: alexMercer._id,
      platformId: crunchyroll._id,
      subscriptionType: 'Mega Fan Plan',
      isPremium: true,
      status: 'active',
      renewalCount: 0,
      activeDays: 15,
      startDate: new Date(BASE_DATE_MS - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(BASE_DATE_MS + 15 * 24 * 60 * 60 * 1000),
      cancelled: false,
      autoRenew: true,
      subscriptionCost: 9.99,
      renewalType: 'auto'
    });

    // E. Sony LIV (Active, Premium)
    await Subscription.create({
      userId: alexMercer._id,
      platformId: sonyLiv._id,
      subscriptionType: 'LIV Premium',
      isPremium: true,
      status: 'active',
      renewalCount: 0,
      activeDays: 10,
      startDate: new Date(BASE_DATE_MS - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(BASE_DATE_MS + 20 * 24 * 60 * 60 * 1000),
      cancelled: false,
      autoRenew: false,
      subscriptionCost: 4.99,
      renewalType: 'manual'
    });

    // F. iQIYI Standard (Cancelled)
    await Subscription.create({
      userId: alexMercer._id,
      platformId: iqiyi._id,
      subscriptionType: 'Standard',
      isPremium: false,
      status: 'cancelled',
      renewalCount: 3,
      activeDays: 80,
      startDate: new Date(BASE_DATE_MS - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(BASE_DATE_MS - 10 * 24 * 60 * 60 * 1000),
      cancelled: true,
      cancellationDate: new Date(BASE_DATE_MS - 10 * 24 * 60 * 60 * 1000),
      autoRenew: false,
      subscriptionCost: 5.99,
      renewalType: 'manual'
    });

    console.log('Presenter Alex Mercer seeded successfully');

    // 4. Create 45 Mock Users (making exactly 46 standard users in total)
    const mockUsersCount = 45;
    const usersData = [];

    for (let i = 0; i < mockUsersCount; i++) {
      const fName = getRandomElement(firstNames);
      const lName = getRandomElement(lastNames);
      const name = `${fName} ${lName}`;
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${getRandomInt(10, 99)}@example.com`;
      const isPremium = Math.random() > 0.4;
      
      const joinedMonthsAgo = getRandomInt(0, 5);
      const joinedDaysAgo = getRandomInt(0, 28);
      const joinedDate = new Date(BASE_DATE_MS);
      joinedDate.setMonth(joinedDate.getMonth() - joinedMonthsAgo);
      joinedDate.setDate(joinedDate.getDate() - joinedDaysAgo);

      const lastActiveDaysAgo = getRandomInt(0, 30);
      const lastActive = new Date(BASE_DATE_MS);
      lastActive.setDate(lastActive.getDate() - lastActiveDaysAgo);

      usersData.push({
        numericId: i + 2,
        name,
        email,
        password: hashedDemoPassword,
        role: 'user',
        avatar: '',
        membershipType: isPremium ? 'premium' : 'standard',
        preferredPlatform: 'None',
        renewalCount: 0,
        activeDays: 0,
        darkMode: true,
        joinedDate,
        lastActive,
        isActive: Math.random() > 0.08
      });
    }

    const seededUsers = await User.insertMany(usersData);
    console.log(`${seededUsers.length} mock users created`);

    // Create subscriptions for the mock users
    let totalSubsCount = 6; // starting with Mercer's 6 subs

    for (const user of seededUsers) {
      const distRand = Math.random() * 100;
      let subsCount = 1;
      if (distRand < 15) {
        subsCount = 1;
      } else if (distRand < 40) {
        subsCount = getRandomInt(2, 3);
      } else if (distRand < 80) {
        subsCount = getRandomInt(4, 5);
      } else {
        subsCount = getRandomInt(6, 8);
      }

      const shuffledPlatforms = [...platforms].sort(() => 0.5 - Math.random());
      const selectedPlatforms = [];

      for (const p of shuffledPlatforms) {
        if (selectedPlatforms.length >= subsCount) break;
        const prob = platformWeights[p.name] || 0.3;
        if (Math.random() < prob || selectedPlatforms.length === 0) {
          selectedPlatforms.push(p);
        }
      }

      for (const p of shuffledPlatforms) {
        if (selectedPlatforms.length >= subsCount) break;
        if (!selectedPlatforms.find(sp => sp._id.toString() === p._id.toString())) {
          selectedPlatforms.push(p);
        }
      }

      let userRenewals = 0;
      let maxActiveDuration = -1;
      let favoriteOTT = 'None';
      let earliestStartDate = null;

      for (const platform of selectedPlatforms) {
        const plan = getRandomElement(platform.plans);
        const status = getRandomElement(['active', 'active', 'active', 'active', 'expired', 'cancelled']);
        
        const msBetween = BASE_DATE_MS - new Date(user.joinedDate).getTime();
        const startDate = new Date(new Date(user.joinedDate).getTime() + Math.random() * msBetween);
        
        if (!earliestStartDate || startDate < earliestStartDate) {
          earliestStartDate = startDate;
        }

        let endDate;
        let cancelled = false;
        let cancellationDate = null;

        if (status === 'active') {
          endDate = new Date(BASE_DATE_MS + getRandomInt(5, 35) * 24 * 60 * 60 * 1000);
        } else {
          const msAfterStart = BASE_DATE_MS - startDate.getTime();
          endDate = new Date(startDate.getTime() + Math.random() * msAfterStart);
          
          if (status === 'cancelled') {
            cancelled = true;
            cancellationDate = endDate;
          }
        }

        const cost = plan.pricingMonthly;
        const isPremiumSub = isPlanPremium(platform.name, plan.name);
        const renewalCount = getRandomInt(0, 12);
        const autoRenew = Math.random() > 0.4;

        const subActiveDays = Math.max(0, Math.ceil((BASE_DATE_MS - startDate.getTime()) / (1000 * 60 * 60 * 24)));

        await Subscription.create({
          userId: user._id,
          platformId: platform._id,
          subscriptionType: plan.name,
          isPremium: isPremiumSub,
          status,
          renewalCount,
          activeDays: subActiveDays,
          startDate,
          endDate,
          cancelled,
          cancellationDate,
          autoRenew,
          subscriptionCost: cost,
          renewalType: autoRenew ? 'auto' : 'manual'
        });

        userRenewals += renewalCount;

        if (status === 'active') {
          if (subActiveDays > maxActiveDuration) {
            maxActiveDuration = subActiveDays;
            favoriteOTT = platform.name;
          }
        }
        totalSubsCount++;
      }

      if (favoriteOTT === 'None' && selectedPlatforms.length > 0) {
        favoriteOTT = selectedPlatforms[0].name;
      }

      // Calculate active days from earliest startDate to BASE_DATE_MS
      const userActiveDays = earliestStartDate 
        ? Math.max(0, Math.ceil((BASE_DATE_MS - earliestStartDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      user.preferredPlatform = favoriteOTT;
      user.renewalCount = userRenewals;
      user.activeDays = userActiveDays;
      await user.save();
    }

    // 5. Update OTT platform aggregated metrics in Platform model based on live subscriptions
    for (const platform of platforms) {
      const activeCount = await Subscription.countDocuments({ platformId: platform._id, status: 'active' });
      const cancelledCount = await Subscription.countDocuments({ platformId: platform._id, status: 'cancelled' });
      const totalCount = await Subscription.countDocuments({ platformId: platform._id });
      const premiumCount = await Subscription.countDocuments({ platformId: platform._id, isPremium: true, status: 'active' });

      platform.activeSubscribers = activeCount;
      platform.premiumUsers = premiumCount;
      platform.cancellationRate = totalCount > 0 ? Math.round((cancelledCount / totalCount) * 100) : 0;
      await platform.save();
    }

    console.log(`${totalSubsCount} mock subscriptions created`);
    console.log(`Exactly ${seededUsers.length + 1} users in standard pool (total standard/presenter accounts).`);
    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
