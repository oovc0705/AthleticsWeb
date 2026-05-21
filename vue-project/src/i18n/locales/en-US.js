export default {
  header: {
    logo: 'Athletics',
    home: 'Home',
    athletes: 'Athletes',
    events: 'Events',
    news: 'News',
    about: 'About'
  },
  search: {
    placeholder: 'Search events, athletes...',
    search: 'Search'
  },
  user: {
    login: 'Login/Register',
    logout: 'Logout',
    admin: 'Admin',
    user: 'User',
    adminCenter: 'Admin Center',
    profile: 'Profile'
  },
  language: {
    zh: '中文',
    en: 'English'
  },
  mobile: {
    menu: 'Menu',
    search: 'Search'
  },
  footer: {
    title: 'World Athletics Championships',
    description: 'Inspire potential, exceed limits. Bring together the world\'s top athletes to witness the peak competition of speed and power.',
    quickLinks: 'Quick Links',
    eventsSchedule: 'Events Schedule',
    athletes: 'Athletes',
    news: 'News',
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    subscribe: 'Subscribe to News',
    subscribeText: 'Get the latest event information and exclusive reports',
    emailPlaceholder: 'Your email address',
    subscribeBtn: 'Subscribe',
    subscribeSuccess: 'Subscription successful! Thank you for your attention.',
    copyright: '© {year} World Athletics Championships. All rights reserved.',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    cookiePolicy: 'Cookie Policy'
  },
  loginModal: {
    loginTitle: 'User Login',
    registerTitle: 'User Registration',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'Please enter your email',
    passwordPlaceholder: 'Please enter your password',
    loginBtn: 'Login',
    loggingIn: 'Logging in...',
    noAccount: 'Don\'t have an account?',
    registerNow: 'Register now',
    username: 'Username',
    usernamePlaceholder: 'Please enter your username',
    passwordMinLength: 'Please enter a password (at least 6 characters)',
    country: 'Country/Region',
    verificationCode: 'Email Verification Code',
    verificationCodePlaceholder: 'Please enter 6-digit code',
    getCode: 'Get Code',
    retryAfter: 'Retry after {seconds}s',
    registerBtn: 'Register',
    registering: 'Registering...',
    haveAccount: 'Already have an account?',
    loginNow: 'Login now',
    verificationCodeError: 'Please enter 6-digit verification code'
  },
  athleteCard: {
    featured: 'Featured Athlete',
    personalBest: 'PB',
    worldRanking: 'World Rank',
    goldMedals: 'Gold Medals',
    achievements: 'Key Achievements',
    showAll: 'View All',
    showAllWithCount: 'View All {count} Items',
    collapse: 'Collapse',
    viewDetails: 'View Details'
  },
  eventForm: {
    editEvent: 'Edit Event',
    addEvent: 'Add Event',
    name: 'Name',
    location: 'Location',
    startDate: 'Start Date',
    endDate: 'End Date',
    type: 'Type',
    typePlaceholder: 'e.g. Championship',
    status: 'Status',
    statusOptions: {
      completed: 'Completed',
      ongoing: 'Ongoing',
      planned: 'Planned'
    },
    level: 'Event Level',
    levelPlaceholder: 'Please select level',
    levelOptions: {
      highest: 'OG/WA (Highest)',
      df: 'DF',
      dl: 'DL',
      a: 'A',
      b: 'B',
      c: 'C'
    },
    organizer: 'Organizer',
    description: 'Description',
    imageUrl: 'Image URL',
    imageUrlPlaceholder: '/assets/events/default.jpg',
    schedules: 'Event Schedule',
    scheduleItem: 'Event Item {index}',
    removeSchedule: 'Remove',
    addSchedule: 'Add Event Item',
    eventName: 'Event Name',
    eventNamePlaceholder: 'e.g. 100m Final',
    eventDate: 'Date',
    eventTime: 'Time',
    venue: 'Venue',
    venuePlaceholder: 'e.g. Main Stadium',
    scheduleStatus: 'Status',
    scheduleStatusOptions: {
      notStarted: 'Not Started',
      inProgress: 'In Progress',
      finished: 'Finished'
    },
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...'
  },
  favoriteButton: {
    add: 'Favorite',
    added: 'Favorited',
    remove: 'Unfavorite',
    loginRequired: 'Please login first',
    ariaLabelAdd: 'Add to favorites',
    ariaLabelRemove: 'Remove from favorites',
    titleAdd: 'Add to favorites',
    titleRemove: 'Remove from favorites'
  },
  athleteForm: {
    editAthlete: 'Edit Athlete',
    addAthlete: 'Add Athlete',
    name: 'Name',
    sport: 'Event',
    country: 'Country',
    gender: 'Gender',
    environment: 'Environment',
    birthday: 'Birthday',
    age: 'Age (Auto Calculated)',
    stats: 'Statistics',
    goldMedals: 'Gold Medals',
    silverMedals: 'Silver Medals',
    bronzeMedals: 'Bronze Medals',
    worldRecords: 'World Records',
    personalBest: 'Personal Best',
    achievements: 'Achievements (separated by commas)',
    achievementsPlaceholder: 'e.g. 2024 Olympic Gold, 2023 World Champion',
    imageUrl: 'Image URL',
    imageUrlPlaceholder: '/assets/athletes/default.webp',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    select: 'Please select',
    genderOptions: {
      male: 'Male',
      female: 'Female'
    },
    environmentOptions: {
      indoor: 'Indoor',
      outdoor: 'Outdoor'
    }
  },
  newsForm: {
    editNews: 'Edit News',
    addNews: 'Add News',
    title: 'Title',
    category: 'Category',
    content: 'Content',
    date: 'Date',
    author: 'Author',
    summary: 'Summary',
    summaryPlaceholder: 'If not filled, will be automatically extracted from content',
    imageUrl: 'Image URL',
    imageUrlPlaceholder: '/assets/news/default.jpg',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    categoryOptions: {
      eventNews: 'Event News',
      athleteInterview: 'Athlete Interview',
      highlight: 'Highlight',
      other: 'Other'
    }
  },
  resultForm: {
    editResult: 'Edit Result',
    addResult: 'Add Result',
    scheduleId: 'Event ID',
    athleteName: 'Athlete Name *',
    athleteNamePlaceholder: 'e.g. Zhang San',
    country: 'Country/Region',
    countryPlaceholder: 'e.g. China',
    rank: 'Rank *',
    rankPlaceholder: '1',
    score: 'Score *',
    scorePlaceholder: 'e.g. 9.89s or 7.12m',
    resultDetail: 'Detailed Result',
    resultDetailPlaceholder: 'Detailed result description...',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    update: 'Update',
    add: 'Add'
  },
  scheduleForm: {
    editSchedule: 'Edit Event Item',
    addSchedule: 'Add Event Item',
    eventId: 'Event ID',
    eventName: 'Event Name *',
    eventNamePlaceholder: 'e.g. Men\'s 100m Sprint',
    eventDate: 'Event Date *',
    eventTime: 'Event Time',
    venue: 'Venue',
    venuePlaceholder: 'e.g. Main Stadium',
    status: 'Status',
    statusOptions: {
      notStarted: 'Not Started',
      inProgress: 'In Progress',
      finished: 'Finished'
    },
    description: 'Description',
    descriptionPlaceholder: 'Event description...',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    update: 'Update',
    add: 'Add'
  },
  home: {
    hero: {
      title: 'Inspire Potential, Exceed Limits',
      subtitle: 'The World Athletics Championships brings together the world\'s top athletes to witness the peak competition of speed and power.',
      viewEvents: 'View Event Schedule',
      exploreAthletes: 'Explore Athletes'
    },
    events: {
      upcoming: 'Upcoming Events',
      loading: 'Loading...',
      error: 'Failed to fetch events: ',
      noData: 'No event data available',
      refresh: 'Refresh',
      retry: 'Retry',
      location: 'Location:',
      date: 'Date:',
      status: 'Status:',
      countdown: 'Countdown:',
      started: 'Started'
    },
    levels: {
      'OG/WA': 'Olympic Games/World Athletics',
      'DF': 'Diamond League Finals',
      'DL': 'Diamond League',
      'A': 'Level A Event',
      'B': 'Level B Event',
      'C': 'Level C Event',
      default: 'No Level'
    },
    footer: {
      copyright: '© 2025 World Athletics. All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      termsService: 'Terms of Service'
    }
  },
  athletes: {
    title: 'Athletes List',
    addAthlete: 'Add Athlete',
    searchPlaceholder: 'Search athletes...',
    filter: {
      sport: 'Sport:',
      country: 'Country:',
      gender: 'Gender:',
      environment: 'Environment:',
      allCountries: 'All Countries',
      allSports: 'All Sports',
      allGenders: 'All Genders',
      allEnvironments: 'All Environments'
    },
    loading: 'Loading...',
    error: 'Failed to fetch athletes',
    noData: 'No athletes data available',
    retry: 'Retry',
    confirmDelete: 'Are you sure you want to delete this athlete?',
    saveFailed: 'Save failed: ',
    deleteFailed: 'Delete failed: ',
    pagination: {
      prev: 'Previous',
      next: 'Next',
      pageInfo: 'Page {current} of {total}'
    },
    details: 'View Details',
    edit: 'Edit',
    delete: 'Delete',
    genders: {
      male: 'Male',
      female: 'Female',
      other: 'Other'
    }
  },
  events: {
    title: 'Events',
    addEvent: 'Post Event',
    searchPlaceholder: 'Search events...',
    filter: {
      level: 'Level:',
      allLevels: 'All Levels',
      sortBy: 'Sort By:',
      date: 'By Date',
      name: 'By Name'
    },
    loading: 'Loading...',
    error: 'Failed to fetch events',
    noData: 'No events data available',
    retry: 'Retry',
    confirmDelete: 'Are you sure you want to delete this event?',
    saveFailed: 'Save failed: ',
    deleteFailed: 'Delete failed: ',
    pagination: {
      prev: 'Previous',
      next: 'Next',
      pageInfo: 'Page {current} of {total}'
    },
    details: 'View Details',
    edit: 'Edit',
    delete: 'Delete',
    info: {
      location: 'Location:',
      date: 'Date:',
      status: 'Status:',
      countdown: 'Countdown:',
      started: 'Started',
      unknown: 'Unknown',
      tbd: 'TBD'
    },
    schedule: {
      title: '📅 Event Schedule',
      more: '{count} more event items...'
    }
  },
  news: {
    title: 'News',
    addNews: 'Post News',
    searchPlaceholder: 'Search news...',
    filter: {
      category: 'Category:',
      allCategories: 'All Categories',
      sortBy: 'Sort By:',
      date: 'By Date',
      popularity: 'By Popularity'
    },
    loading: 'Loading...',
    error: 'Failed to fetch news',
    noData: 'No news data available',
    retry: 'Retry',
    confirmDelete: 'Are you sure you want to delete this news?',
    saveFailed: 'Save failed: ',
    deleteFailed: 'Delete failed: ',
    pagination: {
      prev: 'Previous',
      next: 'Next',
      pageInfo: 'Page {current} of {total}'
    },
    edit: 'Edit',
    delete: 'Delete',
    readMore: 'Read More',
    share: 'Share:',
    copyLink: 'Copy Link',
    shareSuccess: 'Link copied to clipboard',
    shareTo: {
      wechat: 'WeChat',
      weibo: 'Weibo',
      copy: 'Copy Link'
    },
    meta: {
      author: 'Author',
      date: 'Date',
      readTime: 'min read',
      views: 'Views'
    },
    categories: {
      eventNews: 'Event News',
      athleteInterview: 'Athlete Interview',
      highlight: 'Highlight'
    }
  },
  about: {
    hero: {
      title: 'About World Athletics',
      subtitle: 'Promoting global athletics development and nurturing the next generation of sports talents'
    },
    organization: {
      title: 'Organization',
      subtitle: 'Dedicated to the global promotion and development of athletics',
      stats: {
        members: 'Member Countries',
        athletes: 'Registered Athletes',
        events: 'Annual Events',
        history: 'Historical Heritage'
      }
    },
    mission: {
      title: 'Our Mission',
      description: 'Creating a fair competitive stage for global athletics enthusiasts through unified competition standards, support for youth development, and promotion of scientific training.',
      items: [
        'Establish a unified global competition rules system',
        'Support athletics programs in developing countries',
        'Promote advanced training methods and technologies',
        'Uphold sportsmanship and fair competition'
      ]
    },
    vision: {
      title: 'Our Vision',
      description: 'Make athletics a bridge connecting the world, allowing everyone with a dream to showcase themselves on the track.',
      items: [
        'Achieve global athletics program coverage in 100 countries by 2030',
        'Train 500 outstanding young athletes annually',
        'Establish a global athletics data sharing platform',
        'Promote athletics in more schools'
      ]
    },
    history: {
      title: 'Development History',
      items: [
        {
          year: '1975',
          title: 'Organization Established',
          description: 'The World Athletics Federation was officially established, starting to unify global athletics competition standards'
        },
        {
          year: '1990',
          title: 'Global Development',
          description: 'Member countries exceeded 100, and the World Youth Athletics Championships began'
        },
        {
          year: '2010',
          title: 'Technological Innovation',
          description: 'Introduced electronic timing and video replay technology to enhance competition fairness'
        },
        {
          year: '2026',
          title: 'Digital Era',
          description: 'Launched a global digital platform to realize event live streaming and data sharing'
        }
      ]
    },
    leadership: {
      title: 'Leadership Team',
      members: [
        {
          name: 'Li Minghua',
          position: 'President',
          bio: 'Former Olympic champion, won gold medal in men\'s 110m hurdles at the 1996 Atlanta Olympics, with 30 years of sports management experience'
        },
        {
          name: 'Zhang Wei',
          position: 'Technical Director',
          bio: 'PhD in Sports Science from Beijing Sport University, expert in athletics technology innovation, focusing on sports science and training methods research'
        },
        {
          name: 'Wang Xue',
          position: 'Event Director',
          bio: 'IAAF certified event organization expert, successfully organized multiple Diamond League and World Championship station events'
        }
      ]
    },
    contact: {
      title: 'Contact Us',
      items: {
        email: 'Email',
        phone: 'Phone',
        address: 'Address'
      }
    },
    footer: {
      copyright: '© 2026 World Athletics. All rights reserved.',
      links: {
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        contact: 'Contact Us'
      }
    }
  },
  profile: {
    title: 'User Profile',
    subtitle: 'Manage your personal information and favorites',
    sections: {
      personalInfo: 'Personal Information',
      preferences: 'Preferences',
      favorites: 'My Favorites'
    },
    fields: {
      username: 'Username',
      email: 'Email',
      registrationTime: 'Registration Time',
      userRole: 'User Role',
      country: 'Country/Region',
      admin: 'Admin',
      user: 'User'
    },
    edit: {
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      saveSuccess: 'Saved successfully!',
      saveFailed: 'Save failed: ',
      enterNewUsername: 'Enter new username',
      usernameEmpty: 'Username cannot be empty',
      usernameSame: 'New username is the same as current username',
      usernameUpdated: 'Username has been successfully updated!'
    },
    preferences: {
      theme: 'Theme',
      notifications: 'Notifications',
      eventUpdates: 'Event Update Notifications',
      newsletter: 'Newsletter',
      saveSettings: 'Save Settings',
      settingsSaved: 'Preferences saved!',
      settingsFailed: 'Save failed, please retry',
      themeOptions: {
        light: 'Light',
        dark: 'Dark'
      }
    },
    favorites: {
      loginPrompt: 'Please login to view your favorites',
      login: 'Login',
      empty: 'You haven\'t favorited any {type} yet',
      browse: 'Browse {type}',
      tabs: {
        athletes: 'Athletes',
        events: 'Events',
        news: 'News'
      },
      loading: 'Loading...',
      unknownCountry: 'Unknown Country'
    }
  }
}
