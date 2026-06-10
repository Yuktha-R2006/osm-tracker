const fs = require('fs');
const path = require('path');

// Let's read fallbackData.ts, convert TypeScript to simple ES5/CommonJS and run it!
const content = fs.readFileSync(path.join(__dirname, '../frontend/src/services/fallbackData.ts'), 'utf8');

// We can just extract the MOCK_PLATFORMS, SeededRandom, generateMockDataset, calculateFallbackStats
// and run it using a clean environment!
// To do this simply, let's implement the same logic in a pure JS file.

class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  choose(arr) {
    return arr[this.nextInt(0, arr.length - 1)];
  }
}

const MOCK_PLATFORMS = [
  { _id: 'p1', name: 'Netflix', logo: '/assets/logos/netflix.png', status: 'active', themeColor: '#E50914' },
  { _id: 'p2', name: 'Amazon Prime Video', logo: '/assets/logos/prime.png', status: 'active', themeColor: '#00A8E1' },
  { _id: 'p3', name: 'Disney+ Hotstar', logo: '/assets/logos/hotstar.png', status: 'active', themeColor: '#0A2240' },
  { _id: 'p4', name: 'Sony LIV', logo: '/assets/logos/sonyliv.png', status: 'active', themeColor: '#FFD700' },
  { _id: 'p5', name: 'Zee5', logo: '/assets/logos/zee5.png', status: 'active', themeColor: '#8230C6' },
  { _id: 'p6', name: 'Viki Rakuten', logo: '/assets/logos/viki.png', status: 'active', themeColor: '#0A98F7' },
  { _id: 'p7', name: 'iQIYI', logo: '/assets/logos/iqiyi.png', status: 'active', themeColor: '#00C234' },
  { _id: 'p8', name: 'Crunchyroll', logo: '/assets/logos/crunchyroll.png', status: 'active', themeColor: '#F47521' }
];

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White'];
const planNames = ['Basic', 'Standard', 'Premium', 'Super', 'Mega Pass', 'VIP Plan'];

const generateMockDataset = () => {
  const rng = new SeededRandom(42); // fixed seed
  const users = [];
  
  // User 1 John Doe
  const johnDoeSubs = [
    {
      _id: 'sub_john_1',
      ottPlatformId: 'p1',
      platformName: 'Netflix',
      planName: 'Standard',
      isPremium: false,
      renewalCount: 1,
      renewalType: 'auto',
      status: 'active',
      startDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionCost: 15.49,
      autoRenewal: true
    },
    {
      _id: 'sub_john_2',
      ottPlatformId: 'p2',
      platformName: 'Amazon Prime Video',
      planName: 'Monthly Plan',
      isPremium: true,
      renewalCount: 2,
      renewalType: 'manual',
      status: 'active',
      startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionCost: 14.99,
      autoRenewal: false
    },
    {
      _id: 'sub_john_3',
      ottPlatformId: 'p3',
      platformName: 'Disney+ Hotstar',
      planName: 'Premium',
      isPremium: true,
      renewalCount: 3,
      renewalType: 'manual',
      status: 'cancelled',
      startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionCost: 12.99,
      autoRenewal: false
    },
    {
      _id: 'sub_john_4',
      ottPlatformId: 'p8',
      platformName: 'Crunchyroll',
      planName: 'Mega Fan Plan',
      isPremium: true,
      renewalCount: 0,
      renewalType: 'auto',
      status: 'active',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionCost: 9.99,
      autoRenewal: true
    }
  ];

  users.push({
    _id: 'john_doe_id',
    numericId: 1,
    name: 'John Doe',
    email: 'user@osm.com',
    role: 'user',
    isPremium: true,
    favoriteOTT: 'Amazon Prime Video',
    totalRenewals: 6,
    isActive: true,
    joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    subscriptions: johnDoeSubs,
    subscriptionCount: johnDoeSubs.length
  });

  for (let i = 2; i <= 46; i++) {
    const fName = rng.choose(firstNames);
    const lName = rng.choose(lastNames);
    const name = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${rng.nextInt(10, 99)}@example.com`;
    
    const subsCount = rng.nextInt(1, 5);
    const userSubs = [];
    const usedPlatforms = new Set();
    
    for (let j = 0; j < subsCount; j++) {
      const platform = rng.choose(MOCK_PLATFORMS);
      if (usedPlatforms.has(platform._id)) continue;
      usedPlatforms.add(platform._id);
      
      const plan = rng.choose(planNames);
      const status = rng.choose(['active', 'active', 'active', 'cancelled', 'expired']);
      const isPremiumSub = plan.toLowerCase().includes('premium') || plan.toLowerCase().includes('mega') || rng.next() > 0.6;
      const renewalCount = rng.nextInt(0, 12);
      const autoRenewal = rng.next() > 0.4;
      
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - rng.nextInt(1, 5));
      
      let expiryDate = new Date();
      if (status === 'active') {
        expiryDate.setDate(expiryDate.getDate() + rng.nextInt(5, 30));
      } else {
        expiryDate.setDate(expiryDate.getDate() - rng.nextInt(1, 20));
      }
      
      userSubs.push({
        _id: `sub_${i}_${j}`,
        ottPlatformId: platform._id,
        platformName: platform.name,
        planName: plan,
        isPremium: isPremiumSub,
        renewalCount,
        renewalType: autoRenewal ? 'auto' : 'manual',
        status,
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        subscriptionCost: rng.nextInt(4, 19) + 0.99,
        autoRenewal
      });
    }
    
    const totalRenewals = userSubs.reduce((acc, s) => acc + s.renewalCount, 0);
    
    // Calculate favorite platform based on active subscription duration
    let favoriteOTT = 'None';
    let maxActiveDays = -1;
    userSubs.forEach(s => {
      if (s.status === 'active') {
        const activeDays = Math.max(0, Math.ceil((Date.now() - new Date(s.startDate).getTime()) / (1000 * 60 * 60 * 24)));
        if (activeDays > maxActiveDays) {
          maxActiveDays = activeDays;
          favoriteOTT = s.platformName;
        }
      }
    });
    if (favoriteOTT === 'None' && userSubs.length > 0) {
      favoriteOTT = userSubs[0].platformName;
    }
    
    users.push({
      _id: `user_${i}`,
      numericId: i,
      name: name,
      email: email,
      role: 'user',
      isPremium: userSubs.some(s => s.status === 'active' && s.isPremium),
      favoriteOTT,
      totalRenewals,
      isActive: rng.next() > 0.08,
      joinedDate: new Date(Date.now() - rng.nextInt(10, 180) * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(Date.now() - rng.nextInt(0, 10) * 24 * 60 * 60 * 1000).toISOString(),
      subscriptions: userSubs,
      subscriptionCount: userSubs.length
    });
  }

  // Featured Demo User: Alex Mercer
  const alexMercerSubs = [
    {
      _id: 'sub_alex_1',
      ottPlatformId: 'p1',
      platformName: 'Netflix',
      planName: 'Premium',
      isPremium: true,
      renewalCount: 2,
      renewalType: 'auto',
      status: 'active',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionCost: 19.99,
      autoRenewal: true
    },
    {
      _id: 'sub_alex_2',
      ottPlatformId: 'p2',
      platformName: 'Amazon Prime Video',
      planName: 'Monthly Plan',
      isPremium: true,
      renewalCount: 1,
      renewalType: 'manual',
      status: 'active',
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionCost: 14.99,
      autoRenewal: false
    },
    {
      _id: 'sub_alex_3',
      ottPlatformId: 'p3',
      platformName: 'Disney+ Hotstar',
      planName: 'Super',
      isPremium: true,
      renewalCount: 1,
      renewalType: 'auto',
      status: 'active',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionCost: 8.99,
      autoRenewal: true
    },
    {
      _id: 'sub_alex_4',
      ottPlatformId: 'p8',
      platformName: 'Crunchyroll',
      planName: 'Mega Fan Plan',
      isPremium: true,
      renewalCount: 0,
      renewalType: 'auto',
      status: 'active',
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionCost: 9.99,
      autoRenewal: true
    },
    {
      _id: 'sub_alex_5',
      ottPlatformId: 'p4',
      platformName: 'Sony LIV',
      planName: 'LIV Premium',
      isPremium: true,
      renewalCount: 0,
      renewalType: 'manual',
      status: 'active',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionCost: 4.99,
      autoRenewal: false
    },
    {
      _id: 'sub_alex_6',
      ottPlatformId: 'p7',
      platformName: 'iQIYI',
      planName: 'Standard',
      isPremium: false,
      renewalCount: 3,
      renewalType: 'manual',
      status: 'cancelled',
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionCost: 5.99,
      autoRenewal: false
    }
  ];

  users.push({
    _id: 'alex_mercer_id',
    numericId: 47,
    name: 'Alex Mercer',
    email: 'demo@osm.com',
    role: 'user',
    isPremium: true,
    favoriteOTT: 'Netflix',
    totalRenewals: 7,
    isActive: true,
    joinedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    subscriptions: alexMercerSubs,
    subscriptionCount: alexMercerSubs.length
  });
  
  return users;
};

const calculateFallbackStats = (users) => {
  const mockUsersOnly = users.filter(u => u.numericId >= 2 && u.numericId <= 46);
  const allSubs = [];
  mockUsersOnly.forEach(u => {
    u.subscriptions.forEach((s) => {
      allSubs.push({ ...s, userId: u._id });
    });
  });
  
  const totalUsers = mockUsersOnly.length;
  const totalSubscriptions = allSubs.length;
  const activeSubscriptions = allSubs.filter(s => s.status === 'active').length;
  
  let longestContinuousSubscriber = { platformName: 'None', activeDays: 0, userName: 'None' };
  let maxActiveDays = 0;
  allSubs.forEach(s => {
    if (s.status === 'active') {
      const days = Math.max(0, Math.ceil((Date.now() - new Date(s.startDate).getTime()) / (1000 * 60 * 60 * 24)));
      if (days > maxActiveDays) {
        maxActiveDays = days;
        const user = mockUsersOnly.find(u => u.subscriptions.some((us) => us._id === s._id));
        longestContinuousSubscriber = {
          platformName: s.platformName,
          activeDays: days,
          userName: user ? user.name : 'Unknown'
        };
      }
    }
  });

  const usersWithEngagement = mockUsersOnly.map(u => {
    let maxDays = 0;
    let activeCount = 0;
    u.subscriptions.forEach((s) => {
      if (s.status === 'active') {
        activeCount++;
        const days = Math.max(0, Math.ceil((Date.now() - new Date(s.startDate).getTime()) / (1000 * 60 * 60 * 24)));
        if (days > maxDays) {
          maxDays = days;
        }
      }
    });
    return {
      ...u,
      activeSubscriptionsCount: activeCount,
      activeSubscriptionDays: maxDays
    };
  });

  const sortedUsers = [...usersWithEngagement].sort((a, b) => {
    if (b.activeSubscriptionsCount !== a.activeSubscriptionsCount) {
      return b.activeSubscriptionsCount - a.activeSubscriptionsCount;
    }
    if (b.activeSubscriptionDays !== a.activeSubscriptionDays) {
      return b.activeSubscriptionDays - a.activeSubscriptionDays;
    }
    return (b.totalRenewals || 0) - (a.totalRenewals || 0);
  });

  const mostActiveUsers = sortedUsers.slice(0, 5).map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    subscriptionCount: u.subscriptions.length,
    activeSubscriptionsCount: u.activeSubscriptionsCount,
    activeSubscriptionDays: u.activeSubscriptionDays,
    totalRenewals: u.totalRenewals || 0,
    favoriteOTT: u.favoriteOTT,
    isPremium: u.isPremium
  }));

  console.log('longestContinuousSubscriber:', longestContinuousSubscriber);
  console.log('mostActiveUsers:', mostActiveUsers[0]);
};

calculateFallbackStats(generateMockDataset());
