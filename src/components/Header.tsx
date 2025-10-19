import React from 'react'

interface HeaderProps {
  activeSection: 'presentation' | 'schedule' | 'schedule-view'
  onSectionChange: (section: 'presentation' | 'schedule' | 'schedule-view') => void
  subtitle: string
}

const Header: React.FC<HeaderProps> = ({ activeSection, onSectionChange, subtitle }) => {
  return (
    <header className="header">
      <h1>CrayCray Studios</h1>
      <p className="subtitle">{subtitle}</p>
      <nav className="nav">
        <a 
          href="#" 
          className={`nav-link ${activeSection === 'schedule-view' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            onSectionChange('schedule-view')
          }}
        >
          Full Schedule
        </a>
        <a 
          href="#" 
          className={`nav-link ${activeSection === 'schedule' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            onSectionChange('schedule')
          }}
        >
          My Schedule
        </a>
        <a 
          href="#" 
          className={`nav-link ${activeSection === 'presentation' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            onSectionChange('presentation')
          }}
        >
          About Rocky
        </a>
      </nav>
    </header>
  )
}

export default Header
