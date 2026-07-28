import * as Duo from "@duo-icons/react";

const Missing = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    width={props.size || 24}
    height={props.size || 24}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export const UilHome = (props) => <Duo.Calendar {...props} />;
export const UilHouseUser = (props) => <Duo.Calendar {...props} />;
export const UilBedDouble = (props) => <Missing {...props} />;
export const UilBuilding = (props) => <Duo.Building {...props} />;
export const UilSearch = (props) => <Duo.ComputerCamera {...props} />;
export const UilUser = (props) => <Duo.User {...props} />;
export const UilStar = (props) => <Missing {...props} />;
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
    <line x1="7" y1="7" x2="17" y2="17" /><polyline points="17 7 17 17 7 17" />
  </svg>
);
export const UilBars = (props) => <Duo.Menu {...props} />;
export const UilTimes = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
export const UilBell = (props) => <Duo.Bell {...props} />;
export const UilCalendar = (props) => <Duo.Calendar {...props} />;
export const UilClock = (props) => <Duo.Clock {...props} />;
export const UilMapPin = (props) => <Duo.Marker {...props} />;
export const UilMapMarker = (props) => <Duo.Marker {...props} />;
export const UilMap = (props) => <Duo.Location {...props} />;
export const UilHeart = (props) => <Missing {...props} />;
export const UilCheckCircle = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
export const UilPlus = (props) => <Duo.AddCircle {...props} />;
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
export const UilShip = (props) => <Missing {...props} />;
export const UilCar = (props) => <Duo.Car {...props} />;
export const UilTruck = (props) => <Duo.Bus {...props} />;
export const UilPhone = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
export const UilGlobe = (props) => <Duo.World {...props} />;
export const UilCamera = (props) => <Duo.Camera {...props} />;
export const UilSignOutAlt = (props) => <Missing {...props} />;
export const UilSignInAlt = (props) => <Missing {...props} />;
export const UilShield = (props) => <Missing {...props} />;
export const UilTicket = (props) => <Missing {...props} />;
export const UilDashboard = (props) => <Duo.Dashboard {...props} />;
export const UilChartBar = (props) => <Missing {...props} />;
export const UilChartGrowth = (props) => <Missing {...props} />;
export const UilChartPie = (props) => <Duo.ChartPie {...props} />;
export const UilDownloadAlt = (props) => <Duo.UploadFile {...props} />;
export const UilSun = (props) => <Duo.Sun {...props} />;
export const UilMoon = (props) => <Duo.Moon2 {...props} />;
export const UilCompass = (props) => <Duo.Compass {...props} />;
export const UilWifi = (props) => <Missing {...props} />;
export const UilCoffee = (props) => <Missing {...props} />;
export const UilWind = (props) => <Missing {...props} />;
export const UilWater = (props) => <Missing {...props} />;
export const UilSave = (props) => <Duo.Disk {...props} />;
export const UilTag = (props) => <Missing {...props} />;
export const UilWallet = (props) => <Missing {...props} />;
export const UilDollarSign = (props) => <Duo.CurrencyEuro {...props} />;
export const UilDollarAlt = (props) => <Duo.CurrencyEuro {...props} />;
export const UilExclamationCircle = (props) => <Duo.Info {...props} />;
export const UilShareAlt = (props) => <Missing {...props} />;
export const UilMessage = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
export const UilThumbsUp = (props) => <Duo.Approved {...props} />;
export const UilGrid = (props) => <Duo.AppDots {...props} />;
export const UilListUl = (props) => <Duo.Menu {...props} />;
export const UilPackage = (props) => <Duo.Box {...props} />;
export const UilBox = (props) => <Duo.Box {...props} />;
export const UilStore = (props) => <Duo.Building {...props} />;
export const UilShoppingBag = (props) => <Duo.ShoppingBag {...props} />;
export const UilCalendarAlt = (props) => <Duo.Calendar {...props} />;
export const UilCalendarCheck = (props) => <Duo.Calendar {...props} />;
export const UilBolt = (props) => <Missing {...props} />;
export const UilBoltSlash = (props) => <Missing {...props} />;
export const UilUtensils = (props) => <Missing {...props} />;
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
export const UilExchange = (props) => <Missing {...props} />;
export const UilQrcodeScan = (props) => <Missing {...props} />;
export const UilMobileAndroid = (props) => <Duo.Smartphone {...props} />;
export const UilUserCheck = (props) => <Duo.UserCard {...props} />;
export const UilUserTimes = (props) => <Missing {...props} />;
export const UilUsersAlt = (props) => <Duo.User {...props} />;
export const UilTvRetro = (props) => <Duo.Slideshow {...props} />;
export const UilShower = (props) => <Missing {...props} />;
export const UilFridge = (props) => <Missing {...props} />;
export const UilBaby = (props) => <Duo.BabyCarriage {...props} />;
export const UilActivity = (props) => <Missing {...props} />;
export const UilHeartbeat = (props) => <Missing {...props} />;
export const UilFileAlt = (props) => <Duo.File {...props} />;
export const UilBookOpen = (props) => <Duo.Book {...props} />;
export const UilCrosshair = (props) => <Duo.Target {...props} />;
export const UilExternalLinkAlt = (props) => <Missing {...props} />;
export const UilCornerUpRight = (props) => <Missing {...props} />;
export const UilReply = (props) => <Missing {...props} />;
export const UilSlidersV = (props) => <Duo.Settings {...props} />;
export const UilEnvelopeAlt = (props) => <Missing {...props} />;
export const UilMail = (props) => <Missing {...props} />;
export const UilSpinnerAlt = (props) => <Missing {...props} />;
export const UilCloudRain = (props) => <Duo.CloudSnow {...props} />;
export const UilDna = (props) => <Missing {...props} />;
export const UilMountains = (props) => <Duo.Campground {...props} />;
export const UilSparkles = (props) => <Missing {...props} />;
export const UilBrain = (props) => <Missing {...props} />;
export const UilCameraSlash = (props) => <Duo.ComputerCameraOff {...props} />;
export const UilSetting = (props) => <Duo.Settings {...props} />;
export const UilCoins = (props) => <Duo.CoinStack {...props} />;
export const UilRepeat = (props) => <Missing {...props} />;
export const UilSync = (props) => <Missing {...props} />;
export const UilNavigator = (props) => <Duo.Compass {...props} />;
export const UilAnchor = (props) => <Missing {...props} />;
export const UilPlane = (props) => <Duo.Airplay {...props} />;
export const UilBike = (props) => <Missing {...props} />;
export const UilSend = (props) => <Duo.UploadFile {...props} />;
export const UilTimesCircle = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
export const UilEllipsisV = (props) => <Missing {...props} />;
export const UilGift = (props) => <Missing {...props} />;
export const UilCreditCard = (props) => <Duo.CreditCard {...props} />;
export const UilFilter = (props) => <Missing {...props} />;
export const UilShieldCheck = (props) => <Duo.Certificate {...props} />;
export const UilInfoCircle = (props) => <Duo.Info {...props} />;
export const UilExclamationTriangle = (props) => <Duo.AlertTriangle {...props} />;
export const UilAngleDown = (props) => (
  <svg viewBox="0 0 24 24" width={props.size||24} height={props.size||24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
export const UilSnowflake = (props) => <Duo.CloudSnow {...props} />;
export const UilShieldExclamation = (props) => <Missing {...props} />;
export const UilMusic = (props) => <Missing {...props} />;
export const UilTennisBall = (props) => <Missing {...props} />;
