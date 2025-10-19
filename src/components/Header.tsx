import React from 'react'

interface HeaderProps {
  activeSection: 'presentation' | 'schedule'
  onSectionChange: (section: 'presentation' | 'schedule') => void
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
          className={`nav-link ${activeSection === 'presentation' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            onSectionChange('presentation')
          }}
        >
          Presentation
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
      </nav>
    </header>
  )
}

export default Header
