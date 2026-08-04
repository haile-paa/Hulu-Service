import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "am" | "en";

const DICT = {
  appName: { am: "Hulu Service", en: "Hulu Service" },
  whatServiceNeed: { am: "ምን አገልግሎት ይፈልጋሉ?", en: "What service do you need?" },
  searchCategories: { am: "ምድብ ይፈልጉ...", en: "Search categories..." },
  loading: { am: "በመጫን ላይ...", en: "Loading..." },
  noCategories: { am: "ምድቦች የሉም", en: "No categories" },
  noResultsFor: { am: "ውጤት አልተገኘም", en: "No results found" },

  // Login
  welcome: { am: "እንኳን ደህና መጡ", en: "Welcome" },
  phone: { am: "ስልክ ቁጥር", en: "Phone number" },
  password: { am: "የይለፍ ቃል", en: "Password" },
  login: { am: "ግባ", en: "Log in" },
  newHere: { am: "አዲስ ነዎት?", en: "New here?" },
  createAccountLink: { am: "መለያ ይክፈቱ", en: "Create an account" },
  haveAccount: { am: "መለያ አለዎት?", en: "Already have an account?" },

  // Register
  createAccountTitle: { am: "አዲስ መለያ ይክፈቱ", en: "Create an account" },
  roleCustomer: { am: "👤 ደንበኛ", en: "👤 Customer" },
  roleProvider: { am: "🛠 አገልግሎት ሰጪ", en: "🛠 Service Provider" },
  fullName: { am: "ሙሉ ስም", en: "Full name" },
  city: { am: "ከተማ", en: "City" },
  servicesProvided: { am: "የሚሰጡት አገልግሎት", en: "Services you provide" },
  workAreasCsv: { am: "የስራ ቦታዎች (በኮማ ይለያዩ)", en: "Work areas (comma separated)" },
  yearsExperience: { am: "የስራ ልምድ (ዓመት)", en: "Years of experience" },
  selectAtLeastOne: { am: "እባክዎ ቢያንስ አንድ አገልግሎት ምድብ ይምረጡ", en: "Please select at least one service" },
  register: { am: "ተመዝገብ", en: "Register" },
  registrationFailed: { am: "ምዝገባ አልተሳካም", en: "Registration failed" },
  loginFailed: { am: "መግባት አልተሳካም", en: "Login failed" },

  // Providers list
  providersFor: { am: "አገልግሎት ሰጪዎች", en: "Service Providers" },
  noProvidersFound: { am: "አገልግሎት ሰጪ አልተገኘም", en: "No providers found" },
  tryAgainLater: { am: "ትንሽ ቆይተው እንደገና ይሞክሩ", en: "Please try again later" },

  // Booking
  bookingWith: { am: "ማስያዣ", en: "Booking" },
  describeProblem: { am: "ችግሩን በአጭሩ ይግለጹ", en: "Briefly describe the issue" },
  address: { am: "አድራሻ (ሰፈር/ቤት ቁጥር)", en: "Address (area / house number)" },
  sendBooking: { am: "ማስያዣ ላክ", en: "Send Booking" },
  bookingSent: { am: "ማስያዣዎ ተልኳል!", en: "Your booking was sent!" },
  bookingSentDesc: {
    am: "ሲቀበሉት ወይም ውድቅ ሲያደርጉት እናሳውቆታለን።",
    en: "We'll notify you once they respond.",
  },
  viewMyBookings: { am: "ማስያዣዎቼን ይመልከቱ", en: "View My Bookings" },
  bookingFailed: { am: "ማስያዣ አልተሳካም", en: "Booking failed" },

  // My bookings
  myBookings: { am: "የእኔ ማስያዣዎች", en: "My Bookings" },
  noBookingsYet: { am: "እስካሁን ምንም ማስያዣ የለዎትም", en: "You have no bookings yet" },
  pickCategoryHint: { am: "ከቤት ገጽ ምድብ ይምረጡ", en: "Pick a category from Home" },
  cancel: { am: "ሰርዝ", en: "Cancel" },
  chat: { am: "💬 ውይይት", en: "💬 Chat" },
  birr: { am: "ብር", en: "Birr" },

  // Provider dashboard
  jobRequests: { am: "የስራ ጥያቄዎች", en: "Job Requests" },
  available: { am: "አገኛለሁ", en: "Available" },
  unavailable: { am: "አልገኝም", en: "Unavailable" },
  noJobsYet: { am: "እስካሁን የስራ ጥያቄ የለም", en: "No job requests yet" },
  accept: { am: "✅ ተቀበል", en: "✅ Accept" },
  decline: { am: "አትቀበል", en: "Decline" },
  markComplete: { am: "🏁 ጨርሻለሁ", en: "🏁 Mark Complete" },

  // Chat
  chatTitle: { am: "ውይይት", en: "Chat" },
  typeMessage: { am: "መልዕክት ይጻፉ...", en: "Type a message..." },

  // Profile
  profile: { am: "መገለጫ", en: "Profile" },
  logout: { am: "ውጣ", en: "Log out" },

  // Bottom nav
  navHome: { am: "ቤት", en: "Home" },
  navBookings: { am: "ማስያዣዎች", en: "Bookings" },
  navJobs: { am: "ስራዎች", en: "Jobs" },
  navProfile: { am: "መገለጫ", en: "Profile" },

  // Status labels
  statusPending: { am: "በመጠባበቅ ላይ", en: "Pending" },
  statusAccepted: { am: "ተቀባይነት አግኝቷል", en: "Accepted" },
  statusRejected: { am: "ውድቅ ተደርጓል", en: "Rejected" },
  statusInProgress: { am: "በሂደት ላይ", en: "In Progress" },
  statusCompleted: { am: "ተጠናቅቋል", en: "Completed" },
  statusCancelled: { am: "ተሰርዟል", en: "Cancelled" },
} as const;

export type DictKey = keyof typeof DICT;

const LangContext = createContext<{ lang: Lang; toggle: () => void } | null>(null);

const STORAGE_KEY = "hulu-service-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("am");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === "am" || stored === "en") setLang(stored);
  }, []);

  function toggle() {
    setLang((prev) => {
      const next = prev === "am" ? "en" : "am";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  return <LangContext.Provider value={{ lang, toggle }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

export function useT() {
  const { lang } = useLang();
  return (key: DictKey) => DICT[key][lang];
}
