// Centralized local fallback/offline mock dataset and dynamic calculation engine.
// This ensures that all components read from the same source of truth when running offline.

class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  nextInt(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  choose<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }
}

export const MOCK_PLATFORMS = [
  { 
    _id: 'p1', 
    name: 'Netflix', 
    logo: '/assets/logos/netflix.png', 
    status: 'active', 
    themeColor: '#E50914',
    description: 'Unlimited movies, TV shows, and mobile games. Stream in Ultra HD quality with Spatial Audio.',
    plans: [
      { name: 'Premium', pricingMonthly: 19.99, pricingYearly: 199.99 }
    ]
  },
  { 
    _id: 'p2', 
    name: 'Amazon Prime Video', 
    logo: '/assets/logos/prime.png', 
    status: 'active', 
    themeColor: '#00A8E1',
    description: 'Watch popular movies and TV shows, including award-winning Amazon Originals with X-Ray analytics.',
    plans: [
      { name: 'Monthly Plan', pricingMonthly: 14.99, pricingYearly: 139.99 }
    ]
  },
  { 
    _id: 'p3', 
    name: 'Disney+ Hotstar', 
    logo: '/assets/logos/hotstar.png', 
    status: 'active', 
    themeColor: '#0A2240',
    description: 'Stream live sports, exclusive Hotstar Specials, Disney favorites, Pixar, Marvel, Star Wars and National Geographic.',
    plans: [
      { name: 'Premium', pricingMonthly: 12.99, pricingYearly: 99.99 }
    ]
  },
  { 
    _id: 'p4', 
    name: 'Sony LIV', 
    logo: '/assets/logos/sonyliv.png', 
    status: 'active', 
    themeColor: '#FFD700',
    description: 'High-octane live sporting events, international shows, original web series, and blockbuster movies.',
    plans: [
      { name: 'LIV Premium', pricingMonthly: 4.99, pricingYearly: 29.99 }
    ]
  },
  { 
    _id: 'p5', 
    name: 'Zee5', 
    logo: '/assets/logos/zee5.png', 
    status: 'active', 
    themeColor: '#8230C6',
    description: 'Largest collection of regional Indian films, original shows, and live TV channels across 12 languages.',
    plans: [
      { name: 'Premium HD', pricingMonthly: 5.99, pricingYearly: 39.99 }
    ]
  },
  { 
    _id: 'p6', 
    name: 'Viki Rakuten', 
    logo: '/assets/logos/viki.png', 
    status: 'active', 
    themeColor: '#0A98F7',
    description: 'Best Asian entertainment, including K-dramas, C-dramas, J-dramas, variety shows, and award-winning movies.',
    plans: [
      { name: 'Viki Pass Standard', pricingMonthly: 4.99, pricingYearly: 49.99 }
    ]
  },
  { 
    _id: 'p7', 
    name: 'iQIYI', 
    logo: '/assets/logos/iqiyi.png', 
    status: 'active', 
    themeColor: '#00C234',
    description: 'Top-tier Asian movies, TV series, dramas, and high-quality anime with multi-language subtitles.',
    plans: [
      { name: 'Standard', pricingMonthly: 5.99, pricingYearly: 59.99 }
    ]
  },
  { 
    _id: 'p8', 
    name: 'Crunchyroll', 
    logo: '/assets/logos/crunchyroll.png', 
    status: 'active', 
    themeColor: '#F47521',
    description: 'World\'s largest library of anime, streaming episodes next-day with multi-language dubs and offline viewing.',
    plans: [
      { name: 'Mega Fan Plan', pricingMonthly: 9.99, pricingYearly: 99.99 }
    ]
  }
];

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White'];
const planNames = ['Basic', 'Standard', 'Premium', 'Super', 'Mega Pass', 'VIP Plan'];

const BASE_DATE_MS = new Date('2026-05-23T14:00:00.000Z').getTime();

const generateMockDataset = () => {
  const rng = new SeededRandom(42); // fixed seed
  const users: any[] = [];
  
  // User 1 is John Doe
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
      isCancelled: false,
      startDate: new Date(BASE_DATE_MS - 18 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(BASE_DATE_MS + 12 * 24 * 60 * 60 * 1000).toISOString(),
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
      isCancelled: false,
      startDate: new Date(BASE_DATE_MS - 28 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(BASE_DATE_MS + 2 * 24 * 60 * 60 * 1000).toISOString(),
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
      isCancelled: true,
      cancellationDate: new Date(BASE_DATE_MS - 5 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date(BASE_DATE_MS - 35 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(BASE_DATE_MS - 5 * 24 * 60 * 60 * 1000).toISOString(),
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
      isCancelled: false,
      startDate: new Date(BASE_DATE_MS - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(BASE_DATE_MS + 25 * 24 * 60 * 60 * 1000).toISOString(),
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
    joinedDate: new Date(BASE_DATE_MS - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(BASE_DATE_MS - 3600000).toISOString(),
    subscriptions: johnDoeSubs,
    subscriptionCount: johnDoeSubs.length
  });

  for (let i = 2; i <= 45; i++) {
    const fName = rng.choose(firstNames);
    const lName = rng.choose(lastNames);
    const name = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${rng.nextInt(10, 99)}@example.com`;
    
    const subsCount = rng.nextInt(1, 5);
    const userSubs: any[] = [];
    const usedPlatforms = new Set<string>();
    
    for (let j = 0; j < subsCount; j++) {
      const platform = rng.choose(MOCK_PLATFORMS);
      if (usedPlatforms.has(platform._id)) continue;
      usedPlatforms.add(platform._id);
      
      const plan = rng.choose(planNames);
      const status = rng.choose(['active', 'active', 'active', 'cancelled', 'expired']);
      const isPremiumSub = plan.toLowerCase().includes('premium') || plan.toLowerCase().includes('mega') || rng.next() > 0.6;
      const renewalCount = rng.nextInt(0, 12);
      const autoRenewal = rng.next() > 0.4;
      
      const startDate = new Date(BASE_DATE_MS);
      startDate.setMonth(startDate.getMonth() - rng.nextInt(1, 5));
      
      let expiryDate = new Date(BASE_DATE_MS);
      if (status === 'active') {
        expiryDate.setDate(expiryDate.getDate() + rng.nextInt(5, 30));
      } else {
        expiryDate.setDate(expiryDate.getDate() - rng.nextInt(1, 20));
      }
      
      const isCancelled = status === 'cancelled';
      const cancellationDate = isCancelled ? expiryDate.toISOString() : undefined;
      
      userSubs.push({
        _id: `sub_${i}_${j}`,
        ottPlatformId: platform._id,
        platformName: platform.name,
        planName: plan,
        isPremium: isPremiumSub,
        renewalCount,
        renewalType: autoRenewal ? 'auto' : 'manual',
        status,
        isCancelled,
        cancellationDate,
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
      const isActive = s.isCancelled === false || (s.cancellationDate && new Date(s.cancellationDate).getTime() > BASE_DATE_MS);
      if (isActive) {
        const activeDays = Math.max(0, Math.ceil((BASE_DATE_MS - new Date(s.startDate).getTime()) / (1000 * 60 * 60 * 24)));
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
      isPremium: userSubs.some(s => {
        const isActive = s.isCancelled === false || (s.cancellationDate && new Date(s.cancellationDate).getTime() > BASE_DATE_MS);
        return isActive && s.isPremium;
      }),
      favoriteOTT,
      totalRenewals,
      isActive: rng.next() > 0.08,
      joinedDate: new Date(BASE_DATE_MS - rng.nextInt(10, 180) * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(BASE_DATE_MS - rng.nextInt(0, 10) * 24 * 60 * 60 * 1000).toISOString(),
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
      isCancelled: false,
      startDate: new Date(BASE_DATE_MS - 60 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(BASE_DATE_MS + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
      isCancelled: false,
      startDate: new Date(BASE_DATE_MS - 45 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(BASE_DATE_MS + 15 * 24 * 60 * 60 * 1000).toISOString(),
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
      isCancelled: false,
      startDate: new Date(BASE_DATE_MS - 30 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(BASE_DATE_MS + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
      isCancelled: false,
      startDate: new Date(BASE_DATE_MS - 15 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(BASE_DATE_MS + 15 * 24 * 60 * 60 * 1000).toISOString(),
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
      isCancelled: false,
      startDate: new Date(BASE_DATE_MS - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(BASE_DATE_MS + 20 * 24 * 60 * 60 * 1000).toISOString(),
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
      isCancelled: true,
      cancellationDate: new Date(BASE_DATE_MS - 10 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date(BASE_DATE_MS - 90 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(BASE_DATE_MS - 10 * 24 * 60 * 60 * 1000).toISOString(),
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
    joinedDate: new Date(BASE_DATE_MS - 60 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(BASE_DATE_MS - 15 * 60 * 1000).toISOString(),
    subscriptions: alexMercerSubs,
    subscriptionCount: alexMercerSubs.length
  });
  
  return users;
};

export const MOCK_USERS = generateMockDataset();

const isSubscriptionActive = (s: any) => {
  const start = new Date(s.startDate).getTime();
  const expiry = new Date(s.expiryDate).getTime();
  const isCancelled = s.cancelled === true || s.isCancelled === true || s.status === 'cancelled';
  const cancellationTime = s.cancellationDate ? new Date(s.cancellationDate).getTime() : expiry;
  
  return start <= BASE_DATE_MS && expiry >= BASE_DATE_MS && (!isCancelled || cancellationTime >= BASE_DATE_MS);
};

export const calculateFallbackStats = (users: any[]) => {
  const getSubPlatformName = (s: any) => {
    if (s.platformName) return s.platformName;
    if (s.ottPlatformId) {
      if (typeof s.ottPlatformId === 'object') {
        return s.ottPlatformId.name || 'Unknown';
      }
      const platformDoc = MOCK_PLATFORMS.find(p => p._id === s.ottPlatformId);
      if (platformDoc) return platformDoc.name;
    }
    return 'Unknown';
  };

  const allSubs: any[] = [];
  users.forEach(u => {
    if (u.subscriptions) {
      u.subscriptions.forEach((s: any) => {
        const rawPlatformName = getSubPlatformName(s);
        const pName = rawPlatformName === 'Unknown' ? 'Netflix' : rawPlatformName;
        const subActiveDays = Math.max(0, Math.ceil((BASE_DATE_MS - new Date(s.startDate).getTime()) / (1000 * 60 * 60 * 24)));
        const cancelled = s.isCancelled === true || s.status === 'cancelled';
        
        allSubs.push({
          ...s,
          platformName: pName,
          status: s.status || 'active',
          startDate: s.startDate,
          renewalCount: s.renewalCount || 0,
          activeDays: subActiveDays,
          premiumTier: s.planName || 'Standard',
          cancelled: cancelled,
          userId: u._id
        });
      });
    }
  });

  const totalUsers = users.length;
  const totalPlatforms = MOCK_PLATFORMS.length;
  const totalSubscriptions = allSubs.length;
  
  const activeSubscriptions = allSubs.filter(s => isSubscriptionActive(s)).length;
  const cancelledSubscriptions = allSubs.filter(s => s.cancelled).length;
  const expiredSubscriptions = allSubs.filter(s => !isSubscriptionActive(s) && !s.cancelled).length;
  
  const cancellationRate = totalSubscriptions > 0 
    ? Math.round((cancelledSubscriptions / totalSubscriptions) * 100)
    : 0;
     
  const cancellationTrend = -1.2;
  
  // Find most cancelled platform
  const platformCancels: Record<string, number> = {};
  allSubs.filter(s => s.cancelled).forEach(s => {
    platformCancels[s.platformName] = (platformCancels[s.platformName] || 0) + 1;
  });
  let mostCancelledPlatform = 'None';
  let maxCancels = -1;
  Object.keys(platformCancels).forEach(pName => {
    if (platformCancels[pName] > maxCancels) {
      maxCancels = platformCancels[pName];
      mostCancelledPlatform = pName;
    }
  });
  
  // Premium User Percentage
  const premiumSubscriptionsCount = allSubs.filter(s => s.isPremium && isSubscriptionActive(s)).length;
  const premiumUserPercent = totalSubscriptions > 0
    ? Math.round((premiumSubscriptionsCount / totalSubscriptions) * 100)
    : 0;
     
  // Platform with highest premium subscribers
  const platformPremiums: Record<string, number> = {};
  allSubs.filter(s => s.isPremium && isSubscriptionActive(s)).forEach(s => {
    platformPremiums[s.platformName] = (platformPremiums[s.platformName] || 0) + 1;
  });
  let highestPremiumPlatform = 'None';
  let maxPremiums = -1;
  Object.keys(platformPremiums).forEach(pName => {
    if (platformPremiums[pName] > maxPremiums) {
      maxPremiums = platformPremiums[pName];
      highestPremiumPlatform = pName;
    }
  });
  
  // Platform stats
  const platformStats: Record<string, { subscribers: number, recentCount: number }> = {};
  MOCK_PLATFORMS.forEach(p => {
    platformStats[p.name] = { subscribers: 0, recentCount: 0 };
  });
  
  allSubs.forEach(s => {
    if (isSubscriptionActive(s)) {
      if (!platformStats[s.platformName]) {
        platformStats[s.platformName] = { subscribers: 0, recentCount: 0 };
      }
      platformStats[s.platformName].subscribers++;
      const startDateMs = new Date(s.startDate).getTime();
      if (BASE_DATE_MS - startDateMs <= 30 * 24 * 60 * 60 * 1000) {
        platformStats[s.platformName].recentCount++;
      }
    }
  });
  
  const platformList = Object.keys(platformStats).map(pName => ({
    name: pName,
    ...platformStats[pName]
  })).sort((a, b) => b.subscribers - a.subscribers);
  
  const topPlatformBySubs = platformList.length > 0 ? platformList[0].name : 'None';
  const topPlatformSubsCount = platformList.length > 0 ? platformList[0].subscribers : 0;
  
  // Calculate longest continuous subscriber across all active subscriptions (Requirement 9)
  let longestContinuousSubscriber = { platformName: 'None', activeDays: 0, userName: 'None' };
  let minStart = Infinity;
  allSubs.forEach(s => {
    if (isSubscriptionActive(s)) {
      const startTime = new Date(s.startDate).getTime();
      if (startTime < minStart) {
        minStart = startTime;
        const user = users.find(u => u._id.toString() === s.userId.toString());
        longestContinuousSubscriber = {
          platformName: s.platformName,
          activeDays: s.activeDays,
          userName: user ? user.name : 'Unknown'
        };
      }
    }
  });
  
  let fastestGrowingPlatform = 'None';
  let fastestGrowingRate = 0;
  platformList.forEach(p => {
    const growth = p.subscribers > 0 ? Math.round((p.recentCount / p.subscribers) * 100) : 0;
    if (growth > fastestGrowingRate) {
      fastestGrowingRate = growth;
      fastestGrowingPlatform = p.name;
    }
  });
  if (fastestGrowingRate === 0 && platformList.length > 0) {
    fastestGrowingPlatform = platformList[0].name;
    fastestGrowingRate = 12;
  }
  
  const leadingPlatformDoc = MOCK_PLATFORMS.find(p => p.name === topPlatformBySubs);
  let leadingPlatform = null;
  if (leadingPlatformDoc) {
    const statsForLeading = platformStats[topPlatformBySubs];
    const growth = statsForLeading ? (statsForLeading.subscribers > 0 ? Math.round((statsForLeading.recentCount / statsForLeading.subscribers) * 100) : 15) : 15;
    leadingPlatform = {
      name: leadingPlatformDoc.name,
      logo: leadingPlatformDoc.logo,
      subscribers: topPlatformSubsCount,
      growth: growth,
      subsContribution: activeSubscriptions > 0 ? Math.round((topPlatformSubsCount / activeSubscriptions) * 100) : 0
    };
  }
  
  const pieData = platformList
    .filter(p => p.subscribers > 0)
    .map(p => ({
      name: p.name,
      value: p.subscribers
    }));
     
  const monthNames = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const barData: any[] = [];
  const areaData: any[] = [];
  
  // Let's generate the last 6 months chronologically (oldest to newest)
  for (let i = 5; i >= 0; i--) {
    const d = new Date(BASE_DATE_MS);
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    
    const startOfMonth = new Date(year, monthIndex, 1);
    const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
    
    const monthLabel = monthNames[5 - i] || d.toLocaleDateString('en-US', { month: 'short' });
    const monthData: any = { name: monthLabel };
    
    let activeCount = 0;
    
    MOCK_PLATFORMS.forEach(p => {
      // Find active subscriptions during this month for this platform
      const platformSubs = allSubs.filter(s => s.platformName === p.name);
      
      const activeSubsThisMonth = platformSubs.filter(s => {
        const start = new Date(s.startDate).getTime();
        const expiry = new Date(s.expiryDate).getTime();
        const isCancelled = s.cancelled;
        const cancellationTime = s.cancellationDate ? new Date(s.cancellationDate).getTime() : expiry;
        
        return start <= endOfMonth.getTime() && 
               expiry >= startOfMonth.getTime() && 
               (!isCancelled || cancellationTime >= startOfMonth.getTime());
      });
      
      const gainedSubsThisMonth = platformSubs.filter(s => {
        const start = new Date(s.startDate).getTime();
        return start >= startOfMonth.getTime() && start <= endOfMonth.getTime();
      });
      
      const lostSubsThisMonth = platformSubs.filter(s => {
        const cancellationTime = s.cancellationDate ? new Date(s.cancellationDate).getTime() : new Date(s.expiryDate).getTime();
        return s.cancelled && cancellationTime >= startOfMonth.getTime() && cancellationTime <= endOfMonth.getTime();
      });
      
      monthData[p.name] = activeSubsThisMonth.length;
      monthData[`${p.name}_gained`] = gainedSubsThisMonth.length;
      monthData[`${p.name}_lost`] = lostSubsThisMonth.length;
      
      activeCount += activeSubsThisMonth.length;
    });
    
    barData.push(monthData);
    areaData.push({
      name: monthLabel,
      active: activeCount
    });
  }
  
  // Map active days and renewals dynamically for each user based on earliest subscription start date (Requirement 8)
  const usersWithEngagement = users.map(u => {
    let earliestDate: number | null = null;
    let activeCount = 0;
    let totalRenewals = 0;
    
    const userSubs = allSubs.filter(s => s.userId.toString() === u._id.toString());
    
    userSubs.forEach((s: any) => {
      if (isSubscriptionActive(s)) {
        activeCount++;
      }
      totalRenewals += s.renewalCount || 0;
      
      const sDate = new Date(s.startDate).getTime();
      if (!earliestDate || sDate < earliestDate) {
        earliestDate = sDate;
      }
    });

    const activeDays = earliestDate 
      ? Math.max(0, Math.ceil((BASE_DATE_MS - earliestDate) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      ...u,
      activeSubscriptionsCount: activeCount,
      activeSubscriptionDays: activeDays,
      totalRenewals: totalRenewals,
      subscriptionCount: userSubs.length
    };
  });

  const sortedUsers = [...usersWithEngagement].sort((a, b) => {
    if (b.activeSubscriptionDays !== a.activeSubscriptionDays) {
      return b.activeSubscriptionDays - a.activeSubscriptionDays;
    }
    if (b.totalRenewals !== a.totalRenewals) {
      return b.totalRenewals - a.totalRenewals;
    }
    return b.subscriptionCount - a.subscriptionCount;
  });

  const mostActiveUsers = sortedUsers.slice(0, 5).map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    subscriptionCount: u.subscriptionCount,
    activeSubscriptionsCount: u.activeSubscriptionsCount,
    activeSubscriptionDays: u.activeSubscriptionDays,
    totalRenewals: u.totalRenewals,
    favoriteOTT: u.favoriteOTT,
    isPremium: u.isPremium
  }));
     
  const subscriptionRenewals = allSubs.filter(s => isSubscriptionActive(s) && s.autoRenewal).length;
  
  return {
    totalUsers,
    totalPlatforms,
    totalSubscriptions,
    activeSubscriptions,
    expiredSubscriptions,
    cancelledSubscriptions,
    cancellationRate,
    cancellationTrend,
    mostCancelledPlatform,
    premiumUserPercent,
    premiumUsersPercent: premiumUserPercent,
    premiumSubscriptionsCount,
    highestPremiumPlatform,
    topPlatformBySubs,
    longestContinuousSubscriber,
    fastestGrowingPlatform,
    fastestGrowingRate,
    leadingPlatform,
    barData,
    pieData,
    areaData,
    mostActiveUsers,
    subscriptionRenewals
  };
};

export const getFallbackEnrichedPlatforms = (users: any[]) => {
  const allSubs: any[] = [];
  users.forEach(u => {
    if (u.subscriptions) {
      u.subscriptions.forEach((s: any) => {
        allSubs.push(s);
      });
    }
  });
  
  return MOCK_PLATFORMS.map(platform => {
    const platformSubs = allSubs.filter(s => s.platformName === platform.name);
    const activeSubs = platformSubs.filter(s => isSubscriptionActive(s));
    const cancelledSubs = platformSubs.filter(s => s.isCancelled === true);
    const premiumSubs = platformSubs.filter(s => s.isPremium && isSubscriptionActive(s));
    
    const activeCount = activeSubs.length;
    const totalCount = platformSubs.length;
    
    const cancellationPercentage = totalCount > 0
      ? Math.round((cancelledSubs.length / totalCount) * 100)
      : 0;
       
    const isTrending = ['Netflix', 'Amazon Prime Video', 'Disney+ Hotstar'].includes(platform.name) && activeCount > 5;
    
    return {
      ...platform,
      subscribers: activeCount,
      activeUsers: activeCount,
      cancellationPercentage,
      premiumSubscribers: premiumSubs.length,
      isTrending
    };
  });
};
