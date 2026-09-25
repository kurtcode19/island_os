import {
  Anchor,
  ArrowLeftRight,
  Bell,
  BookOpen,
  Box,
  Brain,
  Building2,
  Calendar,
  Camera,
  CameraOff,
  Car,
  ChartPie,
  Circle,
  CircleAlert,
  Clock,
  CloudRain,
  Coins,
  Coffee,
  Compass,
  CornerUpRight,
  CreditCard,
  Crosshair,
  DollarSign,
  Download,
  Droplets,
  Dna,
  EllipsisVertical,
  ExternalLink,
  FileText,
  Filter,
  Gift,
  Globe,
  Heart,
  HeartPulse,
  Info,
  LayoutDashboard,
  LayoutGrid,
  List,
  LoaderCircle,
  LogIn,
  Map,
  MapPin,
  Moon,
  Mountain,
  Music,
  Navigation,
  Package,
  Plus,
  QrCode,
  RefreshCw,
  Repeat,
  Save,
  Search,
  Settings,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ship,
  ShoppingBag,
  Snowflake,
  Smartphone,
  Star,
  Store,
  Sun,
  Tag,
  ThumbsUp,
  Ticket,
  TriangleAlert,
  TrendingUp,
  Truck,
  Tv,
  User,
  UserCheck,
  UserX,
  Users,
  Utensils,
  Wallet,
  Wifi,
  Wind,
  Zap,
  ZapOff,
} from 'lucide-react';

const wrap = (Icon: any) => (props: any) => <Icon {...props} />;

export const UilBedDouble = (props: any) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
  </svg>
);
export const UilBuilding = wrap(Building2);
export const UilSearch = wrap(Search);
export const UilUser = wrap(User);
export const UilStar = wrap(Star);
export const UilArrowRight = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
export const UilArrowUpRight = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
  </svg>
);
export const UilArrowLeft = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
export const UilArrowDownRight = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="7" y1="7" x2="17" y2="17" /><polyline points="17 17 7 17 17 7" />
  </svg>
);
export const UilTimes = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
export const UilBell = wrap(Bell);
export const UilCalendar = wrap(Calendar);
export const UilClock = wrap(Clock);
export const UilMapPin = wrap(MapPin);
export const UilMapMarker = wrap(MapPin);
export const UilMap = wrap(Map);
export const UilHeart = wrap(Heart);
export const UilCheckCircle = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
export const UilPlus = wrap(Plus);
export const UilMinus = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
export const UilRefresh = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
export const UilShip = wrap(Ship);
export const UilCar = wrap(Car);
export const UilTruck = wrap(Truck);
export const UilPhone = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
export const UilGlobe = wrap(Globe);
export const UilCamera = wrap(Camera);
export const UilSignOutAlt = (props: any) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
export const UilSignInAlt = wrap(LogIn);
export const UilShield = wrap(Shield);
export const UilTicket = wrap(Ticket);
export const UilDashboard = wrap(LayoutDashboard);
export const UilChartBar = (props: any) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);
export const UilChartGrowth = wrap(TrendingUp);
export const UilChartPie = wrap(ChartPie);
export const UilDownloadAlt = wrap(Download);
export const UilSun = wrap(Sun);
export const UilMoon = wrap(Moon);
export const UilCompass = wrap(Compass);
export const UilWifi = wrap(Wifi);
export const UilCoffee = wrap(Coffee);
export const UilWind = wrap(Wind);
export const UilWater = wrap(Droplets);
export const UilSave = wrap(Save);
export const UilTag = wrap(Tag);
export const UilWallet = wrap(Wallet);
export const UilDollarSign = wrap(DollarSign);
export const UilDollarAlt = wrap(DollarSign);
export const UilExclamationCircle = wrap(CircleAlert);
export const UilShareAlt = wrap(Share2);
export const UilMessage = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
export const UilThumbsUp = wrap(ThumbsUp);
export const UilGrid = wrap(LayoutGrid);
export const UilListUl = wrap(List);
export const UilPackage = wrap(Package);
export const UilBox = wrap(Box);
export const UilStore = wrap(Store);
export const UilShoppingBag = wrap(ShoppingBag);
export const UilCalendarAlt = wrap(Calendar);
export const UilBolt = wrap(Zap);
export const UilBoltSlash = wrap(ZapOff);
export const UilUtensils = wrap(Utensils);
export const UilAngleLeftB = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
export const UilAngleRightB = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
export const UilExchange = wrap(ArrowLeftRight);
export const UilQrcodeScan = wrap(QrCode);
export const UilMobileAndroid = wrap(Smartphone);
export const UilUserCheck = wrap(UserCheck);
export const UilUserTimes = wrap(UserX);
export const UilUsersAlt = wrap(Users);
export const UilTvRetro = wrap(Tv);
export const UilHeartbeat = wrap(HeartPulse);
export const UilFileAlt = wrap(FileText);
export const UilBookOpen = wrap(BookOpen);
export const UilCrosshair = wrap(Crosshair);
export const UilExternalLinkAlt = wrap(ExternalLink);
export const UilCornerUpRight = wrap(CornerUpRight);
export const UilEnvelopeAlt = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
export const UilFacebook = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="currentColor" className={props.className}>
    <path d="M13.5 21v-7.5h2.52l.48-3h-3V8.62c0-.87.29-1.62 1.67-1.62H16.6V4.35C16.35 4.32 15.3 4.25 14.1 4.25c-2.55 0-4.35 1.6-4.35 4.53V10.5H7.25v3h2.5V21h3.75Z" />
  </svg>
);
export const UilSpinnerAlt = wrap(LoaderCircle);
export const UilCloudRain = wrap(CloudRain);
export const UilDna = wrap(Dna);
export const UilMountains = wrap(Mountain);
export const UilBrain = wrap(Brain);
export const UilCameraSlash = wrap(CameraOff);
export const UilSetting = wrap(Settings);
export const UilCoins = wrap(Coins);
export const UilRepeat = wrap(Repeat);
export const UilSync = wrap(RefreshCw);
export const UilNavigator = wrap(Navigation);
export const UilAnchor = wrap(Anchor);
export const UilTimesCircle = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
export const UilEllipsisV = wrap(EllipsisVertical);
export const UilGift = wrap(Gift);
export const UilCreditCard = wrap(CreditCard);
export const UilFilter = wrap(Filter);
export const UilShieldCheck = wrap(ShieldCheck);
export const UilInfoCircle = wrap(Info);
export const UilExclamationTriangle = wrap(TriangleAlert);
export const UilAngleDown = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
export const UilSnowflake = wrap(Snowflake);
export const UilShieldExclamation = wrap(ShieldAlert);
export const UilMusic = wrap(Music);
export const UilTennisBall = wrap(Circle);
export const UilTrashAlt = (props: any) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6L18 19A2 2 0 0 1 16 21H8A2 2 0 0 1 6 19L5 6"></path><path d="M10 11L10 17"></path><path d="M14 11L14 17"></path><path d="M9 6L9 4A2 2 0 0 1 11 2H13A2 2 0 0 1 15 4L15 6"></path>
  </svg>
);
