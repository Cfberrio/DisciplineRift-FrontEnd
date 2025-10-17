"use client"

import { BotIdClient } from 'botid/client'

export default function BotIdProtection() {
  return (
    <BotIdClient 
      protect={[
        { path: '/api/contact', method: 'POST' },
        { path: '/api/apply', method: 'POST' }
      ]} 
    />
  )
}

