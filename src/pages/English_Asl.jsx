import { Link } from 'react-router-dom'
import { useState } from 'react'

function EnglishAsl() {
  const [text, setText] = useState('')

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
            Enter Text
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your sentence here..."
            className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
          />

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

          <div className="w-full h-72 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-5">
            <span className="text-gray-400 text-sm">
              ASL gesture video will appear here
            </span>
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