import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
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
  ArrowBackRounded, SearchRounded, FilterListRounded, LockRounded, PersonRounded,
  EmailRounded, LanguageRounded, LogoutRounded, EditRounded, PhoneRounded,
  FavoriteRounded, MedicalServicesRounded, AccountBalanceRounded, TravelExploreRounded,
  AttachMoneyRounded, DirectionsBusRounded, HotelRounded, WarningAmberRounded,
  PsychologyRounded, BadgeRounded, TimelineRounded, AddCommentRounded, QrCodeScannerRounded,
  MoreHorizRounded, KeyboardArrowRightRounded, MapRounded
} from '@mui/icons-material'
import { touristCareApi } from './services/api'
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
  const activePath = pathname.startsWith('/cases') ? '/cases' : pathname
  const items = staff
    ? [['/staff', DashboardRounded, 'Staff overview'], ['/staff/reports', ReportProblemRounded, 'Submitted reports'], ['/staff/support', SupportAgentRounded, 'Support requests']]
    : navItems
  const moreItems = [['/documents', FolderRounded, 'My Documents'], ['/safety', ShieldRounded, 'Safety Information'], ['/settings', SettingsRounded, 'Settings']]

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
          </div>
          <div className="d-flex align-items-center gap-1">
            <Button className="more-trigger" startIcon={<MoreHorizRounded />} onClick={() => setMobileOpen(true)}>{staff ? 'Menu' : 'More'}</Button>
            <Tooltip title="Profile"><IconButton onClick={() => navigate(staff ? '/staff' : '/settings')}><Avatar sx={{ width: 34, height: 34, bgcolor: '#172B3A' }}>{staff ? 'SS' : 'A'}</Avatar></IconButton></Tooltip>
          </div>
        </header>
        <main className="page-content">{children}</main>
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
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(false)
  const [locating, setLocating] = useState(false)
  const requestLocation = () => {
    if (!navigator.geolocation) { setLocationError(true); return }
    setLocating(true); setLocationError(false)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLocation({ latitude: coords.latitude.toFixed(5), longitude: coords.longitude.toFixed(5), accuracy: Math.round(coords.accuracy) }); setLocating(false) },
      () => { setLocationError(true); setLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }
  const quickActions = [
    [FolderRounded, 'Documents', '/documents'],
    [ReportProblemRounded, 'Report incident', '/report'],
    [AssignmentRounded, 'Track a case', '/cases'],
    [SupportAgentRounded, 'Get support', '/support'],
  ]
  return (
    <AppShell>
      <div className="dashboard-welcome"><Typography variant="h4" component="h1">Explore Cape Town.<br /><span>Feel safer.</span></Typography><p>Support and practical safety tools for your journey.</p></div>
      <button className="location-card" onClick={requestLocation}>
        <span className={`location-indicator ${location ? 'located' : ''}`}><LocationOnRounded /></span>
        <span className="location-copy"><strong>{locating ? 'Finding your location…' : location ? 'Location available' : 'Location sharing is off'}</strong><small>{location ? `${location.latitude}, ${location.longitude} · ±${location.accuracy} m` : locationError ? 'Permission denied. Tap to try again.' : 'Tap to share your location when you need it.'}</small></span>
        <span className="location-action">{locating ? <CircularProgress size={18} /> : <KeyboardArrowRightRounded />}</span>
      </button>
      <Card className="dashboard-sos-card">
        <CardContent><div className="dashboard-sos-copy"><span className="eyebrow">HERE WHEN YOU NEED IT</span><Typography variant="h5">Need help right now?</Typography><Typography variant="body2">Call emergency services or share your location. SOS does not dispatch responders.</Typography><Button variant="contained" onClick={() => navigate('/emergency')} startIcon={<SosRounded />}>Open SOS</Button></div><div className="sos-emblem"><SosRounded /></div></CardContent>
      </Card>
      <section className="quick-section">
        <div className="section-heading"><Typography variant="h6">Quick actions</Typography><span>YOUR TRIP, MADE EASIER</span></div>
        <div className="quick-grid">{quickActions.map(([Icon, title, path]) => <button className="quick-action" key={path} onClick={() => navigate(path)}><span><Icon /></span><strong>{title}</strong><KeyboardArrowRightRounded /></button>)}</div>
      </section>
      <section className="dashboard-section"><div className="section-heading"><Typography variant="h6">Recent activity</Typography><Button size="small" onClick={() => navigate('/cases')}>View all</Button></div><Card className="activity-card"><CardContent><div className="activity-row"><div className="activity-icon"><AssignmentRounded /></div><div><strong>No recent activity</strong><Typography variant="body2" className="muted">Your reports and case updates will appear here.</Typography></div></div></CardContent></Card></section>
      <section className="dashboard-section"><div className="section-heading"><Typography variant="h6">Visitor safety</Typography><Button size="small" onClick={() => navigate('/safety')}>More tips</Button></div><div className="safety-tip-card"><div className="safety-tip-image" role="img" aria-label="Cape Town mountain landscape" /><div><span className="eyebrow">A QUICK REMINDER</span><strong>Check your ride before you get in</strong><p>Match the vehicle, plate and driver to your e-hailing app.</p><Button size="small" endIcon={<ArrowForwardRounded />} onClick={() => navigate('/safety')}>Read safety tips</Button></div></div></section>
    </AppShell>
  )
}

function EmergencySOS() {
  const [dialog, setDialog] = useState(false)
  const [location, setLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [denied, setDenied] = useState(false)
  const [shareMessage, setShareMessage] = useState('')

  const locate = () => {
    setLocating(true); setDenied(false)
    if (!navigator.geolocation) { setDenied(true); setLocating(false); return }
    navigator.geolocation.getCurrentPosition(
      pos => { setLocation({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6), accuracy: Math.round(pos.coords.accuracy) }); setLocating(false) },
      () => { setDenied(true); setLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }
  const shareLocation = async () => {
    if (!location) return
    const url = `https://maps.google.com/?q=${location.lat},${location.lng}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My TouristCare location', text: `My current location: ${location.lat}, ${location.lng} (accuracy ±${location.accuracy} m)`, url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`My current location: ${location.lat}, ${location.lng} (accuracy ±${location.accuracy} m) ${url}`)
        setShareMessage('Location link copied. Share it with your trusted contact.')
      } else {
        setShareMessage('Sharing is not supported in this browser. You can copy the coordinates above.')
      }
      setDialog(false)
    } catch (shareError) {
      if (shareError.name !== 'AbortError') setShareMessage('Could not share this location. Try again or copy the coordinates.')
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
              <Typography variant="body2" className="muted mb-3">Your action is not sent automatically. Confirm before requesting assistance.</Typography>
              <Button variant="contained" color="error" startIcon={<CallRounded />} onClick={() => setDialog(true)}>Call emergency services</Button>
              <Typography variant="caption" className="d-block mt-2 muted">South Africa: 112 from a mobile phone where available</Typography>
            </CardContent>
          </Card>
        </div>
        <div className="col-lg-5">
          <Card className="h-100"><CardContent>
            <Typography variant="h6" className="mb-3">Your location</Typography>
            {location ? (
              <><div className="location-grid"><div><small>Latitude</small><strong>{location.lat}</strong></div><div><small>Longitude</small><strong>{location.lng}</strong></div><div><small>Accuracy</small><strong>{location.accuracy} m</strong></div></div><div className="map-placeholder"><LocationOnRounded /><span>Map preview</span><small>Enable a map integration to display this location.</small></div></>
            ) : <div className="location-empty"><LocationOnRounded /><strong>{denied ? 'Location permission denied' : 'Location is not active'}</strong><Typography variant="body2" className="muted">{denied ? 'Enable location access in browser settings, then try again.' : 'Grant temporary access only when you need it.'}</Typography></div>}
            <Button fullWidth variant="outlined" startIcon={locating ? <CircularProgress size={18} /> : <LocationOnRounded />} onClick={locate} disabled={locating}>{locating ? 'Finding location' : 'Get my current location'}</Button>
            <Button fullWidth variant="text" startIcon={<ShareRounded />} sx={{ mt: 1 }} disabled={!location} onClick={() => setDialog(true)}>Share with a trusted contact</Button>
            {shareMessage && <Alert severity="info" sx={{ mt: 1 }} onClose={() => setShareMessage('')}>{shareMessage}</Alert>}
          </CardContent></Card>
        </div>
      </div>
      <Dialog open={dialog} onClose={() => setDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Choose what you need</DialogTitle><DialogContent><Alert severity="warning" sx={{ mb: 2 }}>TouristCare does not automatically contact emergency services.</Alert><Typography variant="body2" className="muted">Choose an action. If you are in immediate danger, call emergency services directly.</Typography></DialogContent>
        <DialogActions className="emergency-dialog-actions"><Button onClick={() => setDialog(false)}>Cancel</Button>{location && <Button variant="outlined" startIcon={<ShareRounded />} onClick={shareLocation}>Share with a trusted contact</Button>}<Button variant="contained" color="error" startIcon={<CallRounded />} href="tel:112" onClick={() => setDialog(false)}>Call 112</Button></DialogActions>
      </Dialog>
    </AppShell>
  )
}

function Documents() {
  const [dialog, setDialog] = useState(false)
  const [docs, setDocs] = useState([])
  const docsRef = useRef(docs)
  const [details, setDetails] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [category, setCategory] = useState('Passport')
  const [preview, setPreview] = useState(null)
  useEffect(() => { docsRef.current = docs }, [docs])
  useEffect(() => () => docsRef.current.forEach(document => {
    if (document.url) URL.revokeObjectURL(document.url)
  }), [])
  const addDocument = () => {
    if (!selectedFile) return
    const url = URL.createObjectURL(selectedFile)
    setDocs(current => [...current, {
      name: selectedFile.name,
      category,
      date: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date()),
      type: selectedFile.type || 'File',
      size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
      file: selectedFile,
      url,
    }])
    setSelectedFile(null)
    setDialog(false)
  }
  const deleteDocument = document => {
    if (document.url) URL.revokeObjectURL(document.url)
    setDocs(current => current.filter(item => item !== document))
  }
  return (
    <AppShell>
      <PageHeader title="My documents" subtitle="Organise travel and case documents in one place." action={<Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialog(true)}>Upload document</Button>} />
      <Alert severity="info" icon={<LockRounded />} sx={{ mb: 3 }}>Selected files remain only in this browser session. They are not encrypted or uploaded, so do not treat this as secure document storage.</Alert>
      {docs.length ? <div className="document-cards">{docs.map(doc => <Card className="document-card" key={`${doc.name}-${doc.date}`}><CardContent><div className="document-card-title"><div className="file-icon"><DescriptionRounded /></div><div className="document-name"><strong>{doc.name}</strong><small>{doc.category} · Added {doc.date}</small></div><IconButton color="error" aria-label={`Delete ${doc.name}`} onClick={() => deleteDocument(doc)}><DeleteOutlineRounded /></IconButton></div><div className="document-card-meta"><Chip label={doc.type.split('/').pop()?.toUpperCase() || 'FILE'} size="small" /><span>{doc.size}</span></div><div className="document-card-actions"><Button size="small" startIcon={<VisibilityRounded />} onClick={() => setPreview(doc)}>Preview</Button><Button size="small" startIcon={<DownloadRounded />} component="a" href={doc.url} download={doc.name}>Download</Button></div></CardContent></Card>)}</div> : <Card><CardContent className="empty-state"><FolderRounded /><Typography variant="h6">No documents in this session</Typography><Typography className="muted">Choose files from your phone to preview and organise them temporarily.</Typography><Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialog(true)}>Choose a document</Button></CardContent></Card>}
      <Dialog open={dialog} onClose={() => setDialog(false)} fullWidth maxWidth="sm" className="document-dialog"><DialogTitle>Add a document</DialogTitle><DialogContent><Stack spacing={2} sx={{ mt: 1 }}><FormControl fullWidth><InputLabel>Category</InputLabel><Select label="Category" value={category} onChange={event => setCategory(event.target.value)}><MenuItem value="Passport">Passport</MenuItem><MenuItem value="Visa">Visa</MenuItem><MenuItem value="Travel insurance">Travel insurance</MenuItem><MenuItem value="Flight tickets">Flight tickets</MenuItem><MenuItem value="Accommodation bookings">Accommodation bookings</MenuItem><MenuItem value="Rental vehicle documents">Rental vehicle documents</MenuItem><MenuItem value="Police case documents">Police case documents</MenuItem><MenuItem value="Other travel documents">Other travel documents</MenuItem></Select></FormControl><Button className="file-picker-button" variant="outlined" component="label" startIcon={<UploadFileRounded />}>Choose from this device<input hidden type="file" accept=".pdf,image/*" onChange={event => setSelectedFile(event.target.files?.[0] || null)} /></Button>{selectedFile && <Typography variant="body2">{selectedFile.name} · {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Typography>}<Typography variant="caption" className="muted">Preview and download use a temporary browser URL. Closing the page clears this session's list.</Typography></Stack></DialogContent><DialogActions><Button onClick={() => { setDialog(false); setSelectedFile(null) }}>Cancel</Button><Button variant="contained" disabled={!selectedFile} onClick={addDocument}>Add to this session</Button></DialogActions></Dialog>
      <Dialog open={!!preview} onClose={() => setPreview(null)} fullWidth maxWidth="md" className="preview-dialog"><DialogTitle className="dialog-heading"><span>{preview?.name}</span><IconButton onClick={() => setPreview(null)}><CloseRounded /></IconButton></DialogTitle><DialogContent>{preview?.type.startsWith('image/') ? <img className="document-preview" src={preview.url} alt={preview.name} /> : preview?.type === 'application/pdf' ? <iframe className="document-pdf-preview" src={preview.url} title={preview.name} /> : <Alert severity="info">Preview is not available for this file type. Use Download to open it on your device.</Alert>}</DialogContent></Dialog>
    </AppShell>
  )
}

function ReportIncident() {
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
      await touristCareApi.submitIncident(incident)
      setError('The report service is not configured. Your information has not been submitted.')
    } catch (requestError) {
      setError(requestError.message || 'The report could not be submitted. Your information has not been sent.')
    } finally {
      setSaving(false)
    }
  }
  const stepLabels = ['Incident', 'When & where', 'Description', 'Evidence', 'Review']
  return (
    <AppShell>
      <PageHeader title="Report an incident" subtitle="Share only what you feel comfortable sharing." />
      <div className="report-progress"><span>STEP {step + 1} OF 5</span><strong>{stepLabels[step]}</strong><div><i style={{ width: `${((step + 1) / 5) * 100}%` }} /></div><div className="report-step-labels">{stepLabels.map((label, index) => <span className={index === step ? 'current' : index < step ? 'complete' : ''} key={label}>{label}</span>)}</div></div>
      <Card className="form-card"><CardContent className="report-card-content">
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
        {step === 0 && <section className="report-step"><Typography variant="h5">What happened?</Typography><Typography className="muted">Choose the closest category. You can share more later.</Typography><div className="category-grid">{categories.map(category => <button key={category} className={`category-option ${incident.category === category ? 'selected' : ''}`} onClick={() => { update('category', category); setError('') }}><span className="material-symbols-rounded">{category.includes('harassment') || category.includes('violence') ? 'support' : category.includes('documents') ? 'badge' : category.includes('scam') || category.includes('Fraud') ? 'payments' : category.includes('Theft') || category.includes('Robbery') ? 'report' : 'shield'}</span><strong>{category}</strong><span className="material-symbols-rounded">chevron_right</span></button>)}</div></section>}
        {step === 1 && <section className="report-step"><Typography variant="h5">When and where?</Typography><Typography className="muted">Approximate details are okay; leave anything blank if you are unsure.</Typography><TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={incident.date} onChange={event => update('date', event.target.value)} /><TextField fullWidth type="time" label="Approximate time" InputLabelProps={{ shrink: true }} value={incident.time} onChange={event => update('time', event.target.value)} /><TextField fullWidth label="Location" placeholder="Area, address or landmark" value={incident.location} onChange={event => update('location', event.target.value)} /></section>}
        {step === 2 && <section className="report-step"><Typography variant="h5">Tell us what happened</Typography><Typography className="muted">{sensitive ? 'Share only what feels okay. You do not need to include distressing details.' : 'A short description can help us understand what support you need.'}</Typography><TextField fullWidth multiline minRows={5} label="Description (optional)" placeholder="Use your own words. You can skip this." value={incident.description} onChange={event => update('description', event.target.value)} /></section>}
        {step === 3 && <section className="report-step"><Typography variant="h5">Add supporting documents</Typography><Typography className="muted">Evidence is optional. Do not upload anything you are uncomfortable sharing.</Typography><Button className="file-picker-button" variant="outlined" component="label" startIcon={<UploadFileRounded />}>Choose files from this device<input hidden type="file" multiple onChange={event => setFiles(Array.from(event.target.files || []))} /></Button>{files.length > 0 && <div className="selected-files">{files.map(file => <Chip key={`${file.name}-${file.size}`} label={file.name} onDelete={() => setFiles(current => current.filter(item => item !== file))} />)}</div>}<Alert severity="info">Attachments are not uploaded or stored until a secure backend is connected.</Alert></section>}
        {step === 4 && <section className="report-step"><Typography variant="h5">Review your choices</Typography><Typography className="muted">You control what you share and who can follow up.</Typography><div className="review-summary"><span>Category</span><strong>{incident.category || 'Not selected'}</strong><span>Date & time</span><strong>{incident.date || 'Not provided'} {incident.time}</strong><span>Location</span><strong>{incident.location || 'Not provided'}</strong><span>Description</span><strong>{incident.description ? 'Added' : 'Not provided'}</strong><span>Attachments</span><strong>{files.length ? `${files.length} selected` : 'None'}</strong></div><FormControl fullWidth><InputLabel>Preferred contact method</InputLabel><Select label="Preferred contact method" value={incident.contact} onChange={event => update('contact', event.target.value)}><MenuItem value="">No preference</MenuItem><MenuItem value="Email">Email</MenuItem><MenuItem value="Phone">Phone</MenuItem><MenuItem value="WhatsApp">WhatsApp</MenuItem></Select></FormControl><FormControlLabel control={<Checkbox checked={incident.reportedToPolice} onChange={event => update('reportedToPolice', event.target.checked)} />} label="I have reported this to SAPS" />{incident.reportedToPolice && <TextField fullWidth label="Police case number (optional)" value={incident.policeCase} onChange={event => update('policeCase', event.target.value)} />}{sensitive && <div className="sensitive-options"><Typography variant="subtitle1">What would help you now?</Typography><Typography variant="body2" className="muted">Both choices are optional. Your report is not shared with third parties.</Typography><FormControlLabel control={<Checkbox checked={incident.wantsSupport} onChange={event => update('wantsSupport', event.target.checked)} />} label="I would like support" /><FormControlLabel control={<Checkbox checked={incident.wantsPoliceInfo} onChange={event => update('wantsPoliceInfo', event.target.checked)} />} label="I would like information about reporting to SAPS" /></div>}<Alert severity="warning">Submitting a TouristCare report does not open an official SAPS case. Sensitive reports are not shared with hotels, employers or other third parties.</Alert></section>}
        <div className="form-actions"><Button disabled={step === 0 || saving} onClick={() => { setStep(step - 1); setError('') }}>Back</Button><Box sx={{ flex: 1 }} /><Button variant="text" onClick={() => { setDraft(true); setError('') }}>Save draft</Button>{step < 4 ? <Button variant="contained" onClick={() => { if (step === 0 && !incident.category) { setError('Choose an incident category to continue.'); return } setError(''); setStep(step + 1) }}>Continue</Button> : <Button variant="contained" disabled={saving} onClick={submit}>{saving ? 'Submitting…' : 'Submit report'}</Button>}</div>
      </CardContent></Card>
      <Snackbar open={draft} autoHideDuration={3000} message="Draft remains in this session only; it is not uploaded or saved to your account." onClose={() => setDraft(false)} />
    </AppShell>
  )
}

const cases = [
  { ref: 'TC-2026-10482', category: 'Theft', date: '18 Nov 2026', police: 'Not provided', status: 'Awaiting update', updated: '19 Nov 2026' },
]
function Cases() {
  const navigate = useNavigate()
  const [dialog, setDialog] = useState(false)
  return (
    <AppShell>
      <PageHeader title="My cases" subtitle="Track reports and follow-up activity." />
      <Alert severity="info" sx={{ mb: 2 }}>Example case data is shown for the interface preview. Connect your account to view real reports and updates.</Alert>
      {cases.length ? <div className="row g-3">{cases.map(item => <div className="col-12" key={item.ref}><Card className="case-card"><CardContent><div className="case-head"><div><Typography variant="subtitle1"><strong>{item.ref}</strong></Typography><Chip label={item.category} size="small" /></div><Chip label={item.status} color="warning" variant="outlined" /></div><div className="case-meta"><div><small>Date reported</small><strong>{item.date}</strong></div><div><small>Police case number</small><strong>{item.police}</strong></div><div><small>Last updated</small><strong>{item.updated}</strong></div></div><Divider sx={{ my: 2 }} /><div className="case-actions"><Button size="small" endIcon={<ArrowForwardRounded />} onClick={() => navigate('/cases/detail')}>View details</Button><Button size="small" startIcon={<AddCommentRounded />} onClick={() => setDialog(true)}>Add follow-up</Button></div></CardContent></Card></div>)}</div> : <Card><CardContent className="empty-state"><AssignmentRounded /><Typography variant="h6">No cases yet</Typography><Button variant="contained" onClick={() => navigate('/report')}>Report an incident</Button></CardContent></Card>}
      <Dialog open={dialog} onClose={() => setDialog(false)} fullWidth><DialogTitle>Add a follow-up note</DialogTitle><DialogContent><TextField fullWidth multiline rows={4} sx={{ mt: 1 }} label="Note" /><Button variant="outlined" component="label" startIcon={<UploadFileRounded />} sx={{ mt: 2 }}>Add document<input hidden type="file" /></Button></DialogContent><DialogActions><Button onClick={() => setDialog(false)}>Cancel</Button><Button variant="contained" onClick={() => setDialog(false)}>Save note</Button></DialogActions></Dialog>
    </AppShell>
  )
}

function CaseDetail() {
  const navigate = useNavigate()
  const timeline = [
    ['Incident reported to TouristCare', '18 Nov 2026', 'TouristCare'],
    ['Police case number not provided', '18 Nov 2026', 'Alex Morgan'],
    ['Support request submitted', '19 Nov 2026', 'Alex Morgan'],
  ]
  return <AppShell><Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/cases')} sx={{ mb: 2 }}>Back to cases</Button><PageHeader title="Case TC-2026-10482" subtitle="Theft · 18 November 2026" /><div className="row g-3"><div className="col-lg-8"><Card><CardContent><Typography variant="h6" className="mb-3">Case timeline</Typography><div className="timeline">{timeline.map(([title, date, source]) => <div className="timeline-item" key={title}><span /><div><strong>{title}</strong><Typography variant="body2" className="muted">{date} · Source: {source}</Typography></div></div>)}</div></CardContent></Card></div><div className="col-lg-4"><Card><CardContent><Typography variant="h6">Case information</Typography><dl className="details-list"><dt>Police case number</dt><dd>Not provided</dd><dt>Police station</dt><dd>Not provided</dd><dt>Support status</dt><dd>Request submitted</dd></dl><Button fullWidth variant="outlined" startIcon={<SupportAgentRounded />}>Request further assistance</Button></CardContent></Card></div></div></AppShell>
}

function Support() {
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
  return (
    <AppShell><PageHeader title="Get support" subtitle="Find the right kind of help for your situation." />
      <Grid container spacing={2}>{categories.map(({ icon: Icon, title, text }) => <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={title}><Card className="support-card" onClick={() => setSelected({ title, text })}><CardContent><div className="support-icon"><Icon /></div><Typography variant="subtitle1">{title}</Typography><Typography variant="body2" className="muted">{text}</Typography></CardContent></Card></Grid>)}</Grid>
      <Card className="mt-4"><CardContent><Typography variant="h6" className="mb-3">Support listing</Typography><div className="support-listing"><div className="support-logo"><SupportAgentRounded /></div><div><Typography variant="subtitle1"><strong>Participating victim-support provider</strong></Typography><Typography variant="body2" className="muted">Verified contact details should be configured by the organisation integration.</Typography><Chip label="Available support types: configuration required" size="small" /></div><Button variant="outlined" onClick={() => setSelected({ title: 'Support provider', text: 'This organisation is not yet connected. Contact details must come from a verified backend integration.' })}>View details</Button></div></CardContent></Card>
      <Dialog open={!!selected} onClose={() => setSelected(null)}><DialogTitle>{selected?.title}</DialogTitle><DialogContent><Typography className="muted">{selected?.text}</Typography></DialogContent><DialogActions><Button onClick={() => setSelected(null)}>Close</Button></DialogActions></Dialog>
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
  const [trusted, setTrusted] = useState([{ name: 'Emergency contact', phone: 'Not provided' }])
  const [dialog, setDialog] = useState(false)
  return <AppShell><PageHeader title="Settings" /><Grid container spacing={3}><Grid size={{ xs: 12, md: 7 }}><Card><CardContent><Typography variant="h6" className="mb-3">Personal profile</Typography><div className="row g-3"><div className="col-md-6"><TextField fullWidth label="Full name" defaultValue="Alex Morgan" /></div><div className="col-md-6"><TextField fullWidth label="Email" defaultValue="alex@example.com" /></div><div className="col-md-6"><TextField fullWidth label="Phone" placeholder="Optional" /></div><div className="col-md-6"><FormControl fullWidth><InputLabel>Preferred language</InputLabel><Select label="Preferred language" defaultValue="English"><MenuItem>English</MenuItem><MenuItem>Afrikaans</MenuItem><MenuItem>isiZulu</MenuItem></Select></FormControl></div></div></CardContent></Card><Card className="mt-3"><CardContent><Typography variant="h6" className="mb-3">Privacy and notifications</Typography><FormControlLabel control={<Switch defaultChecked />} label="Safety updates" /><br/><FormControlLabel control={<Switch defaultChecked />} label="Case activity notifications" /><br/><FormControlLabel control={<Switch />} label="Share location only during an active SOS request" /></CardContent></Card></Grid><Grid size={{ xs: 12, md: 5 }}><Card><CardContent><div className="card-heading"><Typography variant="h6">Trusted emergency contacts</Typography><IconButton onClick={() => setDialog(true)}><AddRounded /></IconButton></div>{trusted.map(contact => <div className="contact-row" key={contact.name}><Avatar><PersonRounded /></Avatar><div><strong>{contact.name}</strong><small>{contact.phone}</small></div></div>)}</CardContent></Card><Card className="mt-3"><CardContent><Typography variant="h6" className="mb-3">Account security</Typography><Button fullWidth variant="outlined" startIcon={<LockRounded />} sx={{ mb: 1 }}>Change password</Button><Button fullWidth color="error" variant="text" startIcon={<LogoutRounded />} onClick={() => window.location.assign('/login')}>Logout</Button></CardContent></Card></Grid></Grid><Dialog open={dialog} onClose={() => setDialog(false)}><DialogTitle>Add trusted contact</DialogTitle><DialogContent><Stack spacing={2} sx={{ mt: 1, minWidth: { xs: 250, sm: 380 } }}><TextField label="Name" /><TextField label="Phone number" /></Stack></DialogContent><DialogActions><Button onClick={() => setDialog(false)}>Cancel</Button><Button variant="contained" onClick={() => setDialog(false)}>Save contact</Button></DialogActions></Dialog></AppShell>
}

function StaffDashboard() {
  const navigate = useNavigate()
  return <AppShell staff><PageHeader title="Staff overview" subtitle="Restricted support operations workspace." /><Alert severity="info" sx={{ mb: 2 }}>Staff data is not connected. Counts and report details will appear here after authorised backend integration.</Alert><Grid container spacing={2} className="mb-3"><Grid size={{ xs: 12, sm: 4 }}><Card><CardContent><Typography variant="body2" className="muted">New reports</Typography><Typography variant="h4">—</Typography></CardContent></Card></Grid><Grid size={{ xs: 12, sm: 4 }}><Card><CardContent><Typography variant="body2" className="muted">Support requests</Typography><Typography variant="h4">—</Typography></CardContent></Card></Grid><Grid size={{ xs: 12, sm: 4 }}><Card><CardContent><Typography variant="body2" className="muted">Awaiting follow-up</Typography><Typography variant="h4">—</Typography></CardContent></Card></Grid></Grid><Card><CardContent><div className="card-heading"><Typography variant="h6">Recent reports</Typography><Button size="small" onClick={() => navigate('/staff/reports')}>View all</Button></div><div className="empty-state"><ReportProblemRounded /><Typography variant="body2" className="muted">No connected reports to display.</Typography></div></CardContent></Card></AppShell>
}

function StaffReports() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  return <AppShell staff><PageHeader title="Submitted reports" subtitle="Only authorised support staff can view report details." /><Card><CardContent><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} className="mb-3"><TextField size="small" placeholder="Search reference" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <SearchRounded sx={{ mr: 1, color: 'text.secondary' }} /> }} /><FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Status</InputLabel><Select label="Status" value={status} onChange={e => setStatus(e.target.value)}><MenuItem>All</MenuItem><MenuItem>New</MenuItem><MenuItem>Awaiting update</MenuItem><MenuItem>Closed</MenuItem></Select></FormControl><Button variant="outlined" startIcon={<FilterListRounded />}>More filters</Button></Stack><Alert severity="warning" sx={{ mb: 2 }}>Sensitive harassment and GBV reports require authorised restricted access.</Alert><div className="empty-state"><ReportProblemRounded /><Typography variant="body2" className="muted">No reports are available. Connect an authorised staff account.</Typography></div></CardContent></Card></AppShell>
}

function StaffSupport() {
  return <AppShell staff><PageHeader title="Support requests" subtitle="Requests are visible to authorised staff only." /><Card><CardContent><div className="empty-state"><SupportAgentRounded /><Typography variant="h6">No connected support requests</Typography><Typography variant="body2" className="muted">Requests will appear here after the staff API is configured.</Typography></div></CardContent></Card></AppShell>
}

function AccessCodeDialog({ open, onClose, initialScan = false }) {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const [scan, setScan] = useState(initialScan)
  const [code, setCode] = useState('')
  const [qrDetected, setQrDetected] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (open) setScan(initialScan)
  }, [open, initialScan])
  useEffect(() => {
    if (!open || !scan) return undefined
    let active = true
    setError('')
    import('@zxing/browser').then(({ BrowserQRCodeReader }) => {
      if (!active) return undefined
      const reader = new BrowserQRCodeReader()
      return reader.decodeFromVideoDevice(undefined, videoRef.current, (result, scanError, controls) => {
        controlsRef.current = controls
        if (result && active) {
          setCode(result.getText())
          setQrDetected(true)
          setScan(false)
          controls.stop()
        } else if (scanError && scanError.name === 'NotAllowedError') {
          setError('Camera access was blocked. Allow camera access in your browser settings, or enter your access code instead.')
        }
      })
    }).then(controls => {
      if (active && controls) controlsRef.current = controls
      else controls?.stop()
    }).catch(() => {
      if (active) setError('Camera is unavailable. Check your browser permission or enter your access code instead.')
    })
    return () => {
      active = false
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [open, scan])
  const close = () => { controlsRef.current?.stop(); setScan(false); setCode(''); setQrDetected(false); setError(''); onClose() }
  return <Dialog open={open} onClose={close} fullWidth maxWidth="xs" className="access-dialog"><DialogTitle className="dialog-heading"><span>{scan ? 'Scan your access QR' : 'Enter an access code'}</span><IconButton onClick={close} aria-label="Close"><CloseRounded /></IconButton></DialogTitle><DialogContent>
    {scan && <><div className="camera-frame"><video ref={videoRef} autoPlay muted playsInline /><div className="camera-frame-guide" /></div><Typography variant="body2" className="camera-hint">Allow camera access when your browser asks, then point it at the TouristCare QR code. If access is blocked, change your browser permissions or enter the code manually. The camera runs only while this scanner is open.</Typography>{error && <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>}</>}
    {qrDetected && <Alert severity="success" sx={{ mt: 2 }}>QR code detected. Check the code before continuing.</Alert>}
    {!scan && <TextField fullWidth autoFocus label="Access code" value={code} onChange={event => { setCode(event.target.value); setQrDetected(false) }} placeholder="Enter code from your host" sx={{ mt: 2 }} />}
    {!code && <Button fullWidth variant="text" onClick={() => setScan(value => !value)} sx={{ mt: 1 }}>{scan ? 'Enter code manually' : 'Scan a QR code instead'}</Button>}
    <Typography variant="caption" className="camera-hint d-block">Access-code verification will be available when the TouristCare service is connected.</Typography>
  </DialogContent><DialogActions><Button onClick={close}>Close</Button><Button variant="contained" disabled={!code} onClick={() => setError('Access-code verification is not configured yet.')}>Continue</Button></DialogActions></Dialog>
}

function Welcome() {
  const navigate = useNavigate()
  const [accessOpen, setAccessOpen] = useState(false)
  const [initialScan, setInitialScan] = useState(false)
  const openAccess = scan => { setInitialScan(scan); setAccessOpen(true) }
  return <main className="welcome-page">
    <header className="welcome-header"><button className="welcome-brand" aria-label="TouristCare home"><span className="brand-mark"><ShieldRounded /></span><span>TouristCare</span></button><button className="welcome-signin" onClick={() => navigate('/login')}>Sign in <ArrowForwardRounded /></button></header>
    <section className="welcome-hero">
      <div className="hero-photo"><img src="https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1400&q=85" alt="Table Mountain overlooking Cape Town" /><span className="photo-caption"><LocationOnRounded /> CAPE TOWN, SOUTH AFRICA</span></div>
      <div className="hero-copy"><span className="eyebrow">YOUR TRAVEL SAFETY COMPANION</span><h1>Explore Cape Town.<br /><em>Feel safer.</em></h1><p>Practical safety tools and caring support for every part of your journey.</p>
        <button className="qr-access-button" onClick={() => openAccess(true)}><span className="qr-icon"><QrCodeScannerRounded /></span><span><strong>Scan QR code</strong><small>Quick access from your hotel or host</small></span><KeyboardArrowRightRounded /></button>
        <button className="manual-access-button" onClick={() => openAccess(false)}>Enter an access code</button>
        <div className="welcome-divider"><span />OR SIGN IN<span /></div>
        <Button className="welcome-create" variant="contained" onClick={() => navigate('/register')}>Create an account</Button>
        <p className="welcome-small">Already registered? <button onClick={() => navigate('/login')}>Sign in</button></p>
      </div>
    </section>
    <footer className="welcome-footer"><ShieldRounded /> Safety beyond the incident</footer>
    <AccessCodeDialog open={accessOpen} initialScan={initialScan} onClose={() => setAccessOpen(false)} />
  </main>
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
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login register />} />
      <Route path="/recover" element={<Login recovery />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/emergency" element={<EmergencySOS />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/report" element={<ReportIncident />} />
      <Route path="/cases" element={<Cases />} />
      <Route path="/cases/detail" element={<CaseDetail />} />
      <Route path="/support" element={<Support />} />
      <Route path="/safety" element={<Safety />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/staff" element={<StaffDashboard />} />
      <Route path="/staff/reports" element={<StaffReports />} />
      <Route path="/staff/support" element={<StaffSupport />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter><App /></BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
