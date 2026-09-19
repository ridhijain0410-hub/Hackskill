import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { fetchNearbyFacilities, searchFacilitiesByQuery } from './server/careFacilities';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Secure in-memory user repository
interface StoredUser {
  id: string;
  fullName: string;
  identifier: string; // normalized mobile number or email
  salt: string;
  passwordHash: string;
  trustedContactName: string;
  trustedContactPhone: string;
  relationship: string;
  preferredLanguage?: string;
  createdAt: string;
}

const languageMap: Record<
  string,
  { code: string; name: string; nativeName: string; script: string }
> = {
  en: { code: 'en', name: 'English', nativeName: 'English', script: 'Latin script' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari script' },
};

const usersMap = new Map<string, StoredUser>(); // identifier -> user
const sessionsMap = new Map<string, string>(); // token -> identifier

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const hash = hashPassword(password, salt);
    const hashBuffer = Buffer.from(hash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');
    if (hashBuffer.length !== storedBuffer.length) return false;
    return crypto.timingSafeEqual(hashBuffer, storedBuffer);
  } catch {
    return false;
  }
}

// Seed a default demo senior user for quick preview/testing if needed
const demoSalt = crypto.randomBytes(16).toString('hex');
const demoUser: StoredUser = {
  id: 'usr-demo-1',
  fullName: 'Ramesh Sharma',
  identifier: '9876543210',
  salt: demoSalt,
  passwordHash: hashPassword('password123', demoSalt),
  trustedContactName: 'Sunita Sharma (Daughter)',
  trustedContactPhone: '+91 98765 43210',
  relationship: 'Daughter',
  createdAt: new Date().toISOString(),
};
usersMap.set('9876543210', demoUser);
// Also map demo email
usersMap.set('ramesh@mitraone.in', {
  ...demoUser,
  id: 'usr-demo-2',
  identifier: 'ramesh@mitraone.in',
});

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please add your API key in the AI Studio Settings.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to call Gemini with graceful model fallback in case of high demand (503)
async function generateContentWithFallback(ai: GoogleGenAI, requestConfig: any) {
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...requestConfig,
        model,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} failed, trying next:`, err?.message || err);
    }
  }

  throw lastError || new Error('All Gemini models failed to respond');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // ==========================================
  // MANDATORY AUTHENTICATION & PROFILE ROUTES
  // ==========================================

  // Register endpoint
  app.post('/api/auth/register', (req, res) => {
    try {
      const { fullName, identifier, password, trustedContactName, trustedContactPhone } = req.body;

      if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
        res.status(400).json({ error: 'Please enter your full name.' });
        return;
      }

      if (!identifier || typeof identifier !== 'string' || identifier.trim().length < 3) {
        res.status(400).json({ error: 'Please enter a valid mobile number or email.' });
        return;
      }

      if (!password || typeof password !== 'string' || password.length < 4) {
        res.status(400).json({ error: 'Please choose a password with at least 4 characters.' });
        return;
      }

      const cleanId = identifier.trim().toLowerCase();

      if (usersMap.has(cleanId)) {
        res.status(400).json({
          error: 'An account already exists with this mobile or email. Please log in instead.',
        });
        return;
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);

      const newUser: StoredUser = {
        id: `usr-${Date.now()}`,
        fullName: fullName.trim(),
        identifier: cleanId,
        salt,
        passwordHash,
        trustedContactName: (trustedContactName || 'Family Member').trim(),
        trustedContactPhone: (trustedContactPhone || '112').trim(),
        relationship: 'Trusted Family',
        preferredLanguage: (req.body.preferredLanguage || 'en').trim(),
        createdAt: new Date().toISOString(),
      };

      usersMap.set(cleanId, newUser);

      // Issue session token
      const token = crypto.randomBytes(32).toString('hex');
      sessionsMap.set(token, cleanId);

      res.status(201).json({
        message: 'Account created successfully',
        token,
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          identifier: newUser.identifier,
          trustedContactName: newUser.trustedContactName,
          trustedContactPhone: newUser.trustedContactPhone,
          relationship: newUser.relationship,
          preferredLanguage: newUser.preferredLanguage || 'en',
        },
      });
    } catch (err: any) {
      console.error('Error in /api/auth/register:', err);
      res.status(500).json({ error: 'Failed to create account. Please try again.' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', (req, res) => {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        res.status(400).json({ error: 'Please enter your mobile/email and password.' });
        return;
      }

      const cleanId = identifier.trim().toLowerCase();
      const user = usersMap.get(cleanId);

      if (!user) {
        res.status(401).json({
          error: 'No account found with this mobile number or email. Please check or register.',
        });
        return;
      }

      const isValid = verifyPassword(password, user.salt, user.passwordHash);
      if (!isValid) {
        res.status(401).json({
          error: 'Incorrect password. Please try again or re-enter.',
        });
        return;
      }

      // Issue session token
      const token = crypto.randomBytes(32).toString('hex');
      sessionsMap.set(token, cleanId);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          identifier: user.identifier,
          trustedContactName: user.trustedContactName,
          trustedContactPhone: user.trustedContactPhone,
          relationship: user.relationship,
          preferredLanguage: user.preferredLanguage || 'en',
        },
      });
    } catch (err: any) {
      console.error('Error in /api/auth/login:', err);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  });

  // Get current user profile
  app.get('/api/auth/me', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

      if (!token) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const identifier = sessionsMap.get(token);
      if (!identifier) {
        res.status(401).json({ error: 'Session expired or invalid' });
        return;
      }

      const user = usersMap.get(identifier);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      res.json({
        user: {
          id: user.id,
          fullName: user.fullName,
          identifier: user.identifier,
          trustedContactName: user.trustedContactName,
          trustedContactPhone: user.trustedContactPhone,
          relationship: user.relationship,
          preferredLanguage: user.preferredLanguage || 'en',
        },
      });
    } catch (err: any) {
      console.error('Error in /api/auth/me:', err);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Update profile endpoint
  app.put('/api/auth/profile', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

      if (!token) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const identifier = sessionsMap.get(token);
      if (!identifier) {
        res.status(401).json({ error: 'Session expired or invalid' });
        return;
      }

      const user = usersMap.get(identifier);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      const { fullName, trustedContactName, trustedContactPhone, relationship, preferredLanguage } = req.body;

      if (fullName && typeof fullName === 'string') {
        user.fullName = fullName.trim();
      }
      if (trustedContactName && typeof trustedContactName === 'string') {
        user.trustedContactName = trustedContactName.trim();
      }
      if (trustedContactPhone && typeof trustedContactPhone === 'string') {
        user.trustedContactPhone = trustedContactPhone.trim();
      }
      if (relationship && typeof relationship === 'string') {
        user.relationship = relationship.trim();
      }
      if (preferredLanguage && typeof preferredLanguage === 'string' && languageMap[preferredLanguage]) {
        user.preferredLanguage = preferredLanguage;
      }

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          fullName: user.fullName,
          identifier: user.identifier,
          trustedContactName: user.trustedContactName,
          trustedContactPhone: user.trustedContactPhone,
          relationship: user.relationship,
          preferredLanguage: user.preferredLanguage || 'en',
        },
      });
    } catch (err: any) {
      console.error('Error in /api/auth/profile:', err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
      if (token) {
        sessionsMap.delete(token);
      }
      res.json({ message: 'Logged out successfully' });
    } catch (err: any) {
      res.status(500).json({ error: 'Logout failed' });
    }
  });

  // 1. ASK MITRA ONE ENDPOINT
  app.post('/api/gemini/ask', async (req, res) => {
    try {
      const { question, language } = req.body;
      if (!question || typeof question !== 'string') {
        res.status(400).json({ error: 'Question is required' });
        return;
      }

      const lang = languageMap[language || 'en'] || languageMap['en'];
      const ai = getGeminiClient();

      let langInstruction = '';
      if (lang.code !== 'en') {
        langInstruction = `\nMANDATORY LANGUAGE REQUIREMENT:
- The user has selected ${lang.name} (${lang.nativeName}).
- You MUST respond ENTIRELY in simple, conversational, polite, and reassuring ${lang.name} using ${lang.script}.
- Answers should be short and easy for senior citizens to understand.
- When explaining how to do a task or procedure, provide numbered step-by-step instructions in simple ${lang.name}.
- Provide a helpful practical tip ('Good to remember') in simple ${lang.name}.
- Do not mix in English sentences; keep everything in ${lang.name} except standard brand names like WhatsApp or Google.`;
      }

      const systemInstruction = `You are MITRA ONE, a patient, warm, and friendly digital assistant for senior citizens.
Key guidelines:
- Answer in simple, clear, conversational, and reassuring language without any technical jargon.
- Answers should be short and easy for senior citizens to understand.
- When explaining how to do a task or procedure, provide numbered step-by-step instructions.
- Provide a helpful practical tip ('Good to remember').${langInstruction}
AI Safety Guidelines:
- Never ask users for OTPs, PINs, passwords, CVVs, or banking credentials.
- If the topic touches finances or banking, remind the user to never share OTPs or passwords over the phone with anyone.
- Do not make definitive medical, legal, or financial decisions for users. For health or high-stakes topics, clearly encourage verification with an appropriate doctor, professional, or official family source.
- Do not present uncertain information as fact.`;

      const prompt = `User question from a senior citizen: "${question}"
Please respond with a helpful, friendly answer in simple terms${lang.code !== 'en' ? ` in ${lang.name} (${lang.nativeName})` : ''}.`;

      const response = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: {
                type: Type.STRING,
                description: `Short, friendly, simple answer in ${lang.name} for a senior citizen.`,
              },
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: `Numbered steps in ${lang.name} if this is a task or procedure, otherwise empty array.`,
              },
              tips: {
                type: Type.STRING,
                description: `A helpful, reassuring senior-friendly tip in ${lang.name}.`,
              },
            },
            required: ['answer', 'steps'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      res.json({
        answer: parsed.answer || 'I am here to help you step by step.',
        steps: Array.isArray(parsed.steps) ? parsed.steps : [],
        tips: parsed.tips || '',
        language: lang.code,
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/ask:', err);
      const fallbackLang = languageMap[req.body?.language || 'en'] || languageMap['en'];
      res.status(500).json({
        error: err.message || 'Failed to get answer from Mitra One',
        answer:
          fallbackLang.code === 'hi'
            ? 'मैं आपकी मदद के लिए यहाँ हूँ। कृपया थोड़ा समय लें और आवश्यकता होने पर परिवार के सदस्य से भी पूछ सकते हैं।'
            : 'I am here with you. Take your time, step by step, and remember that you can always ask a family member or tap one of the common questions below.',
        steps: [
          fallbackLang.code === 'hi'
            ? 'अपना इंटरनेट कनेक्शन जांचें।'
            : 'Check your internet connection.',
          fallbackLang.code === 'hi'
            ? 'प्रश्न को दोबारा पूछने का प्रयास करें।'
            : 'Try tapping the question again.',
        ],
        tips:
          fallbackLang.code === 'hi'
            ? 'आप कभी भी परिवार के किसी सदस्य से पूछ सकते हैं या वरिष्ठ हेल्पलाइन 14567 पर कॉल कर सकते हैं।'
            : 'You can always ask a family member or call the senior helpline 14567.',
      });
    }
  });

  // 2. UNDERSTAND ENDPOINT
  app.post('/api/gemini/understand', async (req, res) => {
    try {
      const { text, language } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text to analyze is required' });
        return;
      }

      const lang = languageMap[language || 'en'] || languageMap['en'];
      const ai = getGeminiClient();

      let langInstruction = '';
      if (lang.code !== 'en') {
        langInstruction = `\nMANDATORY LANGUAGE REQUIREMENT:
- The senior citizen has chosen ${lang.name} (${lang.nativeName}).
- You MUST explain and summarize the document entirely in simple, clear, reassuring ${lang.name} using ${lang.script}.
- Sections "whatIsThis", "importantInfo", "whatDoINeedToDo", "importantDates", and reminder details must be in easy-to-understand ${lang.name}.`;
      }

      const systemInstruction = `You are the UNDERSTAND engine of MITRA ONE, designed to translate confusing bills, bank notices, appointment letters, emails, and official SMS messages into plain, calm language for senior citizens.
Present the result using clear sections:
1. "What is this?": 1-2 friendly sentences explaining exactly what this message or bill is.
2. "Important information": 2-3 bullet points highlighting the essential facts (e.g. account numbers, what service it is for, context) in plain words without jargon.
3. "What do I need to do?": Clear, calming instructions on what physical action the user needs to take (e.g. pay bill, show doctor, no action needed).
4. "Important dates": Key dates, due dates, appointment times, or deadline. If none, state "No specific deadline".
5. Extracted reminder: If there is a due date, deadline, doctor appointment, or payment due, extract structured reminder data so the senior can create a reminder with one click.${langInstruction}
Safety:
- Never ask for or store passwords, OTPs, or CVVs.
- If it looks like a phishing scam or fake threat, warn the user prominently.
- Do not give legal or financial advice; suggest verifying with the provider or family.`;

      const prompt = `Here is the text to explain for a senior citizen:
"""
${text}
"""
Analyze it and return the structured explanation${lang.code !== 'en' ? ` in ${lang.name} (${lang.nativeName})` : ''}.`;

      const response = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              whatIsThis: {
                type: Type.STRING,
                description: `Section "What is this?": Brief explanation in ${lang.name} of what the document or message is.`,
              },
              importantInfo: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: `Section "Important information": 2 to 4 bullet points in ${lang.name} highlighting key points in plain words.`,
              },
              whatDoINeedToDo: {
                type: Type.STRING,
                description: `Section "What do I need to do?": Clear instruction in ${lang.name} on action required.`,
              },
              importantDates: {
                type: Type.STRING,
                description: `Section "Important dates": Due dates, appointment dates, or deadlines in ${lang.name}.`,
              },
              amount: {
                type: Type.STRING,
                description: 'Extracted amount with currency (e.g. ₹1,450) or empty string if not applicable.',
              },
              isUrgent: {
                type: Type.BOOLEAN,
                description: 'True if there is an imminent deadline or security concern.',
              },
              canCreateReminder: {
                type: Type.BOOLEAN,
                description: 'True if there is an actionable date/time or payment due that can be scheduled.',
              },
              reminderTitle: {
                type: Type.STRING,
                description: `Suggested title in ${lang.name} for the reminder, e.g. "Pay Electricity Bill" or "Doctor Appointment".`,
              },
              reminderTime: {
                type: Type.STRING,
                description: 'Suggested reminder time, e.g. "10:00 AM" or "04:00 PM".',
              },
              reminderPeriod: {
                type: Type.STRING,
                description: 'morning, afternoon, or evening.',
              },
              reminderCategory: {
                type: Type.STRING,
                description: 'routine, appointment, call, or medicine.',
              },
              reminderDetails: {
                type: Type.STRING,
                description: `Brief details in ${lang.name} for the reminder.`,
              },
            },
            required: [
              'whatIsThis',
              'importantInfo',
              'whatDoINeedToDo',
              'importantDates',
              'isUrgent',
              'canCreateReminder',
            ],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      res.json({
        whatIsThis: parsed.whatIsThis || 'This is an informational notice.',
        importantInfo: Array.isArray(parsed.importantInfo) ? parsed.importantInfo : ['Take your time reading through this message.'],
        whatDoINeedToDo: parsed.whatDoINeedToDo || 'No immediate action required.',
        importantDates: parsed.importantDates || 'No specific deadline mentioned.',
        amount: parsed.amount || '',
        isUrgent: !!parsed.isUrgent,
        extractedReminder: parsed.canCreateReminder
          ? {
              canCreateReminder: true,
              reminderTitle: parsed.reminderTitle || 'Follow up on notice',
              reminderTime: parsed.reminderTime || '10:00 AM',
              reminderPeriod: parsed.reminderPeriod || 'morning',
              reminderCategory: parsed.reminderCategory || 'routine',
              reminderDetails: parsed.reminderDetails || (parsed.amount ? `Amount: ${parsed.amount}` : 'Scheduled reminder from document'),
              importantDates: parsed.importantDates || '',
            }
          : null,
        language: lang.code,
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/understand:', err);
      res.status(500).json({
        error: err.message || 'Failed to analyze text',
        whatIsThis: 'Here is a simplified summary of the text provided.',
        importantInfo: [
          'The document was reviewed by Mitra One.',
          'Always verify unusual payment requests with a family member or official provider.',
        ],
        whatDoINeedToDo: 'If this message asks for unexpected money or urgent action, pause and verify with someone you trust.',
        importantDates: 'Check the date printed on the original document.',
        isUrgent: false,
        extractedReminder: null,
      });
    }
  });

  // 3. SCAM SHIELD ENDPOINT
  app.post('/api/gemini/scam-shield', async (req, res) => {
    try {
      const { text, language } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text to analyze is required' });
        return;
      }

      const lang = languageMap[language || 'en'] || languageMap['en'];
      const ai = getGeminiClient();

      let langInstruction = '';
      if (lang.code !== 'en') {
        langInstruction = `\nMANDATORY LANGUAGE REQUIREMENT:
- The senior citizen has chosen ${lang.name} (${lang.nativeName}).
- You MUST provide the headline, verdictLabel, explanation, identifiedRedFlags, safeAction, securityAdvice, and suggestedMitraQuestion in simple, protective, reassuring ${lang.name} using ${lang.script}.
- Clearly explain the risks in plain ${lang.name} without alarming the senior.`;
      }

      const systemInstruction = `You are SCAM SHIELD in MITRA ONE, an expert cybersecurity and fraud protection analyzer for senior citizens in India and worldwide.
Analyze the provided SMS, WhatsApp message, email, or caller script for common fraud patterns:
- Suspicious links (bit.ly, unverified domains, apk download links)
- Urgency and panic triggers ("power cut tonight at 9:30 PM", "account blocked within 2 hours", "arrest warrant")
- Threats of disconnection, fine, or police
- OTP, PIN, password, CVV, or banking credential requests
- Unexpected payment requests, registration fees for lotteries or government schemes
- Prize, lottery (e.g. KBC, lucky draw), and reward scams
- Remote access apps (AnyDesk, TeamViewer, QuickSupport)
- Impersonation of electricity boards (BESCOM, MSEDCL, etc.), banks (SBI, HDFC, ICICI, etc.), post office, or courier services.

Determine the verdict:
- "danger" (High Risk: clearly a fraud attempt or dangerous request)
- "warning" (Be Careful: contains unverified links, ambiguous requests, or pressure)
- "safe" (Looks Safe to Review: standard bank alert, transactional notification, or harmless informational message)

Guidelines:
- Explain the reasons in simple, calming language.
- Clearly advise users never to share OTPs, PINs, passwords, or CVVs.
- Do not request or store sensitive credentials.
- Provide a clear recommended safe action.
- Provide a suggested follow-up question for Mitra One so the senior can ask for further clarification.${langInstruction}`;

      const prompt = `Analyze this message for a senior citizen:
"""
${text}
"""
Provide the scam safety analysis${lang.code !== 'en' ? ` in ${lang.name} (${lang.nativeName})` : ''}.`;

      const response = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: {
                type: Type.STRING,
                description: 'Must be one of: "danger", "warning", "safe"',
              },
              verdictLabel: {
                type: Type.STRING,
                description: `Verdict in ${lang.name}, e.g. "High Risk", "Be Careful", or "Looks Safe to Review"`,
              },
              headline: {
                type: Type.STRING,
                description: `Clear, bold headline in ${lang.name} for seniors.`,
              },
              explanation: {
                type: Type.STRING,
                description: `Simple, calming explanation in ${lang.name} of why this verdict was reached.`,
              },
              identifiedRedFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: `3 to 4 specific indicators or reassurements in ${lang.name} identified in the message.`,
              },
              safeAction: {
                type: Type.STRING,
                description: `Concrete, easy-to-follow safety action in ${lang.name} for the senior citizen.`,
              },
              securityAdvice: {
                type: Type.STRING,
                description: `Reassurance and reminder in ${lang.name} never to share OTPs, passwords, PINs, or CVVs.`,
              },
              suggestedMitraQuestion: {
                type: Type.STRING,
                description: `A question in ${lang.name} the user can ask Mitra One for further explanation.`,
              },
            },
            required: [
              'verdict',
              'verdictLabel',
              'headline',
              'explanation',
              'identifiedRedFlags',
              'safeAction',
              'securityAdvice',
              'suggestedMitraQuestion',
            ],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      let verdict: 'danger' | 'warning' | 'safe' = 'warning';
      if (parsed.verdict === 'danger' || parsed.verdict === 'safe') {
        verdict = parsed.verdict;
      }

      res.json({
        verdict,
        verdictLabel: parsed.verdictLabel || (verdict === 'danger' ? 'High Risk' : verdict === 'safe' ? 'Looks Safe to Review' : 'Be Careful'),
        headline: parsed.headline || (verdict === 'danger' ? '🚨 High Risk Warning' : '⚠️ Please Be Careful'),
        explanation: parsed.explanation || 'We reviewed this message carefully for signs of digital deception.',
        identifiedRedFlags: Array.isArray(parsed.identifiedRedFlags) ? parsed.identifiedRedFlags : ['Verify before taking action'],
        safeAction: parsed.safeAction || 'Do not share any OTP or personal information. When in doubt, consult family.',
        securityAdvice: parsed.securityAdvice || 'Remember: Real banks and government offices NEVER ask for your OTP, PIN, or password.',
        suggestedMitraQuestion: parsed.suggestedMitraQuestion || 'How can I safely check if an official bill is legitimate?',
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/scam-shield:', err);
      res.status(500).json({
        error: err.message || 'Failed to analyze scam text',
        verdict: 'warning',
        verdictLabel: 'Be Careful',
        headline: '⚠️ Caution: Please Verify This Message',
        explanation: 'We could not reach our AI safety scanner right now, but as a safety precaution, treat unexpected messages with care.',
        identifiedRedFlags: [
          'Never share 6-digit OTP codes or passwords over phone or SMS',
          'Do not click unknown links or download APK files',
        ],
        safeAction: 'Do not click any links or call numbers given in the message. Call the official helpline if concerned.',
        securityAdvice: 'Never share your OTP, PIN, password, or CVV with anyone.',
        suggestedMitraQuestion: 'What are the most common signs of a digital scam?',
      });
    }
  });

  // Nearby Care API Routes
  // Privacy notice: User coordinates are processed ephemerally in memory to calculate proximity.
  // Precise coordinates are NEVER stored in a database or file, and NEVER passed to Gemini or external LLMs.
  app.get('/api/care/nearby', async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);

      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({
          error: 'Valid geographic latitude and longitude coordinates are required.',
        });
      }

      const result = await fetchNearbyFacilities(lat, lon);
      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/care/nearby:', err);
      res.status(500).json({
        error: 'Unable to retrieve nearby care facilities at this moment. Please try searching manually or call 112 in an emergency.',
      });
    }
  });

  app.get('/api/care/search', async (req, res) => {
    try {
      const query = ((req.query.query as string) || '').trim();
      if (!query) {
        return res.status(400).json({ error: 'Search area or city query is required.' });
      }

      const result = await searchFacilitiesByQuery(query);
      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/care/search:', err);
      res.status(500).json({
        error: 'Unable to search for care facilities right now. Please try again or call 112 in an emergency.',
      });
    }
  });

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mitra One server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
