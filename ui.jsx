import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

/* ==================================================================
   CENTRALIZED TRANSLATION DICTIONARY (EN / FR / AR)
   Every key holds the three languages side by side, so they stay in sync.
   Values can be strings, or arrays / objects for structured content.
   Strings may contain {placeholders} filled by t(key, { name: value }).
   Stored data (order type, language, status) is never translated;
   only the displayed labels are.
================================================================== */
// DICT-START
const DICT = {
  /* ---------- Global ---------- */
  'meta.title': {
    en: 'PRESORA — Professional Presentation Design',
    fr: 'PRESORA — Design de présentations professionnelles',
    ar: 'PRESORA — تصميم العروض التقديمية الاحترافية',
  },
  'brand.tagline': {
    en: 'WE TURN IDEAS INTO IMPACT.',
    fr: 'NOUS TRANSFORMONS VOS IDÉES EN IMPACT.',
    ar: 'نحوّل أفكارك إلى أثر.',
  },
  currency: { en: 'DZD', fr: 'DA', ar: 'دج' },
  'lang.label': { en: 'Language', fr: 'Langue', ar: 'اللغة' },
  'sign.by': { en: 'Created by', fr: 'Créé par', ar: 'من إبداع' },

  /* ---------- Intro ---------- */
  'intro.aria': {
    en: 'Welcome to PRESORA',
    fr: 'Bienvenue chez PRESORA',
    ar: 'مرحبًا بك في PRESORA',
  },
  'intro.skip': { en: 'Skip', fr: 'Passer', ar: 'تخطّي' },

  /* ---------- Navigation / footer ---------- */
  'nav.menu': { en: 'Menu', fr: 'Menu', ar: 'القائمة' },
  'nav.close': { en: 'Close', fr: 'Fermer', ar: 'إغلاق' },
  'nav.homeAria': {
    en: 'PRESORA home',
    fr: 'Accueil PRESORA',
    ar: 'الصفحة الرئيسية لـ PRESORA',
  },
  'nav.home': { en: 'Home', fr: 'Accueil', ar: 'الرئيسية' },
  'nav.services': { en: 'Services', fr: 'Services', ar: 'الخدمات' },
  'nav.order': { en: 'Order', fr: 'Commander', ar: 'اطلب الآن' },
  'nav.contact': { en: 'Contact', fr: 'Contact', ar: 'تواصل معنا' },
  'footer.pages': { en: 'Pages', fr: 'Pages', ar: 'الصفحات' },
  'footer.contact': { en: 'Contact', fr: 'Contact', ar: 'التواصل' },
  'footer.admin': { en: 'Admin', fr: 'Administration', ar: 'الإدارة' },
  'footer.rights': {
    en: '© {year} PRESORA. All rights reserved.',
    fr: '© {year} PRESORA. Tous droits réservés.',
    ar: '© {year} PRESORA. جميع الحقوق محفوظة.',
  },

  /* ---------- Shared UI components ---------- */
  'ui.orderProgress': {
    en: 'Order progress',
    fr: 'Progression de la commande',
    ar: 'تقدّم الطلب',
  },
  'ui.chooseExample': {
    en: 'Choose an example',
    fr: 'Choisissez un exemple',
    ar: 'اختر مثالًا',
  },
  'ui.beforeAfter': { en: 'Before or after', fr: 'Avant ou après', ar: 'قبل أو بعد' },
  'ui.before': { en: 'Before', fr: 'Avant', ar: 'قبل' },
  'ui.after': { en: 'After', fr: 'Après', ar: 'بعد' },
  'ui.filterCategory': {
    en: 'Filter by category',
    fr: 'Filtrer par catégorie',
    ar: 'التصفية حسب الفئة',
  },
  'ui.all': { en: 'All', fr: 'Tous', ar: 'الكل' },
  'ui.emptyTransform': {
    en: 'Real before and after examples will appear here once our portfolio is published.',
    fr: 'De vrais exemples avant/après apparaîtront ici dès la publication de notre portfolio.',
    ar: 'ستظهر هنا أمثلة حقيقية لما قبل وبعد عند نشر أعمالنا.',
  },
  'ui.emptyGallery': {
    en: 'Our portfolio is being prepared. Real projects will be published here soon.',
    fr: 'Notre portfolio est en préparation. De vrais projets seront publiés ici prochainement.',
    ar: 'نعمل على تجهيز أعمالنا. ستُنشر المشاريع الحقيقية هنا قريبًا.',
  },

  /* ---------- Services (shared by Home, Services, Order) ---------- */
  'services.items': {
    en: [
      {
        id: 'business',
        title: 'Business Presentations',
        text: 'Company profiles, reports and internal decks that look consistent and professional.',
        points: [
          'Clear structure and hierarchy',
          'Consistent layout and typography',
          'Charts and tables formatted cleanly',
        ],
      },
      {
        id: 'academic',
        title: 'Academic Presentations',
        text: 'Lectures, research and graduation defense slides that are easy to follow.',
        points: [
          'Readable, uncluttered slides',
          'Clean presentation of figures and sources',
          'Suitable for defense and class use',
        ],
      },
      {
        id: 'pitch',
        title: 'Pitch Decks & Proposals',
        text: 'Decks that explain your idea clearly to clients, partners or investors.',
        points: [
          'Focused storytelling flow',
          'Professional visual identity',
          'Ready to present or send',
        ],
      },
      {
        id: 'redesign',
        title: 'Slide Redesign',
        text: 'Already have slides? We rework them into a cleaner and more polished presentation.',
        points: [
          'Your content stays yours',
          'Improved layout and spacing',
          'Unified style across all slides',
        ],
      },
    ],
    fr: [
      {
        id: 'business',
        title: 'Présentations d’entreprise',
        text: 'Profils d’entreprise, rapports et présentations internes à l’aspect cohérent et professionnel.',
        points: [
          'Structure et hiérarchie claires',
          'Mise en page et typographie cohérentes',
          'Graphiques et tableaux mis en forme proprement',
        ],
      },
      {
        id: 'academic',
        title: 'Présentations académiques',
        text: 'Cours, recherches et soutenances faciles à suivre.',
        points: [
          'Diapositives lisibles et aérées',
          'Présentation soignée des chiffres et des sources',
          'Adaptées aux soutenances et aux cours',
        ],
      },
      {
        id: 'pitch',
        title: 'Pitch decks et propositions',
        text: 'Des présentations qui expliquent clairement votre idée à vos clients, partenaires ou investisseurs.',
        points: [
          'Un fil narratif ciblé',
          'Identité visuelle professionnelle',
          'Prêt à présenter ou à envoyer',
        ],
      },
      {
        id: 'redesign',
        title: 'Refonte de diapositives',
        text: 'Vous avez déjà des diapositives ? Nous les transformons en une présentation plus propre et plus soignée.',
        points: [
          'Votre contenu reste le vôtre',
          'Mise en page et espacement améliorés',
          'Style unifié sur toutes les diapositives',
        ],
      },
    ],
    ar: [
      {
        id: 'business',
        title: 'عروض الأعمال',
        text: 'ملفات تعريف الشركات والتقارير والعروض الداخلية بمظهر متسق واحترافي.',
        points: [
          'هيكل وتسلسل واضحان',
          'تنسيق وخطوط متناسقة',
          'رسوم بيانية وجداول منسّقة بعناية',
        ],
      },
      {
        id: 'academic',
        title: 'العروض الأكاديمية',
        text: 'محاضرات وأبحاث وشرائح مناقشة التخرج يسهل متابعتها.',
        points: [
          'شرائح مقروءة وغير مزدحمة',
          'عرض أنيق للأرقام والمصادر',
          'مناسبة للمناقشات والدروس',
        ],
      },
      {
        id: 'pitch',
        title: 'عروض المستثمرين والمقترحات',
        text: 'عروض تشرح فكرتك بوضوح للعملاء والشركاء والمستثمرين.',
        points: [
          'تسلسل قصصي مركّز',
          'هوية بصرية احترافية',
          'جاهزة للعرض أو الإرسال',
        ],
      },
      {
        id: 'redesign',
        title: 'إعادة تصميم الشرائح',
        text: 'لديك شرائح جاهزة؟ نحوّلها إلى عرض أنظف وأكثر أناقة.',
        points: [
          'محتواك يبقى لك',
          'تخطيط ومسافات أفضل',
          'أسلوب موحّد في جميع الشرائح',
        ],
      },
    ],
  },

  /* ---------- Home: hero, services, process, CTA ---------- */
  'home.hero.eyebrow': {
    en: 'Presentation design agency',
    fr: 'Agence de design de présentations',
    ar: 'وكالة تصميم العروض التقديمية',
  },
  'home.hero.text': {
    en: 'PRESORA designs clear, elegant and professional presentations for students, universities and businesses.',
    fr: 'PRESORA conçoit des présentations claires, élégantes et professionnelles pour les étudiants, les universités et les entreprises.',
    ar: 'تصمّم PRESORA عروضًا تقديمية واضحة وأنيقة واحترافية للطلاب والجامعات والشركات.',
  },
  'home.hero.order': {
    en: 'Order a presentation',
    fr: 'Commander une présentation',
    ar: 'اطلب عرضًا تقديميًا',
  },
  'home.hero.services': {
    en: 'View services',
    fr: 'Voir les services',
    ar: 'استعرض الخدمات',
  },
  'home.hero.priceLabel': {
    en: 'Simple pricing',
    fr: 'Tarification simple',
    ar: 'تسعير بسيط',
  },
  'home.hero.priceNote': {
    en: 'for every 5 slides, rounded up to the next group of 5.',
    fr: 'pour 5 diapositives, arrondi au multiple de 5 supérieur.',
    ar: 'لكل 5 شرائح، مع التقريب إلى المجموعة التالية من 5.',
  },
  'home.services.eyebrow': { en: 'Services', fr: 'Services', ar: 'الخدمات' },
  'home.services.title': {
    en: 'What we design',
    fr: 'Ce que nous concevons',
    ar: 'ما الذي نصمّمه',
  },
  'home.services.intro': {
    en: 'Every presentation is built around your content and your audience.',
    fr: 'Chaque présentation est pensée autour de votre contenu et de votre public.',
    ar: 'يُبنى كل عرض حول محتواك وجمهورك.',
  },
  'home.services.more': {
    en: 'See details and prices',
    fr: 'Voir les détails et les tarifs',
    ar: 'التفاصيل والأسعار',
  },
  'process.eyebrow': { en: 'Process', fr: 'Processus', ar: 'آلية العمل' },
  'process.title': { en: 'How it works', fr: 'Comment ça marche', ar: 'كيف نعمل' },
  'process.steps': {
    en: [
      {
        n: '01',
        title: 'Send your brief',
        text: 'Tell us your topic, number of slides, language and deadline, and attach any files you have.',
      },
      {
        n: '02',
        title: 'We design',
        text: 'We turn your content into a clean, professional presentation that fits your audience.',
      },
      {
        n: '03',
        title: 'Receive on WhatsApp',
        text: 'The finished presentation is delivered to you directly through WhatsApp.',
      },
    ],
    fr: [
      {
        n: '01',
        title: 'Envoyez votre brief',
        text: 'Indiquez votre sujet, le nombre de diapositives, la langue et le délai, et joignez vos fichiers.',
      },
      {
        n: '02',
        title: 'Nous concevons',
        text: 'Nous transformons votre contenu en une présentation propre et professionnelle, adaptée à votre public.',
      },
      {
        n: '03',
        title: 'Réception sur WhatsApp',
        text: 'La présentation terminée vous est envoyée directement via WhatsApp.',
      },
    ],
    ar: [
      {
        n: '01',
        title: 'أرسل طلبك',
        text: 'أخبرنا بموضوعك وعدد الشرائح واللغة والموعد النهائي، وأرفق ما لديك من ملفات.',
      },
      {
        n: '02',
        title: 'نحن نصمّم',
        text: 'نحوّل محتواك إلى عرض تقديمي أنيق واحترافي يناسب جمهورك.',
      },
      {
        n: '03',
        title: 'استلام عبر واتساب',
        text: 'يصلك العرض الجاهز مباشرة عبر واتساب.',
      },
    ],
  },
  'cta.title': {
    en: 'YOUR NEXT PRESENTATION STARTS HERE.',
    fr: 'VOTRE PROCHAINE PRÉSENTATION COMMENCE ICI.',
    ar: 'عرضك التقديمي القادم يبدأ من هنا.',
  },
  'cta.text': {
    en: 'Send your order in a few minutes and we will take it from there.',
    fr: 'Envoyez votre commande en quelques minutes, nous nous occupons du reste.',
    ar: 'أرسل طلبك في دقائق وسنتولّى الباقي.',
  },
  'cta.button': {
    en: 'ORDER A PRESENTATION',
    fr: 'COMMANDER UNE PRÉSENTATION',
    ar: 'اطلب عرضًا تقديميًا',
  },

  /* ---------- Signature Showcase ---------- */
  'show.eyebrow': {
    en: 'Signature Showcase',
    fr: 'Vitrine signature',
    ar: 'معرض التميّز',
  },
  'show.title': {
    en: 'DESIGN THAT MAKES AN IMPACT.',
    fr: 'UN DESIGN QUI MARQUE LES ESPRITS.',
    ar: 'تصميم يترك أثرًا.',
  },
  'show.intro': {
    en: 'PRESORA turns raw ideas into clear, refined presentations. Explore original sample designs across four categories.',
    fr: 'PRESORA transforme des idées brutes en présentations claires et raffinées. Explorez des exemples originaux dans quatre catégories.',
    ar: 'تحوّل PRESORA الأفكار الخام إلى عروض واضحة وأنيقة. استكشف نماذج أصلية في أربع فئات.',
  },
  'show.tabsAria': {
    en: 'Presentation categories',
    fr: 'Catégories de présentations',
    ar: 'فئات العروض التقديمية',
  },
  'show.note': {
    en: 'Original sample content for illustration. These are not client projects.',
    fr: 'Contenu d’exemple original, à titre d’illustration. Il ne s’agit pas de projets clients.',
    ar: 'محتوى نموذجي أصلي للتوضيح فقط. هذه ليست مشاريع عملاء.',
  },
  'show.slideOf': {
    en: 'Slide {n} of {total}',
    fr: 'Diapositive {n} sur {total}',
    ar: 'الشريحة {n} من {total}',
  },
  'show.prev': { en: 'Previous', fr: 'Précédent', ar: 'السابق' },
  'show.next': { en: 'Next', fr: 'Suivant', ar: 'التالي' },
  'show.goTo': {
    en: 'Go to slide {n}',
    fr: 'Aller à la diapositive {n}',
    ar: 'الانتقال إلى الشريحة {n}',
  },
  'show.sampleAria': {
    en: '{label} sample presentation',
    fr: 'Exemple de présentation : {label}',
    ar: 'عرض تقديمي نموذجي: {label}',
  },
  'show.categories': {
    en: [
      {
        id: 'business',
        label: 'Business',
        deck: 'Annual Review',
        slides: [
          {
            layout: 'cover',
            kicker: 'ANNUAL REVIEW',
            title: 'A year of steady, focused growth',
            text: 'Company overview · Sample deck',
          },
          {
            layout: 'stats',
            title: 'Highlights',
            items: [
              { value: '4', label: 'New markets' },
              { value: '12', label: 'Product releases' },
              { value: '92%', label: 'Team engagement' },
            ],
          },
          {
            layout: 'bars',
            title: 'Growth by quarter',
            bars: [
              { label: 'Q1', value: 40 },
              { label: 'Q2', value: 58 },
              { label: 'Q3', value: 72 },
              { label: 'Q4', value: 90 },
            ],
          },
          {
            layout: 'closing',
            title: 'Next: scale what works',
            text: 'Three priorities for the year ahead',
          },
        ],
      },
      {
        id: 'education',
        label: 'Education',
        deck: 'Lecture · Module 03',
        slides: [
          {
            layout: 'cover',
            kicker: 'LECTURE · MODULE 03',
            title: 'How memory shapes learning',
            text: 'Cognitive science · Sample deck',
          },
          {
            layout: 'list',
            title: 'Learning objectives',
            items: [
              { n: '01', t: 'Explain how memory is encoded' },
              { n: '02', t: 'Compare short and long-term memory' },
              { n: '03', t: 'Apply spaced practice when studying' },
            ],
          },
          {
            layout: 'list',
            title: 'Study strategy',
            items: [
              { n: '01', t: 'Space your practice over time' },
              { n: '02', t: 'Test yourself, do not just reread' },
              { n: '03', t: 'Teach the idea back in your own words' },
            ],
          },
          {
            layout: 'closing',
            title: 'Questions and discussion',
            text: 'Next session: attention and focus',
          },
        ],
      },
      {
        id: 'marketing',
        label: 'Marketing',
        deck: 'Campaign Proposal',
        slides: [
          {
            layout: 'cover',
            kicker: 'CAMPAIGN PROPOSAL',
            title: 'Spring launch campaign',
            text: 'Marketing strategy · Sample deck',
          },
          {
            layout: 'list',
            title: 'Audience and message',
            items: [
              { n: '01', t: 'Who we speak to' },
              { n: '02', t: 'What we promise them' },
              { n: '03', t: 'Where we show up' },
            ],
          },
          {
            layout: 'bars',
            title: 'Channel mix (sample)',
            bars: [
              { label: 'Social', value: 70 },
              { label: 'Email', value: 55 },
              { label: 'Search', value: 45 },
              { label: 'Events', value: 30 },
            ],
          },
          {
            layout: 'closing',
            title: 'One idea. Every channel.',
            text: 'Campaign timeline: 8 weeks',
          },
        ],
      },
      {
        id: 'pitch',
        label: 'Pitch Deck',
        deck: 'Seed Pitch',
        slides: [
          {
            layout: 'cover',
            kicker: 'PITCH DECK',
            title: 'A smarter way to plan group trips',
            text: 'Seed pitch · Sample deck',
          },
          {
            layout: 'list',
            title: 'The problem',
            items: [
              { n: '01', t: 'Planning is scattered across chats' },
              { n: '02', t: 'Decisions take too long' },
              { n: '03', t: 'Costs stay unclear until the end' },
            ],
          },
          {
            layout: 'stats',
            title: 'Traction (sample)',
            items: [
              { value: '1.2k', label: 'Waitlist sign-ups' },
              { value: '38%', label: 'Weekly active' },
              { value: '4.6', label: 'Average rating' },
            ],
          },
          {
            layout: 'closing',
            title: 'The ask',
            text: 'Join us in building what comes next',
          },
        ],
      },
    ],
    fr: [
      {
        id: 'business',
        label: 'Entreprise',
        deck: 'Bilan annuel',
        slides: [
          {
            layout: 'cover',
            kicker: 'BILAN ANNUEL',
            title: 'Une année de croissance régulière et ciblée',
            text: 'Présentation de l’entreprise · Exemple',
          },
          {
            layout: 'stats',
            title: 'Faits marquants',
            items: [
              { value: '4', label: 'Nouveaux marchés' },
              { value: '12', label: 'Lancements de produits' },
              { value: '92%', label: 'Engagement des équipes' },
            ],
          },
          {
            layout: 'bars',
            title: 'Croissance par trimestre',
            bars: [
              { label: 'T1', value: 40 },
              { label: 'T2', value: 58 },
              { label: 'T3', value: 72 },
              { label: 'T4', value: 90 },
            ],
          },
          {
            layout: 'closing',
            title: 'Prochaine étape : amplifier ce qui fonctionne',
            text: 'Trois priorités pour l’année à venir',
          },
        ],
      },
      {
        id: 'education',
        label: 'Éducation',
        deck: 'Cours · Module 03',
        slides: [
          {
            layout: 'cover',
            kicker: 'COURS · MODULE 03',
            title: 'Comment la mémoire façonne l’apprentissage',
            text: 'Sciences cognitives · Exemple',
          },
          {
            layout: 'list',
            title: 'Objectifs d’apprentissage',
            items: [
              { n: '01', t: 'Expliquer comment la mémoire encode l’information' },
              { n: '02', t: 'Comparer mémoire à court terme et à long terme' },
              { n: '03', t: 'Appliquer la pratique espacée pour réviser' },
            ],
          },
          {
            layout: 'list',
            title: 'Stratégie d’étude',
            items: [
              { n: '01', t: 'Espacer ses révisions dans le temps' },
              { n: '02', t: 'Se tester plutôt que relire' },
              { n: '03', t: 'Réexpliquer l’idée avec ses propres mots' },
            ],
          },
          {
            layout: 'closing',
            title: 'Questions et discussion',
            text: 'Prochaine séance : attention et concentration',
          },
        ],
      },
      {
        id: 'marketing',
        label: 'Marketing',
        deck: 'Proposition de campagne',
        slides: [
          {
            layout: 'cover',
            kicker: 'PROPOSITION DE CAMPAGNE',
            title: 'Campagne de lancement de printemps',
            text: 'Stratégie marketing · Exemple',
          },
          {
            layout: 'list',
            title: 'Audience et message',
            items: [
              { n: '01', t: 'À qui nous nous adressons' },
              { n: '02', t: 'Ce que nous leur promettons' },
              { n: '03', t: 'Où nous sommes présents' },
            ],
          },
          {
            layout: 'bars',
            title: 'Mix des canaux (exemple)',
            bars: [
              { label: 'Réseaux', value: 70 },
              { label: 'E-mail', value: 55 },
              { label: 'Recherche', value: 45 },
              { label: 'Événements', value: 30 },
            ],
          },
          {
            layout: 'closing',
            title: 'Une idée. Tous les canaux.',
            text: 'Calendrier de la campagne : 8 semaines',
          },
        ],
      },
      {
        id: 'pitch',
        label: 'Pitch deck',
        deck: 'Pitch d’amorçage',
        slides: [
          {
            layout: 'cover',
            kicker: 'PITCH DECK',
            title: 'Une façon plus simple d’organiser des voyages en groupe',
            text: 'Pitch d’amorçage · Exemple',
          },
          {
            layout: 'list',
            title: 'Le problème',
            items: [
              { n: '01', t: 'L’organisation est éparpillée entre les discussions' },
              { n: '02', t: 'Les décisions prennent trop de temps' },
              { n: '03', t: 'Les coûts restent flous jusqu’à la fin' },
            ],
          },
          {
            layout: 'stats',
            title: 'Traction (exemple)',
            items: [
              { value: '1,2k', label: 'Inscrits sur liste d’attente' },
              { value: '38%', label: 'Actifs chaque semaine' },
              { value: '4,6', label: 'Note moyenne' },
            ],
          },
          {
            layout: 'closing',
            title: 'La demande',
            text: 'Rejoignez-nous pour construire la suite',
          },
        ],
      },
    ],
    ar: [
      {
        id: 'business',
        label: 'الأعمال',
        deck: 'المراجعة السنوية',
        slides: [
          {
            layout: 'cover',
            kicker: 'المراجعة السنوية',
            title: 'عام من النمو المتواصل والمركّز',
            text: 'نظرة عامة على الشركة · عرض نموذجي',
          },
          {
            layout: 'stats',
            title: 'أبرز الإنجازات',
            items: [
              { value: '4', label: 'أسواق جديدة' },
              { value: '12', label: 'إصدارات للمنتجات' },
              { value: '92%', label: 'مشاركة الفريق' },
            ],
          },
          {
            layout: 'bars',
            title: 'النمو حسب الربع',
            bars: [
              { label: 'ر1', value: 40 },
              { label: 'ر2', value: 58 },
              { label: 'ر3', value: 72 },
              { label: 'ر4', value: 90 },
            ],
          },
          {
            layout: 'closing',
            title: 'الخطوة التالية: توسيع ما ينجح',
            text: 'ثلاث أولويات للعام القادم',
          },
        ],
      },
      {
        id: 'education',
        label: 'التعليم',
        deck: 'محاضرة · الوحدة 03',
        slides: [
          {
            layout: 'cover',
            kicker: 'محاضرة · الوحدة 03',
            title: 'كيف تشكّل الذاكرة عملية التعلّم',
            text: 'علم النفس المعرفي · عرض نموذجي',
          },
          {
            layout: 'list',
            title: 'أهداف التعلّم',
            items: [
              { n: '01', t: 'شرح كيفية ترميز الذاكرة للمعلومات' },
              { n: '02', t: 'المقارنة بين الذاكرة قصيرة المدى وطويلة المدى' },
              { n: '03', t: 'تطبيق المراجعة المتباعدة أثناء الدراسة' },
            ],
          },
          {
            layout: 'list',
            title: 'استراتيجية الدراسة',
            items: [
              { n: '01', t: 'وزّع مراجعتك على فترات متباعدة' },
              { n: '02', t: 'اختبر نفسك بدل الاكتفاء بإعادة القراءة' },
              { n: '03', t: 'اشرح الفكرة بأسلوبك الخاص' },
            ],
          },
          {
            layout: 'closing',
            title: 'أسئلة ونقاش',
            text: 'الجلسة القادمة: الانتباه والتركيز',
          },
        ],
      },
      {
        id: 'marketing',
        label: 'التسويق',
        deck: 'مقترح حملة',
        slides: [
          {
            layout: 'cover',
            kicker: 'مقترح حملة',
            title: 'حملة إطلاق الربيع',
            text: 'استراتيجية التسويق · عرض نموذجي',
          },
          {
            layout: 'list',
            title: 'الجمهور والرسالة',
            items: [
              { n: '01', t: 'من نخاطب' },
              { n: '02', t: 'ماذا نَعِدهم' },
              { n: '03', t: 'أين نظهر' },
            ],
          },
          {
            layout: 'bars',
            title: 'توزيع القنوات (نموذج)',
            bars: [
              { label: 'التواصل الاجتماعي', value: 70 },
              { label: 'البريد', value: 55 },
              { label: 'البحث', value: 45 },
              { label: 'الفعاليات', value: 30 },
            ],
          },
          {
            layout: 'closing',
            title: 'فكرة واحدة. في كل القنوات.',
            text: 'الجدول الزمني للحملة: 8 أسابيع',
          },
        ],
      },
      {
        id: 'pitch',
        label: 'عرض استثماري',
        deck: 'عرض تمويل أولي',
        slides: [
          {
            layout: 'cover',
            kicker: 'عرض استثماري',
            title: 'طريقة أذكى لتخطيط رحلات المجموعات',
            text: 'عرض تمويل أولي · عرض نموذجي',
          },
          {
            layout: 'list',
            title: 'المشكلة',
            items: [
              { n: '01', t: 'التخطيط مشتّت بين المحادثات' },
              { n: '02', t: 'اتخاذ القرارات يستغرق وقتًا طويلًا' },
              { n: '03', t: 'تبقى التكاليف غير واضحة حتى النهاية' },
            ],
          },
          {
            layout: 'stats',
            title: 'المؤشرات (نموذج)',
            items: [
              { value: '1.2k', label: 'مسجّلون في قائمة الانتظار' },
              { value: '38%', label: 'نشطون أسبوعيًا' },
              { value: '4.6', label: 'متوسط التقييم' },
            ],
          },
          {
            layout: 'closing',
            title: 'الطلب',
            text: 'انضم إلينا في بناء ما هو قادم',
          },
        ],
      },
    ],
  },
     /* ---------- Design quality comparison ---------- */
  'versus.eyebrow': {
    en: 'Design quality',
    fr: 'Qualité du design',
    ar: 'جودة التصميم',
  },
  'versus.title': {
    en: 'The difference is in the details',
    fr: 'La différence se joue dans les détails',
    ar: 'الفرق في التفاصيل',
  },
  'versus.intro': {
    en: 'The same content, presented two ways.',
    fr: 'Le même contenu, présenté de deux façons.',
    ar: 'المحتوى نفسه، مقدَّم بطريقتين.',
  },
  'versus.data': {
    en: {
      plain: {
        title: 'Quarterly Results Summary',
        bullets: [
          'Revenue was up compared to last quarter',
          'Costs were reduced in several departments',
          'New customers joined in all regions',
          'Customer support tickets were resolved',
          'The team will continue to work hard',
          'More details are in the attached report',
        ],
      },
      plainCap: {
        title: 'Ordinary design',
        points: [
          'Crowded text and no hierarchy',
          'Default fonts and flat colors',
          'The key message is easy to miss',
        ],
      },
      proCap: {
        title: 'PRESORA design',
        points: [
          'One clear message per slide',
          'Strong hierarchy and consistent system',
          'Key numbers stand out instantly',
        ],
      },
      pro: {
        label: 'Quarterly results',
        title: 'Steady growth, clearer costs',
        items: [
          { value: '+18%', label: 'Revenue' },
          { value: '-9%', label: 'Costs' },
          { value: '+240', label: 'New customers' },
        ],
      },
    },
    fr: {
      plain: {
        title: 'Résumé des résultats trimestriels',
        bullets: [
          'Le chiffre d’affaires a augmenté par rapport au trimestre précédent',
          'Les coûts ont été réduits dans plusieurs services',
          'De nouveaux clients ont rejoint toutes les régions',
          'Les demandes d’assistance ont été traitées',
          'L’équipe va continuer à travailler dur',
          'Plus de détails dans le rapport joint',
        ],
      },
      plainCap: {
        title: 'Design ordinaire',
        points: [
          'Texte chargé et aucune hiérarchie',
          'Polices par défaut et couleurs plates',
          'Le message clé passe facilement inaperçu',
        ],
      },
      proCap: {
        title: 'Design PRESORA',
        points: [
          'Un message clair par diapositive',
          'Hiérarchie forte et système cohérent',
          'Les chiffres clés ressortent instantanément',
        ],
      },
      pro: {
        label: 'Résultats trimestriels',
        title: 'Croissance régulière, coûts plus clairs',
        items: [
          { value: '+18%', label: 'Chiffre d’affaires' },
          { value: '-9%', label: 'Coûts' },
          { value: '+240', label: 'Nouveaux clients' },
        ],
      },
    },
    ar: {
      plain: {
        title: 'ملخص نتائج الربع',
        bullets: [
          'ارتفعت الإيرادات مقارنة بالربع السابق',
          'تم خفض التكاليف في عدة أقسام',
          'انضم عملاء جدد في جميع المناطق',
          'تمت معالجة طلبات الدعم',
          'سيواصل الفريق العمل بجد',
          'مزيد من التفاصيل في التقرير المرفق',
        ],
      },
      plainCap: {
        title: 'التصميم العادي',
        points: [
          'نص مزدحم وبلا تسلسل واضح',
          'خطوط افتراضية وألوان باهتة',
          'الرسالة الرئيسية يسهل تفويتها',
        ],
      },
      proCap: {
        title: 'تصميم PRESORA',
        points: [
          'رسالة واحدة واضحة في كل شريحة',
          'تسلسل بصري قوي ونظام متناسق',
          'الأرقام المهمة تلفت النظر فورًا',
        ],
      },
      pro: {
        label: 'نتائج الربع',
        title: 'نمو مستقر وتكاليف أوضح',
        items: [
          { value: '+18%', label: 'الإيرادات' },
          { value: '-9%', label: 'التكاليف' },
          { value: '+240', label: 'عملاء جدد' },
        ],
      },
    },
  },

  /* ---------- The Design Reaction ---------- */
  'rx.eyebrow': {
    en: 'The Design Reaction',
    fr: 'La Réaction du design',
    ar: 'ردّ فعل التصميم',
  },
  'rx.title': {
    en: 'YOUR IDEAS DESERVE TO BE SEEN DIFFERENTLY.',
    fr: 'VOS IDÉES MÉRITENT D’ÊTRE VUES AUTREMENT.',
    ar: 'أفكارك تستحق أن تُرى بشكل مختلف.',
  },
  'rx.intro': {
    en: 'One slide, three directions. Choose one and watch the same message change how it feels.',
    fr: 'Une diapositive, trois directions. Choisissez-en une et voyez le même message changer de ton.',
    ar: 'شريحة واحدة بثلاثة اتجاهات. اختر اتجاهًا وشاهد كيف تتغير مشاعر الرسالة نفسها.',
  },
  'rx.tabsAria': {
    en: 'Design directions',
    fr: 'Directions de design',
    ar: 'اتجاهات التصميم',
  },
  'rx.same': { en: 'Same idea', fr: 'Même idée', ar: 'الفكرة نفسها' },
  'rx.dirCount': {
    en: 'Direction {n} of {total} · {label}',
    fr: 'Direction {n} sur {total} · {label}',
    ar: 'الاتجاه {n} من {total} · {label}',
  },
  'rx.dirAria': {
    en: '{label} direction',
    fr: 'Direction {label}',
    ar: 'اتجاه {label}',
  },
  'rx.content': {
    en: {
      title: 'The Future Starts With One Idea',
      subtitle: 'Turning possibilities into meaningful progress.',
    },
    fr: {
      title: 'Le futur commence par une idée',
      subtitle: 'Transformer les possibles en progrès concret.',
    },
    ar: {
      title: 'المستقبل يبدأ بفكرة واحدة',
      subtitle: 'نحوّل الإمكانات إلى تقدّم ذي معنى.',
    },
  },
  'rx.dirs': {
    en: {
      minimal: { label: 'Minimal', line: 'Less noise. More meaning.' },
      bold: { label: 'Bold', line: 'Make your message impossible to overlook.' },
      editorial: { label: 'Editorial', line: 'Every idea deserves its own visual story.' },
    },
    fr: {
      minimal: { label: 'Minimal', line: 'Moins de bruit. Plus de sens.' },
      bold: { label: 'Audacieux', line: 'Rendez votre message impossible à ignorer.' },
      editorial: { label: 'Éditorial', line: 'Chaque idée mérite sa propre histoire visuelle.' },
    },
    ar: {
      minimal: { label: 'بسيط', line: 'ضجيج أقل. معنى أكثر.' },
      bold: { label: 'جريء', line: 'اجعل رسالتك مستحيلة التجاهل.' },
      editorial: { label: 'تحريري', line: 'كل فكرة تستحق قصتها البصرية.' },
    },
  },
  'rx.statement': {
    en: 'Same idea. Different feeling. That’s the power of design.',
    fr: 'Même idée. Autre émotion. C’est la force du design.',
    ar: 'الفكرة نفسها. شعور مختلف. هذه هي قوة التصميم.',
  },
  'rx.cta': {
    en: 'CREATE YOUR PRESENTATION',
    fr: 'CRÉEZ VOTRE PRÉSENTATION',
    ar: 'أنشئ عرضك التقديمي',
  },

  /* ---------- Visual Playground ---------- */
  'pg.eyebrow': {
    en: 'Visual Playground',
    fr: 'Laboratoire visuel',
    ar: 'مختبر التصميم',
  },
  'pg.title': {
    en: 'Design isn’t just something you see. It’s something you experience.',
    fr: 'Le design ne se contente pas d’être vu. Il se vit.',
    ar: 'التصميم ليس شيئًا تراه فقط، بل شيء تعيشه.',
  },
  'pg.intro': {
    en: 'Experiment with type, composition and color. Every change happens live on the canvas.',
    fr: 'Expérimentez avec la typographie, la composition et la couleur. Chaque changement s’affiche en direct sur le canevas.',
    ar: 'جرّب الخطوط والتكوين والألوان. كل تغيير يظهر مباشرة على اللوحة.',
  },
  'pg.labsAria': {
    en: 'Playground labs',
    fr: 'Ateliers du laboratoire',
    ar: 'أقسام المختبر',
  },
  'pg.canvasAria': {
    en: 'Live design canvas',
    fr: 'Canevas de design en direct',
    ar: 'لوحة التصميم المباشرة',
  },
  'pg.kicker': {
    en: 'PRESORA · VISUAL PLAYGROUND',
    fr: 'PRESORA · LABORATOIRE VISUEL',
    ar: 'PRESORA · مختبر التصميم',
  },
  'pg.defaultTitle': {
    en: 'Design is an experience',
    fr: 'Le design est une expérience',
    ar: 'التصميم تجربة',
  },
  'pg.customSub': {
    en: 'Your direction. Our craft.',
    fr: 'Votre direction. Notre savoir-faire.',
    ar: 'اتجاهك. وحِرفتنا.',
  },
  'pg.caption': {
    en: 'Direction: {name}',
    fr: 'Direction : {name}',
    ar: 'الاتجاه: {name}',
  },
  'pg.custom': { en: 'Custom', fr: 'Personnalisé', ar: 'مخصّص' },
  'pg.palette': {
    en: '{name} palette',
    fr: 'Palette {name}',
    ar: 'لوحة {name}',
  },
  'pg.surprise': { en: 'Surprise me', fr: 'Surprenez-moi', ar: 'فاجئني' },
  'pg.reset': { en: 'Reset', fr: 'Réinitialiser', ar: 'إعادة ضبط' },
  'pg.headline': { en: 'Your headline', fr: 'Votre titre', ar: 'عنوانك' },
  'pg.headlineHint': {
    en: 'Try your own words.',
    fr: 'Essayez vos propres mots.',
    ar: 'جرّب كلماتك الخاصة.',
  },
  'pg.groups': {
    en: {
      type: 'Typeface',
      align: 'Alignment',
      weight: 'Weight',
      size: 'Size',
      layout: 'Layout',
      palette: 'Palette',
      bg: 'Background',
      shape: 'Shape',
    },
    fr: {
      type: 'Police',
      align: 'Alignement',
      weight: 'Graisse',
      size: 'Taille',
      layout: 'Mise en page',
      palette: 'Palette',
      bg: 'Arrière-plan',
      shape: 'Forme',
    },
    ar: {
      type: 'الخط',
      align: 'المحاذاة',
      weight: 'السماكة',
      size: 'الحجم',
      layout: 'التكوين',
      palette: 'لوحة الألوان',
      bg: 'الخلفية',
      shape: 'الشكل',
    },
  },
  'pg.opt': {
    en: {
      type: { serif: 'Serif', sans: 'Sans', caps: 'Caps', mixed: 'Mixed' },
      align: { left: 'Left', center: 'Center', right: 'Right' },
      weight: { 400: 'Regular', 500: 'Medium', 600: 'Semibold' },
      size: { s: 'Small', m: 'Medium', l: 'Large' },
      layout: {
        centered: 'Centered',
        editorial: 'Editorial',
        asymmetric: 'Asymmetric',
        minimal: 'Minimal',
      },
      palette: { midnight: 'Midnight', silver: 'Silver', steel: 'Steel', neon: 'Neon' },
      bg: { plain: 'Plain', gradient: 'Gradient', grid: 'Grid', frame: 'Frame' },
      shape: { none: 'None', line: 'Line', ring: 'Ring', bars: 'Bars' },
    },
    fr: {
      type: { serif: 'Serif', sans: 'Sans-serif', caps: 'Capitales', mixed: 'Mixte' },
      align: { left: 'Gauche', center: 'Centré', right: 'Droite' },
      weight: { 400: 'Normal', 500: 'Medium', 600: 'Semi-gras' },
      size: { s: 'Petit', m: 'Moyen', l: 'Grand' },
      layout: {
        centered: 'Centré',
        editorial: 'Éditorial',
        asymmetric: 'Asymétrique',
        minimal: 'Minimal',
      },
      palette: { midnight: 'Minuit', silver: 'Argent', steel: 'Acier', neon: 'Néon' },
      bg: { plain: 'Uni', gradient: 'Dégradé', grid: 'Grille', frame: 'Cadre' },
      shape: { none: 'Aucune', line: 'Ligne', ring: 'Anneau', bars: 'Barres' },
    },
    ar: {
      type: { serif: 'سيريف', sans: 'سانس', caps: 'أحرف كبيرة', mixed: 'مختلط' },
      align: { left: 'يسار', center: 'وسط', right: 'يمين' },
      weight: { 400: 'عادي', 500: 'متوسط', 600: 'سميك' },
      size: { s: 'صغير', m: 'متوسط', l: 'كبير' },
      layout: {
        centered: 'متمركز',
        editorial: 'تحريري',
        asymmetric: 'غير متماثل',
        minimal: 'بسيط',
      },
      palette: { midnight: 'منتصف الليل', silver: 'فضي', steel: 'فولاذي', neon: 'نيون' },
      bg: { plain: 'سادة', gradient: 'تدرّج', grid: 'شبكة', frame: 'إطار' },
      shape: { none: 'بلا', line: 'خط', ring: 'حلقة', bars: 'أعمدة' },
    },
  },
  'pg.presets': {
    en: {
      minimal: { label: 'Minimal', note: 'Less, but better.' },
      editorial: { label: 'Editorial', note: 'A story told in type.' },
      corporate: { label: 'Corporate', note: 'Clarity is a design decision.' },
      bold: { label: 'Bold', note: 'Confidence, made visible.' },
    },
    fr: {
      minimal: { label: 'Minimal', note: 'Moins, mais mieux.' },
      editorial: { label: 'Éditorial', note: 'Une histoire racontée par la typographie.' },
      corporate: { label: 'Corporate', note: 'La clarté est un choix de design.' },
      bold: { label: 'Audacieux', note: 'La confiance, rendue visible.' },
    },
    ar: {
      minimal: { label: 'بسيط', note: 'الأقل، لكن الأفضل.' },
      editorial: { label: 'تحريري', note: 'قصة تُروى بالحروف.' },
      corporate: { label: 'مؤسسي', note: 'الوضوح قرار تصميمي.' },
      bold: { label: 'جريء', note: 'الثقة وقد صارت مرئية.' },
    },
  },
  'pg.labs': {
    en: {
      directions: {
        label: 'Directions',
        line: 'Four starting points. Each one is a different point of view.',
      },
      typography: { label: 'Typography', line: 'Every detail has a purpose.' },
      composition: { label: 'Composition', line: 'One idea. Different perspectives.' },
      color: { label: 'Color', line: 'Good design makes ideas feel different.' },
      elements: { label: 'Elements', line: 'Small marks. A big difference.' },
    },
    fr: {
      directions: {
        label: 'Directions',
        line: 'Quatre points de départ. Chacun, un regard différent.',
      },
      typography: { label: 'Typographie', line: 'Chaque détail a une raison d’être.' },
      composition: { label: 'Composition', line: 'Une idée. Des perspectives différentes.' },
      color: {
        label: 'Couleur',
        line: 'Un bon design change la façon dont une idée est perçue.',
      },
      elements: { label: 'Éléments', line: 'De petits détails. Une grande différence.' },
    },
    ar: {
      directions: {
        label: 'الاتجاهات',
        line: 'أربع نقاط انطلاق. لكلٍّ منها زاوية نظر مختلفة.',
      },
      typography: { label: 'الخطوط', line: 'لكل تفصيل غرض.' },
      composition: { label: 'التكوين', line: 'فكرة واحدة. منظورات مختلفة.' },
      color: { label: 'الألوان', line: 'التصميم الجيد يجعل الأفكار تبدو مختلفة.' },
      elements: { label: 'العناصر', line: 'تفاصيل صغيرة. فرق كبير.' },
    },
  },

  /* ---------- Services page ---------- */
  'svc.eyebrow': { en: 'Services', fr: 'Services', ar: 'الخدمات' },
  'svc.title': {
    en: 'Presentation design services',
    fr: 'Services de design de présentations',
    ar: 'خدمات تصميم العروض التقديمية',
  },
  'svc.intro': {
    en: 'Choose the type of presentation you need. Pricing is the same for every service.',
    fr: 'Choisissez le type de présentation dont vous avez besoin. Le tarif est le même pour tous les services.',
    ar: 'اختر نوع العرض الذي تحتاجه. السعر نفسه لجميع الخدمات.',
  },
  'svc.priceEyebrow': { en: 'Pricing', fr: 'Tarifs', ar: 'الأسعار' },
  'svc.priceTitle': {
    en: '{price} for every 5 slides',
    fr: '{price} pour 5 diapositives',
    ar: '{price} لكل 5 شرائح',
  },
  'svc.priceIntro': {
    en: 'The number of slides is rounded up to the next group of 5.',
    fr: 'Le nombre de diapositives est arrondi au multiple de 5 supérieur.',
    ar: 'يُقرَّب عدد الشرائح إلى المجموعة التالية من 5.',
  },
  'svc.colSlides': { en: 'Slides', fr: 'Diapositives', ar: 'الشرائح' },
  'svc.colPrice': { en: 'Price', fr: 'Prix', ar: 'السعر' },
  'svc.rowSlides': {
    en: '{n} slides',
    fr: '{n} diapositives',
    ar: '{n} شريحة',
  },
  'svc.calcTitle': {
    en: 'Price calculator',
    fr: 'Calculateur de prix',
    ar: 'حاسبة الأسعار',
  },
  'svc.calcText': {
    en: 'Enter the number of slides to see your price.',
    fr: 'Saisissez le nombre de diapositives pour voir votre prix.',
    ar: 'أدخل عدد الشرائح لمعرفة السعر.',
  },
  'svc.calcLabel': {
    en: 'Number of slides',
    fr: 'Nombre de diapositives',
    ar: 'عدد الشرائح',
  },
  'svc.groupOne': {
    en: '{n} group of 5 slides',
    fr: '{n} groupe de 5 diapositives',
    ar: 'مجموعات من 5 شرائح: {n}',
  },
  'svc.groupMany': {
    en: '{n} groups of 5 slides',
    fr: '{n} groupes de 5 diapositives',
    ar: 'مجموعات من 5 شرائح: {n}',
  },
  'svc.enter': {
    en: 'Enter slides',
    fr: 'Saisissez les diapositives',
    ar: 'أدخل عدد الشرائح',
  },
  'svc.orderThis': {
    en: 'Order this presentation',
    fr: 'Commander cette présentation',
    ar: 'اطلب هذا العرض',
  },

  /* ---------- Order page ---------- */
  'ord.eyebrow': { en: 'Order', fr: 'Commande', ar: 'الطلب' },
  'ord.title': {
    en: 'Order your presentation',
    fr: 'Commandez votre présentation',
    ar: 'اطلب عرضك التقديمي',
  },
  'ord.intro': {
    en: 'Fill in the details below. {price} for every 5 slides.',
    fr: 'Renseignez les détails ci-dessous. {price} pour 5 diapositives.',
    ar: 'املأ التفاصيل أدناه. {price} لكل 5 شرائح.',
  },
  'ord.name': { en: 'Full name', fr: 'Nom complet', ar: 'الاسم الكامل' },
  'ord.whatsapp': {
    en: 'WhatsApp number',
    fr: 'Numéro WhatsApp',
    ar: 'رقم واتساب',
  },
  'ord.whatsappHint': {
    en: 'Include the country code, e.g. +213...',
    fr: 'Indiquez l’indicatif du pays, ex. +213...',
    ar: 'أضف رمز الدولة، مثال: \u200E+213...',
  },
  'ord.topic': {
    en: 'Presentation topic',
    fr: 'Sujet de la présentation',
    ar: 'موضوع العرض',
  },
  'ord.slides': {
    en: 'Number of slides',
    fr: 'Nombre de diapositives',
    ar: 'عدد الشرائح',
  },
  'ord.language': {
    en: 'Presentation language',
    fr: 'Langue de la présentation',
    ar: 'لغة العرض',
  },
  'ord.type': {
    en: 'Presentation type',
    fr: 'Type de présentation',
    ar: 'نوع العرض',
  },
  'ord.deadline': {
    en: 'Deadline (optional)',
    fr: 'Date limite (facultatif)',
    ar: 'الموعد النهائي (اختياري)',
  },
  'ord.instructions': {
    en: 'Extra instructions (optional)',
    fr: 'Instructions supplémentaires (facultatif)',
    ar: 'تعليمات إضافية (اختياري)',
  },
  'ord.file': {
    en: 'Attach a file (optional)',
    fr: 'Joindre un fichier (facultatif)',
    ar: 'إرفاق ملف (اختياري)',
  },
  'ord.fileHint': {
    en: 'Maximum {mb} MB.',
    fr: 'Taille maximale : {mb} Mo.',
    ar: 'الحد الأقصى {mb} ميغابايت.',
  },
  'ord.estimated': {
    en: 'Estimated price',
    fr: 'Prix estimé',
    ar: 'السعر التقديري',
  },
  'ord.submit': {
    en: 'Submit order',
    fr: 'Envoyer la commande',
    ar: 'إرسال الطلب',
  },
  'ord.sending': {
    en: 'Sending...',
    fr: 'Envoi en cours...',
    ar: 'جارٍ الإرسال...',
  },
  'ord.errName': {
    en: 'Please enter your name.',
    fr: 'Veuillez saisir votre nom.',
    ar: 'يرجى إدخال اسمك.',
  },
  'ord.errWhatsapp': {
    en: 'Please enter a valid WhatsApp number.',
    fr: 'Veuillez saisir un numéro WhatsApp valide.',
    ar: 'يرجى إدخال رقم واتساب صحيح.',
  },
  'ord.errTopic': {
    en: 'Please enter the topic of your presentation.',
    fr: 'Veuillez indiquer le sujet de votre présentation.',
    ar: 'يرجى إدخال موضوع العرض.',
  },
  'ord.errSlides': {
    en: 'Number of slides must be a whole number of at least 1.',
    fr: 'Le nombre de diapositives doit être un entier d’au moins 1.',
    ar: 'يجب أن يكون عدد الشرائح عددًا صحيحًا لا يقل عن 1.',
  },
  'ord.errFile': {
    en: 'File is too large. Maximum size is {mb} MB.',
    fr: 'Le fichier est trop volumineux. Taille maximale : {mb} Mo.',
    ar: 'الملف كبير جدًا. الحد الأقصى {mb} ميغابايت.',
  },
  'ord.errUpload': {
    en: 'File upload failed: {msg}',
    fr: 'Échec de l’envoi du fichier : {msg}',
    ar: 'فشل رفع الملف: {msg}',
  },
  'ord.errSave': {
    en: 'Could not save your order: {msg}',
    fr: 'Impossible d’enregistrer votre commande : {msg}',
    ar: 'تعذّر حفظ طلبك: {msg}',
  },
  'ord.errGeneric': {
    en: 'Something went wrong. Please try again.',
    fr: 'Une erreur est survenue. Veuillez réessayer.',
    ar: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
  },
  'ord.doneTitle': {
    en: 'Your order was received',
    fr: 'Votre commande a bien été reçue',
    ar: 'تم استلام طلبك',
  },
  'ord.doneText': {
    en: 'Thank you. Your order has been saved. Send the prefilled message on WhatsApp to confirm it with us.',
    fr: 'Merci. Votre commande est enregistrée. Envoyez le message prérempli sur WhatsApp pour la confirmer avec nous.',
    ar: 'شكرًا لك. تم حفظ طلبك. أرسل الرسالة الجاهزة عبر واتساب لتأكيده معنا.',
  },
  'ord.openWa': {
    en: 'Open WhatsApp',
    fr: 'Ouvrir WhatsApp',
    ar: 'افتح واتساب',
  },
  'ord.another': {
    en: 'Place another order',
    fr: 'Passer une autre commande',
    ar: 'تقديم طلب آخر',
  },
  'ord.wa': {
    en: {
      head: 'New order — PRESORA',
      name: 'Name',
      topic: 'Topic',
      slides: 'Slides',
      type: 'Type',
      language: 'Language',
      deadline: 'Deadline',
      none: 'Not specified',
      price: 'Price',
      notes: 'Notes',
      file: 'File',
    },
    fr: {
      head: 'Nouvelle commande — PRESORA',
      name: 'Nom',
      topic: 'Sujet',
      slides: 'Diapositives',
      type: 'Type',
      language: 'Langue',
      deadline: 'Date limite',
      none: 'Non précisée',
      price: 'Prix',
      notes: 'Remarques',
      file: 'Fichier',
    },
    ar: {
      head: 'طلب جديد — PRESORA',
      name: 'الاسم',
      topic: 'الموضوع',
      slides: 'الشرائح',
      type: 'النوع',
      language: 'اللغة',
      deadline: 'الموعد النهائي',
      none: 'غير محدد',
      price: 'السعر',
      notes: 'ملاحظات',
      file: 'الملف',
    },
  },
  /* Keys below are the STORED values; only the displayed label changes. */
  'opt.type': {
    en: {
      'Business Presentations': 'Business Presentations',
      'Academic Presentations': 'Academic Presentations',
      'Pitch Decks & Proposals': 'Pitch Decks & Proposals',
      'Slide Redesign': 'Slide Redesign',
      Other: 'Other',
    },
    fr: {
      'Business Presentations': 'Présentations d’entreprise',
      'Academic Presentations': 'Présentations académiques',
      'Pitch Decks & Proposals': 'Pitch decks et propositions',
      'Slide Redesign': 'Refonte de diapositives',
      Other: 'Autre',
    },
    ar: {
      'Business Presentations': 'عروض الأعمال',
      'Academic Presentations': 'العروض الأكاديمية',
      'Pitch Decks & Proposals': 'عروض المستثمرين والمقترحات',
      'Slide Redesign': 'إعادة تصميم الشرائح',
      Other: 'أخرى',
    },
  },
  'opt.language': {
    en: {
      Arabic: 'Arabic',
      English: 'English',
      French: 'French',
      Spanish: 'Spanish',
      Italian: 'Italian',
      German: 'German',
      Portuguese: 'Portuguese',
      Other: 'Other',
    },
    fr: {
      Arabic: 'Arabe',
      English: 'Anglais',
      French: 'Français',
      Spanish: 'Espagnol',
      Italian: 'Italien',
      German: 'Allemand',
      Portuguese: 'Portugais',
      Other: 'Autre',
    },
    ar: {
      Arabic: 'العربية',
      English: 'الإنجليزية',
      French: 'الفرنسية',
      Spanish: 'الإسبانية',
      Italian: 'الإيطالية',
      German: 'الألمانية',
      Portuguese: 'البرتغالية',
      Other: 'أخرى',
    },
  },

  /* ---------- Contact page ---------- */
  'ct.eyebrow': { en: 'Contact', fr: 'Contact', ar: 'التواصل' },
  'ct.title': { en: 'Get in touch', fr: 'Contactez-nous', ar: 'تواصل معنا' },
  'ct.intro': {
    en: 'Have a question before ordering? Reach us directly.',
    fr: 'Une question avant de commander ? Écrivez-nous directement.',
    ar: 'لديك سؤال قبل الطلب؟ تواصل معنا مباشرة.',
  },
  'ct.waTitle': { en: 'WhatsApp', fr: 'WhatsApp', ar: 'واتساب' },
  'ct.waText': {
    en: 'The fastest way to reach us and to receive your finished presentation.',
    fr: 'Le moyen le plus rapide de nous joindre et de recevoir votre présentation terminée.',
    ar: 'أسرع وسيلة للتواصل معنا واستلام عرضك الجاهز.',
  },
  'ct.waBtn': {
    en: 'Chat on WhatsApp',
    fr: 'Discuter sur WhatsApp',
    ar: 'تحدّث معنا على واتساب',
  },
  'ct.waNone': {
    en: 'WhatsApp is not configured yet.',
    fr: 'WhatsApp n’est pas encore configuré.',
    ar: 'لم يتم إعداد واتساب بعد.',
  },
  'ct.mailTitle': { en: 'Email', fr: 'E-mail', ar: 'البريد الإلكتروني' },
  'ct.mailText': {
    en: 'For longer requests, files or business inquiries.',
    fr: 'Pour les demandes détaillées, les fichiers ou les demandes professionnelles.',
    ar: 'للطلبات المفصّلة أو الملفات أو الاستفسارات التجارية.',
  },
  'ct.mailNone': {
    en: 'Email is not configured yet.',
    fr: 'L’e-mail n’est pas encore configuré.',
    ar: 'لم يتم إعداد البريد الإلكتروني بعد.',
  },

  /* ---------- Admin ---------- */
  'adm.eyebrow': { en: 'Admin', fr: 'Administration', ar: 'الإدارة' },
  'adm.signinTitle': { en: 'Sign in', fr: 'Connexion', ar: 'تسجيل الدخول' },
  'adm.email': { en: 'Email', fr: 'E-mail', ar: 'البريد الإلكتروني' },
  'adm.password': { en: 'Password', fr: 'Mot de passe', ar: 'كلمة المرور' },
  'adm.signin': { en: 'Sign in', fr: 'Se connecter', ar: 'دخول' },
  'adm.signingIn': {
    en: 'Signing in...',
    fr: 'Connexion...',
    ar: 'جارٍ الدخول...',
  },
  'adm.ordersTitle': { en: 'Orders', fr: 'Commandes', ar: 'الطلبات' },
  'adm.total': {
    en: '{n} total',
    fr: '{n} au total',
    ar: 'الإجمالي: {n}',
  },
  'adm.refresh': { en: 'Refresh', fr: 'Actualiser', ar: 'تحديث' },
  'adm.signout': {
    en: 'Sign out',
    fr: 'Se déconnecter',
    ar: 'تسجيل الخروج',
  },
  'adm.all': { en: 'All', fr: 'Toutes', ar: 'الكل' },
  'adm.status': {
    en: { pending: 'Pending', in_progress: 'In progress', completed: 'Completed' },
    fr: { pending: 'En attente', in_progress: 'En cours', completed: 'Terminée' },
    ar: { pending: 'قيد الانتظار', in_progress: 'قيد التنفيذ', completed: 'مكتمل' },
  },
  'adm.statusLabel': { en: 'Status', fr: 'Statut', ar: 'الحالة' },
  'adm.loading': { en: 'Loading...', fr: 'Chargement...', ar: 'جارٍ التحميل...' },
  'adm.loadingOrders': {
    en: 'Loading orders...',
    fr: 'Chargement des commandes...',
    ar: 'جارٍ تحميل الطلبات...',
  },
  'adm.noOrders': {
    en: 'No orders to show.',
    fr: 'Aucune commande à afficher.',
    ar: 'لا توجد طلبات للعرض.',
  },
  'adm.slidesCount': {
    en: '{n} slides',
    fr: '{n} diapositives',
    ar: '{n} شريحة',
  },
  'adm.f': {
    en: {
      whatsapp: 'WhatsApp',
      type: 'Type',
      language: 'Language',
      deadline: 'Deadline',
      none: 'Not specified',
      instructions: 'Instructions',
      file: 'File',
      openFile: 'Open file',
      noFile: 'No file',
      created: 'Created',
    },
    fr: {
      whatsapp: 'WhatsApp',
      type: 'Type',
      language: 'Langue',
      deadline: 'Date limite',
      none: 'Non précisée',
      instructions: 'Instructions',
      file: 'Fichier',
      openFile: 'Ouvrir le fichier',
      noFile: 'Aucun fichier',
      created: 'Créée le',
    },
    ar: {
      whatsapp: 'واتساب',
      type: 'النوع',
      language: 'اللغة',
      deadline: 'الموعد النهائي',
      none: 'غير محدد',
      instructions: 'التعليمات',
      file: 'الملف',
      openFile: 'فتح الملف',
      noFile: 'لا يوجد ملف',
      created: 'تاريخ الإنشاء',
    },
  },
  'adm.errStatus': {
    en: 'Status was not updated. Check your permissions.',
    fr: 'Le statut n’a pas été mis à jour. Vérifiez vos autorisations.',
    ar: 'لم يتم تحديث الحالة. تحقق من صلاحياتك.',
  },
}
// DICT-END
