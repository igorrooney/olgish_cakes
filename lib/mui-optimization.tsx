// Optimized Material-UI imports to reduce bundle size
// This file centralizes all MUI imports to enable better tree-shaking

// Core components - import only what's needed
export { default as Box } from "@mui/material/Box";
export { default as Container } from "@mui/material/Container";
export { default as Typography } from "@mui/material/Typography";
export { default as Button } from "@mui/material/Button";
export { default as Card } from "@mui/material/Card";
export { default as CardContent } from "@mui/material/CardContent";
export { default as Grid } from "@mui/material/Grid";
export { default as Paper } from "@mui/material/Paper";
export { default as Chip } from "@mui/material/Chip";
export { default as Alert } from "@mui/material/Alert";
export { default as AlertTitle } from "@mui/material/AlertTitle";
export { default as Stack } from "@mui/material/Stack";
export { default as Link } from "@mui/material/Link";
export { default as Divider } from "@mui/material/Divider";
export { default as CircularProgress } from "@mui/material/CircularProgress";
export { default as IconButton } from "@mui/material/IconButton";
export { default as Tooltip } from "@mui/material/Tooltip";
export { default as FormControl } from "@mui/material/FormControl";
export { default as MenuItem } from "@mui/material/MenuItem";
export { default as Select } from "@mui/material/Select";
export { default as Breadcrumbs } from "@mui/material/Breadcrumbs";
export { default as ImageList } from "@mui/material/ImageList";
export { default as ImageListItem } from "@mui/material/ImageListItem";
export { default as Avatar } from "@mui/material/Avatar";
export { default as Rating } from "@mui/material/Rating";
export { default as List } from "@mui/material/List";
export { default as ListItem } from "@mui/material/ListItem";
export { default as ListItemIcon } from "@mui/material/ListItemIcon";
export { default as ListItemText } from "@mui/material/ListItemText";
export { default as Accordion } from "@mui/material/Accordion";
export { default as AccordionSummary } from "@mui/material/AccordionSummary";
export { default as AccordionDetails } from "@mui/material/AccordionDetails";
export { default as Snackbar } from "@mui/material/Snackbar";
export { default as Stepper } from "@mui/material/Stepper";
export { default as Step } from "@mui/material/Step";
export { default as StepLabel } from "@mui/material/StepLabel";
export { default as StepContent } from "@mui/material/StepContent";
export { default as AppBar } from "@mui/material/AppBar";
export { default as Collapse } from "@mui/material/Collapse";
export { default as Drawer } from "@mui/material/Drawer";
export { default as ListItemButton } from "@mui/material/ListItemButton";
export { default as Menu } from "@mui/material/Menu";
export { default as Toolbar } from "@mui/material/Toolbar";
export { default as Skeleton } from "@mui/material/Skeleton";
export { default as Modal } from "@mui/material/Modal";

// Icons - direct re-exports for better HMR support
export { default as ArrowBackIcon } from "@mui/icons-material/ArrowBack";
export { default as ArrowForwardIcon } from "@mui/icons-material/ArrowForward";
export { default as CloseIcon } from "@mui/icons-material/Close";
export { default as KeyboardArrowDownIcon } from "@mui/icons-material/KeyboardArrowDown";
export { default as MenuIcon } from "@mui/icons-material/Menu";
export { default as ExpandMoreIcon } from "@mui/icons-material/ExpandMore";
export { default as CloudUploadIcon } from "@mui/icons-material/CloudUpload";
export { default as DeleteIcon } from "@mui/icons-material/Delete";
export { default as InstagramIcon } from "@mui/icons-material/Instagram";
export { default as FacebookIcon } from "@mui/icons-material/Facebook";
export { default as YouTubeIcon } from "@mui/icons-material/YouTube";
export { default as GoogleIcon } from "@mui/icons-material/Google";
export { default as CakeOutlinedIcon } from "@mui/icons-material/CakeOutlined";
export { default as ZoomInIcon } from "@mui/icons-material/ZoomIn";
export { default as PhoneIcon } from "@mui/icons-material/Phone";
export { default as EmailIcon } from "@mui/icons-material/Email";
export { default as WhatsAppIcon } from "@mui/icons-material/WhatsApp";
export { default as CheckCircleIcon } from "@mui/icons-material/CheckCircle";
export { default as LocalShippingIcon } from "@mui/icons-material/LocalShipping";
export { default as PaymentIcon } from "@mui/icons-material/Payment";
export { default as SettingsIcon } from "@mui/icons-material/Settings";
export { default as RefreshIcon } from "@mui/icons-material/Refresh";
export { default as ClearIcon } from "@mui/icons-material/Clear";
export { default as StarIcon } from "@mui/icons-material/Star";
export { default as FavoriteIcon } from "@mui/icons-material/Favorite";
export { default as CelebrationIcon } from "@mui/icons-material/Celebration";
export { default as VerifiedIcon } from "@mui/icons-material/Verified";
export { default as LocationOnIcon } from "@mui/icons-material/LocationOn";
export { default as CakeIcon } from "@mui/icons-material/Cake";
export { default as DesignServicesIcon } from "@mui/icons-material/DesignServices";
export { default as ScheduleIcon } from "@mui/icons-material/Schedule";
export { default as EmojiEventsIcon } from "@mui/icons-material/EmojiEvents";
export { default as SchoolIcon } from "@mui/icons-material/School";
export { default as InfoIcon } from "@mui/icons-material/Info";
export { default as SecurityIcon } from "@mui/icons-material/Security";
export { default as ErrorIcon } from "@mui/icons-material/Error";
export { default as ShoppingCartIcon } from "@mui/icons-material/ShoppingCart";
export { default as CalendarTodayIcon } from "@mui/icons-material/CalendarToday";
export { default as AccessTimeIcon } from "@mui/icons-material/AccessTime";
export { default as LocalOfferIcon } from "@mui/icons-material/LocalOffer";
export { default as EventIcon } from "@mui/icons-material/Event";
export { default as KitchenIcon } from "@mui/icons-material/Kitchen";
export { default as LocalDiningIcon } from "@mui/icons-material/LocalDining";
export { default as OpacityIcon } from "@mui/icons-material/Opacity";

// Table components
export { default as Table } from "@mui/material/Table";
export { default as TableBody } from "@mui/material/TableBody";
export { default as TableCell } from "@mui/material/TableCell";
export { default as TableContainer } from "@mui/material/TableContainer";
export { default as TableHead } from "@mui/material/TableHead";
export { default as TableRow } from "@mui/material/TableRow";
export { default as TableSortLabel } from "@mui/material/TableSortLabel";
export { default as TablePagination } from "@mui/material/TablePagination";

// Date picker components - fixed export syntax
export { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
export { DatePicker } from "@mui/x-date-pickers/DatePicker";
export { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

// Core providers and baseline
export { default as ThemeProvider } from "@mui/material/styles/ThemeProvider";
export { default as CssBaseline } from "@mui/material/CssBaseline";

// Hooks
export { useTheme } from "@mui/material/styles";
export { default as useMediaQuery } from "@mui/material/useMediaQuery";

// Types
export type { SelectChangeEvent } from "@mui/material/Select";
export type { Theme } from "@mui/material/styles";
