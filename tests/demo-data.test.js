import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { mockApi } from '../src/services/mockApi.js'
import { getTemporaryFile, clearTemporaryFiles, storeTemporaryFile } from '../src/services/sessionFileStore.js'
import { readDemoData, writeDemoData } from '../src/services/storageService.js'

class MemoryStorage {
  constructor() {
    this.values = new Map()
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null
  }

  setItem(key, value) {
    this.values.set(key, String(value))
  }

  removeItem(key) {
    this.values.delete(key)
  }
}

beforeEach(() => {
  globalThis.window = { localStorage: new MemoryStorage() }
  clearTemporaryFiles()
})

afterEach(() => {
  delete globalThis.window
})

test('visitor reference and sample records persist across reloads', () => {
  const first = readDemoData()
  const savedReference = first.visitor.reference
  first.cases[0].status = 'In review'
  writeDemoData(first)

  const reloaded = readDemoData()
  assert.equal(reloaded.visitor.reference, savedReference)
  assert.equal(reloaded.cases[0].status, 'In review')
  assert.equal(reloaded.documents[0].demoSample, true)
})

test('submitting a report persists safe fields and adds a case, staff activity, and notification', async () => {
  const result = await mockApi.submitIncident({
    category: 'Gender-based violence',
    date: '2026-11-20',
    location: 'private address must not persist',
    description: 'private description must not persist',
    contact: 'private phone must not persist',
    policeCase: 'private police reference must not persist',
    campaignSource: 'airport-kiosk',
  })

  const saved = readDemoData()
  const record = saved.cases.find(item => item.ref === result.reference)
  assert.ok(record)
  assert.equal(record.status, 'New')
  assert.equal(saved.incidents[0].campaignSource, 'airport-kiosk')
  assert.equal(saved.staffActivity[0].reference, result.reference)
  assert.equal(saved.notifications[0].title, 'Demo report created')
  const serialized = JSON.stringify(saved)
  assert.equal(serialized.includes('private address'), false)
  assert.equal(serialized.includes('private description'), false)
  assert.equal(serialized.includes('private phone'), false)
  assert.equal(serialized.includes('private police reference'), false)
  assert.equal((await mockApi.getStaffReports()).find(item => item.ref === result.reference).category, 'Sensitive report')
})

test('case notes, status updates, support requests, and document metadata persist locally', async () => {
  const submitted = await mockApi.submitIncident({ category: 'Theft' })
  await mockApi.addFollowUp(submitted.reference, 'Demo follow-up note')
  await mockApi.updateCaseStatus(submitted.reference, 'In review')
  const request = await mockApi.createSupportRequest('Counselling support')
  await mockApi.updateSupportRequestStatus(request.id, 'Completed')
  await mockApi.addDocumentMetadata({ category: 'Travel information', type: 'application/pdf', size: 1024, filename: 'private-passport.pdf' })

  const saved = readDemoData()
  const record = saved.cases.find(item => item.ref === submitted.reference)
  assert.equal(record.status, 'In review')
  assert.equal(record.followUps[0].note, 'Demo follow-up note')
  assert.ok(record.timeline.some(event => event.title === 'Demo follow-up note'))
  assert.equal(saved.supportRequests.find(item => item.id === request.id).status, 'Completed')
  assert.equal(saved.documents[0].name, 'Uploaded demo pdf')
  assert.equal(JSON.stringify(saved).includes('private-passport.pdf'), false)
})

test('reset restores sample records, clears changes, and keeps the visitor reference', async () => {
  const reference = readDemoData().visitor.reference
  await mockApi.submitIncident({ category: 'Theft' })
  await mockApi.createSupportRequest('Medical assistance')
  storeTemporaryFile('temporary-demo-file', { name: 'not persisted' })

  const reset = await mockApi.resetDemoData()
  assert.equal(reset.visitor.reference, reference)
  assert.deepEqual(reset.cases.map(item => item.ref), ['TC-2026-10482'])
  assert.deepEqual(reset.supportRequests.map(item => item.id), ['sample-support-1'])
  assert.equal(reset.notifications.length, 1)
  assert.equal(getTemporaryFile('temporary-demo-file'), null)
})

test('corrupt local demo data is reported instead of silently overwritten', () => {
  window.localStorage.setItem('touristcare.demo.data.v1', '{broken')
  assert.throws(() => readDemoData(), /could not be read/)
})
