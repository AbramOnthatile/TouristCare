import { createInitialDemoData, DEMO_SCHEMA_VERSION } from '../data/mockData.js'

const DATA_KEY = 'touristcare.demo.data.v1'
const VISITOR_KEY = 'touristcare.demo.visitor.v1'

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('Browser storage is not available. TouristCare demo data could not be loaded.')
  }
  return window.localStorage
}

function createVisitorReference() {
  const year = new Date().getFullYear()
  const suffix = Math.floor(100000 + Math.random() * 900000)
  return `TCV-${year}-${suffix}`
}

export function getVisitorReference() {
  const storage = getStorage()
  const existing = storage.getItem(VISITOR_KEY)
  if (existing) return existing
  const reference = createVisitorReference()
  storage.setItem(VISITOR_KEY, reference)
  return reference
}

function parseData(raw) {
  let data
  try {
    data = JSON.parse(raw)
  } catch (error) {
    throw new Error(`Saved TouristCare demo data is invalid and could not be read: ${error.message}`)
  }
  const collections = ['incidents', 'cases', 'documents', 'supportRequests', 'notifications', 'staffActivity']
  if (!data || data.schemaVersion !== DEMO_SCHEMA_VERSION || typeof data.visitor?.reference !== 'string' || collections.some(key => !Array.isArray(data[key]))) {
    throw new Error('Saved TouristCare demo data has an unsupported format. Use Reset Demo Data to restore the sample records.')
  }
  return data
}

export function readDemoData() {
  const storage = getStorage()
  const raw = storage.getItem(DATA_KEY)
  if (raw !== null) return parseData(raw)
  const initialData = createInitialDemoData(getVisitorReference())
  writeDemoData(initialData)
  return initialData
}

export function writeDemoData(data) {
  if (!data || data.schemaVersion !== DEMO_SCHEMA_VERSION) {
    throw new Error('TouristCare refused to save demo data with an unsupported format.')
  }
  getStorage().setItem(DATA_KEY, JSON.stringify(data))
  return data
}

export function resetDemoData() {
  const storage = getStorage()
  storage.removeItem(DATA_KEY)
  return readDemoData()
}

export function cloneDemoData(data) {
  return JSON.parse(JSON.stringify(data))
}
