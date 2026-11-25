import { readDemoData, writeDemoData, resetDemoData, cloneDemoData } from './storageService.js'
import { clearTemporaryFiles, removeTemporaryFile } from './sessionFileStore.js'

const SIMULATED_DELAY_MS = 120
const CASE_STATUSES = ['New', 'In review', 'Awaiting update', 'Support in progress', 'Closed']
const SUPPORT_STATUSES = ['New', 'In review', 'Contact information needed', 'Completed']

function pause() {
  return new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY_MS))
}

function now() {
  return new Date().toISOString()
}

function formatReference(prefix, usedReferences) {
  const year = new Date().getFullYear()
  let reference
  do {
    reference = `${prefix}-${year}-${Math.floor(10000 + Math.random() * 90000)}`
  } while (usedReferences.has(reference))
  return reference
}

function addActivity(data, title, reference) {
  data.staffActivity.unshift({
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    reference,
    createdAt: now(),
    demoSample: false,
  })
}

function addNotification(data, title, message) {
  data.notifications.unshift({
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    message,
    createdAt: now(),
    read: false,
    demoSample: false,
  })
}

function updateCase(data, reference, update) {
  const index = data.cases.findIndex(item => item.ref === reference)
  if (index < 0) throw new Error(`Demo case ${reference} was not found in this browser.`)
  update(data.cases[index])
  const incident = data.incidents.find(item => item.reference === reference)
  if (incident) incident.status = data.cases[index].status
  return data.cases[index]
}

export const mockApi = {
  async getSnapshot() {
    await pause()
    return cloneDemoData(readDemoData())
  },

  async getVisitorSession() {
    await pause()
    return cloneDemoData(readDemoData().visitor)
  },

  async submitIncident(input) {
    await pause()
    if (!input || typeof input.category !== 'string' || !input.category.trim()) {
      throw new Error('Choose an incident category before submitting the demo report.')
    }

    const data = readDemoData()
    const reference = formatReference('TC', new Set(data.cases.map(item => item.ref)))
    const timestamp = now()
    const incidentDate = typeof input.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.date) ? input.date : timestamp.slice(0, 10)
    const campaignSource = typeof input.campaignSource === 'string' && /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(input.campaignSource)
      ? input.campaignSource
      : null
    const incident = {
      reference,
      category: input.category.trim().slice(0, 80),
      incidentDate,
      reportedAt: timestamp,
      status: 'New',
      campaignSource,
      demoSample: false,
    }
    const record = {
      ...incident,
      ref: reference,
      updatedAt: timestamp,
      timeline: [{ id: `${reference}-event-1`, title: 'Demo report received on this device', at: timestamp, actor: 'Visitor demo' }],
      followUps: [],
    }

    data.incidents.unshift(incident)
    data.cases.unshift(record)
    addActivity(data, 'New demo report received', reference)
    addNotification(data, 'Demo report created', `Your local demo report reference is ${reference}. It was not sent to a service.`)
    writeDemoData(data)
    return { reference, status: record.status }
  },

  async getCases() {
    await pause()
    return cloneDemoData(readDemoData().cases)
  },

  async getCase(reference) {
    await pause()
    const record = readDemoData().cases.find(item => item.ref === reference)
    return record ? cloneDemoData(record) : null
  },

  async addFollowUp(reference, note) {
    await pause()
    const cleanNote = typeof note === 'string' ? note.trim().slice(0, 500) : ''
    if (!cleanNote) throw new Error('Enter a demo follow-up note before saving.')
    const data = readDemoData()
    const timestamp = now()
    const record = updateCase(data, reference, item => {
      const event = {
        id: `${reference}-event-${Date.now()}`,
        title: cleanNote,
        at: timestamp,
        actor: 'Visitor demo',
      }
      item.timeline.unshift(event)
      item.followUps.unshift({ id: event.id, note: cleanNote, createdAt: timestamp })
      item.updatedAt = timestamp
    })
    addActivity(data, 'Demo case follow-up added', reference)
    addNotification(data, 'Follow-up saved', `A local demo note was added to ${reference}.`)
    writeDemoData(data)
    return cloneDemoData(record)
  },

  async updateCaseStatus(reference, status, note = '') {
    await pause()
    if (!CASE_STATUSES.includes(status)) throw new Error(`Unsupported demo case status: ${status}`)
    const data = readDemoData()
    const timestamp = now()
    const record = updateCase(data, reference, item => {
      item.status = status
      item.updatedAt = timestamp
      item.timeline.unshift({
        id: `${reference}-event-${Date.now()}`,
        title: note.trim() || `Demo status changed to ${status}`,
        at: timestamp,
        actor: 'Staff demo',
      })
    })
    addActivity(data, `Demo case status updated: ${status}`, reference)
    addNotification(data, 'Case status updated', `${reference} is now marked ${status} in this browser demo.`)
    writeDemoData(data)
    return cloneDemoData(record)
  },

  async getStaffReports() {
    await pause()
    return cloneDemoData(readDemoData().cases
      .map(({ ref, category, reportedAt, updatedAt, status, demoSample }) => ({
        ref,
        category: ['Sexual harassment', 'Gender-based violence'].includes(category) ? 'Sensitive report' : category,
        reportedAt,
        updatedAt,
        status,
        demoSample,
      }))
      .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt)))
  },

  async getStaffActivity() {
    await pause()
    return cloneDemoData(readDemoData().staffActivity)
  },

  async getNotifications() {
    await pause()
    return cloneDemoData(readDemoData().notifications)
  },

  async createSupportRequest(category) {
    await pause()
    if (typeof category !== 'string' || !category.trim()) throw new Error('Choose a support topic for the demo request.')
    const data = readDemoData()
    const timestamp = now()
    const request = {
      id: formatReference('TS', new Set(data.supportRequests.map(item => item.id))),
      category: category.trim().slice(0, 80),
      status: 'New',
      createdAt: timestamp,
      updatedAt: timestamp,
      demoSample: false,
    }
    data.supportRequests.unshift(request)
    addActivity(data, 'New demo support request received', request.id)
    addNotification(data, 'Demo support request saved', 'The request is stored on this device only and was not sent to a provider.')
    writeDemoData(data)
    return cloneDemoData(request)
  },

  async getSupportRequests() {
    await pause()
    return cloneDemoData(readDemoData().supportRequests)
  },

  async updateSupportRequestStatus(id, status) {
    await pause()
    if (!SUPPORT_STATUSES.includes(status)) throw new Error(`Unsupported demo support status: ${status}`)
    const data = readDemoData()
    const request = data.supportRequests.find(item => item.id === id)
    if (!request) throw new Error(`Demo support request ${id} was not found in this browser.`)
    request.status = status
    request.updatedAt = now()
    addActivity(data, `Demo support request updated: ${status}`, id)
    addNotification(data, 'Support request updated', `Your local demo request is marked ${status}.`)
    writeDemoData(data)
    return cloneDemoData(request)
  },

  async addDocumentMetadata(input) {
    await pause()
    if (!input || typeof input.category !== 'string' || !input.category.trim() || typeof input.type !== 'string') {
      throw new Error('Choose a document category and a supported file before saving demo metadata.')
    }
    const data = readDemoData()
    const extension = input.type === 'application/pdf'
      ? 'pdf'
      : input.type === 'text/plain'
        ? 'txt'
        : input.type.startsWith('image/')
          ? input.type.split('/')[1].replace('jpeg', 'jpg')
          : 'file'
    const document = {
      id: `document-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: `Uploaded demo ${extension}`,
      category: input.category.trim().slice(0, 80),
      type: input.type.slice(0, 100),
      size: Number.isFinite(input.size) && input.size >= 0 ? `${(input.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size',
      addedAt: now(),
      demoSample: false,
      temporaryFile: true,
    }
    data.documents.unshift(document)
    writeDemoData(data)
    return cloneDemoData(document)
  },

  async deleteDocument(id) {
    await pause()
    const data = readDemoData()
    const before = data.documents.length
    data.documents = data.documents.filter(item => item.id !== id)
    if (data.documents.length === before) throw new Error('That demo document was not found in this browser.')
    writeDemoData(data)
    removeTemporaryFile(id)
    return true
  },

  async getDemoLocation() {
    await pause()
    return { latitude: -33.9249, longitude: 18.4241, accuracy: 25, simulated: true }
  },

  async simulateLocationShare() {
    await pause()
    const data = readDemoData()
    addNotification(data, 'Demo location share', 'A simulated location share was not sent to a contact.')
    addActivity(data, 'Visitor tested demo location sharing', 'Location demo')
    writeDemoData(data)
    return { shared: false, simulated: true }
  },

  async markNotificationsRead() {
    await pause()
    const data = readDemoData()
    data.notifications = data.notifications.map(item => ({ ...item, read: true }))
    writeDemoData(data)
    return true
  },

  async resetDemoData() {
    await pause()
    const data = resetDemoData()
    clearTemporaryFiles()
    return cloneDemoData(data)
  },
}
