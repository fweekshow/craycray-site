import { useState, useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import Header from './components/Header'
import PresentationSection from './components/PresentationSection'
import ScheduleSection from './components/ScheduleSection'
import Footer from './components/Footer'

type SectionType = 'presentation' | 'schedule'

interface User {
  address: string
  username?: string
  avatar?: string
  fid?: number
}

interface Reminder {
  id: string
  title: string
  description: string
  time: string
  sent: boolean
}

function App() {
  const [activeSection, setActiveSection] = useState<SectionType>('presentation')
  const [user, setUser] = useState<User | null>(null)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Connecting to Base...')

  // Initialize SDK following Base React pattern
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Call sdk.actions.ready() once when app is ready to be displayed
        // This is the key React pattern from Base docs
        await sdk.actions.ready()
        console.log('SDK ready')
        
        // Get user context after ready() is called
        const context = await sdk.context
        if (context?.user) {
          setUser({
            address: (context.user as any).address || (context.user as any).custodyAddress || '',
            username: (context.user as any).username,
            avatar: (context.user as any).profileImage?.url || (context.user as any).avatar,
            fid: (context.user as any).fid,
          })
          setIsConnected(true)
          setConnectionStatus('Connected - Sign in to view schedule')
        }
      } catch (error) {
        console.error('SDK initialization failed:', error)
        setIsConnected(false)
        setConnectionStatus('Development Mode')
      }
    }

    initializeSDK()
  }, [])

  const showSection = (section: SectionType) => {
    setActiveSection(section)
  }

  return (
    <div className="container">
      <Header 
        activeSection={activeSection} 
        onSectionChange={showSection}
        subtitle={activeSection === 'presentation' 
          ? 'Presenting Rocky - Event Agents Framework' 
          : 'Rocky Event Agents - Personal Schedule'
        }
      />
      
      {activeSection === 'presentation' && <PresentationSection />}
      
      {activeSection === 'schedule' && (
        <ScheduleSection
          user={user}
          reminders={reminders}
          setReminders={setReminders}
          authToken={authToken}
          setAuthToken={setAuthToken}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          isConnected={isConnected}
          connectionStatus={connectionStatus}
          setConnectionStatus={setConnectionStatus}
        />
      )}
      
      <Footer />
    </div>
  )
}

export default App
