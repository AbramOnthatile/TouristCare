import React from 'react'
import { Chip, Tooltip } from '@mui/material'
import { useDemoData } from '../hooks/useDemoData'

export default function DemoModeBadge({ staff = false }) {
  const { data } = useDemoData()
  const reference = data?.visitor?.reference || 'session loading'
  return (
    <Tooltip title={`Browser-local demonstration data · visitor ${reference}. Not shared across devices.`}>
      <Chip
        className="demo-mode-badge"
        size="small"
        label={staff ? 'STAFF DEMO' : 'LOCAL DEMO'}
        aria-label={`${staff ? 'Staff' : 'Visitor'} demo mode, visitor reference ${reference}`}
      />
    </Tooltip>
  )
}
