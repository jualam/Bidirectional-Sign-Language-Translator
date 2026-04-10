import { Link } from 'react-router-dom'
import { useState } from 'react'

function HomePage() {
  const [open, setOpen] = useState(null)

  const toggle = (section) => {
    setOpen(open === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a1a] font-sans px-6">

      {/* Title */}
      <section className="flex flex-col items-center text-center pt-[12vh] pb-16">

        <h1 className="text-[clamp(42px,6vw,80px)] font-serif font-bold leading-tight mb-6">
          Welcome to the <br />
          <span className="text-blue-600 italic">ASL Translator</span>
        </h1>

        <p className="text-gray-600 max-w-xl text-[16px] leading-relaxed mb-12">
          A bidirectional communication bridge between American Sign Language and spoken English.
        </p>

        {/* CARDS */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">

          {/* ASL to English */}
          <Link to="/asl-to-english">
            <div className="h-full bg-[#0f172a] text-white p-10 rounded-2xl shadow-lg border border-gray-800 hover:-translate-y-1 hover:shadow-2xl transition">

              <div className="text-xs tracking-widest uppercase opacity-60 mb-3">
                Mode 01
              </div>

              <h2 className="text-2xl font-serif font-semibold mb-3">
                ASL → English
              </h2>

              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                Use your camera to translate sign language gestures into natural English text and speech in real time.
              </p>

              <div className="text-blue-300 text-sm flex items-center gap-2">
                Get started →
              </div>

            </div>
          </Link>

          {/* English to ASL */}
          <Link to="/english-to-asl">
            <div className="h-full bg-white text-[#0f172a] p-10 rounded-2xl shadow-lg border border-gray-200 hover:-translate-y-1 hover:shadow-2xl transition">

              <div className="text-xs tracking-widest uppercase opacity-60 mb-3">
                Mode 02
              </div>

              <h2 className="text-2xl font-serif font-semibold mb-3">
                English → ASL
              </h2>

              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Convert spoken or typed English into a sequence of ASL gestures for clear visual communication.
              </p>

              <div className="text-blue-600 text-sm flex items-center gap-2">
                Get started →
              </div>

            </div>
          </Link>

        </div>

      </section>

      {/*divide */}
      <div className="flex items-center gap-4 max-w-4xl mx-auto mb-10">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-xs uppercase tracking-widest text-gray-400">
          Learn More
        </span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-3 mb-16">

        {/*About section*/}
        <div className={`border rounded-xl bg-white ${open === 'what' ? 'border-blue-500 shadow-sm' : 'border-gray-200'}`}>
          <button
            onClick={() => toggle('what')}
            className="w-full flex justify-between items-center px-6 py-5 text-left"
          >
            <span className="font-medium">About this project</span>
            <span className={`transition ${open === 'what' ? 'rotate-45 text-blue-600' : ''}`}>+</span>
          </button>

          {open === 'what' && (
            <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
              This project enables real-time communication between ASL users and English speakers using computer vision and language models, reducing reliance on interpreters and improving accessibility.
            </div>
          )}
        </div>

        {/* Asl guide section*/}
        <div className={`border rounded-xl bg-white ${open === 'asl' ? 'border-blue-500 shadow-sm' : 'border-gray-200'}`}>
          <button
            onClick={() => toggle('asl')}
            className="w-full flex justify-between items-center px-6 py-5 text-left"
          >
            <span className="font-medium">How to use ASL → English</span>
            <span className={`transition ${open === 'asl' ? 'rotate-45 text-blue-600' : ''}`}>+</span>
          </button>

          {open === 'asl' && (
            <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
              Use your camera to capture hand gestures. The system detects signs and converts them into readable English text.
            </div>
          )}
        </div>

        {/* Eng to asl guide */}
        <div className={`border rounded-xl bg-white ${open === 'eng' ? 'border-blue-500 shadow-sm' : 'border-gray-200'}`}>
          <button
            onClick={() => toggle('eng')}
            className="w-full flex justify-between items-center px-6 py-5 text-left"
          >
            <span className="font-medium">How to use English → ASL</span>
            <span className={`transition ${open === 'eng' ? 'rotate-45 text-blue-600' : ''}`}>+</span>
          </button>

          {open === 'eng' && (
            <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
              Enter or speak English text. The system converts it into a sequence of ASL gestures for visual understanding.
            </div>
          )}
        </div>

      </div>

      {/* footer*/}
      <footer className="text-center text-xs text-gray-400 pb-6">
        © 2025 ASL Translator
      </footer>

    </div>
  )
}

export default HomePage