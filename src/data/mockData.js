export const DEMO_SCHEMA_VERSION = 1

export function createInitialDemoData(visitorRef) {
  const sampleCase = {
    ref: 'TC-2026-10482',
    category: 'Theft',
    incidentDate: '2026-11-18',
    reportedAt: '2026-11-18T10:00:00.000Z',
    updatedAt: '2026-11-19T09:30:00.000Z',
    status: 'Awaiting update',
    demoSample: true,
    timeline: [
      { id: 'sample-event-1', title: 'Demo report received', at: '2026-11-18T10:00:00.000Z', actor: 'TouristCare demo' },
      { id: 'sample-event-2', title: 'Support follow-up noted', at: '2026-11-19T09:30:00.000Z', actor: 'TouristCare demo' },
    ],
    followUps: [],
  }

  return {
    schemaVersion: DEMO_SCHEMA_VERSION,
    visitor: {
      reference: visitorRef,
      createdAt: new Date().toISOString(),
    },
    incidents: [
      {
        reference: sampleCase.ref,
        category: sampleCase.category,
        incidentDate: sampleCase.incidentDate,
        reportedAt: sampleCase.reportedAt,
        status: sampleCase.status,
        demoSample: true,
      },
    ],
    cases: [sampleCase],
    documents: [
      {
        id: 'sample-document-1',
        name: 'Sample travel note.txt',
        category: 'Travel information',
        type: 'text/plain',
        size: '1 KB',
        addedAt: '2026-11-17T09:00:00.000Z',
        demoSample: true,
        temporaryFile: false,
      },
    ],
    supportRequests: [
      {
        id: 'sample-support-1',
        category: 'Tourism support',
        status: 'In review',
        createdAt: '2026-11-19T11:00:00.000Z',
        updatedAt: '2026-11-19T11:00:00.000Z',
        demoSample: true,
      },
    ],
    notifications: [
      {
        id: 'sample-notification-1',
        title: 'Welcome to the TouristCare demo',
        message: 'Your sample visitor session is stored in this browser only.',
        createdAt: '2026-11-19T11:00:00.000Z',
        read: false,
        demoSample: true,
      },
    ],
    staffActivity: [
      {
        id: 'sample-activity-1',
        title: 'Sample report added to demo queue',
        reference: sampleCase.ref,
        createdAt: '2026-11-18T10:00:00.000Z',
        demoSample: true,
      },
    ],
  }
}
