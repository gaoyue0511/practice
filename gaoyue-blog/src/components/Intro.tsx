import { useState } from 'react'
import StarField from './StarField'
import { site } from '../site.config'

export default function Intro() {
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)

  const start = () => {
    setLeaving(true)
    window.setTimeout(() => setGone(true), 900)
  }

  if (gone) return null

  return (
    <div className={`intro${leaving ? ' intro--leaving' : ''}`}>
      <StarField className="intro__stars" />
      <div className="intro__content">
        <h1 className="intro__title" aria-label="GaoYue">
          {'GaoYue'.split('').map((char, index) => (
            <span key={`${char}-${index}`} aria-hidden="true">
              {char}
            </span>
          ))}
        </h1>
        <p className="intro__subtitle">{site.tagline}</p>
        <button className="intro__start" type="button" onClick={start}>
          开始探索
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <svg
        className="intro__wave"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 80 C 240 140 480 20 720 70 C 960 120 1200 40 1440 90 L1440 160 L0 160 Z"
          fill="var(--pink-soft)"
          opacity="0.75"
        />
        <path
          d="M0 110 C 260 60 520 150 780 100 C 1040 55 1240 130 1440 105 L1440 160 L0 160 Z"
          fill="var(--mint-soft)"
        />
      </svg>
    </div>
  )
}
