import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'mr' | 'gu' | 'ta';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  // Common
  "krishirath": { en: "KrishiRath", hi: "कृषिरथ", mr: "कृषिरथ", gu: "કૃષિરથ", ta: "கிருஷிரத்" },
  "login": { en: "Login", hi: "लॉगिन", mr: "लॉगिन", gu: "લોગિન", ta: "உள்நுழை" },
  "logout": { en: "Logout", hi: "लॉगआउट", mr: "लॉगआउट", gu: "લોગઆઉટ", ta: "வெளியேறு" },
  "search": { en: "Search", hi: "खोजें", mr: "शोधा", gu: "શોધો", ta: "தேடு" },
  
  // Header / Nav
  "equipment_search": { en: "Equipment Search", hi: "उपकरण खोज", mr: "उपकरण शोध", gu: "સાધન શોધ", ta: "கருவி தேடல்" },
  "management": { en: "Management", hi: "प्रबंधन", mr: "व्यवस्थापन", gu: "વ્યવસ્થાપન", ta: "மேலாண்மை" },
  
  // Landing Page
  "hero_title": { en: "Modernizing Indian Agriculture", hi: "भारतीय कृषि का आधुनिकीकरण", mr: "भारतीय कृषीचे आधुनिकीकरण", gu: "ભારતીય કૃષિનું આધુનિકીકરણ", ta: "இந்திய விவசாயத்தை நவீனப்படுத்துதல்" },
  "hero_subtitle": { en: "Connect with equipment owners, optimize your harvest, and grow more with KrishiRath.", hi: "उपकरण मालिकों से जुड़ें, अपनी कटाई को बेहतर बनाएं और कृषिरथ के साथ अधिक उगाएं।", mr: "उपकरण मालकांशी जोडा, आपली कापणी सुधारा आणि कृषिरथसह अधिक धान्य पिकवा.", gu: "સાધનોના માલિકો સાથે જોડાઓ, તમારી લણણીને શ્રેષ્ઠ બનાવો અને કૃષિરથ સાથે વધુ ઉગાડો.", ta: "கருவி உரிமையாளர்களுடன் இணையுங்கள், உங்கள் அறுவடையை மேம்படுத்துங்கள் மற்றும் கிருஷிரத் மூலம் அதிகம் வளருங்கள்." },
  "farmer_login": { en: "Farmer Login", hi: "किसान लॉगिन", mr: "शेतकरी लॉगिन", gu: "ખેડૂત લોગિન", ta: "விவசாயி உள்நுழைவு" },
  "owner_login": { en: "Owner Login", hi: "मालिक लॉगिन", mr: "मालक लॉगिन", gu: "માલિક લોગિન", ta: "உரிமையாளர் உள்நுழைவு" },
  "why_choose": { en: "Why Choose KrishiRath?", hi: "कृषिरथ क्यों चुनें?", mr: "कृषिरथ का निवडा?", gu: "કૃષિરથ શા માટે પસંદ કરવું?", ta: "கிருஷிரத்தை ஏன் தேர்ந்தெடுக்க வேண்டும்?" },
  "infrastructure_text": { en: "We're building the infrastructure for the next generation of Indian farmers.", hi: "हम भारतीय किसानों की अगली पीढ़ी के लिए बुनियादी ढांचा तैयार कर रहे हैं।", mr: "आम्ही भारतीय शेतकऱ्यांच्या पुढच्या पिढीसाठी पायाभूत सुविधा निर्माण करत आहोत.", gu: "અમે ભારતીય ખેડૂતોની આગામી પેઢી માટે ઇન્ફ્રાસ્ટ્રક્ચર બનાવી રહ્યા છીએ.", ta: "இந்திய விவசாயிகளின் அடுத்த தலைமுறைக்கான உள்கட்டமைப்பை நாங்கள் உருவாக்கி வருகிறோம்." },
  "smart_fleet": { en: "Smart Fleet", hi: "स्मार्ट बेड", mr: "स्मार्ट उपकरणे", gu: "સ્માર્ટ ફ્લીટ", ta: "ஸ்மார்ட் கடற்படை" },
  "smart_fleet_desc": { en: "Access modern tractors, harvesters, and specialized gear instantly.", hi: "आधुनिक ट्रैक्टरों, हार्वेस्टर और विशेष गियर तक तुरंत पहुंचें।", mr: "आधुनिक ट्रॅक्टर, हार्वेस्टर आणि विशेष उपकरणांमध्ये त्वरित प्रवेश मिळवा.", gu: "આધુનિક ટ્રેક્ટર્સ, હાર્વેસ્ટર્સ અને વિશિષ્ટ ગિયરને તરત જ ઍક્સેસ કરો.", ta: "நவீன டிராக்டர்கள், அறுவடை இயந்திரங்கள் மற்றும் சிறப்பு கருவிகளை உடனடியாக அணுகவும்." },
  "verified_trust": { en: "Verified Trust", hi: "सत्यापित विश्वास", mr: "सत्यापित विश्वास", gu: "ચકાસાયેલ ટ્રસ્ટ", ta: "சரிபார்க்கப்பட்ட நம்பிக்கை" },
  "verified_trust_desc": { en: "Every owner and machine is verified to ensure your crop is in safe hands.", hi: "यह सुनिश्चित करने के लिए कि आपकी फसल सुरक्षित हाथों में है, हर मालिक और मशीन का सत्यापन किया जाता है।", mr: "तुमचे पीक सुरक्षित हातात असल्याची खात्री करण्यासाठी प्रत्येक मालकाची आणि मशीनची पडताळणी केली जाते.", gu: "તમારો પાક સુરક્ષિત હાથમાં છે તેની ખાતરી કરવા માટે દરેક માલિક અને મશીન ચકાસવામાં આવે છે.", ta: "உங்கள் பயிர் பாதுகாப்பான கைகளில் இருப்பதை உறுதி செய்ய ஒவ்வொரு உரிமையாளரும் இயந்திரமும் சரிபார்க்கப்படுகின்றன." },
  "dynamic_pricing": { en: "Dynamic Pricing", hi: "गतिशील मूल्य निर्धारण", mr: "डायनॅमिक किंमत", gu: "ડાયનેમિક પ્રાઇસિંગ", ta: "டைனமிக் விலை" },
  "dynamic_pricing_desc": { en: "Transparent, data-driven rates that save you money during peak seasons.", hi: "पारदर्शी, डेटा-आधारित दर जो पीक सीजन के दौरान आपके पैसे बचाते हैं।", mr: "पारदर्शक, डेटा-आधारित दर जे पीक सीझनमध्ये तुमचे पैसे वाचवतात.", gu: "પારદર્શક, ડેટા-ટ્રિવન દરો જે પીક સીઝન દરમિયાન તમારા પૈસા બચાવે છે.", ta: "பீக் சீசன்களில் உங்கள் பணத்தை மிச்சப்படுத்தும் வெளிப்படையான, தரவு சார்ந்த கட்டணங்கள்." },
  
  // Login Page
  "login_to_account": { en: "Login to your account", hi: "अपने खाते में लॉगिन करें", mr: "तुमच्या खात्यात लॉगिन करा", gu: "તમારા ખાતામાં લોગિન કરો", ta: "உங்கள் கணக்கில் உள்நுழையவும்" },
  "sign_in_as_farmer": { en: "Sign in as Farmer", hi: "किसान के रूप में साइन इन करें", mr: "शेतकरी म्हणून साइन इन करा", gu: "ખેડૂત તરીકે સાઇન ઇન કરો", ta: "விவசாயியாக உள்நுழையவும்" },
  "sign_in_as_owner": { en: "Sign in as Owner", hi: "मालिक के रूप में साइन इन करें", mr: "मालक म्हणून साइन इन करा", gu: "માલિક તરીકે સાઇન ઇન કરો", ta: "உரிமையாளராக உள்நுழையவும்" },
  "back_to_home": { en: "Back to home", hi: "होमपेज पर वापस जाएं", mr: "मुख्यपृष्ठावर परत जा", gu: "હોમપેજ પર પાછા ફરો", ta: "முகப்புப் பக்கத்திற்குத் திரும்பு" },

  // Register Page
  "join_krishirath": { en: "Join KrishiRath", hi: "कृषिरथ से जुड़ें", mr: "कृषिरथमध्ये सामील व्हा", gu: "કૃષિરથમાં જોડાઓ", ta: "கிருஷிரத்தில் இணையுங்கள்" },
  "create_account_start": { en: "Create your account to start booking", hi: "बुकिंग शुरू करने के लिए अपना खाता बनाएं", mr: "बुकिंग सुरू करण्यासाठी तुमचे खाते तयार करा", gu: "બુકિંગ શરૂ કરવા માટે તમારું એકાઉન્ટ બનાવો", ta: "பதிவு செய்ய உங்கள் கணக்கை உருவாக்கவும்" },
  "register_as_farmer": { en: "Register as Farmer", hi: "किसान के रूप में पंजीकरण करें", mr: "शेतकरी म्हणून नोंदणी करा", gu: "ખેડૂત તરીકે નોંધણી કરો", ta: "விவசாயியாக பதிவு செய்யவும்" },
  "register_as_owner": { en: "Register as Owner", hi: "मालिक के रूप में पंजीकरण करें", mr: "मालक म्हणून नोंदणी करा", gu: "માલિક તરીકે નોંધણી કરો", ta: "உரிமையாளராக பதிவு செய்யவும்" },

  // Dashboard Common
  "smart_suggester": { en: "AI Equipment Suggestion", hi: "AI उपकरण सुझाव", mr: "AI उपकरण सूचना", gu: "AI સાધન સૂચન", ta: "AI கருவி பரிந்துரை" },
  "land_area": { en: "Land Area (Acres)", hi: "भूमि क्षेत्र (एकड़)", mr: "जमीन क्षेत्र (एकर)", gu: "જમીન વિસ્તાર (એકર)", ta: "நிலப்பரப்பு (ஏக்கர்)" },
  "select_crop": { en: "Select Crop", hi: "फसल चुनें", mr: "पीक निवडा", gu: "પાક પસંદ કરો", ta: "பயிரைத் தேர்ந்தெடுக்கவும்" },
  "select_soil": { en: "Select Soil", hi: "मिट्टी चुनें", mr: "माती निवडा", gu: "જમીન પસંદ કરો", ta: "மண்ணைத் தேர்ந்தெடுக்கவும்" },
  "analyze_suggest": { en: "Analyze & Suggest", hi: "विश्लेषण करें और सुझाव दें", mr: "विश्लेषण करा आणि सुचवा", gu: "વિશ્લેષણ અને સૂચન", ta: "பகுப்பாய்வு செய்து பரிந்துரைக்கவும்" },
  
  // Farmer Dashboard
  "farmer_dashboard_title": { en: "Farmer Intelligent Dashboard", hi: "किसान इंटेलिजेंट डैशबोर्ड", mr: "शेतकरी इंटेलिजेंट डॅशबोर्ड", gu: "ખેડૂત ઇન્ટેલિજન્ટ ડેશબોર્ડ", ta: "விவசாயி அறிவார்ந்த டாஷ்போர்டு" },
  "empowering_farm": { en: "Empowering your farm with smart technology and data-driven insights.", hi: "स्मार्ट तकनीक और डेटा-आधारित अंतर्दृष्टि के साथ अपने खेत को सशक्त बनाएं।", mr: "स्मार्ट तंत्रज्ञान आणि डेटा-आधारित अंतर्दृष्टीसह तुमची शेती सक्षम करा.", gu: "સ્માર્ટ ટેક્નોલોજી અને ડેટા-ટ્રિવન આંતરદૃષ્ટિ સાથે તમારા ફાર્મને સશક્ત બનાવવું.", ta: "ஸ்மார்ட் தொழில்நுட்பம் மற்றும் தரவு சார்ந்த நுண்ணறிவுகளுடன் உங்கள் பண்ணையை மேம்படுத்துதல்." },
  "discovery_title": { en: "Discover Equipment", hi: "उपकरण खोजें", mr: "उपकरणे शोधा", gu: "સાધનો શોધો", ta: "கருவிகளைக் கண்டறியவும்" },
  "demand_prediction": { en: "Demand Prediction", hi: "मांग पूर्वानुमान", mr: "मागणीचा अंदाज", gu: "માંગ આગાહી", ta: "தேவை கணிப்பு" },
  "maintenance_tip": { en: "Maintenance Tip", hi: "रखरखाव टिप", mr: "देखभाल टीप", gu: "જાળવણી ટીપ", ta: "பராமரிப்பு குறிப்பு" },
  "book_instantly": { en: "Book Instantly", hi: "तुरंत बुक करें", mr: "त्वरीत बुक करा", gu: "તરત જ બુક કરો", ta: "உடனடியாக பதிவு செய்யவும்" },
  "all_maharashtra": { en: "All Maharashtra", hi: "पूरा महाराष्ट्र", mr: "सर्व महाराष्ट्र", gu: "આખું મહારાષ્ટ્ર", ta: "அனைத்து மகாராஷ்டிரா" },
  "filter": { en: "Filter", hi: "फिल्टर करें", mr: "फिल्टर करा", gu: "ફિલ્ટર કરો", ta: "வடிகட்டி" },
  "high_demand": { en: "High Demand", hi: "अत्यधिक मांग", mr: "जास्त मागणी", gu: "ઊંચી માંગ", ta: "அதிக தேவை" },
  "base_price": { en: "Base", hi: "मूल", mr: "मूळ", gu: "મૂળ", ta: "அடிப்படை" },
  
  // Owner Dashboard
  "owner_management_hub": { en: "Owner Management Hub", hi: "मालिक प्रबंधन हब", mr: "मालक व्यवस्थापन हब", gu: "માલિક મેનેજમેન્ટ હબ", ta: "உரிமையாளர் மேலாண்மை மையம்" },
  "assets_managed": { en: "Assets Managed", hi: "प्रबंधित संपत्तियां", mr: "व्यवस्थापित मालमत्ता", gu: "સંપત્તિ સંચાલિત", ta: "நிர்வகிக்கப்படும் சொத்துக்கள்" },
  "monthly_earnings": { en: "Monthly Earnings", hi: "मासिक कमाई", mr: "मासिक कमाई", gu: "માસિક આવક", ta: "மாதாந்திர வருமானம்" },
  "attention_needed": { en: "Attention Needed", hi: "ध्यान देने की आवश्यकता", mr: "लक्ष देण्याची गरज", gu: "ધ્યાન આવશ્યક છે", ta: "கவனம் தேவை" },
  "ratings": { en: "Ratings", hi: "रेटिंग", mr: "रेटिंग", gu: "રેટિંગ્સ", ta: "மதிப்பீடுகள்" },
  "maintenance_repair_suggestions": { en: "Maintenance & Repair Suggestions", hi: "रखरखाव और मरम्मत सुझाव", mr: "देखभाल आणि दुरुस्ती सूचना", gu: "જાળવણી અને સમારકામ સૂચનો", ta: "பராமரிப்பு மற்றும் பழுதுபார்க்கும் பரிந்துரைகள்" },
  "severity": { en: "Severity", hi: "गंभीरता", mr: "तीव्रता", gu: "તીવ્રતા", ta: "தீவிரம்" },
  "ai_repair_advice": { en: "AI Repair Advice", hi: "AI मरम्मत सलाह", mr: "AI दुरुस्ती सल्ला", gu: "AI સમારકામ સલાહ", ta: "AI பழுதுபார்க்கும் ஆலோசனை" },
  "order_spare_parts": { en: "Order Spare Parts", hi: "स्पेयर पार्ट्स ऑर्डर करें", mr: "स्पेयर पार्ट्स ऑर्डर करा", gu: "સ્પેરપાર્ટ્સ મંગાવો", ta: "உதிரி பாகங்களை ஆர்டர் செய்யவும்" },
  "mark_replacement": { en: "Mark for Replacement", hi: "प्रतिस्थापन के लिए चिह्नित करें", mr: "बदलीसाठी चिन्हांकित करा", gu: "બદલી માટે ચિહ્નિત કરો", ta: "மாற்றத்திற்கு குறிக்கவும்" },
  "active_fleet": { en: "Your Active Fleet", hi: "आपका सक्रिय बेड़ा", mr: "तुमची सक्रिय उपकरणे", gu: "તમારી સક્રિય ફ્લીટ", ta: "உங்கள் செயலில் உள்ள கடற்படை" },
  "available": { en: "Available", hi: "उपलब्ध", mr: "उपलब्ध", gu: "ઉપલબ્ધ", ta: "கிடைக்கிறது" },
  "booked": { en: "Booked", hi: "बुक किया गया", mr: "बुक केले", gu: "બુક કરેલ", ta: "பதிவு செய்யப்பட்டது" },
  "edit": { en: "Edit", hi: "संपादित करें", mr: "संपादित करा", gu: "ફેરફાર કરો", ta: "திருத்து" },
  "calendar": { en: "Calendar", hi: "कैलेंडर", mr: "कॅलेंडर", gu: "કેલેન્ડર", ta: "நாட்காட்டி" },
  "managing_assets_fleet_health": { en: "Managing assets, maintenance, and fleet health.", hi: "संपत्ति, रखरखाव और बेड़े के स्वास्थ्य का प्रबंधन।", mr: "मालमत्ता, देखभाल आणि आरोग्याचे व्यवस्थापन करणे.", gu: "સંપત્તિ, જાળવણી અને ફ્લીટ સ્વાસ્થ્યનું સંચાલન.", ta: "சொத்துக்கள், பராமரிப்பு மற்றும் மேலாண்மை." },
  "add_new_equipment": { en: "Add New Equipment", hi: "नया उपकरण जोड़ें", mr: "नवीन उपकरणे जोडा", gu: "નવું સાધન ઉમેરો", ta: "புதிய கருவியைச் சேர்க்கவும்" },
  "damage_reports": { en: "Damage reports submitted", hi: "क्षति रिपोर्ट प्रस्तुत की गई", mr: "नुकसान अहवाल सादर केला", gu: "નુકસાન અહેવાલ સબમિટ કરવામાં આવ્યો", ta: "சேத அறிக்கைகள் சமர்ப்பிக்கப்பட்டன" },
  "issue": { en: "Issue", hi: "समस्या", mr: "समस्या", gu: "સમસ્યા", ta: "பிரச்சினை" },
  "per_day": { en: "/day", hi: "/दिन", mr: "/दिवस", gu: "/દિવસ", ta: "/நாள்" },
  
  // AI Detection
  "plant_disease_detection": { en: "Plant Disease Detection", hi: "पौधों के रोग की पहचान", mr: "रोगांची ओळख", gu: "છોડના રોગની ઓળખ", ta: "தாவர நோய் கண்டறிதல்" },
  "analyzing": { en: "Analyzing...", hi: "विश्लेषण कर रहे हैं...", mr: "विश्लेषण करत आहे...", gu: "વિશ્લેષણ કરી રહ્યા છીએ...", ta: "பகுப்பாய்வு செய்கிறது..." },
  "detect_disease": { en: "Analyze Plant Health", hi: "पौधों के स्वास्थ्य का विश्लेषण करें", mr: "रोपांच्या आरोग्याचे विश्लेषण करा", gu: "છોડના સ્વાસ્થ્યનું વિશ્લેષણ કરો", ta: "தாவர ஆரோக்கியத்தை பகுப்பாய்வு செய்யுங்கள்" },
  
  // Actions
  "chat": { en: "Chat", hi: "चैट करें", mr: "चॅट करा", gu: "ચેટ કરો", ta: "அரட்டை" },
  "call": { en: "Call", hi: "कॉल करें", mr: "कॉल करा", gu: "કોલ કરો", ta: "અழைப்பு" },
  "book_now": { en: "Book Now", hi: "अभी बुक करें", mr: "आता बुक करा", gu: "હમણાં બુક કરો", ta: "இப்போதே பதிவு செய்யுங்கள்" },
  "contact_owner": { en: "Contact Owner", hi: "मालिक से संपर्क करें", mr: "मालकांशी संपर्क साधा", gu: "માલિકનો સંપર્ક કરો", ta: "உரிமையாளரைத் தொடர்பு கொள்ளவும்" },
  "cancel": { en: "Cancel", hi: "रद्द करें", mr: "रद्द करा", gu: "રદ કરો", ta: "ரத்து செய்" },
  "submit_review": { en: "Submit Review", hi: "समीक्षा सबमिट करें", mr: "समीक्षा सबमिट करा", gu: "સમીક્ષા સબમિટ કરો", ta: "மதிப்பாய்வைச் சமர்ப்பிக்கவும்" },

  // Chat
  "type_message": { en: "Type your message...", hi: "अपना संदेश टाइप करें...", mr: "तुमचा संदेश टाइप करा...", gu: "તમારો સંદેશ લખો...", ta: "உங்கள் செய்தியைத் தட்டச்சு செய்க..." },
  "online_status": { en: "Online • Typically replies in 5m", hi: "ऑनलाइन • आमतौर पर 5 मिनट में जवाब देते हैं", mr: "ऑनलाइन • सहसा ५ मिनिटांत उत्तर देतात", gu: "ઓનલાઇન • સામાન્ય રીતે 5 મિનિટમાં જવાબ આપે છે", ta: "ஆன்லைன் • பொதுவாக 5 நிமிடங்களில் பதிலளிக்கும்" },

  // Rating
  "rate_experience": { en: "Rate your experience", hi: "अपने अनुभव को रेट करें", mr: "तुमचा अनुभव रेट करा", gu: "તમારા અનુભવને રેટ કરો", ta: "உங்கள் அனுபવத்தை மதிப்பிடுங்கள்" },
  "how_was_rental": { en: "How was your rental of", hi: "आपका किराया कैसा रहा", mr: "तुमचे भाडे कसे होते", gu: "તમારું ભાડું કેવું હતું", ta: "உங்கள் வாடகை எப்படி இருந்தது" },
  "tell_more": { en: "Tell us more about the equipment condition, owner's behavior, etc. (optional)", hi: "हमें उपकरण की स्थिति, मालिक के व्यवहार आदि के बारे में अधिक बताएं (वैकल्पिक)", mr: "आम्हाला उपकरणाची स्थिती, मालकाचे वर्तन इत्यादींबद्दल अधिक सांगा (पर्यायी)", gu: "અમને સાધનોની સ્થિતિ, માલિકની વર્તણૂક વગેરે વિશે વધુ જણાવો (વૈકલ્પિક)", ta: "கருவியின் நிலை, உரிமையாளரின் நடத்தை போன்றவற்றை பற்றி மேலும் சொல்லுங்கள் (விருப்பமானது)" },

  // Booking
  "booking_confirmed": { en: "Booking Confirmed!", hi: "बुकिंग की पुष्टि हो गई!", mr: "बुकिंगची पुष्टी झाली!", gu: "બુકિંગ કન્ફર્મ થયું!", ta: "பதிவு உறுதி செய்யப்பட்டது!" },
  "pending_approval": { en: "Pending Owner Approval", hi: "मालिक की मंजूरी लंबित है", mr: "मालकाच्या मंजुरीची प्रतीक्षा आहे", gu: "માલિકની મંજૂરી બાકી છે", ta: "உரிமையாளர் ஒப்புதலுக்காக நிலுவையில் உள்ளது" },
  "booking_summary": { en: "Booking Summary", hi: "बुकिंग सारांश", mr: "बुकिंग सारांश", gu: "બુકિંગ સારાંશ", ta: "பதிவு சுருக்கம்" },
  "booking_date": { en: "Booking Date", hi: "बुकिंग की तारीख", mr: "बुकिंगची तारीख", gu: "બુકિંગની તારીખ", ta: "பதிவு தேதி" },
  "delivery_location": { en: "Delivery Location", hi: "वितरण स्थान", mr: "वितरण ठिकाण", gu: "ડિલિવરી લોકેશન", ta: "விநியோக இடம்" },
  "total_price": { en: "Total Price", hi: "कुल कीमत", mr: "एकूण किंमत", gu: "કુલ કિંમત", ta: "மொத்த விலை" },
  "download_receipt": { en: "Download Receipt", hi: "रसीद डाउनलोड करें", mr: "पावती डाउनलोड करा", gu: "પાવતી ડાઉનલોડ કરો", ta: "ரசீதைப் பதிவிறக்கவும்" },
  "return_to_dashboard": { en: "Return to Dashboard", hi: "डैशबोर्ड पर वापस जाएं", mr: "डॅशबोर्डवर परत जा", gu: "ડેશબોર્ડ પર પાછા ફરો", ta: "டாஷ்போர்டிற்குத் திரும்பு" },

  // NotFound
  "page_not_found": { en: "Oops! Page not found", hi: "ओह! पेज नहीं मिला", mr: "अरेरे! पेज सापडले नाही", gu: "અરે! પેજ મળ્યું નથી", ta: "அய்யோ! பக்கம் கிடைக்கவில்லை" },
  "return_home": { en: "Return Home", hi: "होमपेज पर वापस जाएं", mr: "होमपेजवर परत जा", gu: "હોમપેજ પર પાછા ફરો", ta: "முகப்பு திரும்பவும்" },

  // Crops
  "Wheat": { en: "Wheat", hi: "गेहूं", mr: "गहू", gu: "ઘઉં", ta: "கோதுமை" },
  "Rice": { en: "Rice", hi: "चावल", mr: "तांदूळ", gu: "ચોખા", ta: "அரிசி" },
  "Sugarcane": { en: "Sugarcane", hi: "गन्ना", mr: "ऊस", gu: "શેરડી", ta: "கரும்பு" },
  "Maize": { en: "Maize", hi: "मक्का", mr: "मका", gu: "મકાઈ", ta: "சோளம்" },
  "Barley": { en: "Barley", hi: "जौ", mr: "सातू", gu: "જવ", ta: "பார்லி" },
  "Millet": { en: "Millet", hi: "बाजरा", mr: "बाजरी", gu: "બાજરી", ta: "தினை" },

  // Soil
  "Loamy": { en: "Loamy", hi: "दोमट", mr: "लोमी", gu: "ચીકણી માટી", ta: "வண்டல் மண்" },
  "Clay": { en: "Clay", hi: "मिट्टी", mr: "चिक्कण माती", gu: "માટી", ta: "களிமண்" },
  "Sandy": { en: "Sandy", hi: "रेतीली", mr: "रेताड माती", gu: "રેતાળ", ta: "மணல்" },
  "Black Soil": { en: "Black Soil", hi: "काली मिट्टी", mr: "काळी माती", gu: "કાળી માટી", ta: "கரிசல் மண்" },
  "Red Soil": { en: "Red Soil", hi: "लाल मिट्टी", mr: "लाल माती", gu: "લાલ માટી", ta: "செம்மண்" },

  // Equipment Types
  "Tractor": { en: "Tractor", hi: "ट्रैक्टर", mr: "ट्रॅक्टर", gu: "ટ્રેક્ટર", ta: "டிராக்டர்" },
  "Harvester": { en: "Harvester", hi: "हार्वेस्टर", mr: "हार्वेस्टर", gu: "હારવેસ્ટર", ta: "அறுவடை இயந்திரம்" },
  "Rotavator": { en: "Rotavator", hi: "रोटावेटर", mr: "रोटावेटर", gu: "રોટાવેટર", ta: "ரோட்டாவேட்டர்" },
  "Cultivator": { en: "Cultivator", hi: "कल्टीवेटर", mr: "कल्टीवेटर", gu: "કલ્ટીવેટર", ta: "கலப்பை" }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('krishi_lang');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('krishi_lang', language);
  }, [language]);

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language] || translations[key]['en'];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
