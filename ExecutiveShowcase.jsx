import { useState } from 'react'
import { Link } from 'react-router-dom'
import './executive-showcase.css'

function pad(value) {
  return String(value).padStart(2, '0')
}

function SlideContent({ slide }) {
  if (slide.layout === 'stats') {
    return (
      <div className="exec-slide-content exec-stats">
        <span className="exec-slide-kicker">PERFORMANCE SNAPSHOT</span>
        <h3>{slide.title}</h3>
        <div className="exec-stat-grid">
          {slide.items?.map((item) => (
            <div className="exec-stat" key={`${item.value}-${item.label}`}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (slide.layout === 'list') {
    return (
      <div className="exec-slide-content exec-list">
        <span className="exec-slide-kicker">KEY TAKEAWAYS</span>
        <h3>{slide.title}</h3>
        <div className="exec-list-items">
          {slide.items?.map((item) => (
            <div className="exec-list-item" key={`${item.n}-${item.t}`}>
              <span>{item.n}</span>
              <p>{item.t}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (slide.layout === 'bars') {
    return (
      <div className="exec-slide-content exec-bars">
        <span className="exec-slide-kicker">DATA &amp; INSIGHTS</span>
        <h3>{slide.title}</h3>
        <div className="exec-bars-list">
          {slide.bars?.map((bar) => (
            <div className="exec-bar-row" key={bar.label}>
              <span>{bar.label}</span>
              <div className="exec-bar-track">
                <i style={{ width: `${Math.max(0, Math.min(100, bar.value))}%` }} />
              </div>
              <b>{bar.value}%</b>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const isClosing = slide.layout === 'closing'
  return (
    <div className={`exec-slide-content exec-cover ${isClosing ? 'is-closing' : ''}`}>
      <span className="exec-slide-kicker">{slide.kicker || (isClosing ? 'THE WAY FORWARD' : 'PRESORA PRESENTATION')}</span>
      <div className="exec-cover-rule" />
      <h3>{slide.title}</h3>
      <p>{slide.text}</p>
      <span className="exec-cover-mark" aria-hidden="true">P.</span>
    </div>
  )
}

function PresentationSlide({ slide, index, total, categoryLabel }) {
  return (
    <div className="exec-slide">
      <div className="exec-slide-topline">
        <span className="exec-slide-brand"><i>P</i> PRESORA</span>
        <span>{categoryLabel.toUpperCase()} / SIGNATURE SERIES</span>
      </div>
      <SlideContent slide={slide} />
      <div className="exec-slide-footer">
        <span>STRATEGY · CLARITY · IMPACT</span>
        <span>{pad(index + 1)} <i /> {pad(total)}</span>
      </div>
    </div>
  )
}

export default function ExecutiveShowcase({ categories: suppliedCategories }) {
  // Reuse Home.jsx's existing slide data; no translation or site-wide changes.
  const categories = suppliedCategories || []
  const safeCategories = Array.isArray(categories) ? categories : []
  const [activeId, setActiveId] = useState(safeCategories[0]?.id || 'business')
  const category = safeCategories.find((item) => item.id === activeId) || safeCategories[0]
  const [slideIndex, setSlideIndex] = useState(0)

  if (!category || !category.slides?.length) return null

  const currentIndex = Math.min(slideIndex, category.slides.length - 1)
  const slide = category.slides[currentIndex]

  function chooseCategory(id) {
    setActiveId(id)
    setSlideIndex(0)
  }

  function moveSlide(direction) {
    setSlideIndex((current) => Math.max(0, Math.min(category.slides.length - 1, current + direction)))
  }

  return (
    <section className="exec-showcase-section" id="showcase">
      <div className="exec-showcase-shell">
        <header className="exec-showcase-heading">
          <div className="exec-heading-copy">
            <span className="exec-eyebrow"><i /> SIGNATURE SHOWCASE</span>
            <h2>DESIGN THAT MAKES AN IMPACT.</h2>
            <p>PRESORA turns raw ideas into clear, refined presentations. Explore original sample designs across four categories.</p>
          </div>
          <div className="exec-heading-aside">
            <span>INDEPENDENT DESIGN STUDIO</span>
            <strong>01—04</strong>
            <small>SELECTED DIRECTIONS</small>
          </div>
        </header>

        <div className="exec-showcase-workspace">
          <aside className="exec-showcase-rail">
            <span className="exec-rail-label">EXPLORE THE WORK</span>
            <div className="exec-category-list" role="tablist" aria-label="Presentation categories">
              {safeCategories.map((item, index) => (
                <button
                  className={`exec-category-tab ${item.id === category.id ? 'is-active' : ''}`}
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={item.id === category.id}
                  onClick={() => chooseCategory(item.id)}
                >
                  <span className="exec-category-number">{pad(index + 1)}</span>
                  <span className="exec-category-name">{item.label}</span>
                  <span className="exec-category-arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
            <div className="exec-rail-note">
              <span>THE PRESORA STANDARD</span>
              <p>Clear thinking, considered composition, and a confident visual voice.</p>
            </div>
          </aside>

          <div className="exec-viewer-column">
            <div className="exec-viewer-meta">
              <div>
                <span className="exec-meta-label">FEATURED PRESENTATION</span>
                <h3>{category.deck}</h3>
              </div>
              <span className="exec-meta-count">{pad(currentIndex + 1)} <i /> {pad(category.slides.length)}</span>
            </div>

            <div className="exec-slide-frame" role="tabpanel" aria-label={`${category.label} presentation preview`} aria-live="polite">
              <div className="exec-slide-glow" aria-hidden="true" />
              <div className="exec-slide-inner" key={`${category.id}-${currentIndex}`}>
                <PresentationSlide
                  slide={slide}
                  index={currentIndex}
                  total={category.slides.length}
                  categoryLabel={category.label}
                />
              </div>
            </div>

            <div className="exec-viewer-controls">
              <div className="exec-viewer-caption">
                <span>LIVE PRESENTATION PREVIEW</span>
                <small>Slide {currentIndex + 1} of {category.slides.length}</small>
              </div>
              <div className="exec-viewer-actions">
                <button type="button" onClick={() => moveSlide(-1)} disabled={currentIndex === 0} aria-label="Previous slide">
                  ←
                </button>
                <div className="exec-slide-dots" role="group" aria-label="Choose slide">
                  {category.slides.map((item, index) => (
                    <button
                      key={`${category.id}-slide-${index}`}
                      type="button"
                      className={index === currentIndex ? 'is-active' : ''}
                      aria-label={`Go to slide ${index + 1}`}
                      aria-current={index === currentIndex ? 'true' : undefined}
                      onClick={() => setSlideIndex(index)}
                    />
                  ))}
                </div>
                <button type="button" onClick={() => moveSlide(1)} disabled={currentIndex === category.slides.length - 1} aria-label="Next slide">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="exec-showcase-footer">
          <p><span>NOTE</span> Original sample content for illustration. These are not client projects.</p>
          <Link to="/order">START A PROJECT <span aria-hidden="true">↗</span></Link>
        </footer>
      </div>
    </section>
  )
}
