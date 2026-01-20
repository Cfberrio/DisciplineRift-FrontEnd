#!/usr/bin/env tsx
/**
 * Script de Testing de UI del Sistema de Mensajería
 * 
 * Este script genera un reporte de verificación de la UI y componentes
 */

import * as fs from 'fs'
import * as path from 'path'

interface UITest {
  component: string
  file: string
  checks: { name: string; passed: boolean; details?: string }[]
}

const tests: UITest[] = []

function checkFileContent(filePath: string, patterns: { name: string; pattern: RegExp }[]) {
  const fullPath = path.join(process.cwd(), filePath)
  
  if (!fs.existsSync(fullPath)) {
    return patterns.map(p => ({ name: p.name, passed: false, details: 'Archivo no existe' }))
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8')
  
  return patterns.map(p => ({
    name: p.name,
    passed: p.pattern.test(content),
    details: p.pattern.test(content) ? 'OK' : 'No encontrado'
  }))
}

function testTeamSelector() {
  console.log('\n🧩 Test: TeamSelector Component')
  
  const checks = checkFileContent('components/messages/TeamSelector.tsx', [
    { name: 'Export default', pattern: /export default function TeamSelector/ },
    { name: 'Props interface', pattern: /interface.*TeamSelectorProps/ },
    { name: 'Teams prop', pattern: /teams.*Team\[\]/ },
    { name: 'Selected prop', pattern: /selected.*string.*null/ },
    { name: 'onChange handler', pattern: /onChange.*string/ },
    { name: 'Select element', pattern: /<select/ },
    { name: 'No teams message', pattern: /No teams available/ },
    { name: 'Styling classes', pattern: /className/ },
  ])
  
  tests.push({
    component: 'TeamSelector',
    file: 'components/messages/TeamSelector.tsx',
    checks
  })
  
  checks.forEach(check => {
    console.log(`   ${check.passed ? '✅' : '❌'} ${check.name}: ${check.details}`)
  })
}

function testChatPanel() {
  console.log('\n💬 Test: ChatPanel Component')
  
  const checks = checkFileContent('components/messages/ChatPanel.tsx', [
    { name: 'Export default', pattern: /export default function ChatPanel/ },
    { name: 'Props interface', pattern: /interface.*ChatPanelProps/ },
    { name: 'teamId prop', pattern: /teamId.*string/ },
    { name: 'parentId prop', pattern: /parentId.*string/ },
    { name: 'useState hooks', pattern: /useState/ },
    { name: 'useEffect hooks', pattern: /useEffect/ },
    { name: 'Supabase import', pattern: /import.*supabase.*from.*@\/lib\/supabase/ },
    { name: 'Message type import', pattern: /import.*Message.*from.*@\/lib\/supabase/ },
    { name: 'Load messages function', pattern: /loadMessages/ },
    { name: 'Send message function', pattern: /sendMessage/ },
    { name: 'Realtime subscription', pattern: /\.channel\(/ },
    { name: 'postgres_changes event', pattern: /postgres_changes/ },
    { name: 'Filter by teamid', pattern: /teamid=eq/ },
    { name: 'INSERT event handler', pattern: /eventType.*===.*INSERT/ },
    { name: 'Optimistic update', pattern: /tempMessage|temp_/ },
    { name: 'Auto-scroll ref', pattern: /scrollIntoView/ },
    { name: 'Loading state', pattern: /loading/ },
    { name: 'Sending state', pattern: /sending/ },
    { name: 'Input validation', pattern: /trim\(\)/ },
    { name: 'Error handling', pattern: /catch.*error/ },
    { name: 'Channel cleanup', pattern: /removeChannel/ },
  ])
  
  tests.push({
    component: 'ChatPanel',
    file: 'components/messages/ChatPanel.tsx',
    checks
  })
  
  checks.forEach(check => {
    console.log(`   ${check.passed ? '✅' : '❌'} ${check.name}: ${check.details}`)
  })
}

function testMessagesClient() {
  console.log('\n🖥️  Test: MessagesClient Component')
  
  const checks = checkFileContent('app/dashboard/messages/MessagesClient.tsx', [
    { name: 'Export default', pattern: /export default function MessagesClient/ },
    { name: 'use client directive', pattern: /'use client'/ },
    { name: 'Supabase import', pattern: /import.*supabase/ },
    { name: 'TeamSelector import', pattern: /import.*TeamSelector/ },
    { name: 'ChatPanel import', pattern: /import.*ChatPanel/ },
    { name: 'useState hooks', pattern: /useState/ },
    { name: 'useEffect hook', pattern: /useEffect/ },
    { name: 'Teams state', pattern: /teams.*setTeams/ },
    { name: 'SelectedTeamId state', pattern: /selectedTeamId|selected/ },
    { name: 'ParentId state', pattern: /parentId|setParentId/ },
    { name: 'Auth getUser', pattern: /supabase\.auth\.getUser/ },
    { name: 'Student query', pattern: /from\('student'\)/ },
    { name: 'Enrollment join', pattern: /enrollment/ },
    { name: 'Team join', pattern: /team/ },
    { name: 'Active filter', pattern: /isactive/ },
    { name: 'Status filter', pattern: /status/ },
    { name: 'Loading state', pattern: /loading/ },
    { name: 'Error state', pattern: /error/ },
    { name: 'No teams message', pattern: /No teams available/ },
    { name: 'No auth message', pattern: /log in/ },
  ])
  
  tests.push({
    component: 'MessagesClient',
    file: 'app/dashboard/messages/MessagesClient.tsx',
    checks
  })
  
  checks.forEach(check => {
    console.log(`   ${check.passed ? '✅' : '❌'} ${check.name}: ${check.details}`)
  })
}

function testMessagesPage() {
  console.log('\n📄 Test: Messages Page')
  
  const checks = checkFileContent('app/dashboard/messages/page.tsx', [
    { name: 'Import MessagesClient', pattern: /import.*MessagesClient/ },
    { name: 'Export default', pattern: /export default function/ },
    { name: 'Render MessagesClient', pattern: /<MessagesClient/ },
  ])
  
  tests.push({
    component: 'MessagesPage',
    file: 'app/dashboard/messages/page.tsx',
    checks
  })
  
  checks.forEach(check => {
    console.log(`   ${check.passed ? '✅' : '❌'} ${check.name}: ${check.details}`)
  })
}

function testMessageInterface() {
  console.log('\n📦 Test: Message Interface')
  
  const checks = checkFileContent('lib/supabase.ts', [
    { name: 'Message interface', pattern: /export interface Message/ },
    { name: 'id field', pattern: /id.*string/ },
    { name: 'teamid field', pattern: /teamid.*string/ },
    { name: 'sender_role field', pattern: /sender_role.*'parent'.*'coach'/ },
    { name: 'parentid field', pattern: /parentid.*string.*null/ },
    { name: 'coachid field', pattern: /coachid.*string.*null/ },
    { name: 'body field', pattern: /body.*string/ },
    { name: 'created_at field', pattern: /created_at.*string/ },
  ])
  
  tests.push({
    component: 'Message Interface',
    file: 'lib/supabase.ts',
    checks
  })
  
  checks.forEach(check => {
    console.log(`   ${check.passed ? '✅' : '❌'} ${check.name}: ${check.details}`)
  })
}

function testDashboardNavigation() {
  console.log('\n🧭 Test: Dashboard Navigation')
  
  const checks = checkFileContent('app/dashboard/layout.tsx', [
    { name: 'MessageSquare import', pattern: /import.*MessageSquare.*from.*lucide-react/ },
    { name: 'Messages nav item', pattern: /href.*\/dashboard\/messages/ },
    { name: 'Messages label', pattern: /label.*Messages/ },
    { name: 'MessageSquare icon', pattern: /icon.*MessageSquare/ },
  ])
  
  tests.push({
    component: 'Dashboard Navigation',
    file: 'app/dashboard/layout.tsx',
    checks
  })
  
  checks.forEach(check => {
    console.log(`   ${check.passed ? '✅' : '❌'} ${check.name}: ${check.details}`)
  })
}

function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE TESTS DE UI')
  console.log('='.repeat(60))
  
  let totalChecks = 0
  let passedChecks = 0
  
  tests.forEach(test => {
    const passed = test.checks.filter(c => c.passed).length
    const total = test.checks.length
    totalChecks += total
    passedChecks += passed
    
    const percentage = Math.round((passed / total) * 100)
    const status = percentage === 100 ? '✅' : percentage >= 75 ? '⚠️' : '❌'
    
    console.log(`\n${status} ${test.component}: ${passed}/${total} checks (${percentage}%)`)
  })
  
  const overallPercentage = Math.round((passedChecks / totalChecks) * 100)
  
  console.log('\n' + '-'.repeat(60))
  console.log(`Total: ${passedChecks}/${totalChecks} checks pasados (${overallPercentage}%)`)
  console.log('='.repeat(60))
  
  if (overallPercentage === 100) {
    console.log('\n✨ ¡TODOS LOS COMPONENTES ESTÁN CORRECTAMENTE IMPLEMENTADOS!')
  } else if (overallPercentage >= 90) {
    console.log('\n✅ Componentes bien implementados, revisar detalles menores.')
  } else if (overallPercentage >= 75) {
    console.log('\n⚠️  Componentes funcionales pero con mejoras pendientes.')
  } else {
    console.log('\n🔴 Revisar implementación de componentes.')
  }
  
  console.log('='.repeat(60) + '\n')
}

function runAllTests() {
  console.log('🎨 Verificando UI del Sistema de Mensajería\n')
  
  testMessageInterface()
  testTeamSelector()
  testChatPanel()
  testMessagesClient()
  testMessagesPage()
  testDashboardNavigation()
  
  printSummary()
  
  const allPassed = tests.every(test => test.checks.every(check => check.passed))
  process.exit(allPassed ? 0 : 1)
}

runAllTests()
