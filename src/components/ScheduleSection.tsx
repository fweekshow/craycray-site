import React, { useState, useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

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

interface ScheduleSectionProps {
  user: User | null
  reminders: Reminder[]
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>
  authToken: string | null
  setAuthToken: React.Dispatch<React.SetStateAction<string | null>>
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  isConnected: boolean
  connectionStatus: string
  setConnectionStatus: React.Dispatch<React.SetStateAction<string>>
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  user,
  reminders,
  setReminders,
  authToken,
  setAuthToken,
  isAuthenticated,
  setIsAuthenticated,
  isConnected,
  connectionStatus,
  setConnectionStatus,
}) => {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check onboarding status
    const hasSeenOnboarding = localStorage.getItem('rocky-onboarding-seen')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }

    // Load reminders if authenticated
    if (isAuthenticated && user?.address) {
      loadReminders()
    }
  }, [isAuthenticated, user])

  const hideOnboarding = () => {
    setShowOnboarding(false)
    localStorage.setItem('rocky-onboarding-seen', 'true')
  }

  const authenticateUser = async () => {
    try {
      setConnectionStatus('Signing in...')
      
      if (sdk && sdk.quickAuth && sdk.quickAuth.getToken) {
        const { token } = await sdk.quickAuth.getToken()
        setAuthToken(token)
        
        // Verify token with backend
        const response = await sdk.quickAuth.fetch(`${window.location.origin}/api/auth`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        
        if (response.ok) {
          setIsAuthenticated(true)
          setConnectionStatus('Connected - Signed in')
          // Load reminders after authentication
          if (user?.address) {
            loadReminders()
          }
        } else {
          throw new Error('Authentication failed')
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error)
      setConnectionStatus('Authentication failed - try again')
    }
  }

  const loadReminders = async () => {
    if (!user?.address) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/reminders/${user.address}`)
      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      } else {
        // Load mock reminders for development
        loadMockReminders()
      }
    } catch (error) {
      console.error('Failed to load reminders:', error)
      loadMockReminders()
    } finally {
      setLoading(false)
    }
  }

  const loadMockReminders = () => {
    const mockReminders: Reminder[] = [
      {
        id: '1',
        title: 'Welcome to DevConnect!',
        description: 'Opening ceremony and keynote presentation',
        time: new Date(Date.now() + 3600000).toISOString(),
        sent: false,
      },
      {
        id: '2', 
        title: 'Blockchain Security Workshop',
        description: 'Learn about smart contract security best practices',
        time: new Date(Date.now() + 7200000).toISOString(),
        sent: false,
      },
    ]
    setReminders(mockReminders)
  }

  const shareSchedule = async () => {
    try {
      const shareText = reminders.length > 0 
        ? `🚀 DevConnect schedule is locked and loaded! ${reminders.length} sessions planned and Rocky Event Agent is keeping me organized. This is gonna be epic! #DevConnect #BaseChain #RockyAgent`
        : '🚀 DevConnect schedule is locked and loaded! Rocky Event Agent is keeping me organized. This is gonna be epic! #DevConnect #BaseChain #RockyAgent'

      const shareData = {
        text: shareText,
        embeds: ['https://www.craycray.xyz/']
      }

      if (sdk && sdk.actions && sdk.actions.composeCast) {
        try {
          await sdk.actions.composeCast(shareData)
          return
        } catch (sdkError) {
          console.error('SDK composeCast failed:', sdkError)
        }
      }
      
      if (navigator.share) {
        await navigator.share({
          title: 'My DevConnect Schedule',
          text: shareText,
          url: 'https://www.craycray.xyz/'
        })
      } else {
        await navigator.clipboard.writeText(`${shareText}\nhttps://www.craycray.xyz/`)
        alert('Schedule copied to clipboard!')
      }
    } catch (error) {
      console.error('Failed to share schedule:', error)
      alert('Unable to share schedule right now.')
    }
  }

  const formatTimeUntil = (targetTime: string) => {
    const now = new Date()
    const target = new Date(targetTime)
    const diffMs = target.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 24) {
      return `in ${Math.floor(diffHours / 24)}d`
    } else if (diffHours > 0) {
      return `in ${diffHours}h`
    } else if (diffMinutes > 0) {
      return `in ${diffMinutes}m`
    } else {
      return 'soon!'
    }
  }

  return (
    <section id="scheduleSection">
      {/* Onboarding */}
      {showOnboarding && (
        <section className="onboarding-section">
          <div className="onboarding-card">
            <div className="onboarding-header">
              <h2>Welcome to Rocky Event Schedule</h2>
              <p>Your personal event assistant for DevConnect</p>
            </div>
            <div className="onboarding-content">
              <div className="feature">
                <div className="feature-icon">🤖</div>
                <h3>Smart Agent Integration</h3>
                <p>Chat with Rocky Agent to set reminders for sessions you want to attend</p>
              </div>
              <div className="feature">
                <div className="feature-icon">📅</div>
                <h3>Personal Schedule</h3>
                <p>View all your DevConnect reminders in one organized place</p>
              </div>
              <div className="feature">
                <div className="feature-icon">📤</div>
                <h3>Share & Connect</h3>
                <p>Share your schedule with other attendees and build your network</p>
              </div>
            </div>
            <button className="onboarding-btn" onClick={hideOnboarding}>
              Get Started
            </button>
          </div>
        </section>
      )}

      {/* Connection Status */}
      <section className="connection-section">
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <span>{connectionStatus}</span>
        </div>
        {!isAuthenticated && (
          <div className="auth-section">
            <button className="signin-btn" onClick={authenticateUser}>
              Sign In to View Your Schedule
            </button>
          </div>
        )}
      </section>

      {/* User Profile */}
      {isAuthenticated && user && (
        <section className="profile-section">
          <div className="profile-card">
            <div className="profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt="User avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {user.username?.[0] || '👤'}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h2>{user.username || 'Anonymous User'}</h2>
              <p className="user-fid">FID: {user.fid}</p>
            </div>
          </div>
        </section>
      )}

      {/* Reminders/Schedule */}
      <section className="schedule-section">
        <div className="schedule-header">
          <h2>Your Event Reminders</h2>
          <div className="header-actions">
            <button className="share-btn" onClick={shareSchedule}>
              📤 Share Schedule
            </button>
            <button className="refresh-btn" onClick={loadReminders}>
              🔄 Refresh
            </button>
          </div>
        </div>
        
        <div className="reminders-container">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading your reminders...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No reminders yet</h3>
              <p>Interact with the Rocky agent to create your first reminder!</p>
            </div>
          ) : (
            <div className="reminders-list">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="reminder-item">
                  <div className="reminder-icon">⏰</div>
                  <div className="reminder-content">
                    <h3>{reminder.title}</h3>
                    <p>{reminder.description}</p>
                    <div className="reminder-meta">
                      <span className="reminder-time">{formatTimeUntil(reminder.time)}</span>
                      <span className="reminder-status">{reminder.sent ? 'Sent' : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </section>
  )
}

export default ScheduleSection
