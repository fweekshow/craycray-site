import { useState, useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import Header from './components/Header'
import PresentationSection from './components/PresentationSection'
import ScheduleSection from './components/ScheduleSection'
import ScheduleViewSection from './components/ScheduleViewSection'
import Footer from './components/Footer'

type SectionType = 'presentation' | 'schedule' | 'schedule-view'

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

interface DevConnectEvent {
  id: number
  rkey: string
  created_by: string
  record_passed_review: {
    $type: string
    title: string
    start_utc: string
    end_utc: string
    location: {
      name: string
      address: string
    }
    organizer: {
      name: string
      contact: string
    }
    description: string
    event_type: string
    expertise: string
    requires_ticket: boolean
    sold_out: boolean
    main_url?: string
    tickets_url?: string
  }
  is_core_event: boolean
  updated_at: string
}

function App() {
  const [activeSection, setActiveSection] = useState<SectionType>('schedule-view')
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

  const handleAddToSchedule = (event: DevConnectEvent) => {
    // Create a reminder from the DevConnect event
    const newReminder: Reminder = {
      id: `devconnect-${event.id}`,
      title: event.record_passed_review.title,
      description: `DevConnect Event: ${event.record_passed_review.description.slice(0, 100)}...`,
      time: event.record_passed_review.start_utc,
      sent: false
    }
    
    // Add to reminders (in a real app, this would send to your backend)
    setReminders(prev => [...prev, newReminder])
    console.log('Added event to schedule:', event.record_passed_review.title)
  }

  return (
    <div className="container">
      <Header 
        activeSection={activeSection} 
        onSectionChange={showSection}
        subtitle={
          activeSection === 'presentation' 
            ? 'About Rocky - Event Agents Framework' 
            : activeSection === 'schedule-view'
            ? 'Full Schedule - All DevConnect Events'
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

      {activeSection === 'schedule-view' && (
        <ScheduleViewSection
          user={user}
          onAddToSchedule={handleAddToSchedule}
        />
      )}
      
      <Footer />
    </div>
  )
}

export default App
