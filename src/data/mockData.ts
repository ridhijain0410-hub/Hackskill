import { ReminderItem, UnderstandSample, ScamRule } from '../types';

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'Blood Pressure Medicine',
    time: '08:30 AM',
    period: 'morning',
    category: 'medicine',
    details: 'Take 1 tablet of Telmisartan 40mg after breakfast with water.',
    dosage: '1 Tablet (Telmisartan 40mg)',
    completed: true,
    urgent: true,
  },
  {
    id: 'rem-2',
    title: 'Drink a Warm Glass of Water',
    time: '09:15 AM',
    period: 'morning',
    category: 'routine',
    details: 'Stay hydrated! Warm water with a slice of lemon if you like.',
    completed: false,
  },
  {
    id: 'rem-3',
    title: 'Call Daughter Sunita',
    time: '11:30 AM',
    period: 'morning',
    category: 'call',
    details: 'Sunday family catch-up and check how little Aarav is doing at school.',
    doctorOrContact: 'Sunita (Daughter)',
    completed: false,
  },
  {
    id: 'rem-4',
    title: 'Afternoon Eye Drops',
    time: '02:00 PM',
    period: 'afternoon',
    category: 'medicine',
    details: 'Lubricating eye drops: 1 drop in each eye. Rest eyes for 5 minutes after.',
    dosage: '1 Drop each eye (Systane)',
    completed: false,
  },
  {
    id: 'rem-5',
    title: 'Gentle Walk in the Park',
    time: '05:00 PM',
    period: 'evening',
    category: 'routine',
    details: '20-minute pleasant walk with neighbor Sharma ji. Wear walking shoes.',
    completed: false,
  },
  {
    id: 'rem-6',
    title: 'Calcium & Vitamin D',
    time: '08:30 PM',
    period: 'evening',
    category: 'medicine',
    details: 'Take 1 tablet with a cup of warm milk after dinner.',
    dosage: '1 Tablet (Shelcal 500)',
    completed: false,
  },
];

export const UNDERSTAND_SAMPLES: UnderstandSample[] = [
  {
    id: 'sample-sms',
    title: 'Bank SMS Alert',
    subtitle: 'Account debit text message',
    tag: 'Banking',
    iconName: 'CreditCard',
    originalText:
      'A/c *4812 debited for INR 1,850.00 on 18-Sep-26 at 10:24 AM via UPI to MEDPLUS PHARMACY. Bal INR 48,210.00. If not done by you, SMS BLOCK to 56767.',
    plainEnglish: {
      inOneSentence: 'You paid 1,850 Rupees to MedPlus Pharmacy from your bank account ending in 4812.',
      whatItMeans: [
        'Your bank balance is now 48,210 Rupees.',
        'The transaction took place this morning at 10:24 AM.',
        'It was paid using UPI (PhonePe/GooglePay/Paytm).',
      ],
      whatYouNeedToDo:
        'If you bought medicine at MedPlus today, you do not need to do anything. If you did NOT buy this, press the Emergency Call button right now to call your bank or daughter.',
      deadlineOrAmount: 'Amount: ₹1,850.00',
      isUrgent: false,
    },
  },
  {
    id: 'sample-bill',
    title: 'Electricity Monthly Bill',
    subtitle: 'Power utility payment notice',
    tag: 'Utility Bill',
    iconName: 'Zap',
    originalText:
      'CA No: 102938475. Consumer: ANAND SWARUP. Current Bill: Rs 1,420. Units consumed: 184 kWh. Due Date: 28-SEP-2026. Early payment rebate: Rs 30 if paid by 22-SEP-2026. Disconnection notice applicable post 05-OCT.',
    plainEnglish: {
      inOneSentence: 'Your electricity bill for this month is 1,420 Rupees, due by September 28th.',
      whatItMeans: [
        'You used 184 units of power this month (normal average for 2 people).',
        'If you pay before September 22nd, you get a 30 Rupee discount (pay only ₹1,390).',
        'No rush today, but good to pay this week so you do not have to worry.',
      ],
      whatYouNeedToDo:
        'Pay online via your phone app, or ask your children to assist. You do NOT need to stand in a long queue in the hot sun.',
      deadlineOrAmount: 'Pay: ₹1,420 by 28 September',
      isUrgent: false,
    },
  },
  {
    id: 'sample-prescription',
    title: "Doctor's Prescription Slip",
    subtitle: 'Medical dosage instructions',
    tag: 'Health',
    iconName: 'Pill',
    originalText:
      'Rx: 1. Tab. Pan-D 40mg (1 - 0 - 0) x 15 days [B/F - AC] 2. Tab. Glycomet GP 1mg (1 - 0 - 1) x 30 days [P/C] 3. Syp. Cremaffin 10ml [H/S if needed]',
    plainEnglish: {
      inOneSentence: 'Here is your simple medicine schedule translated from the doctor slip:',
      whatItMeans: [
        'Pan-D 40mg: Take 1 tablet in the morning, 30 minutes BEFORE eating breakfast on an empty stomach.',
        'Glycomet GP 1mg: Take 1 tablet in morning and 1 tablet at night, AFTER meals for your blood sugar.',
        'Cremaffin Syrup: Take 2 spoonfuls (10ml) only at night before sleeping if you feel stomach constipation.',
      ],
      whatYouNeedToDo:
        'Place the morning tablets beside your water bottle tonight so you remember first thing upon waking.',
      deadlineOrAmount: 'Follow for next 30 days',
      isUrgent: false,
    },
  },
  {
    id: 'sample-scam-sms',
    title: 'Suspicious Courier Message',
    subtitle: 'Common package delivery fraud',
    tag: 'High Risk Alert',
    iconName: 'AlertTriangle',
    originalText:
      'SpeedPost Alert: Your parcel #IN84920 could not be delivered due to missing house number. Update your details within 12 hours or package will be returned: http://ind-post-update82.com/pay5rs',
    plainEnglish: {
      inOneSentence: 'DANGER: This is a 100% fake fraud message trying to steal money from your bank account.',
      whatItMeans: [
        'Real post offices NEVER send links asking you to pay ₹5 to update your address.',
        'The link http://ind-post-update82.com is a fake criminal website designed to capture your card details.',
      ],
      whatYouNeedToDo:
        'DO NOT click the link. DO NOT pay any amount. Delete this message immediately. Your parcel is not in danger.',
      deadlineOrAmount: 'Action: Delete immediately',
      isUrgent: true,
    },
  },
];

export const SCAM_RULES: ScamRule[] = [
  {
    id: 'rule-1',
    title: 'Never Share Any OTP',
    simpleRule: 'An OTP is like your house key. Never give it over the phone to ANYONE.',
    explanation:
      'Even if the caller claims to be a Bank Manager, Police Officer, Electricity Officer, or Army Officer — they are lying. Real bank employees will NEVER ask you for an OTP.',
    example:
      'Fraudster says: "Sir, I am calling from SBI. Tell me the 6-digit code on your SMS to stop your account from closing."',
    icon: 'Key',
  },
  {
    id: 'rule-2',
    title: 'No One "Accidentally" Sends You Money',
    simpleRule: 'If someone sends a screenshot saying "I sent you Rs 25,000 by mistake, please send back", STOP.',
    explanation:
      'Scammers send fake SMS screenshots or ask you to scan a QR code to "receive" money. Remember: You NEVER need to enter your UPI PIN to RECEIVE money.',
    example:
      'Golden Rule: You only enter your PIN when money is GOING OUT of your bank account.',
    icon: 'ArrowDownLeft',
  },
  {
    id: 'rule-3',
    title: 'The "Electricity Power Cut Tonight" Lie',
    simpleRule: 'Messages saying your power will be cut tonight at 9:30 PM are ALWAYS fake.',
    explanation:
      'The electricity board always gives formal printed notices 15 days in advance. They never ask you to call a personal 10-digit mobile number or download an APK app.',
    example:
      'Message text: "Dear consumer, your electricity will be disconnected tonight at 9.30 pm because previous month bill was not updated. Call 9876543210 immediately."',
    icon: 'ZapOff',
  },
  {
    id: 'rule-4',
    title: 'Never Install "AnyDesk" or Screen-Share Apps',
    simpleRule: 'Never download any app that a stranger on the phone tells you to install.',
    explanation:
      'Apps like AnyDesk, TeamViewer, or RustDesk allow criminals to see your mobile screen and steal passwords as you type them.',
    example:
      'Fraudster says: "Sir, download QuickSupport app from Play Store so our technician can fix your KYC from office."',
    icon: 'Smartphone',
  },
];

export const COMMON_QUESTIONS = [
  {
    question: 'How do I make a video call to my grandchildren on WhatsApp?',
    answer:
      'Open WhatsApp, tap on your grandchild’s name, and look at the top right corner. You will see a small camera icon 📹. Tap that camera icon, and the video call will start ringing!',
    steps: [
      'Open WhatsApp on your phone screen.',
      'Tap on the name or photo of your family member.',
      'Look at the very top right corner for the Video Camera icon 📹.',
      'Tap it once. Hold the phone in front of your face and smile!',
    ],
    tip: 'Make sure you are sitting in a well-lit room so they can see your lovely smile clearly.',
  },
  {
    question: 'How can I make the letters and text bigger on my phone?',
    answer:
      'You can easily increase text size in your phone Settings so you don’t have to squint or search for your reading glasses.',
    steps: [
      'Open your phone Settings (the gear icon ⚙️).',
      'Tap on "Display" or "Screen".',
      'Tap on "Font size" or "Text size".',
      'Slide the circle to the right to make the letters large and comfortable.',
    ],
    tip: 'Inside Mitra One, you can also use the A / A+ / A++ buttons at the top of the screen anytime!',
  },
  {
    question: 'Is it safe to pay my water and electricity bills online?',
    answer:
      'Yes, it is very safe as long as you use official apps like Google Pay, PhonePe, Paytm, or your official bank app. You never need to enter your PIN to receive money, only to make a payment.',
    steps: [
      'Open your trusted UPI app (Google Pay or PhonePe).',
      'Look for the "Bills" section and tap "Electricity".',
      'Select your power company (e.g., BSES, BESCOM, TATA Power, MSEDCL).',
      'Enter your Consumer Account Number from your paper bill.',
      'Check that your name matches on the screen before entering your secret PIN.',
    ],
    tip: 'Never click on payment links sent to you by unknown numbers on SMS.',
  },
  {
    question: 'What should I do if I get an unknown call saying I won a prize?',
    answer:
      'Hang up immediately! You cannot win a lottery or prize for a competition you never entered. These are automated scam calls trying to get your bank details.',
    steps: [
      'Do not press 1 or any numbers if an automated voice asks you to.',
      'Press the red button on your screen to end the call.',
      'Block the number if your phone gives you the option.',
      'Tell your family member or check with Mitra One Scam Shield if you are unsure.',
    ],
    tip: 'Remember: Real companies do not give free cars, gold coins, or foreign tours over phone calls.',
  },
];
