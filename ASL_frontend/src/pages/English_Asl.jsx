import { Link } from 'react-router-dom'
import { useEffect } from 'react'

function EnglishAsl() {
  let hasRun = 0;
  
  useEffect(()=>{
	if (hasRun == 0) {
	hasRun = hasRun + 1;
	const input = document.querySelector("#input-text");
	const output = document.querySelector("#output-video");
	const button = document.querySelector("#button-translate");
	let videoSequence = [];
	
	async function translate() {
		if (input.value) {
			const vform = new FormData();
			vform.append('text', input.value);
			
			const response = await fetch(
				"http://localhost:8000/api/english-to-asl/", {
				method: "POST",
				body: vform
			});
			const result = await response.json();
			
			videoSequence = result.sequence;
			startVideoSequence();
		}
	}
	
	// https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	function startVideoSequence() {
		if (videoSequence && videoSequence.length>0) {
			output.addEventListener('ended', advanceVideoSequence);
			output.src = videoSequence.shift().path;
		}
	}
	async function advanceVideoSequence() {
		if (videoSequence && videoSequence.length>0) {
			await sleep(200);
			output.src = videoSequence.shift().path;
		} else {
			output.removeEventListener('ended', advanceVideoSequence);
		}
	}
	
	button.addEventListener('click', translate);
	
	}
  }, [])
  
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
      <div className="max-w-6xl mx-auto mb-4">
		<div className="flex align-center mb-2">
			<h1 className="text-3xl font-serif font-semibold w-fit">
			  English → ASL
			</h1>
			<div className="max-w-6xl ml-4">
				<Link
					to="/asl-to-english"
					className="inline-block text-sm px-4 py-2 border border-gray-300 rounded-full bg-white hover:bg-gray-100 hover:border-blue-500 hover:text-blue-600 transition"
				>
					Switch mode
				</Link>
			  </div>
		</div>
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

          <input type="text" id='input-text' className="w-full h-48 border border-blue-100 bg-blue-50 rounded-xl p-6 text-2xl font-semibold text-blue-900 flex items-center justify-center text-center shadow-sm">
		  </input>

          {/* Buttons */}
          <div className="flex items-center justify-end mt-6">

            {/* Translate */}
            <button id='button-translate' className="bg-blue-600 text-white px-7 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
              Translate
            </button>

          </div>

        </div>

        {/*Right: Video */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col justify-center items-center">

          <div className="w-full h-72 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-3 p-2 mb-5 bg-gray-50">
            <video id='output-video' className='h-full w-full' autoPlay muted>
			</video>
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
