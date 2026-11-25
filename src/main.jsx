import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  Alert, Avatar, Badge, Box, Button, Card, CardContent, Checkbox, Chip, CircularProgress,
  BottomNavigation, BottomNavigationAction, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, FormControl,
  FormControlLabel, Grid, IconButton, InputLabel, List, ListItemButton, ListItemIcon,
  ListItemText, MenuItem, Paper, Radio, RadioGroup, Select, Snackbar, Stack, Step,
  StepLabel, Stepper, Switch, TextField, ThemeProvider, Tooltip, Typography, createTheme
} from '@mui/material'
import {
  DashboardRounded, SosRounded, FolderRounded, ReportProblemRounded, AssignmentRounded,
  SupportAgentRounded, ShieldRounded, SettingsRounded, NotificationsNoneRounded,
  MenuRounded, LocationOnRounded, DescriptionRounded, AddRounded, ArrowForwardRounded,
  CloseRounded, CallRounded, ShareRounded, GavelRounded, HomeRounded, CheckCircleRounded,
  UploadFileRounded, DownloadRounded, VisibilityRounded, VisibilityOffRounded, DeleteOutlineRounded,
  ArrowBackRounded, SearchRounded, LockRounded, PersonRounded,
  EmailRounded, LanguageRounded, LogoutRounded, EditRounded, PhoneRounded,
  FavoriteRounded, MedicalServicesRounded, AccountBalanceRounded, TravelExploreRounded,
  AttachMoneyRounded, DirectionsBusRounded, HotelRounded, WarningAmberRounded,
  PsychologyRounded, BadgeRounded, TimelineRounded, AddCommentRounded, QrCodeScannerRounded,
  MoreHorizRounded, KeyboardArrowRightRounded, MapRounded
} from '@mui/icons-material'
import { QRCodeSVG } from 'qrcode.react'
import { touristCareApi } from './services/api'
import { getTemporaryFile, storeTemporaryFile } from './services/sessionFileStore'
import { DemoProvider } from './context/DemoContext'
import { useDemoData } from './hooks/useDemoData'
import DemoModeBadge from './components/DemoModeBadge'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

const theme = createTheme({
  palette: {
    primary: { main: '#172B3A', dark: '#10202b', light: '#e9dfd0' },
    secondary: { main: '#397C8A' },
    error: { main: '#bd6652' },
    background: { default: '#F8F6F1', paper: '#FFFFFF' },
  },
  typography: { fontFamily: '"DM Sans", sans-serif', button: { textTransform: 'none', fontWeight: 700 } },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: { styleOverrides: { root: { boxShadow: 'none', borderRadius: 8 } } },
    MuiCard: { styleOverrides: { root: { boxShadow: '0 8px 26px rgba(23,43,58,.055)', border: '1px solid #eeeae2' } } },
  },
})

const configuredPublicAppUrl = (import.meta.env.VITE_APP_URL || '').trim().replace(/\/+$/, '')
const PUBLIC_APP_URL = (() => {
  try {
    const url = new URL(configuredPublicAppUrl)
    return url.protocol === 'https:' ? url.origin : ''
  } catch {
    return ''
  }
})()
const CampaignSourceContext = createContext(null)

function CampaignSourceProvider({ children }) {
  const { search } = useLocation()
  const [source, setSource] = useState(null)
  useEffect(() => {
    const candidate = new URLSearchParams(search).get('src')
    if (candidate && /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(candidate)) setSource(candidate)
  }, [search])
  return <CampaignSourceContext.Provider value={source}>{children}</CampaignSourceContext.Provider>
}

function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null)
  const [ios, setIos] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [installError, setInstallError] = useState('')
  useEffect(() => {
    const userAgent = navigator.userAgent || ''
    const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone
    setIos(isAppleMobile && !standalone)
    const onPrompt = event => {
      event.preventDefault()
      setInstallEvent(event)
    }
    const onInstalled = () => { setInstallEvent(null); setDismissed(true) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])
  if (dismissed || (!installEvent && !ios)) return null
  const install = async () => {
    if (!installEvent) { setHelpOpen(true); return }
    try {
      await installEvent.prompt()
      const choice = await installEvent.userChoice
      if (choice.outcome === 'accepted') setDismissed(true)
      setInstallEvent(null)
    } catch (error) {
      setInstallError('Installation could not be opened. You can still add TouristCare from your browser menu.')
      console.error('PWA install prompt failed', error)
    }
  }
  return <>
    <div className="pwa-install-suggestion">
      <span className="material-symbols-rounded" aria-hidden="true">add_to_home_screen</span>
      <span className="pwa-install-copy"><strong>Add TouristCare to Home Screen</strong><small>Optional · opens faster next time</small></span>
      <Button size="small" onClick={install}>{installEvent ? 'Install' : 'How'}</Button>
      <IconButton size="small" aria-label="Dismiss install suggestion" onClick={() => setDismissed(true)}><CloseRounded /></IconButton>
    </div>
    <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle>Add TouristCare to Home Screen</DialogTitle>
      <DialogContent><Typography variant="body2">In Safari, tap the Share button, then choose “Add to Home Screen”. You can continue using TouristCare in your browser without installing it.</Typography></DialogContent>
      <DialogActions><Button onClick={() => setHelpOpen(false)}>Got it</Button></DialogActions>
    </Dialog>
    {installError && <Snackbar open message={installError} autoHideDuration={6000} onClose={() => setInstallError('')} />}
  </>
}

function NotificationCenter() {
  const { data, run, pendingAction } = useDemoData()
  const [open, setOpen] = useState(false)
  const notifications = data?.notifications || []
  const unreadCount = notifications.filter(item => !item.read).length
  const markRead = async () => {
    try {
      await run('markNotificationsRead')
    } catch (error) {
      console.error('Demo notifications could not be marked as read.', error)
    }
  }
  return <>
    <Tooltip title="Demo notifications">
      <IconButton aria-label={`Notifications, ${unreadCount} unread`} onClick={() => setOpen(true)}>
        <Badge color="secondary" badgeContent={unreadCount}><NotificationsNoneRounded /></Badge>
      </IconButton>
    </Tooltip>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle>Demo notifications</DialogTitle>
      <DialogContent>
        <Typography variant="caption" className="muted">Stored in this browser only. These are not provider messages.</Typography>
        <List>
          {notifications.length ? notifications.map(item => (
            <ListItemButton key={item.id} disableRipple>
              <ListItemText primary={item.title} secondary={`${item.message} · ${new Date(item.createdAt).toLocaleString()}`} />
              {item.demoSample && <Chip size="small" label="Sample" />}
            </ListItemButton>
          )) : <ListItemText primary="No demo notifications yet." />}
        </List>
      </DialogContent>
      <DialogActions><Button onClick={() => setOpen(false)}>Close</Button><Button disabled={!unreadCount || pendingAction === 'markNotificationsRead'} onClick={markRead}>Mark all read</Button></DialogActions>
    </Dialog>
  </>
}

const navItems = [
  ['/dashboard', DashboardRounded, 'Home'],
  ['/emergency', SosRounded, 'SOS'],
  ['/report', ReportProblemRounded, 'Report'],
  ['/cases', AssignmentRounded, 'My Cases'],
  ['/support', SupportAgentRounded, 'Support'],
]

function AppShell({ children, staff = false }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const demo = useDemoData()
  const activePath = pathname.startsWith('/cases') ? '/cases' : pathname
  const items = staff
    ? [['/staff', DashboardRounded, 'Staff overview'], ['/staff/reports', ReportProblemRounded, 'Submitted reports'], ['/staff/support', SupportAgentRounded, 'Support requests']]
    : navItems
  const moreItems = [['/documents', FolderRounded, 'My Documents'], ['/safety', ShieldRounded, 'Safety Information'], ['/settings', SettingsRounded, 'Settings'], ['/admin/qr', QrCodeScannerRounded, 'QR distribution']]

  const drawer = (
    <Box className="sidebar-inner">
      <button className="brand" onClick={() => navigate(staff ? '/staff' : '/dashboard')}>
        <span className="brand-mark"><ShieldRounded /></span>
        <span>Tourist<span>Care</span></span>
      </button>
      <nav className="side-nav">
        {items.map(([path, Icon, label]) => (
          <NavLink key={path} to={path} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon fontSize="small" /><span>{label}</span>
          </NavLink>
        ))}
        {!staff && <div className="nav-section-label">MORE</div>}
        {!staff && moreItems.map(([path, Icon, label]) => (
          <NavLink key={path} to={path} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon fontSize="small" /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <Avatar sx={{ width: 38, height: 38, bgcolor: '#e9dfd0', color: '#172B3A' }}>AM</Avatar>
        <div><strong>{staff ? 'Support Staff' : 'Visitor profile'}</strong><small>{staff ? 'Restricted access' : 'Account & preferences'}</small></div>
      </div>
    </Box>
  )

  return (
    <Box className="app-shell">
      <Drawer variant="permanent" sx={{ display: 'none', '@media (min-width:1025px)': { display: 'block' }, '& .MuiDrawer-paper': { width: 248, boxSizing: 'border-box', border: 0 } }}>{drawer}</Drawer>
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: 'block', '@media (min-width:1025px)': { display: 'none' }, '& .MuiDrawer-paper': { width: 290 } }}>{drawer}</Drawer>
      <Box className="app-main">
        <header className="topbar">
          <div className="d-flex align-items-center">
            <div className="location-chip"><LocationOnRounded fontSize="small" /><span>Cape Town</span></div>
            <DemoModeBadge staff={staff} />
          </div>
          <div className="d-flex align-items-center gap-1">
            <NotificationCenter />
            <Button className="more-trigger" startIcon={<MoreHorizRounded />} onClick={() => setMobileOpen(true)}>{staff ? 'Menu' : 'More'}</Button>
            <Tooltip title="Profile"><IconButton onClick={() => navigate(staff ? '/staff' : '/settings')}><Avatar sx={{ width: 34, height: 34, bgcolor: '#172B3A' }}>{staff ? 'SS' : 'A'}</Avatar></IconButton></Tooltip>
          </div>
        </header>
        <div className="demo-notices">
          <Alert severity={staff ? 'warning' : 'info'} className="demo-scope-alert">
            {staff
              ? 'Staff demo only: sample and same-browser records are shown. This view has no staff authentication and is not shared across devices.'
              : 'Local demo only: records stay in this browser. Do not enter real personal, identity, passport or incident details; this is not a secure service.'}
          </Alert>
          {demo.error && <Alert severity="error" onClose={demo.clearError}>{demo.error}</Alert>}
        </div>
        <main className="page-content">{children}<InstallPrompt /></main>
        {!staff && <BottomNavigation className="mobile-bottom-nav" showLabels value={activePath} onChange={(event, path) => navigate(path)}>
          {navItems.map(([path, Icon, label]) => <BottomNavigationAction key={path} label={label} value={path} icon={<Icon />} className={path === '/emergency' ? 'sos-nav-item' : ''} />)}
        </BottomNavigation>}
      </Box>
    </Box>
  )
}

function PageHeader({ title, subtitle, action }) {
  return <div className="page-header"><div><Typography variant="h4" component="h1">{title}</Typography>{subtitle && <Typography className="page-subtitle">{subtitle}</Typography>}</div>{action}</div>
}

function Dashboard() {
  const navigate = useNavigate()
  const demo = useDemoData()
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(false)
  const [locating, setLocating] = useState(false)
  const requestLocation = async () => {
    setLocating(true)
    setLocationError(false)
    try {
      const result = await demo.run('getDemoLocation')
      setLocation({ latitude: result.latitude.toFixed(5), longitude: result.longitude.toFixed(5), accuracy: result.accuracy, simulated: result.simulated })
    } catch {
      setLocationError(true)
    } finally {
      setLocating(false)
    }
  }
  const recentActivity = (demo.data?.staffActivity || []).slice(0, 3)
  const quickActions = [
    [FolderRounded, 'Documents', '/documents'],
    [ReportProblemRounded, 'Report incident', '/report'],
    [AssignmentRounded, 'Track a case', '/cases'],
    [SupportAgentRounded, 'Get support', '/support'],
  ]
  return (
    <AppShell>
      <div className="dashboard-welcome"><Typography variant="h4" component="h1">Explore Cape Town.<br /><span>Feel safer.</span></Typography><p>Support and practical safety tools for your journey.</p></div>
      <div className="visitor-reference">DEMO VISITOR REFERENCE <strong>{demo.data?.visitor?.reference || 'Loading…'}</strong></div>
      <button className="location-card" onClick={requestLocation}>
        <span className={`location-indicator ${location ? 'located' : ''}`}><LocationOnRounded /></span>
        <span className="location-copy"><strong>{locating ? 'Simulating location…' : location ? 'Demo location available' : 'Location sharing is off'}</strong><small>{location ? `${location.latitude}, ${location.longitude} · ±${location.accuracy} m · simulated` : locationError ? 'Demo location could not be loaded. Tap to try again.' : 'Tap to display a simulated Cape Town location.'}</small></span>
        <span className="location-action">{locating ? <CircularProgress size={18} /> : <KeyboardArrowRightRounded />}</span>
      </button>
      <Card className="dashboard-sos-card">
        <CardContent><div className="dashboard-sos-copy"><span className="eyebrow">HERE WHEN YOU NEED IT</span><Typography variant="h5">Need help right now?</Typography><Typography variant="body2">Call emergency services or share your location. SOS does not dispatch responders.</Typography><Button variant="contained" onClick={() => navigate('/emergency')} startIcon={<SosRounded />}>Open SOS</Button></div><div className="sos-emblem"><SosRounded /></div></CardContent>
      </Card>
      <section className="quick-section">
        <div className="section-heading"><Typography variant="h6">Quick actions</Typography><span>YOUR TRIP, MADE EASIER</span></div>
        <div className="quick-grid">{quickActions.map(([Icon, title, path]) => <button className="quick-action" key={path} onClick={() => navigate(path)}><span><Icon /></span><strong>{title}</strong><KeyboardArrowRightRounded /></button>)}</div>
      </section>
      <section className="dashboard-section"><div className="section-heading"><Typography variant="h6">Recent activity</Typography><Button size="small" onClick={() => navigate('/cases')}>View cases</Button></div><Card className="activity-card"><CardContent>{recentActivity.length ? recentActivity.map(item => <div className="activity-row" key={item.id}><div className="activity-icon"><AssignmentRounded /></div><div><strong>{item.title}</strong><Typography variant="body2" className="muted">{item.reference} · {new Date(item.createdAt).toLocaleDateString()}{item.demoSample ? ' · sample' : ' · this browser'}</Typography></div></div>) : <div className="empty-state"><AssignmentRounded /><strong>No activity yet</strong><Typography variant="body2" className="muted">Local demo reports and case changes appear here.</Typography></div>}</CardContent></Card></section>
      <section className="dashboard-section"><div className="section-heading"><Typography variant="h6">Visitor safety</Typography><Button size="small" onClick={() => navigate('/safety')}>More tips</Button></div><div className="safety-tip-card"><div className="safety-tip-image" role="img" aria-label="Cape Town mountain landscape" /><div><span className="eyebrow">A QUICK REMINDER</span><strong>Check your ride before you get in</strong><p>Match the vehicle, plate and driver to your e-hailing app.</p><Button size="small" endIcon={<ArrowForwardRounded />} onClick={() => navigate('/safety')}>Read safety tips</Button></div></div></section>
    </AppShell>
  )
}

function EmergencySOS() {
  const demo = useDemoData()
  const [dialog, setDialog] = useState(false)
  const [location, setLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [denied, setDenied] = useState(false)
  const [shareMessage, setShareMessage] = useState('')

  const locate = async () => {
    setLocating(true); setDenied(false)
    try {
      const result = await demo.run('getDemoLocation')
      setLocation({ lat: result.latitude.toFixed(6), lng: result.longitude.toFixed(6), accuracy: result.accuracy, simulated: result.simulated })
    } catch {
      setDenied(true)
    } finally {
      setLocating(false)
    }
  }
  const shareLocation = async () => {
    if (!location) return
    try {
      await demo.run('simulateLocationShare')
      setShareMessage('Demo share complete: no location was sent to a contact or service.')
      setDialog(false)
    } catch {
      setShareMessage('The simulated share could not be completed. No location was sent.')
    }
  }
  return (
    <AppShell>
      <PageHeader title="Emergency assistance" subtitle="Choose the action that is appropriate for your situation." />
      <div className="row g-3">
        <div className="col-lg-7">
          <Card className="emergency-card">
            <CardContent className="text-center">
              <button className="sos-button" onClick={() => setDialog(true)}><SosRounded /><strong>SOS</strong><span>Request help</span></button>
              <Typography variant="h6" sx={{ mt: 3 }}>If you are in immediate danger</Typography>
              <Typography variant="body2" className="muted mb-3">Demo actions do not contact responders. Confirm before opening your phone’s emergency call option.</Typography>
              <Button variant="contained" color="error" startIcon={<CallRounded />} onClick={() => setDialog(true)}>Call emergency services</Button>
              <Typography variant="caption" className="d-block mt-2 muted">South Africa: 112 from a mobile phone where available</Typography>
            </CardContent>
          </Card>
        </div>
        <div className="col-lg-5">
          <Card className="h-100"><CardContent>
            <Typography variant="h6" className="mb-3">Your location</Typography>
            {location ? (
              <><Chip label="SIMULATED LOCATION · CAPE TOWN" size="small" color="warning" sx={{ mb: 1 }} /><div className="location-grid"><div><small>Latitude</small><strong>{location.lat}</strong></div><div><small>Longitude</small><strong>{location.lng}</strong></div><div><small>Accuracy</small><strong>±{location.accuracy} m</strong></div></div><div className="map-placeholder"><LocationOnRounded /><span>Demo map preview</span><small>These fixed demonstration coordinates are not your device location.</small></div></>
            ) : <div className="location-empty"><LocationOnRounded /><strong>{denied ? 'Demo location unavailable' : 'Location is not active'}</strong><Typography variant="body2" className="muted">{denied ? 'The simulated location could not be loaded. Try again.' : 'No device location is requested in this demo.'}</Typography></div>}
            <Button fullWidth variant="outlined" startIcon={locating ? <CircularProgress size={18} /> : <LocationOnRounded />} onClick={locate} disabled={locating}>{locating ? 'Simulating location' : 'Show demo location'}</Button>
            <Button fullWidth variant="text" startIcon={<ShareRounded />} sx={{ mt: 1 }} disabled={!location} onClick={() => setDialog(true)}>Simulate trusted-contact share</Button>
            {shareMessage && <Alert severity="info" sx={{ mt: 1 }} onClose={() => setShareMessage('')}>{shareMessage}</Alert>}
          </CardContent></Card>
        </div>
      </div>
      <Dialog open={dialog} onClose={() => setDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Confirm emergency action</DialogTitle><DialogContent><Alert severity="warning" sx={{ mb: 2 }}>This is a local demo. SOS does not notify TouristCare staff or automatically dispatch responders.</Alert><Typography variant="body2" className="muted">Choose a simulated share or confirm to open your phone’s call option. If you are in immediate danger, contact local emergency services directly.</Typography></DialogContent>
        <DialogActions className="emergency-dialog-actions"><Button onClick={() => setDialog(false)}>Cancel</Button>{location && <Button variant="outlined" startIcon={<ShareRounded />} onClick={shareLocation}>Simulate share</Button>}<Button variant="contained" color="error" startIcon={<CallRounded />} href="tel:112" onClick={() => setDialog(false)}>Confirm call 112</Button></DialogActions>
      </Dialog>
    </AppShell>
  )
}

function Documents() {
  const demo = useDemoData()
  const [dialog, setDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [category, setCategory] = useState('Passport')
  const [preview, setPreview] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const previewUrlRef = useRef('')
  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
  }, [])
  const addDocument = async () => {
    if (!selectedFile) return
    try {
      const document = await demo.run('addDocumentMetadata', { category, type: selectedFile.type || 'application/octet-stream', size: selectedFile.size })
      storeTemporaryFile(document.id, selectedFile)
      setSelectedFile(null)
      setDialog(false)
      setError('')
      setNotice('Document metadata saved. The file remains available in this tab until it is reloaded or closed.')
    } catch (saveError) {
      setError(saveError.message || 'The demo document could not be saved.')
    }
  }
  const deleteDocument = async document => {
    try {
      await demo.run('deleteDocument', document.id)
      if (preview?.id === document.id) closePreview()
      setError('')
    } catch (deleteError) {
      setError(deleteError.message || 'The demo document could not be deleted.')
    }
  }
  const openPreview = document => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const file = getTemporaryFile(document.id)
    const url = file ? URL.createObjectURL(file) : ''
    previewUrlRef.current = url
    setPreview(document)
    setPreviewUrl(url)
  }
  const closePreview = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = ''
    setPreviewUrl('')
    setPreview(null)
  }
  const downloadDocument = document => {
    const file = getTemporaryFile(document.id)
    const content = file || (document.demoSample ? new Blob(['TouristCare sample document. This file contains demonstration text only.'], { type: 'text/plain' }) : null)
    if (!content) {
      setError('The temporary demo file is no longer available after leaving its page session.')
      return
    }
    const url = URL.createObjectURL(content)
    const anchor = window.document.createElement('a')
    anchor.href = url
    const extension = document.type === 'application/pdf'
      ? 'pdf'
      : document.type === 'text/plain'
        ? 'txt'
        : document.type.startsWith('image/')
          ? document.type.split('/')[1].replace('jpeg', 'jpg')
          : 'file'
    anchor.download = document.demoSample ? 'touristcare-sample-note.txt' : `touristcare-demo.${extension}`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const docs = demo.data?.documents || []
  return (
    <AppShell>
      <PageHeader title="My documents" subtitle="Organise travel and case documents in one place." action={<Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialog(true)}>Upload document</Button>} />
      <Alert severity="warning" icon={<LockRounded />} sx={{ mb: 2 }}>Metadata persists in this browser for the demo. Uploaded file contents remain in memory for this tab only and are never written to localStorage or uploaded. Do not select real passports or identity documents.</Alert>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {docs.length ? <div className="document-cards">{docs.map(doc => <Card className="document-card" key={doc.id}><CardContent><div className="document-card-title"><div className="file-icon"><DescriptionRounded /></div><div className="document-name"><strong>{doc.name}</strong><small>{doc.category} · Added {new Date(doc.addedAt).toLocaleDateString()}</small></div><IconButton color="error" aria-label={`Delete ${doc.name}`} onClick={() => deleteDocument(doc)}><DeleteOutlineRounded /></IconButton></div><div className="document-card-meta"><Chip label={doc.type.split('/').pop()?.toUpperCase() || 'FILE'} size="small" />{doc.demoSample && <Chip label="Sample metadata" size="small" />}{doc.temporaryFile && !getTemporaryFile(doc.id) && <Chip label="File temporary" size="small" color="warning" />}<span>{doc.size}</span></div><div className="document-card-actions"><Button size="small" startIcon={<VisibilityRounded />} onClick={() => openPreview(doc)}>Preview</Button><Button size="small" startIcon={<DownloadRounded />} onClick={() => downloadDocument(doc)}>Download demo file</Button><Button size="small" color="error" startIcon={<DeleteOutlineRounded />} onClick={() => deleteDocument(doc)}>Delete</Button></div></CardContent></Card>)}</div> : <Card><CardContent className="empty-state"><FolderRounded /><Typography variant="h6">{demo.loading ? 'Loading demo documents…' : 'No documents yet'}</Typography><Typography className="muted">Sample document metadata and uploads from this browser appear here.</Typography><Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialog(true)}>Choose a demo document</Button></CardContent></Card>}
      <Snackbar open={!!notice} autoHideDuration={4000} message={notice} onClose={() => setNotice('')} />
      <Dialog open={dialog} onClose={() => setDialog(false)} fullWidth maxWidth="sm" className="document-dialog"><DialogTitle>Add demo document</DialogTitle><DialogContent><Stack spacing={2} sx={{ mt: 1 }}><FormControl fullWidth><InputLabel>Category</InputLabel><Select label="Category" value={category} onChange={event => setCategory(event.target.value)}><MenuItem value="Travel information">Travel information</MenuItem><MenuItem value="Passport">Passport (demo files only)</MenuItem><MenuItem value="Visa">Visa (demo files only)</MenuItem><MenuItem value="Travel insurance">Travel insurance</MenuItem><MenuItem value="Flight tickets">Flight tickets</MenuItem><MenuItem value="Accommodation bookings">Accommodation bookings</MenuItem><MenuItem value="Other travel documents">Other travel documents</MenuItem></Select></FormControl><Button className="file-picker-button" variant="outlined" component="label" startIcon={<UploadFileRounded />}>Choose a sample file from this device<input hidden type="file" accept=".pdf,image/*,text/plain" onChange={event => setSelectedFile(event.target.files?.[0] || null)} /></Button>{selectedFile && <Typography variant="body2">Demo file selected · {selectedFile.type || 'unknown file type'} · {(selectedFile.size / 1024 / 1024).toFixed(2)} MB. Its filename will not be saved.</Typography>}<Alert severity="warning">Only fictional sample files. The file remains available during in-app navigation until this tab is reloaded or closed; only non-identifying metadata persists.</Alert></Stack></DialogContent><DialogActions><Button onClick={() => { setDialog(false); setSelectedFile(null) }}>Cancel</Button><Button variant="contained" disabled={!selectedFile || demo.pendingAction === 'addDocumentMetadata'} onClick={addDocument}>{demo.pendingAction === 'addDocumentMetadata' ? 'Saving…' : 'Save demo metadata'}</Button></DialogActions></Dialog>
      <Dialog open={!!preview} onClose={closePreview} fullWidth maxWidth="md" className="preview-dialog"><DialogTitle className="dialog-heading"><span>{preview?.name}</span><IconButton onClick={closePreview} aria-label="Close preview"><CloseRounded /></IconButton></DialogTitle><DialogContent>{previewUrl && preview?.type.startsWith('image/') ? <img className="document-preview" src={previewUrl} alt="Temporary demo file preview" /> : previewUrl && ['application/pdf', 'text/plain'].includes(preview.type) ? <iframe className="document-pdf-preview" src={previewUrl} title="Temporary demo file preview" /> : preview?.demoSample ? <Alert severity="info">Sample metadata preview. The downloadable sample contains demonstration text only.</Alert> : preview && !getTemporaryFile(preview.id) ? <Alert severity="warning">Temporary file contents are available only in the current browser tab. Reloading or closing the tab clears them; safe demo metadata remains.</Alert> : <Alert severity="info">Preview is available for image, PDF and plain-text demo files during this page session.</Alert>}</DialogContent></Dialog>
    </AppShell>
  )
}

function ReportIncident() {
  const campaignSource = useContext(CampaignSourceContext)
  const navigate = useNavigate()
  const demo = useDemoData()
  const [step, setStep] = useState(0)
  const [incident, setIncident] = useState({ category: '', date: '', time: '', location: '', description: '', contact: '', reportedToPolice: false, policeCase: '', wantsSupport: false, wantsPoliceInfo: false })
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState(false)
  const update = (key, value) => setIncident(previous => ({ ...previous, [key]: value }))
  const sensitive = incident.category === 'Sexual harassment' || incident.category === 'Gender-based violence'
  const categories = ['Theft', 'Robbery', 'Fraud and scams', 'E-hailing or transport scams', 'Impersonation', 'Lost or stolen documents', 'Sexual harassment', 'Gender-based violence', 'Stalking or intimidation', 'Threats or assault', 'Other safety incident']
  const submit = async () => {
    if (!incident.category) { setError('Choose an incident category to continue.'); setStep(0); return }
    setSaving(true); setError('')
    try {
      const result = await demo.run('submitIncident', { ...incident, campaignSource })
      navigate(`/cases/${result.reference}`)
    } catch (requestError) {
      setError(requestError.message || 'The demo report could not be saved in this browser.')
    } finally {
      setSaving(false)
    }
  }
  const stepLabels = ['Incident', 'When & where', 'Description', 'Evidence', 'Review']
  return (
    <AppShell>
      <PageHeader title="Report an incident" subtitle="Share only what you feel comfortable sharing." />
      <Alert severity="info" sx={{ mb: 2 }}>Demonstration only: do not enter real names, exact locations, phone numbers or identity details. The local demo saves only a reference, category and date; descriptions and attachments are not stored or sent.</Alert>
      <div className="report-progress"><span>STEP {step + 1} OF 5</span><strong>{stepLabels[step]}</strong><div><i style={{ width: `${((step + 1) / 5) * 100}%` }} /></div><div className="report-step-labels">{stepLabels.map((label, index) => <span className={index === step ? 'current' : index < step ? 'complete' : ''} key={label}>{label}</span>)}</div></div>
      <Card className="form-card"><CardContent className="report-card-content">
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
        {step === 0 && <section className="report-step"><Typography variant="h5">What happened?</Typography><Typography className="muted">Choose the closest category. You can share more later.</Typography><div className="category-grid">{categories.map(category => <button key={category} className={`category-option ${incident.category === category ? 'selected' : ''}`} onClick={() => { update('category', category); setError('') }}><span className="material-symbols-rounded">{category.includes('harassment') || category.includes('violence') ? 'support' : category.includes('documents') ? 'badge' : category.includes('scam') || category.includes('Fraud') ? 'payments' : category.includes('Theft') || category.includes('Robbery') ? 'report' : 'shield'}</span><strong>{category}</strong><span className="material-symbols-rounded">chevron_right</span></button>)}</div></section>}
        {step === 1 && <section className="report-step"><Typography variant="h5">When and where?</Typography><Typography className="muted">Approximate details are okay; leave anything blank if you are unsure.</Typography><TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={incident.date} onChange={event => update('date', event.target.value)} /><TextField fullWidth type="time" label="Approximate time" InputLabelProps={{ shrink: true }} value={incident.time} onChange={event => update('time', event.target.value)} /><TextField fullWidth label="Location" placeholder="Area, address or landmark" value={incident.location} onChange={event => update('location', event.target.value)} /></section>}
        {step === 2 && <section className="report-step"><Typography variant="h5">Tell us what happened</Typography><Typography className="muted">{sensitive ? 'Share only what feels okay. You do not need to include distressing details.' : 'A short description can help us understand what support you need.'}</Typography><TextField fullWidth multiline minRows={5} label="Description (optional)" placeholder="Use your own words. You can skip this." value={incident.description} onChange={event => update('description', event.target.value)} /></section>}
        {step === 3 && <section className="report-step"><Typography variant="h5">Add supporting documents</Typography><Typography className="muted">Evidence is optional. Do not upload anything you are uncomfortable sharing.</Typography><Button className="file-picker-button" variant="outlined" component="label" startIcon={<UploadFileRounded />}>Choose files from this device<input hidden type="file" multiple onChange={event => setFiles(Array.from(event.target.files || []))} /></Button>{files.length > 0 && <div className="selected-files">{files.map(file => <Chip key={`${file.name}-${file.size}`} label={file.name} onDelete={() => setFiles(current => current.filter(item => item !== file))} />)}</div>}<Alert severity="info">Selected attachments are temporary in this page only. They are not copied into browser storage or sent.</Alert></section>}
        {step === 4 && <section className="report-step"><Typography variant="h5">Review your choices</Typography><Typography className="muted">You control what you share and who can follow up.</Typography><div className="review-summary"><span>Category</span><strong>{incident.category || 'Not selected'}</strong><span>Date & time</span><strong>{incident.date || 'Not provided'} {incident.time}</strong><span>Location</span><strong>{incident.location || 'Not provided'}</strong><span>Description</span><strong>{incident.description ? 'Added' : 'Not provided'}</strong><span>Attachments</span><strong>{files.length ? `${files.length} selected` : 'None'}</strong></div><FormControl fullWidth><InputLabel>Preferred contact method</InputLabel><Select label="Preferred contact method" value={incident.contact} onChange={event => update('contact', event.target.value)}><MenuItem value="">No preference</MenuItem><MenuItem value="Email">Email</MenuItem><MenuItem value="Phone">Phone</MenuItem><MenuItem value="WhatsApp">WhatsApp</MenuItem></Select></FormControl><FormControlLabel control={<Checkbox checked={incident.reportedToPolice} onChange={event => update('reportedToPolice', event.target.checked)} />} label="I have reported this to SAPS" />{incident.reportedToPolice && <TextField fullWidth label="Police case number (optional)" value={incident.policeCase} onChange={event => update('policeCase', event.target.value)} />}{sensitive && <div className="sensitive-options"><Typography variant="subtitle1">What would help you now?</Typography><Typography variant="body2" className="muted">Both choices are optional. Your report is not shared with third parties.</Typography><FormControlLabel control={<Checkbox checked={incident.wantsSupport} onChange={event => update('wantsSupport', event.target.checked)} />} label="I would like support" /><FormControlLabel control={<Checkbox checked={incident.wantsPoliceInfo} onChange={event => update('wantsPoliceInfo', event.target.checked)} />} label="I would like information about reporting to SAPS" /></div>}<Alert severity="warning">Submitting a TouristCare report does not open an official SAPS case. Sensitive reports are not shared with hotels, employers or other third parties.</Alert></section>}
        <div className="form-actions"><Button disabled={step === 0 || saving} onClick={() => { setStep(step - 1); setError('') }}>Back</Button><Box sx={{ flex: 1 }} /><Button variant="text" onClick={() => { setDraft(true); setError('') }}>Save draft</Button>{step < 4 ? <Button variant="contained" onClick={() => { if (step === 0 && !incident.category) { setError('Choose an incident category to continue.'); return } setError(''); setStep(step + 1) }}>Continue</Button> : <Button variant="contained" disabled={saving || demo.pendingAction === 'submitIncident'} onClick={submit}>{saving ? 'Saving demo…' : 'Save demo report'}</Button>}</div>
      </CardContent></Card>
      <Snackbar open={draft} autoHideDuration={3000} message="Draft remains on this page only; it is not uploaded or persisted." onClose={() => setDraft(false)} />
    </AppShell>
  )
}

function Cases() {
  const navigate = useNavigate()
  const demo = useDemoData()
  const [dialogCase, setDialogCase] = useState(null)
  const [note, setNote] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const saveFollowUp = async () => {
    if (!dialogCase) return
    try {
      await demo.run('addFollowUp', dialogCase.ref, note)
      setDialogCase(null)
      setNote('')
      setError('')
      setNotice('Follow-up note saved in this browser demo.')
    } catch (saveError) {
      setError(saveError.message || 'The demo follow-up could not be saved.')
    }
  }
  const savedCases = demo.data?.cases || []
  return (
    <AppShell>
      <PageHeader title="My cases" subtitle="Track reports and follow-up activity." />
      <Alert severity="info" sx={{ mb: 2 }}>Sample and new demo cases are saved only in this browser. Use fictional follow-up notes; do not enter sensitive personal information.</Alert>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {savedCases.length ? <div className="row g-3">{savedCases.map(item => <div className="col-12" key={item.ref}><Card className="case-card"><CardContent><div className="case-head"><div><Typography variant="subtitle1"><strong>{item.ref}</strong></Typography><Chip label={item.category} size="small" />{item.demoSample && <Chip label="Sample" size="small" variant="outlined" />}</div><Chip label={item.status} color={item.status === 'Closed' ? 'success' : 'warning'} variant="outlined" /></div><div className="case-meta"><div><small>Date reported</small><strong>{new Date(item.reportedAt).toLocaleDateString()}</strong></div><div><small>Police case number</small><strong>Not provided</strong></div><div><small>Last update</small><strong>{new Date(item.updatedAt).toLocaleString()}</strong></div></div><Divider sx={{ my: 2 }} /><div className="case-actions"><Button size="small" endIcon={<ArrowForwardRounded />} onClick={() => navigate(`/cases/${item.ref}`)}>View timeline</Button><Button size="small" startIcon={<AddCommentRounded />} onClick={() => { setDialogCase(item); setError('') }}>Add follow-up</Button></div></CardContent></Card></div>)}</div> : <Card><CardContent className="empty-state"><AssignmentRounded /><Typography variant="h6">{demo.loading ? 'Loading demo cases…' : 'No cases yet'}</Typography><Button variant="contained" onClick={() => navigate('/report')}>Create demo report</Button></CardContent></Card>}
      <Dialog open={!!dialogCase} onClose={() => setDialogCase(null)} fullWidth maxWidth="xs"><DialogTitle>Add a demo follow-up note</DialogTitle><DialogContent><Alert severity="warning" sx={{ mb: 1 }}>Use fictional, non-sensitive text only. This note persists in this browser.</Alert><TextField fullWidth multiline rows={4} sx={{ mt: 1 }} label="Demo note" value={note} onChange={event => setNote(event.target.value)} inputProps={{ maxLength: 500 }} /></DialogContent><DialogActions><Button onClick={() => setDialogCase(null)}>Cancel</Button><Button variant="contained" disabled={!note.trim() || demo.pendingAction === 'addFollowUp'} onClick={saveFollowUp}>Save note</Button></DialogActions></Dialog>
      <Snackbar open={!!notice} autoHideDuration={3500} message={notice} onClose={() => setNotice('')} />
    </AppShell>
  )
}

function CaseDetail() {
  const navigate = useNavigate()
  const { caseRef } = useParams()
  const demo = useDemoData()
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const item = (demo.data?.cases || []).find(record => record.ref === caseRef)
  const requestSupport = async () => {
    if (!item) return
    try {
      await demo.run('createSupportRequest', `Case follow-up · ${item.category}`)
      setNotice('A demo support request was saved on this browser only.')
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'The demo support request could not be saved.')
    }
  }
  return <AppShell>
    <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/cases')} sx={{ mb: 2 }}>Back to cases</Button>
    {!item ? <Card><CardContent className="empty-state"><AssignmentRounded /><Typography variant="h6">{demo.loading ? 'Loading case…' : 'This demo case was not found'}</Typography><Button variant="contained" onClick={() => navigate('/cases')}>View my cases</Button></CardContent></Card> : <>
      <PageHeader title={`Case ${item.ref}`} subtitle={`${item.category} · Reported ${new Date(item.reportedAt).toLocaleDateString()}`} />
      <Alert severity="info" sx={{ mb: 2 }}>Local demo timeline only. Police case number: not provided.</Alert>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <div className="row g-3"><div className="col-lg-8"><Card><CardContent><Typography variant="h6" className="mb-3">Case timeline</Typography><div className="timeline">{item.timeline.map(event => <div className="timeline-item" key={event.id}><span /><div><strong>{event.title}</strong><Typography variant="body2" className="muted">{new Date(event.at).toLocaleString()} · {event.actor}</Typography></div></div>)}</div>{!item.timeline.length && <Typography className="muted">No timeline events yet.</Typography>}</CardContent></Card></div><div className="col-lg-4"><Card><CardContent><Typography variant="h6">Case information</Typography><dl className="details-list"><dt>Support status</dt><dd>{item.status}</dd><dt>Last update</dt><dd>{new Date(item.updatedAt).toLocaleString()}</dd><dt>Police case number</dt><dd>Not provided</dd></dl><Button fullWidth variant="outlined" startIcon={<SupportAgentRounded />} onClick={requestSupport} disabled={demo.pendingAction === 'createSupportRequest'}>Create demo support request</Button></CardContent></Card></div></div>
    </>}
    <Snackbar open={!!notice} autoHideDuration={3500} message={notice} onClose={() => setNotice('')} />
  </AppShell>
}

function Support() {
  const demo = useDemoData()
  const categories = [
    { icon: SosRounded, title: 'Emergency assistance', text: 'Immediate danger or urgent medical help.' },
    { icon: FavoriteRounded, title: 'Sexual harassment & GBV', text: 'Confidential information and support options.' },
    { icon: MedicalServicesRounded, title: 'Medical assistance', text: 'Find appropriate urgent or routine care.' },
    { icon: PsychologyRounded, title: 'Counselling support', text: 'Emotional support after an incident.' },
    { icon: DescriptionRounded, title: 'Lost travel documents', text: 'Guidance for passport and document replacement.' },
    { icon: AccountBalanceRounded, title: 'Consular assistance', text: 'Contact the relevant diplomatic mission.' },
    { icon: TravelExploreRounded, title: 'Tourism support', text: 'Visitor information and local guidance.' },
    { icon: GavelRounded, title: 'Reporting to SAPS', text: 'Information about official police reporting.' },
  ]
  const [selected, setSelected] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const createRequest = async () => {
    if (!selected) return
    try {
      await demo.run('createSupportRequest', selected.title)
      setSelected(null)
      setError('')
      setNotice('Demo support request saved in this browser. No provider was contacted.')
    } catch (requestError) {
      setError(requestError.message || 'The demo support request could not be saved.')
    }
  }
  const requests = demo.data?.supportRequests || []
  return (
    <AppShell><PageHeader title="Get support" subtitle="Find the right kind of help for your situation." />
      <Alert severity="info" sx={{ mb: 2 }}>Support categories are guidance. Requesting help creates a local demo record only; no provider receives your information.</Alert>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>{categories.map(({ icon: Icon, title, text }) => <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={title}><Card className="support-card" onClick={() => setSelected({ title, text })}><CardContent><div className="support-icon"><Icon /></div><Typography variant="subtitle1">{title}</Typography><Typography variant="body2" className="muted">{text}</Typography></CardContent></Card></Grid>)}</Grid>
      <Card className="mt-4"><CardContent><Typography variant="h6" className="mb-3">Demo support requests</Typography>{requests.map(request => <div className="support-request" key={request.id}><div><strong>{request.category}</strong><Typography variant="body2" className="muted">{request.id} · {request.status}{request.demoSample ? ' · sample' : ' · this browser'}</Typography></div><Chip label={request.status} size="small" variant="outlined" /></div>)}</CardContent></Card>
      <Dialog open={!!selected} onClose={() => setSelected(null)}><DialogTitle>{selected?.title}</DialogTitle><DialogContent><Typography className="muted">{selected?.text}</Typography><Alert severity="warning" sx={{ mt: 2 }}>This button creates a demonstration record only. It does not contact a support provider.</Alert></DialogContent><DialogActions><Button onClick={() => setSelected(null)}>Close</Button><Button variant="contained" disabled={demo.pendingAction === 'createSupportRequest'} onClick={createRequest}>Create demo request</Button></DialogActions></Dialog>
      <Snackbar open={!!notice} autoHideDuration={3500} message={notice} onClose={() => setNotice('')} />
    </AppShell>
  )
}

function Safety() {
  const sections = [
    { icon: DirectionsBusRounded, title: 'Airport and transport safety', text: 'Use official transport points, confirm vehicle details and keep valuables close.' },
    { icon: TravelExploreRounded, title: 'E-hailing safety', text: 'Verify the plate, vehicle and driver before entering. Share trip details with a trusted person.' },
    { icon: WarningAmberRounded, title: 'Avoiding tourist scams', text: 'Be cautious of unsolicited offers, fake authorities and requests to move money urgently.' },
    { icon: BadgeRounded, title: 'Protecting travel documents', text: 'Carry copies, store originals securely and know how to contact your consulate.' },
    { icon: HotelRounded, title: 'Accommodation safety', text: 'Check entry routes and emergency procedures and keep doors and windows secure.' },
    { icon: ShieldRounded, title: 'Personal safety', text: 'Stay aware in unfamiliar areas, especially after dark, and use a route you have checked.' },
    { icon: ReportProblemRounded, title: 'What to do after an incident', text: 'Move to safety, seek urgent care, preserve evidence and consider reporting to SAPS.' },
    { icon: FavoriteRounded, title: 'Sexual harassment and GBV', text: 'Move to a safe place and choose support without pressure. Seek immediate medical care if needed.' },
  ]
  return <AppShell><PageHeader title="Safety information" subtitle="Practical guidance for a safer visit." /><Grid container spacing={2}>{sections.map(({ icon: Icon, title, text }) => <Grid size={{ xs: 12, md: 6 }} key={title}><Card className="safety-card"><CardContent><div className="support-icon"><Icon /></div><Typography variant="h6">{title}</Typography><Typography variant="body2" className="muted">{text}</Typography></CardContent></Card></Grid>)}</Grid></AppShell>
}

function SettingsPage() {
  const navigate = useNavigate()
  const demo = useDemoData()
  const trusted = [{ name: 'Emergency contact', phone: 'Not provided' }]
  const [dialog, setDialog] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetError, setResetError] = useState('')
  const [notice, setNotice] = useState('')
  const reset = async () => {
    try {
      await demo.run('resetDemoData')
      setResetOpen(false)
      setResetError('')
      setNotice('Demo data reset for this browser. Sample records have been restored.')
    } catch (error) {
      setResetError(error.message || 'Demo data could not be reset.')
    }
  }
  return <AppShell>
    <PageHeader title="Settings" subtitle={`Demo visitor reference: ${demo.data?.visitor?.reference || 'Loading…'}`} />
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Card><CardContent><Typography variant="h6" className="mb-3">Demo profile</Typography><div className="row g-3"><div className="col-md-6"><TextField fullWidth label="Display name (not saved)" defaultValue="Demo visitor" /></div><div className="col-md-6"><TextField fullWidth label="Email (not saved)" placeholder="Optional demo value" /></div><div className="col-md-6"><TextField fullWidth label="Phone (not saved)" placeholder="Do not enter a real number" /></div><div className="col-md-6"><FormControl fullWidth><InputLabel>Preferred language</InputLabel><Select label="Preferred language" defaultValue="English"><MenuItem value="English">English</MenuItem><MenuItem value="Afrikaans">Afrikaans</MenuItem><MenuItem value="isiZulu">isiZulu</MenuItem></Select></FormControl></div></div><Alert severity="warning" sx={{ mt: 2 }}>Profile fields are illustrative only and are not saved. Do not enter real personal information.</Alert></CardContent></Card>
        <Card className="mt-3"><CardContent><Typography variant="h6" className="mb-3">Privacy and notifications</Typography><FormControlLabel control={<Switch defaultChecked />} label="Safety updates (demo)" /><br /><FormControlLabel control={<Switch defaultChecked />} label="Case activity notifications (demo)" /><br /><FormControlLabel control={<Switch />} label="Share location only during an active SOS request" /></CardContent></Card>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card><CardContent><div className="card-heading"><Typography variant="h6">Trusted emergency contacts</Typography><IconButton onClick={() => setDialog(true)}><AddRounded /></IconButton></div>{trusted.map(contact => <div className="contact-row" key={contact.name}><Avatar><PersonRounded /></Avatar><div><strong>{contact.name}</strong><small>{contact.phone}</small></div></div>)}<Typography variant="caption" className="muted">Contact entry is not connected to any service in this demo.</Typography></CardContent></Card>
        <Card className="mt-3"><CardContent><Typography variant="h6" className="mb-3">Demo tools</Typography><Button fullWidth variant="outlined" startIcon={<DashboardRounded />} sx={{ mb: 1 }} onClick={() => navigate('/staff')}>Open staff demo view</Button><Button fullWidth color="error" variant="contained" startIcon={<DeleteOutlineRounded />} onClick={() => setResetOpen(true)}>Reset Demo Data</Button><Typography variant="caption" className="muted d-block mt-2">Resets only this browser’s demo records and restores the sample records. Other devices are not affected.</Typography></CardContent></Card>
        <Card className="mt-3"><CardContent><Typography variant="h6" className="mb-3">Account security</Typography><Button fullWidth variant="outlined" startIcon={<LockRounded />} sx={{ mb: 1 }} onClick={() => navigate('/login')}>Sign-in options</Button><Button fullWidth color="error" variant="text" startIcon={<LogoutRounded />} onClick={() => navigate('/')}>Return to welcome page</Button></CardContent></Card>
      </Grid>
    </Grid>
    <Dialog open={dialog} onClose={() => setDialog(false)}><DialogTitle>Demo contact</DialogTitle><DialogContent><Alert severity="warning">Contact details are not stored or used. Do not enter real phone numbers.</Alert><Stack spacing={2} sx={{ mt: 1, minWidth: { xs: 250, sm: 380 } }}><TextField label="Name (not saved)" /><TextField label="Phone number (not saved)" /></Stack></DialogContent><DialogActions><Button onClick={() => setDialog(false)}>Close</Button></DialogActions></Dialog>
    <Dialog open={resetOpen} onClose={() => setResetOpen(false)}><DialogTitle>Reset demo data?</DialogTitle><DialogContent><Typography>This removes reports, status updates, follow-up notes, document metadata, support requests and notifications created in this browser, then restores the original sample records. Your demo visitor reference remains the same. No other visitor or device is affected.</Typography>{resetError && <Alert severity="error" sx={{ mt: 2 }}>{resetError}</Alert>}</DialogContent><DialogActions><Button onClick={() => setResetOpen(false)}>Cancel</Button><Button color="error" variant="contained" disabled={demo.pendingAction === 'resetDemoData'} onClick={reset}>Reset Demo Data</Button></DialogActions></Dialog>
    <Snackbar open={!!notice} autoHideDuration={4500} message={notice} onClose={() => setNotice('')} />
  </AppShell>
}

function StaffDashboard() {
  const navigate = useNavigate()
  const demo = useDemoData()
  const reports = demo.data?.cases || []
  const supportRequests = demo.data?.supportRequests || []
  const activity = demo.data?.staffActivity || []
  const safeCategory = category => ['Sexual harassment', 'Gender-based violence'].includes(category) ? 'Sensitive report' : category
  const needsFollowUp = reports.filter(item => ['New', 'Awaiting update', 'In review'].includes(item.status)).length
  return <AppShell staff>
    <PageHeader title="Staff demo overview" subtitle="Sample and same-browser activity for demonstration only." />
    <Alert severity="warning" sx={{ mb: 2 }}>This is not a protected staff dashboard. It shows sample data plus reports created in this browser only. Sensitive descriptions, locations and contact details are not shown.</Alert>
    <Grid container spacing={2} className="mb-3">
      <Grid size={{ xs: 12, sm: 4 }}><Card><CardContent><Typography variant="body2" className="muted">Demo reports</Typography><Typography variant="h4">{reports.length}</Typography></CardContent></Card></Grid>
      <Grid size={{ xs: 12, sm: 4 }}><Card><CardContent><Typography variant="body2" className="muted">Demo support requests</Typography><Typography variant="h4">{supportRequests.length}</Typography></CardContent></Card></Grid>
      <Grid size={{ xs: 12, sm: 4 }}><Card><CardContent><Typography variant="body2" className="muted">Awaiting follow-up</Typography><Typography variant="h4">{needsFollowUp}</Typography></CardContent></Card></Grid>
    </Grid>
    <Card><CardContent><div className="card-heading"><Typography variant="h6">Recent demo reports</Typography><Button size="small" onClick={() => navigate('/staff/reports')}>View all</Button></div>{reports.length ? <div className="staff-demo-list">{reports.slice(0, 5).map(item => <div className="staff-demo-row" key={item.ref}><div><strong>{item.ref}</strong><small>{safeCategory(item.category)} · {new Date(item.reportedAt).toLocaleDateString()}{item.demoSample ? ' · sample' : ' · this browser'}</small></div><Chip label={item.status} size="small" variant="outlined" /></div>)}</div> : <div className="empty-state"><ReportProblemRounded /><Typography variant="body2" className="muted">No demo reports yet.</Typography></div>}</CardContent></Card>
    <Card className="mt-3"><CardContent><Typography variant="h6">Demo staff activity</Typography>{activity.length ? <div className="staff-demo-list">{activity.slice(0, 6).map(item => <div className="staff-demo-row" key={item.id}><div><strong>{item.title}</strong><small>{item.reference} · {new Date(item.createdAt).toLocaleString()}{item.demoSample ? ' · sample' : ''}</small></div></div>)}</div> : <Typography className="muted">No staff demo activity yet.</Typography>}</CardContent></Card>
    <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/staff/support')}>View demo support requests</Button>
  </AppShell>
}

function StaffReports() {
  const demo = useDemoData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [error, setError] = useState('')
  const reports = (demo.data?.cases || []).filter(item =>
    item.ref.toLowerCase().includes(search.trim().toLowerCase()) && (status === 'All' || item.status === status)
  )
  const safeCategory = category => ['Sexual harassment', 'Gender-based violence'].includes(category) ? 'Sensitive report' : category
  const updateStatus = async (reference, nextStatus) => {
    try {
      await demo.run('updateCaseStatus', reference, nextStatus)
      setError('')
    } catch (statusError) {
      setError(statusError.message || 'The demo status could not be updated.')
    }
  }
  return <AppShell staff>
    <PageHeader title="Submitted demo reports" subtitle="Non-sensitive sample fields only; status changes stay in this browser." />
    <Card><CardContent>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} className="mb-3">
        <TextField size="small" placeholder="Search reference" value={search} onChange={event => setSearch(event.target.value)} InputProps={{ startAdornment: <SearchRounded sx={{ mr: 1, color: 'text.secondary' }} /> }} />
        <FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Status</InputLabel><Select label="Status" value={status} onChange={event => setStatus(event.target.value)}><MenuItem value="All">All statuses</MenuItem>{['New', 'In review', 'Awaiting update', 'Support in progress', 'Closed'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</Select></FormControl>
      </Stack>
      <Alert severity="warning" sx={{ mb: 2 }}>Staff demo has no authentication. Descriptions, exact locations, police details and contact information are intentionally excluded from this view.</Alert>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {reports.length ? <div className="staff-demo-list">{reports.map(item => <div className="staff-demo-row staff-report-row" key={item.ref}><div><strong>{item.ref}</strong><small>{safeCategory(item.category)} · reported {new Date(item.reportedAt).toLocaleDateString()}{item.demoSample ? ' · sample record' : ' · this browser'}</small></div><FormControl size="small" sx={{ minWidth: { xs: 130, sm: 190 } }}><InputLabel>Status</InputLabel><Select label="Status" value={item.status} disabled={demo.pendingAction === 'updateCaseStatus'} onChange={event => updateStatus(item.ref, event.target.value)}>{['New', 'In review', 'Awaiting update', 'Support in progress', 'Closed'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</Select></FormControl></div>)}</div> : <div className="empty-state"><ReportProblemRounded /><Typography variant="body2" className="muted">No reports match this filter.</Typography></div>}
    </CardContent></Card>
  </AppShell>
}

function StaffSupport() {
  const demo = useDemoData()
  const [error, setError] = useState('')
  const requests = demo.data?.supportRequests || []
  const updateStatus = async (id, status) => {
    try {
      await demo.run('updateSupportRequestStatus', id, status)
      setError('')
    } catch (statusError) {
      setError(statusError.message || 'The demo support status could not be updated.')
    }
  }
  return <AppShell staff>
    <PageHeader title="Demo support requests" subtitle="Sample and same-browser requests; no provider contact details are stored." />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Card><CardContent>{requests.length ? <div className="staff-demo-list">{requests.map(request => <div className="staff-demo-row staff-report-row" key={request.id}><div><strong>{request.category}</strong><small>{request.id} · {new Date(request.createdAt).toLocaleDateString()}{request.demoSample ? ' · sample record' : ' · this browser'}</small></div><FormControl size="small" sx={{ minWidth: { xs: 140, sm: 210 } }}><InputLabel>Status</InputLabel><Select label="Status" value={request.status} disabled={demo.pendingAction === 'updateSupportRequestStatus'} onChange={event => updateStatus(request.id, event.target.value)}>{['New', 'In review', 'Contact information needed', 'Completed'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</Select></FormControl></div>)}</div> : <div className="empty-state"><SupportAgentRounded /><Typography variant="h6">No demo support requests</Typography></div>}</CardContent></Card>
  </AppShell>
}

function Welcome() {
  const navigate = useNavigate()
  const demo = useDemoData()
  const publicServices = [
    [SosRounded, 'Emergency SOS', '/emergency'],
    [ReportProblemRounded, 'Report an incident', '/report'],
    [SupportAgentRounded, 'Get support', '/support'],
    [ShieldRounded, 'Safety information', '/safety'],
    [FolderRounded, 'My documents', '/documents'],
    [AssignmentRounded, 'My cases', '/cases'],
  ]
  return <main className="welcome-page">
    <header className="welcome-header"><button className="welcome-brand" aria-label="TouristCare home"><span className="brand-mark"><ShieldRounded /></span><span>TouristCare</span></button><div className="welcome-header-actions"><DemoModeBadge /><button className="welcome-signin" onClick={() => navigate('/login')}>Sign in <ArrowForwardRounded /></button></div></header>
    {demo.error && <Alert severity="error">{demo.error}</Alert>}
    <section className="welcome-hero">
      <div className="hero-photo"><img src="https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1400&q=85" alt="Table Mountain overlooking Cape Town" /><span className="photo-caption"><LocationOnRounded /> CAPE TOWN, SOUTH AFRICA</span></div>
      <div className="hero-copy"><span className="eyebrow">YOUR TRAVEL SAFETY COMPANION</span><h1>Explore Cape Town.<br /><em>Feel Safer.</em></h1><p>Practical safety tools and caring support for every part of your journey.</p>
        <button className="qr-access-button" onClick={() => navigate('/dashboard')}><span className="qr-icon"><ShieldRounded /></span><span><strong>Open visitor tools</strong><small>Emergency help and safety support · no sign-in needed</small></span><KeyboardArrowRightRounded /></button>
        <p className="welcome-small">Need immediate help? <button onClick={() => navigate('/emergency')}>Open Emergency SOS</button></p>
        <div className="welcome-account-links"><button onClick={() => navigate('/login')}>Sign in</button><span>·</span><button onClick={() => navigate('/register')}>Create an optional account</button></div>
      </div>
    </section>
    <section className="public-services" aria-labelledby="public-services-title">
      <div className="public-services-heading"><div><span className="eyebrow">NO ACCOUNT REQUIRED</span><h2 id="public-services-title">What do you need?</h2></div><span className="material-symbols-rounded" aria-hidden="true">explore</span></div>
      <div className="public-service-grid">{publicServices.map(([Icon, label, route]) => <button key={route} className={route === '/emergency' ? 'public-service emergency-service' : 'public-service'} onClick={() => navigate(route)}><Icon /><span>{label}</span><KeyboardArrowRightRounded /></button>)}</div>
      <p className="public-record-note">Interactive reports, case updates and document metadata are demonstrations saved only in this browser (visitor {demo.data?.visitor?.reference || 'loading'}). Do not enter real personal or sensitive information.</p>
    </section>
    <InstallPrompt />
    <footer className="welcome-footer"><ShieldRounded /> Safety beyond the incident · <a href="/admin/qr">QR distribution</a></footer>
  </main>
}

function OfficialQrUtility() {
  const [venue, setVenue] = useState('general')
  const [locationName, setLocationName] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const qrRef = useRef(null)
  const normalizedLocation = locationName.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
  const sourceTag = venue === 'general' ? '' : [venue, normalizedLocation].filter(Boolean).join('-').slice(0, 64)
  const target = PUBLIC_APP_URL ? new URL('/', `${PUBLIC_APP_URL}/`) : null
  if (sourceTag && target) target.searchParams.set('src', sourceTag)
  const targetUrl = target?.toString() || ''
  const fileStem = sourceTag ? `touristcare-qr-${sourceTag}` : 'touristcare-official-qr'
  const svgMarkup = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) throw new Error('QR image is not ready yet.')
    return new XMLSerializer().serializeToString(svg)
  }
  const downloadBlob = (blob, filename) => {
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }
  const downloadSvg = () => {
    try {
      downloadBlob(new Blob([svgMarkup()], { type: 'image/svg+xml;charset=utf-8' }), `${fileStem}.svg`)
      setError('')
    } catch (downloadError) {
      setError(downloadError.message)
    }
  }
  const downloadPng = () => {
    let imageUrl
    try {
      imageUrl = URL.createObjectURL(new Blob([svgMarkup()], { type: 'image/svg+xml;charset=utf-8' }))
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 1200
        canvas.height = 1200
        const context = canvas.getContext('2d')
        if (!context) {
          URL.revokeObjectURL(imageUrl)
          setError('PNG export is not supported in this browser. Download the SVG instead.')
          return
        }
        context.fillStyle = '#FFFFFF'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(blob => {
          URL.revokeObjectURL(imageUrl)
          if (!blob) {
            setError('Could not create a PNG file. Download the SVG instead.')
            return
          }
          downloadBlob(blob, `${fileStem}.png`)
          setError('')
        }, 'image/png')
      }
      image.onerror = () => {
        URL.revokeObjectURL(imageUrl)
        setError('Could not render the QR image. Download the SVG instead.')
      }
      image.src = imageUrl
    } catch (downloadError) {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
      setError(downloadError.message)
    }
  }
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl)
      setNotice('Public QR destination copied.')
      setError('')
    } catch {
      setError('Clipboard access is unavailable. Select and copy the destination shown below.')
    }
  }
  return <AppShell>
    <PageHeader title="Official TouristCare QR" subtitle="One public destination for visitor safety tools. No app download or sign-in required." />
    {PUBLIC_APP_URL
      ? <Alert severity="success" sx={{ mb: 2 }}>QR destination: <a href={PUBLIC_APP_URL} target="_blank" rel="noreferrer">{PUBLIC_APP_URL}</a></Alert>
      : <Alert severity="error" sx={{ mb: 2 }}>Public QR generation is disabled. Configure VITE_APP_URL with the deployed HTTPS TouristCare URL in Vercel environment variables, then rebuild.</Alert>}
    <div className="qr-utility-layout">
      <Card><CardContent className="qr-controls">
        <Typography variant="h6">Create a distribution QR</Typography>
        <Typography variant="body2" className="muted">All codes open the same TouristCare welcome page. Optional source labels identify distribution channels only; they never contain visitor information.</Typography>
        <FormControl fullWidth><InputLabel>Distribution point</InputLabel><Select label="Distribution point" value={venue} onChange={event => setVenue(event.target.value)}><MenuItem value="general">Official public QR</MenuItem><MenuItem value="airport">Airport information point</MenuItem><MenuItem value="hotel">Hotel</MenuItem><MenuItem value="guesthouse">Guesthouse</MenuItem><MenuItem value="tourism-centre">Tourism centre</MenuItem><MenuItem value="transport-provider">Participating transport provider</MenuItem><MenuItem value="tourist-attraction">Tourist attraction</MenuItem></Select></FormControl>
        {venue !== 'general' && <TextField fullWidth label="Optional location label" value={locationName} onChange={event => setLocationName(event.target.value)} helperText="A short public venue label only, such as waterfront-hotel. Do not enter visitor details." inputProps={{ maxLength: 80 }} />}
        <div className="qr-utility-actions"><Button variant="contained" disabled={!targetUrl} onClick={downloadPng}>Download PNG</Button><Button variant="outlined" disabled={!targetUrl} onClick={downloadSvg}>Download SVG</Button></div>
        <div className="qr-utility-actions"><Button variant="text" disabled={!targetUrl} onClick={copyUrl}>Copy link</Button><Button variant="text" disabled={!targetUrl} onClick={() => window.print()}>Print QR</Button></div>
        {error && <Alert severity="error">{error}</Alert>}
        {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}
        {targetUrl && <div className="qr-url-box"><span>Public QR destination</span><code>{targetUrl}</code></div>}
      </CardContent></Card>
      <Card className="qr-print-card"><CardContent>
        <div className="qr-print-heading"><span className="brand-mark"><ShieldRounded /></span><span>TouristCare</span></div>
        <div className="qr-code-frame" ref={qrRef}>{targetUrl ? <QRCodeSVG value={targetUrl} size={260} level="H" includeMargin bgColor="#FFFFFF" fgColor="#172B3A" title="Official TouristCare QR code" /> : <Typography variant="body2" className="muted">Configure the deployed HTTPS URL to generate the public QR.</Typography>}</div>
        <Typography variant="h6" className="qr-visitor-title">Scan for safety support</Typography>
        <Typography variant="body2" className="muted">Open with your phone camera · no app or account required</Typography>
        {sourceTag && <Chip className="qr-source-chip" label={`Source: ${sourceTag}`} size="small" />}
      </CardContent></Card>
    </div>
    <Alert severity="warning" sx={{ mt: 2 }}>This distribution utility is not protected by a staff login. QR links expose no visitor records and should only be shared as public access links.</Alert>
  </AppShell>
}

function Login({ register = false, recovery = false }) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const submit = async event => {
    event.preventDefault()
    setError(''); setMessage('')
    if (recovery || register) {
      setError(recovery
        ? 'Password recovery is not available until the authentication service is connected.'
        : 'Account creation is not available until the authentication service is connected.')
      return
    }
    try {
      await touristCareApi.login({ email, password })
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in. Please try again.')
    }
  }
  return <main className="auth-page"><button className="auth-brand" onClick={() => navigate('/')}><span className="brand-mark"><ShieldRounded /></span><span>TouristCare</span></button><Card className="auth-card"><CardContent><Typography variant="h5">{recovery ? 'Reset your password' : register ? 'Create an account' : 'Welcome back'}</Typography><Typography variant="body2" className="muted mb-4">{recovery ? 'Enter your email to request a reset link.' : register ? 'Create your personal safety account.' : 'Sign in to your travel safety companion.'}</Typography>
    {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}{message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
    <form onSubmit={submit}><Stack spacing={2}>{register && <TextField fullWidth required label="Full name" autoComplete="name" />}{<TextField fullWidth required label="Email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} />}{!recovery && <TextField fullWidth required label="Password" autoComplete={register ? 'new-password' : 'current-password'} type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} InputProps={{ endAdornment: <IconButton onClick={() => setShowPassword(value => !value)} edge="end" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <VisibilityRounded /> : <VisibilityOffRounded />}</IconButton> }} />}{register && <TextField fullWidth required label="Confirm password" type="password" autoComplete="new-password" />}{!register && !recovery && <button className="forgot-link" type="button" onClick={() => navigate('/recover')}>Forgot password?</button>}<Button type="submit" variant="contained" size="large">{recovery ? 'Send reset link' : register ? 'Create account' : 'Sign in'}</Button></Stack></form>
    <div className="auth-links">{register ? <button onClick={() => navigate('/login')}>Already registered? Sign in</button> : recovery ? <button onClick={() => navigate('/login')}>Back to sign in</button> : <button onClick={() => navigate('/register')}>New to TouristCare? Create an account</button>}</div>
    <div className="auth-note"><LockRounded /> Your personal details are only shared with your consent.</div>
  </CardContent></Card></main>
}

function App() {
  return (
    <CampaignSourceProvider><Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login register />} />
      <Route path="/recover" element={<Login recovery />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/emergency" element={<EmergencySOS />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/report" element={<ReportIncident />} />
      <Route path="/cases" element={<Cases />} />
      <Route path="/cases/:caseRef" element={<CaseDetail />} />
      <Route path="/support" element={<Support />} />
      <Route path="/safety" element={<Safety />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/staff" element={<StaffDashboard />} />
      <Route path="/staff/reports" element={<StaffReports />} />
      <Route path="/staff/support" element={<StaffSupport />} />
      <Route path="/admin/qr" element={<OfficialQrUtility />} />
      <Route path="*" element={<Dashboard />} />
    </Routes></CampaignSourceProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter><DemoProvider><App /></DemoProvider></BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch(error => console.error('TouristCare offline support could not be enabled.', error))
  })
}
