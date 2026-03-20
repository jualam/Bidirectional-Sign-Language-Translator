import { Link } from 'react-router-dom'

function AslEnglish() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a1a] px-6 py-10">

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

          <div className="w-full h-72 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-5">
            <span className="text-gray-400 text-sm">
              Camera feed will appear here
            </span>
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

          <div className="w-full h-48 border border-gray-200 rounded-xl p-4 text-sm text-gray-500 flex items-center justify-center text-center">
            English translation will appear here
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