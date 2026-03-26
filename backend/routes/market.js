const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Mock market prices - in production integrate with data.gov.in API or Agmarknet
const CROP_PRICES = {
  grains: [
    { crop: 'Wheat (गेहूं)', variety: 'HD-3086', price: 2275, unit: 'quintal', change: +25, trend: 'up', msp: 2275 },
    { crop: 'Rice/Paddy (धान)', variety: 'PR-126', price: 2183, unit: 'quintal', change: -15, trend: 'down', msp: 2183 },
    { crop: 'Maize (मक्का)', variety: 'Local', price: 2090, unit: 'quintal', change: +10, trend: 'up', msp: 1962 },
    { crop: 'Barley (जौ)', variety: 'Mixed', price: 1735, unit: 'quintal', change: 0, trend: 'stable', msp: 1635 },
    { crop: 'Jowar (ज्वार)', variety: 'Hybrid', price: 3180, unit: 'quintal', change: +45, trend: 'up', msp: 3180 },
    { crop: 'Bajra (बाजरा)', variety: 'HHB-67', price: 2625, unit: 'quintal', change: +30, trend: 'up', msp: 2500 },
  ],
  pulses: [
    { crop: 'Chana/Gram (चना)', variety: 'Desi', price: 5440, unit: 'quintal', change: +120, trend: 'up', msp: 5440 },
    { crop: 'Arhar Dal (अरहर)', variety: 'Mixed', price: 7000, unit: 'quintal', change: +200, trend: 'up', msp: 7000 },
    { crop: 'Moong Dal (मूंग)', variety: 'SML-668', price: 8558, unit: 'quintal', change: -100, trend: 'down', msp: 8558 },
    { crop: 'Urad Dal (उड़द)', variety: 'T-9', price: 7400, unit: 'quintal', change: +50, trend: 'up', msp: 7400 },
    { crop: 'Masoor (मसूर)', variety: 'K-75', price: 6425, unit: 'quintal', change: +75, trend: 'up', msp: 6425 },
  ],
  oilseeds: [
    { crop: 'Mustard (सरसों)', variety: 'RH-749', price: 5650, unit: 'quintal', change: +80, trend: 'up', msp: 5650 },
    { crop: 'Groundnut (मूंगफली)', variety: 'GJG-31', price: 6377, unit: 'quintal', change: -50, trend: 'down', msp: 6377 },
    { crop: 'Soybean (सोयाबीन)', variety: 'JS-335', price: 4892, unit: 'quintal', change: +30, trend: 'up', msp: 4892 },
    { crop: 'Sunflower (सूरजमुखी)', variety: 'KBSH-44', price: 6760, unit: 'quintal', change: +40, trend: 'up', msp: 6760 },
    { crop: 'Sesame (तिल)', variety: 'RT-346', price: 8635, unit: 'quintal', change: -120, trend: 'down', msp: 8635 },
  ],
  vegetables: [
    { crop: 'Onion (प्याज)', variety: 'Local', price: 1800, unit: 'quintal', change: -200, trend: 'down', msp: null },
    { crop: 'Potato (आलू)', variety: 'Kufri Jyoti', price: 1200, unit: 'quintal', change: +100, trend: 'up', msp: null },
    { crop: 'Tomato (टमाटर)', variety: 'Hybrid', price: 3500, unit: 'quintal', change: +500, trend: 'up', msp: null },
    { crop: 'Garlic (लहसुन)', variety: 'Yamuna Safed', price: 12000, unit: 'quintal', change: -500, trend: 'down', msp: null },
    { crop: 'Ginger (अदरक)', variety: 'Local', price: 8000, unit: 'quintal', change: +300, trend: 'up', msp: null },
    { crop: 'Cabbage (पत्तागोभी)', variety: 'Golden Acre', price: 800, unit: 'quintal', change: -100, trend: 'down', msp: null },
  ],
  cotton_sugarcane: [
    { crop: 'Cotton (कपास) - Medium', variety: 'Bt Hybrid', price: 6620, unit: 'quintal', change: +100, trend: 'up', msp: 6620 },
    { crop: 'Cotton (कपास) - Long', variety: 'Bt Hybrid', price: 7020, unit: 'quintal', change: +120, trend: 'up', msp: 7020 },
    { crop: 'Sugarcane (गन्ना)', variety: 'Co-86032', price: 340, unit: 'quintal', change: +10, trend: 'up', msp: 340 },
    { crop: 'Jute (जूट)', variety: 'JRO-8432', price: 5050, unit: 'quintal', change: +50, trend: 'up', msp: 5050 },
  ]
};

// Get market prices
router.get('/', authenticate, (req, res) => {
  try {
    const { category, state } = req.query;
    const userState = state || req.user.state || 'All India';

    let prices;
    if (category && CROP_PRICES[category]) {
      prices = { [category]: CROP_PRICES[category] };
    } else {
      prices = CROP_PRICES;
    }

    // Market tips
    const tips = [
      { icon: '📊', text: 'Prices updated daily from mandis. Check before selling.' },
      { icon: '📱', text: 'Use eNAM app to sell directly to buyers at better prices.' },
      { icon: '💡', text: 'Store crops safely when prices are low, sell when prices rise.' },
      { icon: '🤝', text: 'Form FPOs (Farmer Producer Organizations) for better bargaining.' }
    ];

    res.json({
      state: userState,
      lastUpdated: new Date().toISOString(),
      prices,
      tips,
      disclaimer: 'Prices are indicative. Actual prices may vary by mandi and quality. Check local mandi for exact rates.'
    });
  } catch (err) {
    console.error('Market prices error:', err);
    res.status(500).json({ error: 'Failed to fetch market prices.' });
  }
});

// Get price trend for specific crop
router.get('/trend/:cropName', authenticate, (req, res) => {
  try {
    const { cropName } = req.params;
    
    // Generate mock 30-day trend data
    const trend = [];
    let basePrice = 2500;
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      basePrice += (Math.random() - 0.48) * 100;
      trend.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(basePrice)
      });
    }

    res.json({ crop: cropName, trend, unit: 'quintal' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get price trend.' });
  }
});

// Government schemes
router.get('/schemes', authenticate, (req, res) => {
  const schemes = [
    {
      id: 1,
      name: 'PM-KISAN',
      fullName: 'Pradhan Mantri Kisan Samman Nidhi',
      benefit: '₹6,000/year in 3 installments',
      eligibility: 'All small & marginal farmers with cultivable land',
      howToApply: 'Visit pmkisan.gov.in or nearest CSC center',
      helpline: '155261',
      icon: '💰'
    },
    {
      id: 2,
      name: 'PMFBY',
      fullName: 'Pradhan Mantri Fasal Bima Yojana',
      benefit: 'Crop insurance at 2% premium for Kharif, 1.5% for Rabi',
      eligibility: 'All farmers with loanee and non-loanee',
      howToApply: 'Apply through bank, CSC, or pmfby.gov.in',
      helpline: '1800-200-7710',
      icon: '🛡️'
    },
    {
      id: 3,
      name: 'KCC',
      fullName: 'Kisan Credit Card',
      benefit: 'Credit up to ₹3 lakh at 4% interest rate',
      eligibility: 'All farmers, sharecroppers, tenant farmers',
      howToApply: 'Apply at nearest bank branch with land documents',
      helpline: '1800-180-1551',
      icon: '💳'
    },
    {
      id: 4,
      name: 'Soil Health Card',
      fullName: 'Soil Health Card Scheme',
      benefit: 'Free soil testing and fertilizer recommendations',
      eligibility: 'All farmers',
      howToApply: 'Contact local agriculture department or KVK',
      helpline: '1551',
      icon: '🧪'
    },
    {
      id: 5,
      name: 'eNAM',
      fullName: 'National Agriculture Market',
      benefit: 'Online trading platform for better crop prices',
      eligibility: 'All farmers and traders',
      howToApply: 'Register at enam.gov.in or through mandi',
      helpline: '1800-270-0224',
      icon: '🛒'
    },
    {
      id: 6,
      name: 'PKVY',
      fullName: 'Paramparagat Krishi Vikas Yojana',
      benefit: '₹50,000/hectare for organic farming over 3 years',
      eligibility: 'Farmers willing to adopt organic farming in groups',
      howToApply: 'Contact district agriculture officer',
      helpline: '011-23382477',
      icon: '🌱'
    }
  ];

  res.json({ schemes });
});

module.exports = router;
