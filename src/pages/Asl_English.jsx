import { Link } from 'react-router-dom'
import iwantwater21 from '../assets/iwantwater_21.png'
import iwantwater22 from '../assets/iwantwater_22.png'
import iwantwater23 from '../assets/iwantwater_23.png'

function AslEnglish() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a1a] px-6 py-10">
      <style>{`
        @keyframes waterDrift {
          0% { transform: translateX(0); }
          50% { transform: translateX(-24px); }
          100% { transform: translateX(0); }
        }

        @keyframes waterRise {
          0% { transform: translateY(8px); opacity: 0.7; }
          50% { transform: translateY(-6px); opacity: 0.95; }
          100% { transform: translateY(8px); opacity: 0.7; }
        }
      `}</style>

      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          to="/"
          className="inline-block text-sm px-4 py-2 border border-gray-300 rounded-full bg-white hover:bg-gray-100 hover:border-blue-500 hover:text-blue-600 transition"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Title */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-3xl font-serif font-semibold mb-2">
          ASL → English
        </h1>
        <p className="text-gray-600 text-sm">
          Capture hand gestures using your camera and translate them into English.
        </p>
      </div>

      {/* Main grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

        {/* left:Camera*/}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col items-center">

          <label className="block text-sm font-medium mb-3 self-start">
            Camera Input
          </label>

          <div className="w-full h-72 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-3 p-4 mb-5 bg-gray-50">
            <img
              src={iwantwater21}
              alt="ASL frame 1"
              className="h-full w-1/3 rounded-lg object-cover"
            />
            <img
              src={iwantwater22}
              alt="ASL frame 2"
              className="h-full w-1/3 rounded-lg object-cover"
            />
            <img
              src={iwantwater23}
              alt="ASL frame 3"
              className="h-full w-1/3 rounded-lg object-cover"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between w-full mt-2">

            <button className="text-sm text-gray-600 border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100 transition">
              📁 Upload
            </button>

            <button className="bg-blue-600 text-white px-7 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
              Capture
            </button>

          </div>

        </div>

        {/* Right:Outputt*/}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col">

          <label className="block text-sm font-medium mb-3">
            Translated Output
          </label>

          <div className="relative w-full h-48 overflow-hidden border border-blue-100 bg-linear-to-b from-sky-50 to-cyan-100 rounded-xl p-6 text-2xl font-semibold text-blue-950 flex items-center justify-center text-center shadow-sm">
            {/* <div
              className="absolute inset-x-[-20%] bottom-0 h-20 bg-cyan-300/60 rounded-[100%] blur-sm"
              style={{ animation: 'waterDrift 5s ease-in-out infinite' }}
            />
            <div
              className="absolute inset-x-[-15%] bottom-2 h-16 bg-sky-400/50 rounded-[100%]"
              style={{ animation: 'waterDrift 4s ease-in-out infinite reverse' }}
            />
            <div
              className="absolute bottom-8 left-8 h-3 w-3 rounded-full bg-white/70"
              style={{ animation: 'waterRise 3s ease-in-out infinite' }}
            />
            <div
              className="absolute bottom-10 right-10 h-4 w-4 rounded-full bg-white/60"
              style={{ animation: 'waterRise 3.6s ease-in-out infinite 0.6s' }}
            /> */}
            <div className="relative z-10 tracking-wide">
              I want water
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-5 text-center">
            Detected gestures will be processed and converted into readable English text.
          </p>

        </div>

      </div>

    </div>
  )
}

export default AslEnglish
