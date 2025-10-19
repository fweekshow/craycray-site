import React from 'react'

const PresentationSection: React.FC = () => {
  return (
    <section id="presentationSection" className="presentation-section">
      {/* Video Section */}
      <div className="video-section">
        <h2>Video Presentation</h2>
        <div className="video-container">
          <video controls preload="metadata">
            <source src="https://res.cloudinary.com/dg5qvbxjp/video/upload/v1760661156/Basecamp_vid_ndzww8.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* PDF Section */}
      <div className="pdf-section">
        <h2>Presentation</h2>
        <div className="pdf-container">
          <iframe 
            src="https://www.canva.com/design/DAGz8ZPplT8/usUPBi4UE_YLeqz0emIdOw/view?embed" 
            allowFullScreen 
            loading="lazy"
            title="Rocky Presentation"
          />
        </div>
        <div className="pdf-fallback">
          <p>
            <a href="https://www.canva.com/design/DAGz8ZPplT8/usUPBi4UE_YLeqz0emIdOw/view" target="_blank" rel="noopener noreferrer">
              View presentation in new tab
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

export default PresentationSection
