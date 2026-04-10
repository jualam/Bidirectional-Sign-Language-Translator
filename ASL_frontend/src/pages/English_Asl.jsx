import { Link } from 'react-router-dom'
import iwantwater21 from '../assets/iwantwater_21.png'
import iwantwater22 from '../assets/iwantwater_22.png'
import iwantwater23 from '../assets/iwantwater_23.png'

function EnglishAsl() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a1a] px-6 py-10">

      {/* Back Butto */}
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
          English → ASL
        </h1>
        <p className="text-gray-600 text-sm">
          Enter or speak a sentence to convert it into ASL gestures.
        </p>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

        {/* Left:input */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

          <label className="block text-sm font-medium mb-3">
            Input Text
          </label>

          <div className="w-full h-48 border border-blue-100 bg-blue-50 rounded-xl p-6 text-2xl font-semibold text-blue-900 flex items-center justify-center text-center shadow-sm">
            I want water
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between mt-6">

            {/* Voice Input */}
            <button className="text-sm text-gray-600 border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100 transition">
              🎤 Voice Input
            </button>

            {/* Translate */}
            <button className="bg-blue-600 text-white px-7 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
              Translate
            </button>

          </div>

        </div>

        {/*Right: Video */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col justify-center items-center">

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

          <p className="text-xs text-gray-500 text-center max-w-xs">
            This area will display generated ASL gesture animations or video output.
          </p>

        </div>

      </div>

    </div>
  )
}

export default EnglishAsl
