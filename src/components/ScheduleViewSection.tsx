import React, { useState, useEffect } from 'react'

interface User {
  address: string
  username?: string
  avatar?: string
  fid?: number
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

interface ScheduleViewSectionProps {
  user: User | null
  onAddToSchedule?: (event: DevConnectEvent) => void
}

const ScheduleViewSection: React.FC<ScheduleViewSectionProps> = ({
  user,
  onAddToSchedule,
}) => {
  const [scheduleData, setScheduleData] = useState<DevConnectEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addedEvents, setAddedEvents] = useState<Set<number>>(new Set())
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'core'>('all')
  const [selectedDay, setSelectedDay] = useState<string>('all')

  // Get unique days from events
  const getEventDays = () => {
    const days = new Set<string>()
    scheduleData.forEach(event => {
      const date = new Date(event.record_passed_review.start_utc)
      const dayString = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
      days.add(dayString)
    })
    return Array.from(days).sort((a, b) => {
      const aDate = new Date(a)
      const bDate = new Date(b)
      return aDate.getTime() - bDate.getTime()
    })
  }


  const handleAddToSchedule = (event: DevConnectEvent) => {
    if (onAddToSchedule) {
      onAddToSchedule(event)
      setAddedEvents(prev => new Set(prev).add(event.id))
    }
  }

  const loadScheduleData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch DevConnect calendar events from the public API
      const response = await fetch('https://at-slurper.onrender.com/calendar-events')
      
      if (response.ok) {
        const data = await response.json()
        setScheduleData(data)
      } else {
        setError('Failed to load DevConnect events')
      }
    } catch (error) {
      console.error('Failed to load DevConnect events:', error)
      setError('Failed to load DevConnect events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load DevConnect events immediately when component mounts
    // No authentication needed for public calendar events
    loadScheduleData()
  }, [])

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return {
        date: date.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      }
    } catch {
      return { date: 'Invalid date', time: '' }
    }
  }

  const getTimeStatus = (targetTime: string) => {
    const now = new Date()
    const target = new Date(targetTime)
    const diffMs = target.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffMs < 0) {
      return { status: 'past', text: 'Completed' }
    } else if (diffDays === 0 && diffHours < 24) {
      return { status: 'today', text: 'Today' }
    } else if (diffDays === 1) {
      return { status: 'tomorrow', text: 'Tomorrow' }
    } else if (diffDays <= 7) {
      return { status: 'upcoming', text: `${diffDays} day${diffDays > 1 ? 's' : ''}` }
    } else {
      return { status: 'future', text: `${diffDays} days` }
    }
  }

  return (
    <section className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            DevConnect Schedule
          </h1>
          <p className="text-xl text-gray-200 mb-2">The Ethereum World's Fair</p>
          <p className="text-lg text-gray-300">17-22 November, Buenos Aires</p>
          {user && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-sky-500/10 border border-sky-500/30 rounded-full">
              <span className="w-2 h-2 bg-sky-400 rounded-full mr-2"></span>
              <span className="text-sky-400 text-sm">Base Authenticated • {user.username || `FID: ${user.fid}`}</span>
            </div>
          )}
          <button 
            className="mt-6 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
            onClick={loadScheduleData}
            disabled={loading}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh Events'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button 
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              filter === 'all' 
                ? 'bg-sky-600 text-white border border-sky-600' 
                : 'bg-black text-white hover:bg-gray-900 border border-gray-600 hover:border-sky-500'
            }`}
            onClick={() => setFilter('all')}
          >
            All Events ({scheduleData.length})
          </button>
          <button 
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              filter === 'core' 
                ? 'bg-sky-600 text-white border border-sky-600' 
                : 'bg-black text-white hover:bg-gray-900 border border-gray-600 hover:border-sky-500'
            }`}
            onClick={() => setFilter('core')}
          >
            ⭐ Core Events
          </button>
          <button 
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              filter === 'today' 
                ? 'bg-sky-600 text-white border border-sky-600' 
                : 'bg-black text-white hover:bg-gray-900 border border-gray-600 hover:border-sky-500'
            }`}
            onClick={() => setFilter('today')}
          >
            Today
          </button>
          <button 
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              filter === 'upcoming' 
                ? 'bg-sky-600 text-white border border-sky-600' 
                : 'bg-black text-white hover:bg-gray-900 border border-gray-600 hover:border-sky-500'
            }`}
            onClick={() => setFilter('upcoming')}
          >
            ⏰ Upcoming
          </button>
        </div>

        {/* Day Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button 
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              selectedDay === 'all' 
                ? 'bg-sky-600 text-white border border-sky-600' 
                : 'bg-black text-white hover:bg-gray-900 border border-gray-600 hover:border-sky-500'
            }`}
            onClick={() => setSelectedDay('all')}
          >
            All Days
          </button>
          {getEventDays().map(day => (
            <button
              key={day}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedDay === day 
                  ? 'bg-sky-600 text-white border border-sky-600' 
                  : 'bg-black text-white hover:bg-gray-900 border border-gray-600 hover:border-sky-500'
              }`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500 mb-4"></div>
            <p className="text-gray-200 text-lg">Loading DevConnect events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-white mb-4">Unable to load schedule</h3>
            <p className="text-gray-200 mb-6">{error}</p>
            <button 
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-all duration-200"
              onClick={loadScheduleData}
            >
              Try Again
            </button>
          </div>
        ) : scheduleData.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-white mb-4">No events found</h3>
            <p className="text-gray-200">DevConnect events will appear here once they are loaded.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(() => {
              // Apply filters and day selection
              let filteredEvents = scheduleData.filter((event) => {
                // Apply category filter
                if (filter === 'core' && !event.is_core_event) return false
                if (filter === 'today') {
                  const { status } = getTimeStatus(event.record_passed_review.start_utc)
                  if (status !== 'today') return false
                }
                if (filter === 'upcoming') {
                  const { status } = getTimeStatus(event.record_passed_review.start_utc)
                  if (!['upcoming', 'tomorrow', 'future'].includes(status)) return false
                }

                // Apply day filter
                if (selectedDay !== 'all') {
                  const eventDate = new Date(event.record_passed_review.start_utc)
                  const eventDayString = eventDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })
                  if (eventDayString !== selectedDay) return false
                }

                return true
              }).sort((a, b) => new Date(a.record_passed_review.start_utc).getTime() - new Date(b.record_passed_review.start_utc).getTime())

              // Group events by day if not filtering by specific day
              const eventsByDay = selectedDay === 'all' ? 
                filteredEvents.reduce((acc, event) => {
                  const date = new Date(event.record_passed_review.start_utc)
                  const dayString = date.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })
                  if (!acc[dayString]) acc[dayString] = []
                  acc[dayString].push(event)
                  return acc
                }, {} as Record<string, DevConnectEvent[]>) : {
                  [selectedDay]: filteredEvents
                }

              return Object.entries(eventsByDay).map(([day, events]) => (
                <div key={day} className="mb-12">
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                    <span className="text-sky-400">
                      {day}
                    </span>
                    <span className="ml-3 text-gray-200 text-lg font-normal">
                      ({events.length} events)
                    </span>
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => {
                      const { date, time } = formatDateTime(event.record_passed_review.start_utc)
                      const { status } = getTimeStatus(event.record_passed_review.start_utc)
                      const endTime = formatDateTime(event.record_passed_review.end_utc).time
                      
                      // Get event type styling - simplified to black/white/sky blue
                      const getEventTypeClasses = (eventType: string) => {
                        return 'bg-gray-700 text-white border border-gray-600'
                      }

                      const getStatusClasses = (status: string) => {
                        const classes: Record<string, string> = {
                          'today': 'bg-sky-600 text-white',
                          'tomorrow': 'bg-gray-200 text-black',
                          'upcoming': 'bg-gray-600 text-white',
                          'future': 'bg-gray-600 text-white',
                          'past': 'bg-gray-400 text-white'
                        }
                        return classes[status] || classes['upcoming']
                      }

                      return (
                        <div 
                          key={event.id} 
                          className="bg-black border border-sky-500 rounded-xl p-6 transition-all duration-300 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/20"
                        >
                          {/* Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-sm text-white mb-1">{date}</div>
                              <div className="text-xs text-gray-200">{time} - {endTime}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(status)}`}>
                                {status === 'today' ? 'Today' : 
                                 status === 'tomorrow' ? 'Tomorrow' :
                                 status === 'past' ? 'Completed' : 'Upcoming'}
                              </span>
                              {event.is_core_event && (
                                <span className="px-2 py-1 bg-sky-600 text-white text-xs font-bold rounded-full">
                                  ⭐ Core
                                </span>
                              )}
                              {onAddToSchedule && (
                                <button 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all duration-200 ${
                                    addedEvents.has(event.id) 
                                      ? 'bg-gray-600 hover:bg-gray-700' 
                                      : 'bg-sky-600 hover:bg-sky-700'
                                  }`}
                                  onClick={() => handleAddToSchedule(event)}
                                  title={addedEvents.has(event.id) ? 'Added to schedule' : 'Add to my schedule'}
                                >
                                  {addedEvents.has(event.id) ? '✓' : '+'}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Title and Type */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-bold text-white pr-2">{event.record_passed_review.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getEventTypeClasses(event.record_passed_review.event_type)}`}>
                                {event.record_passed_review.event_type}
                              </span>
                            </div>
                            <p className="text-gray-200 text-sm leading-relaxed">
                              {event.record_passed_review.description.slice(0, 120)}
                              {event.record_passed_review.description.length > 120 && '...'}
                            </p>
                          </div>

                          {/* Details */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                              <span className="text-sky-400 text-sm mt-0.5">📍</span>
                              <div>
                                <div className="text-white text-sm font-medium">{event.record_passed_review.location.name}</div>
                                {event.record_passed_review.location.address && (
                                  <div className="text-gray-300 text-xs">{event.record_passed_review.location.address}</div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sky-400 text-sm">👤</span>
                              <div className="text-white text-sm">{event.record_passed_review.organizer.name}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sky-400 text-sm">🎫</span>
                              <div className="text-white text-sm flex items-center gap-2">
                                {event.record_passed_review.requires_ticket ? 'Ticket Required' : 'Free'}
                                {event.record_passed_review.sold_out && (
                                  <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">Sold Out</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          {(event.record_passed_review.main_url || event.record_passed_review.tickets_url) && (
                            <div className="flex gap-3">
                              {event.record_passed_review.main_url && (
                                <a 
                                  href={event.record_passed_review.main_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold text-center transition-all duration-200"
                                >
                                  Learn More
                                </a>
                              )}
                              {event.record_passed_review.tickets_url && (
                                <a 
                                  href={event.record_passed_review.tickets_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold text-center transition-all duration-200"
                                >
                                  Get Tickets
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            })()}
          </div>
        )}
      </div>
    </section>
  )
}

export default ScheduleViewSection
