export type Lang = "en" | "hi";

export const translations = {
  en: {
    // Time of day
    goodMorning:   "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening:   "Good evening",

    // Greetings
    greetings: [
      "You are safe and loved 💛",
      "Today is a good day to make a memory 🌿",
      "Take it one gentle moment at a time 🍃",
      "You are doing wonderfully 🌸",
    ],

    // Tips
    tips: [
      "Stay hydrated today — drink a glass of water 💧",
      "A gentle walk outside might lift your spirits 🌳",
      "Today is perfect for looking at old photos 📸",
      "Consider calling a family member today 📞",
    ],

    // Notifications
    enableReminders:     "Enable Gentle Reminders 🔔",
    enableRemindersDesc: "Get notified for journal, water, breathing & medications",
    enableBtn:           "Enable",
    settingUp:           "Setting up…",
    remindersActive:     "Gentle reminders are active — we'll nudge you throughout the day 💛",
    notifBlocked:        "Notifications blocked. Please allow them in browser settings.",
    notifSuccess:        "Notifications enabled! We'll send gentle reminders 🔔",
    notifError:          "Could not enable notifications",

    // Tip banner
    gentleReminder: "GENTLE REMINDER",

    // Hydration
    todayHydration:  "Today's Hydration",
    hydrationDone:   "Amazing! You've had enough water today 🎉",
    glasses:         "glasses",
    glass:           "glass",

    // Quick cards
    whatToDo: "What would you like to do?",
    cards: [
      { label: "Memory Journal", desc: "Write or recall a memory" },
      { label: "My Family",      desc: "See the people you love" },
      { label: "Reminders",      desc: "Medications & daily tasks" },
      { label: "Activities",     desc: "Gentle exercises & music" },
      { label: "Calm Breathing", desc: "A moment of peace" },
      { label: "Mood Garden",    desc: "How are you feeling?" },
    ],

    // Location
    locationSafety: "Location Safety",
    locationDesc:   "Tap to view your safe zone",

    // Emergency
    emergency: "Emergency",

    // Sidebar
    signedInAs: "Signed in as",
    signOut:    "Sign out",
    language:   "Language",
  },

  hi: {
    // Time of day
    goodMorning:   "सुप्रभात",
    goodAfternoon: "नमस्ते",
    goodEvening:   "शुभ संध्या",

    // Greetings
    greetings: [
      "आप सुरक्षित और प्यारे हैं 💛",
      "आज एक अच्छी याद बनाने का दिन है 🌿",
      "एक-एक पल धीरे-धीरे लें 🍃",
      "आप बहुत अच्छा कर रहे हैं 🌸",
    ],

    // Tips
    tips: [
      "आज पानी पीते रहें — एक गिलास पानी पिएं 💧",
      "बाहर थोड़ी सैर करने से मन खुश हो सकता है 🌳",
      "आज पुरानी तस्वीरें देखने का अच्छा समय है 📸",
      "आज किसी परिवार के सदस्य को फ़ोन करें 📞",
    ],

    // Notifications
    enableReminders:     "सौम्य अनुस्मारक चालू करें 🔔",
    enableRemindersDesc: "जर्नल, पानी, साँस और दवाओं के लिए सूचना पाएं",
    enableBtn:           "चालू करें",
    settingUp:           "सेट हो रहा है…",
    remindersActive:     "सौम्य अनुस्मारक सक्रिय हैं — हम दिन भर याद दिलाएंगे 💛",
    notifBlocked:        "सूचनाएं अवरुद्ध हैं। कृपया ब्राउज़र सेटिंग में अनुमति दें।",
    notifSuccess:        "सूचनाएं चालू हो गईं! हम सौम्य अनुस्मारक भेजेंगे 🔔",
    notifError:          "सूचना चालू नहीं हो सकी",

    // Tip banner
    gentleReminder: "सौम्य याद",

    // Hydration
    todayHydration: "आज का पानी",
    hydrationDone:  "बहुत बढ़िया! आपने आज पर्याप्त पानी पी लिया 🎉",
    glasses:        "गिलास",
    glass:          "गिलास",

    // Quick cards
    whatToDo: "आज क्या करना चाहेंगे?",
    cards: [
      { label: "स्मृति डायरी",   desc: "एक याद लिखें या याद करें" },
      { label: "मेरा परिवार",    desc: "अपने प्रियजनों को देखें" },
      { label: "अनुस्मारक",      desc: "दवाएं और दैनिक कार्य" },
      { label: "गतिविधियाँ",     desc: "हल्के व्यायाम और संगीत" },
      { label: "शांत साँस",      desc: "एक शांतिपूर्ण पल" },
      { label: "मूड गार्डन",    desc: "आप कैसा महसूस कर रहे हैं?" },
    ],

    // Location
    locationSafety: "स्थान सुरक्षा",
    locationDesc:   "अपना सुरक्षित क्षेत्र देखने के लिए टैप करें",

    // Emergency
    emergency: "आपातकाल",

    // Sidebar
    signedInAs: "इस नाम से लॉग इन हैं",
    signOut:    "साइन आउट",
    language:   "भाषा",
  },
} as const;

export type Translations = typeof translations.en;