import { EXTRA } from './i18n.extra'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const LANGS = {
  en: { name: 'English', short: 'EN', dir: 'ltr' },
  fr: { name: 'Français', short: 'FR', dir: 'ltr' },
  ar: { name: 'العربية', short: 'AR', dir: 'rtl' },
}

// Keys are shared by all languages. Database values (status, type, presentation language) are never translated, only their labels.
const D = {
  en: {
    'nav.home': 'Home', 'nav.services': 'Services', 'nav.order': 'Order', 'nav.contact': 'Contact', 'nav.cta': 'Order Now', 'nav.menu': 'Menu', 'nav.lang': 'Language',
    'brand.tag': 'WE TURN IDEAS INTO IMPACT.',
    'hero.badge': 'Custom PowerPoint design studio', 'hero.t1': 'Your ideas,', 'hero.t2': 'beautifully presented.',
    'hero.sub': 'PRESORA designs custom PowerPoint presentations for students, universities and businesses, in English, French, Arabic and Italian. Tell us your topic and your deadline.',
    'hero.c1': 'Order now', 'hero.c2': 'See services', 'hero.scroll': 'SCROLL',
    'k.services': 'Services', 'h.services': 'What we create', 'k.portfolio': 'Portfolio', 'h.portfolio': 'Sample designs',
    'portfolio.note': 'Illustrative style previews, not client projects.', 'sample': 'Sample', 'k.why': 'Why PRESORA', 'h.why': 'Built around your needs',
    'k.process': 'Process', 'h.process': 'How ordering works', 'k.faq': 'FAQ', 'h.faq': 'Common questions', 'h.services2': 'Presentations for every need',
    'sv.School.t': 'School Presentations', 'sv.School.d': 'Clear, colourful slides for class projects, reports and presentations.',
    'sv.University.t': 'University Presentations', 'sv.University.d': 'Academic decks for theses, seminars and research defences, properly structured.',
    'sv.Business.t': 'Business Presentations', 'sv.Business.d': 'Pitch decks, company profiles and reports for clients and investors.',
    'sv.Creative.t': 'Creative PowerPoint', 'sv.Creative.d': 'Bold custom designs, animations and storytelling for any idea.', 'sv.order': 'Order this',
    'pf.1': 'Startup Pitch Deck', 'pf.2': 'Biology Research', 'pf.3': 'Marketing Plan', 'pf.4': 'History Class Project',
    'w1.t': 'Four languages', 'w1.d': 'Presentations in English, French, Arabic and Italian.', 'w2.t': 'Custom design', 'w2.d': 'Made for your topic, not a recycled template.',
    'w3.t': 'Your deadline', 'w3.d': 'Tell us the date when you order.', 'w4.t': 'Direct contact', 'w4.d': 'Your order opens straight in WhatsApp.',
    'p1.t': 'Fill the form', 'p1.d': 'Topic, slides, language, type and deadline. Attach files if you like.',
    'p2.t': 'Send on WhatsApp', 'p2.d': 'Your order is saved, then WhatsApp opens with all the details ready.', 'p3.t': 'We get to work', 'p3.d': 'We follow up with you directly about your presentation.',
    'q1': 'What do I need to place an order?', 'a1': 'Just the form: your name, WhatsApp number, topic, number of slides, language, type and deadline. Files and extra instructions are optional.',
    'q2': 'Which presentation languages are available?', 'a2': 'English, French, Arabic and Italian.',
    'q3': 'How do I discuss details?', 'a3': 'After you submit, WhatsApp opens with your order so you can talk with us directly. You can also use the Contact page.',
    'q4': 'Can I attach my own material?', 'a4': 'Yes. Upload a reference or requirements file (max 10 MB) on the order form.',
    'cta.t': 'Ready for a presentation that stands out?', 'cta.b': 'Start your order',
    'o.k': 'Order', 'o.h': 'Order your presentation', 'o.name': 'Your name', 'o.phone': 'WhatsApp number (with country code)', 'o.topic': 'Presentation topic',
    'o.slides': 'Number of slides', 'o.lang': 'Presentation language', 'o.type': 'Type', 'o.deadline': 'Deadline', 'o.instr': 'Additional instructions',
    'o.file': 'Attach a file (optional, max 10 MB)', 'o.pick': 'Tap to choose a file', 'o.ph.name': 'Full name', 'o.ph.phone': '+213 5 00 00 00 00',
    'o.ph.topic': 'e.g. Climate change', 'o.ph.instr': 'Colours, style, sources, anything we should know…', 'o.prog': '{n}% of required details filled',
    'o.submit': 'Submit & continue on WhatsApp', 'o.sending': 'Sending…', 'o.note': 'Your order is saved, then WhatsApp opens with your details ready to send.',
    'e.file': 'File is too large (max 10 MB).', 'e.slides': 'Enter a whole number of slides from 1 to 200.', 'e.generic': 'Something went wrong. Please try again.',
    'type.School': 'School', 'type.University': 'University', 'type.Business': 'Business', 'type.Creative': 'Creative',
    'pl.English': 'English', 'pl.French': 'French', 'pl.Arabic': 'Arabic', 'pl.Italian': 'Italian',
    'c.k': 'Contact', 'c.h': 'Let’s talk', 'c.wa': 'WhatsApp', 'c.wad': 'Fastest way to reach us.', 'c.wab': 'Chat on WhatsApp', 'c.em': 'Email', 'c.emb': 'Send an email', 'c.hello': 'Hello PRESORA! I have a question.',
    'f.rights': '© {y} PRESORA. All rights reserved.', 'f.made': 'Made by MS',
    'wa.title': 'New PRESORA Order', 'wa.name': 'Name', 'wa.phone': 'WhatsApp', 'wa.topic': 'Topic', 'wa.slides': 'Slides', 'wa.lang': 'Language', 'wa.type': 'Type', 'wa.deadline': 'Deadline', 'wa.instr': 'Instructions', 'wa.file': 'File', 'wa.none': 'None', 'wa.notset': 'Not set',
    'a.login': 'Admin login', 'a.email': 'Email', 'a.pw': 'Password', 'a.signin': 'Sign in', 'a.signing': 'Signing in…', 'a.loading': 'Loading…', 'a.k': 'Admin', 'a.h': 'Orders dashboard',
    'a.refresh': 'Refresh', 'a.logout': 'Log out', 'a.all': 'All', 'a.search': 'Search name, phone, topic, language…', 'a.none': 'No orders found.', 'a.slides': '{n} slides',
    'a.customer': 'Customer', 'a.wa': 'WhatsApp', 'a.lang': 'Language', 'a.type': 'Type', 'a.deadline': 'Deadline', 'a.ordered': 'Ordered', 'a.instr': 'Instructions',
    'a.msg': 'Message customer', 'a.file': 'Open file', 'a.del': 'Delete', 'a.confirm': 'Delete this order permanently?',
    'st.pending': 'Pending', 'st.in_progress': 'In progress', 'st.completed': 'Completed',
  },
  fr: {
    'nav.home': 'Accueil', 'nav.services': 'Services', 'nav.order': 'Commande', 'nav.contact': 'Contact', 'nav.cta': 'Commander', 'nav.menu': 'Menu', 'nav.lang': 'Langue',
    'brand.tag': 'WE TURN IDEAS INTO IMPACT.',
    'hero.badge': 'Studio de design PowerPoint sur mesure', 'hero.t1': 'Vos idées,', 'hero.t2': 'magnifiquement présentées.',
    'hero.sub': 'PRESORA conçoit des présentations PowerPoint sur mesure pour les étudiants, les universités et les entreprises, en anglais, français, arabe et italien. Indiquez-nous votre sujet et votre date limite.',
    'hero.c1': 'Commander', 'hero.c2': 'Voir les services', 'hero.scroll': 'DÉFILER',
    'k.services': 'Services', 'h.services': 'Ce que nous créons', 'k.portfolio': 'Portfolio', 'h.portfolio': 'Exemples de designs',
    'portfolio.note': 'Aperçus de style à titre d’illustration, pas des projets clients.', 'sample': 'Exemple', 'k.why': 'Pourquoi PRESORA', 'h.why': 'Pensé selon vos besoins',
    'k.process': 'Processus', 'h.process': 'Comment commander', 'k.faq': 'FAQ', 'h.faq': 'Questions fréquentes', 'h.services2': 'Des présentations pour chaque besoin',
    'sv.School.t': 'Présentations scolaires', 'sv.School.d': 'Des diapositives claires et colorées pour vos exposés, rapports et projets de classe.',
    'sv.University.t': 'Présentations universitaires', 'sv.University.d': 'Des présentations académiques pour mémoires, séminaires et soutenances, bien structurées.',
    'sv.Business.t': 'Présentations professionnelles', 'sv.Business.d': 'Pitch decks, présentations d’entreprise et rapports pour clients et investisseurs.',
    'sv.Creative.t': 'PowerPoint créatif', 'sv.Creative.d': 'Des designs audacieux sur mesure, animations et storytelling pour toute idée.', 'sv.order': 'Commander',
    'pf.1': 'Pitch deck de startup', 'pf.2': 'Recherche en biologie', 'pf.3': 'Plan marketing', 'pf.4': 'Projet d’histoire',
    'w1.t': 'Quatre langues', 'w1.d': 'Présentations en anglais, français, arabe et italien.', 'w2.t': 'Design sur mesure', 'w2.d': 'Conçu pour votre sujet, pas un modèle recyclé.',
    'w3.t': 'Votre date limite', 'w3.d': 'Indiquez la date au moment de la commande.', 'w4.t': 'Contact direct', 'w4.d': 'Votre commande s’ouvre directement dans WhatsApp.',
    'p1.t': 'Remplissez le formulaire', 'p1.d': 'Sujet, diapositives, langue, type et date limite. Joignez des fichiers si vous le souhaitez.',
    'p2.t': 'Envoyez sur WhatsApp', 'p2.d': 'Votre commande est enregistrée, puis WhatsApp s’ouvre avec tous les détails prêts.', 'p3.t': 'Nous nous mettons au travail', 'p3.d': 'Nous vous recontactons directement au sujet de votre présentation.',
    'q1': 'De quoi ai-je besoin pour commander ?', 'a1': 'Uniquement du formulaire : votre nom, numéro WhatsApp, sujet, nombre de diapositives, langue, type et date limite. Les fichiers et instructions supplémentaires sont facultatifs.',
    'q2': 'Quelles langues de présentation sont disponibles ?', 'a2': 'Anglais, français, arabe et italien.',
    'q3': 'Comment discuter des détails ?', 'a3': 'Après l’envoi, WhatsApp s’ouvre avec votre commande pour échanger directement avec nous. Vous pouvez aussi utiliser la page Contact.',
    'q4': 'Puis-je joindre mes propres documents ?', 'a4': 'Oui. Importez un fichier de référence ou de consignes (10 Mo max) dans le formulaire.',
    'cta.t': 'Prêt pour une présentation qui se démarque ?', 'cta.b': 'Commencer ma commande',
    'o.k': 'Commande', 'o.h': 'Commandez votre présentation', 'o.name': 'Votre nom', 'o.phone': 'Numéro WhatsApp (avec indicatif du pays)', 'o.topic': 'Sujet de la présentation',
    'o.slides': 'Nombre de diapositives', 'o.lang': 'Langue de la présentation', 'o.type': 'Type', 'o.deadline': 'Date limite', 'o.instr': 'Instructions supplémentaires',
    'o.file': 'Joindre un fichier (facultatif, 10 Mo max)', 'o.pick': 'Touchez pour choisir un fichier', 'o.ph.name': 'Nom complet', 'o.ph.phone': '+213 5 00 00 00 00',
    'o.ph.topic': 'ex. Changement climatique', 'o.ph.instr': 'Couleurs, style, sources, tout ce que nous devons savoir…', 'o.prog': '{n} % des informations requises remplies',
    'o.submit': 'Envoyer et continuer sur WhatsApp', 'o.sending': 'Envoi…', 'o.note': 'Votre commande est enregistrée, puis WhatsApp s’ouvre avec vos détails prêts à envoyer.',
    'e.file': 'Le fichier est trop volumineux (10 Mo max).', 'e.slides': 'Saisissez un nombre entier de diapositives entre 1 et 200.', 'e.generic': 'Une erreur est survenue. Veuillez réessayer.',
    'type.School': 'Scolaire', 'type.University': 'Universitaire', 'type.Business': 'Professionnel', 'type.Creative': 'Créatif',
    'pl.English': 'Anglais', 'pl.French': 'Français', 'pl.Arabic': 'Arabe', 'pl.Italian': 'Italien',
    'c.k': 'Contact', 'c.h': 'Parlons-en', 'c.wa': 'WhatsApp', 'c.wad': 'Le moyen le plus rapide de nous joindre.', 'c.wab': 'Discuter sur WhatsApp', 'c.em': 'E-mail', 'c.emb': 'Envoyer un e-mail', 'c.hello': 'Bonjour PRESORA ! J’ai une question.',
    'f.rights': '© {y} PRESORA. Tous droits réservés.', 'f.made': 'Made by MS',
    'wa.title': 'Nouvelle commande PRESORA', 'wa.name': 'Nom', 'wa.phone': 'WhatsApp', 'wa.topic': 'Sujet', 'wa.slides': 'Diapositives', 'wa.lang': 'Langue', 'wa.type': 'Type', 'wa.deadline': 'Date limite', 'wa.instr': 'Instructions', 'wa.file': 'Fichier', 'wa.none': 'Aucun', 'wa.notset': 'Non définie',
    'a.login': 'Connexion admin', 'a.email': 'E-mail', 'a.pw': 'Mot de passe', 'a.signin': 'Se connecter', 'a.signing': 'Connexion…', 'a.loading': 'Chargement…', 'a.k': 'Admin', 'a.h': 'Tableau des commandes',
    'a.refresh': 'Actualiser', 'a.logout': 'Déconnexion', 'a.all': 'Toutes', 'a.search': 'Rechercher nom, téléphone, sujet, langue…', 'a.none': 'Aucune commande trouvée.', 'a.slides': '{n} diapositives',
    'a.customer': 'Client', 'a.wa': 'WhatsApp', 'a.lang': 'Langue', 'a.type': 'Type', 'a.deadline': 'Date limite', 'a.ordered': 'Commandée le', 'a.instr': 'Instructions',
    'a.msg': 'Écrire au client', 'a.file': 'Ouvrir le fichier', 'a.del': 'Supprimer', 'a.confirm': 'Supprimer définitivement cette commande ?',
    'st.pending': 'En attente', 'st.in_progress': 'En cours', 'st.completed': 'Terminée',
  },
  ar: {
    'nav.home': 'الرئيسية', 'nav.services': 'الخدمات', 'nav.order': 'الطلب', 'nav.contact': 'تواصل معنا', 'nav.cta': 'اطلب الآن', 'nav.menu': 'القائمة', 'nav.lang': 'اللغة',
    'brand.tag': 'WE TURN IDEAS INTO IMPACT.',
    'hero.badge': 'استوديو تصميم عروض PowerPoint مخصصة', 'hero.t1': 'أفكارك،', 'hero.t2': 'بأجمل صورة.',
    'hero.sub': 'تصمم PRESORA عروض PowerPoint مخصصة للطلاب والجامعات والشركات، بالعربية والإنجليزية والفرنسية والإيطالية. أخبرنا بموضوعك وموعد التسليم.',
    'hero.c1': 'اطلب الآن', 'hero.c2': 'تصفح الخدمات', 'hero.scroll': 'مرّر للأسفل',
    'k.services': 'الخدمات', 'h.services': 'ما نصممه لك', 'k.portfolio': 'الأعمال', 'h.portfolio': 'نماذج تصاميم',
    'portfolio.note': 'معاينات توضيحية للأسلوب، وليست مشاريع عملاء.', 'sample': 'نموذج', 'k.why': 'لماذا PRESORA', 'h.why': 'مصمم حول احتياجاتك',
    'k.process': 'الخطوات', 'h.process': 'كيف يتم الطلب', 'k.faq': 'الأسئلة الشائعة', 'h.faq': 'أسئلة يطرحها العملاء', 'h.services2': 'عروض تقديمية لكل حاجة',
    'sv.School.t': 'عروض مدرسية', 'sv.School.d': 'شرائح واضحة وملونة للمشاريع الصفية والتقارير والعروض.',
    'sv.University.t': 'عروض جامعية', 'sv.University.d': 'عروض أكاديمية للأطروحات والندوات ومناقشات البحوث، بتنظيم محكم.',
    'sv.Business.t': 'عروض للأعمال', 'sv.Business.d': 'عروض استثمارية وتعريفية بالشركات وتقارير للعملاء والمستثمرين.',
    'sv.Creative.t': 'PowerPoint إبداعي', 'sv.Creative.d': 'تصاميم جريئة ومخصصة مع حركات وسرد بصري لأي فكرة.', 'sv.order': 'اطلب هذه الخدمة',
    'pf.1': 'عرض شركة ناشئة', 'pf.2': 'بحث في الأحياء', 'pf.3': 'خطة تسويقية', 'pf.4': 'مشروع التاريخ',
    'w1.t': 'أربع لغات', 'w1.d': 'عروض بالعربية والإنجليزية والفرنسية والإيطالية.', 'w2.t': 'تصميم مخصص', 'w2.d': 'مصمم لموضوعك، وليس قالباً مكرراً.',
    'w3.t': 'موعدك أولاً', 'w3.d': 'حدد تاريخ التسليم عند الطلب.', 'w4.t': 'تواصل مباشر', 'w4.d': 'يُفتح طلبك مباشرة في واتساب.',
    'p1.t': 'املأ النموذج', 'p1.d': 'الموضوع وعدد الشرائح واللغة والنوع والموعد. ويمكنك إرفاق ملفات.',
    'p2.t': 'أرسل عبر واتساب', 'p2.d': 'يُحفظ طلبك ثم يُفتح واتساب وجميع التفاصيل جاهزة.', 'p3.t': 'نبدأ العمل', 'p3.d': 'نتواصل معك مباشرة بخصوص عرضك التقديمي.',
    'q1': 'ما الذي أحتاجه لتقديم طلب؟', 'a1': 'النموذج فقط: اسمك ورقم واتساب والموضوع وعدد الشرائح واللغة والنوع والموعد. الملفات والتعليمات الإضافية اختيارية.',
    'q2': 'ما لغات العروض المتاحة؟', 'a2': 'العربية والإنجليزية والفرنسية والإيطالية.',
    'q3': 'كيف أناقش التفاصيل؟', 'a3': 'بعد الإرسال يُفتح واتساب مع طلبك لتتحدث معنا مباشرة. ويمكنك أيضاً استخدام صفحة التواصل.',
    'q4': 'هل يمكنني إرفاق مواد خاصة بي؟', 'a4': 'نعم. ارفع ملفاً مرجعياً أو ملف متطلبات (حتى 10 ميغابايت) في نموذج الطلب.',
    'cta.t': 'هل أنت مستعد لعرض تقديمي مميز؟', 'cta.b': 'ابدأ طلبك',
    'o.k': 'الطلب', 'o.h': 'اطلب عرضك التقديمي', 'o.name': 'اسمك', 'o.phone': 'رقم واتساب (مع رمز الدولة)', 'o.topic': 'موضوع العرض',
    'o.slides': 'عدد الشرائح', 'o.lang': 'لغة العرض', 'o.type': 'النوع', 'o.deadline': 'موعد التسليم', 'o.instr': 'تعليمات إضافية',
    'o.file': 'إرفاق ملف (اختياري، حتى 10 ميغابايت)', 'o.pick': 'اضغط لاختيار ملف', 'o.ph.name': 'الاسم الكامل', 'o.ph.phone': '+213 5 00 00 00 00',
    'o.ph.topic': 'مثال: التغير المناخي', 'o.ph.instr': 'الألوان، الأسلوب، المصادر، أي شيء نحتاج معرفته…', 'o.prog': 'تم ملء {n}٪ من البيانات المطلوبة',
    'o.submit': 'إرسال والمتابعة عبر واتساب', 'o.sending': 'جارٍ الإرسال…', 'o.note': 'يُحفظ طلبك ثم يُفتح واتساب وتفاصيلك جاهزة للإرسال.',
    'e.file': 'حجم الملف كبير جداً (الحد الأقصى 10 ميغابايت).', 'e.slides': 'أدخل عدداً صحيحاً من الشرائح بين 1 و200.', 'e.generic': 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    'type.School': 'مدرسي', 'type.University': 'جامعي', 'type.Business': 'أعمال', 'type.Creative': 'إبداعي',
    'pl.English': 'الإنجليزية', 'pl.French': 'الفرنسية', 'pl.Arabic': 'العربية', 'pl.Italian': 'الإيطالية',
    'c.k': 'تواصل معنا', 'c.h': 'لنتحدث', 'c.wa': 'واتساب', 'c.wad': 'أسرع طريقة للوصول إلينا.', 'c.wab': 'تحدث عبر واتساب', 'c.em': 'البريد الإلكتروني', 'c.emb': 'أرسل بريداً إلكترونياً', 'c.hello': 'مرحباً PRESORA! لدي سؤال.',
    'f.rights': '© {y} PRESORA. جميع الحقوق محفوظة.', 'f.made': 'Made by MS',
    'wa.title': 'طلب جديد من PRESORA', 'wa.name': 'الاسم', 'wa.phone': 'واتساب', 'wa.topic': 'الموضوع', 'wa.slides': 'الشرائح', 'wa.lang': 'اللغة', 'wa.type': 'النوع', 'wa.deadline': 'الموعد', 'wa.instr': 'التعليمات', 'wa.file': 'الملف', 'wa.none': 'لا يوجد', 'wa.notset': 'غير محدد',
    'a.login': 'دخول المشرف', 'a.email': 'البريد الإلكتروني', 'a.pw': 'كلمة المرور', 'a.signin': 'تسجيل الدخول', 'a.signing': 'جارٍ الدخول…', 'a.loading': 'جارٍ التحميل…', 'a.k': 'المشرف', 'a.h': 'لوحة الطلبات',
    'a.refresh': 'تحديث', 'a.logout': 'تسجيل الخروج', 'a.all': 'الكل', 'a.search': 'ابحث بالاسم أو الهاتف أو الموضوع أو اللغة…', 'a.none': 'لا توجد طلبات.', 'a.slides': '{n} شريحة',
    'a.customer': 'العميل', 'a.wa': 'واتساب', 'a.lang': 'اللغة', 'a.type': 'النوع', 'a.deadline': 'الموعد', 'a.ordered': 'تاريخ الطلب', 'a.instr': 'التعليمات',
    'a.msg': 'راسل العميل', 'a.file': 'فتح الملف', 'a.del': 'حذف', 'a.confirm': 'هل تريد حذف هذا الطلب نهائياً؟',
    'st.pending': 'قيد الانتظار', 'st.in_progress': 'قيد التنفيذ', 'st.completed': 'مكتمل',
  },
}

// New keys (pricing, portfolio, comparison, order UX, admin) live in i18n.extra.js and are merged here.
for (const l in EXTRA) Object.assign(D[l], EXTRA[l])

const Ctx = createContext(null)

function detect() {
  try { const s = localStorage.getItem('presora_lang'); if (D[s]) return s } catch { /* storage unavailable */ }
  const n = (navigator.language || 'en').slice(0, 2).toLowerCase()
  return D[n] ? n : 'en'
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(detect)
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = LANGS[lang].dir
    try { localStorage.setItem('presora_lang', lang) } catch { /* storage unavailable */ }
  }, [lang])
  const t = useCallback((k, v) => {
    let s = D[lang][k] ?? D.en[k] ?? k
    if (v) for (const x in v) s = s.split(`{${x}}`).join(v[x])
    return s
  }, [lang])
  const value = useMemo(() => ({ lang, setLang, t, dir: LANGS[lang].dir, rtl: lang === 'ar' }), [lang, t])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useI18n = () => useContext(Ctx)
