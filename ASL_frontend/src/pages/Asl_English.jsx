import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import loadingGif from '../assets/loading.gif'
import landmarkerTask from '../assets/hand_landmarker.task'

import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils
} from "../../node_modules/@mediapipe/tasks-vision/vision_bundle.mjs"
const vision = await FilesetResolver.forVisionTasks(
  "../../node_modules/@mediapipe/tasks-vision/wasm"
);
const handLandmarker = await HandLandmarker.createFromOptions(
  vision,
  {
    baseOptions: {
      modelAssetPath: landmarkerTask
    },
    runningMode: "VIDEO",
    numHands: 1
  });

function AslEnglish() {
  let hasRun = 0;
  useEffect(() => {
	if (hasRun == 0) {
	hasRun = hasRun + 1;
    const video = document.getElementById('input-video')
    const fileInput = document.getElementById('video-upload')
    const captureButton = document.getElementById('toggle-capture') 
    const textOutput = document.getElementById('text-output')
	const detectedWords = document.getElementById('detected-words')
    
    let detectionMode = 0;
    let animationFrame = null;
    
    captureButton.addEventListener("click", toggleCapture)
    function toggleCapture() {
      if (detectionMode == 0) startWebcam();
      else {
        if (detectionMode == 1) stopWebcam();
        else if (detectionMode == 2) stopVideo();
        translate();
      }
      
      setButtonText();
    }
    function setButtonText() {
      if (detectionMode == 0) captureButton.innerText = "Start Capture";
      else if (detectionMode == 1) captureButton.innerText = "Start Translation";
      else if (detectionMode == 2) captureButton.innerText = "Stop Video and Translate";
    }
    
    
    /* ------- Webcam ----------- */
    // Check if webcam access is supported.
    const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;
    
    function startWebcam() {
      if (!hasGetUserMedia()) {
        console.warn("getUserMedia() is not supported by your browser");
        return;
      }
      if (!handLandmarker) {
        console.log("Wait! objectDetector not loaded yet.");
        return;
      }
  
      navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
        video.addEventListener("loadeddata", predict);
        video.srcObject = stream;
      });
      detectionMode = 1;
    }
    
    function stopWebcam() {
      window.cancelAnimationFrame(animationFrame);
      if (!!video.srcObject?.getTracks) {
        for (const track of video.srcObject.getTracks()) {
          track.stop();
        }
      }
      video.srcObject = null;
      video.src = "";
      video.removeEventListener("loadeddata", predict);
      detectionMode = 0;
    }

    /* ----------- Video ------------ */
    fileInput.addEventListener('change', startVideo);
    function startVideo() {
      if (!handLandmarker) {
        console.log("Wait! objectDetector not loaded yet.");
        return;
      }
      if (fileInput.files?.length > 0) {
        if (detectionMode != 0) toggleCapture();
        
        video.addEventListener("loadeddata", predict);
        video.src = URL.createObjectURL(fileInput.files[0]);
        detectionMode = 2;
        setButtonText();
      }
    }
    function stopVideo() {
      window.cancelAnimationFrame(animationFrame);
      if (video.src.length > 0) {
        URL.revokeObjectURL(video.src);
        video.src = "";
      }
      video.removeEventListener('loadeddata', predict);
      detectionMode = 0;
      fileInput.value = "";
    }


    /* ----------- Hand Movement Detection ---------- */
    const MAX_BUFFER = 60;
    const STILL_TIME = 8; // number of frames hand must be still to count as stopped
    const STILL_TIME_MIDPOINT = 1; // frame to send when movement is detected, counted from end of buffer
    const OFF_SCREEN_TIME = 4; // number of frames hand must not be detected to be considered moving again
    const STILL_DISTANCE_IMAGE = 0.05; // distance away (within still_time frames) that hand must stay within to count as still -- image coordinates
    const STILL_DISTANCE_IMAGE_Z = 0.035; // z-distance away in image coordinates (since it is measured differently)
    const STILL_DISTANCE_WORLD = 0.04; // same as above -- world coordinates

    let outOfFrame = 0;
    let buffer = [];
    /*
      buffer format: {
        wristMoving: -1,  // -1 unknown, 0 still, 1 moving
        wrist: {x, y, z},
        handMoving: -1,
        hand: [{x,y,z},...], // 21 landmarks
        frame: <canvas> // contains video frame at this time
      }
    */

    // returns array with two values, corresponding to the wrist and hand. for each:
    //  true if the wrist/hand was moving the previous frame but stopped this one
    //  true if the wrist/hand was stopped then left the frame for too long
    //  false otherwise
    function detectSignificantChange(inFrame, vwrist, vhand) {
      if (inFrame) {
        outOfFrame = 0;
        
        let vframe = document.createElement('canvas');
        vframe.width = video.videoWidth;
        vframe.height = video.videoHeight;
        vframe.getContext('2d').drawImage(video, 0, 0);
        
        buffer.push({
          wristMoving: -1,
          wrist: vwrist,
          handMoving: -1,
          hand: vhand,
          frame: vframe
        });
        if (buffer.length > MAX_BUFFER) buffer.shift();
        return determineSpeed(buffer.length-1);
      } else {
        outOfFrame++;
        // hand not detected for too long -> no longer stopped
        if (outOfFrame == OFF_SCREEN_TIME) { 
          if (buffer.length > 0) {
            return [
              buffer[buffer.length-1].wristMoving == 0,
              buffer[buffer.length-1].handMoving == 0
            ]
          }
        }
        return [false, false];
      }
      
    }
    function determineSpeed(i) {
      // buffer size <still_time -> wait
      if (buffer.length < STILL_TIME) {
        buffer[i].wristMoving = 1;
        buffer[i].handMoving = 1;
        return [false, false];
      }

      // previous still_time positions similar -> stopped
      // wrist
      if (buffer[i].wristMoving == -1) {
        for (let j = 1; j < STILL_TIME; j++) {
          let x_dist_image = Math.abs(buffer[i-j].wrist.x - buffer[i].wrist.x);
          let y_dist_image = Math.abs(buffer[i-j].wrist.y - buffer[i].wrist.y);
          let z_dist_image = Math.abs(buffer[i-j].wrist.z - buffer[i].wrist.z);
          if (x_dist_image > STILL_DISTANCE_IMAGE || y_dist_image > STILL_DISTANCE_IMAGE || z_dist_image > STILL_DISTANCE_IMAGE_Z) {
            buffer[i].wristMoving = 1;
            break;
          }
        }
        if (buffer[i].wristMoving != 1) buffer[i].wristMoving = 0;
      }
      
      // hand
      if (buffer[i].handMoving == -1) {
        for (let j = 1; j < STILL_TIME; j++) {
          for (let k = 0; k < buffer[i].hand.length; k++) {
            let x_dist_world = Math.abs(buffer[i-j].hand[k].x - buffer[i].hand[k].x);
            let y_dist_world = Math.abs(buffer[i-j].hand[k].y - buffer[i].hand[k].y);
            let z_dist_world = Math.abs(buffer[i-j].hand[k].z - buffer[i].hand[k].z);
            if (x_dist_world > STILL_DISTANCE_WORLD || y_dist_world > STILL_DISTANCE_WORLD || z_dist_world > STILL_DISTANCE_WORLD) {
              buffer[i].handMoving = 1;
              break;
            }
          }
          if (buffer[i].handMoving == 1) break;
        }
        if (buffer[i].handMoving != 1) buffer[i].handMoving = 0;
      }
      /* scenarios:
        wrist was moving, stopped -> ended sign
        fingers were moving, stopped -> ended sign
      */
      if (i==0) return [false, false]
      return [
        buffer[i-1].wristMoving == 1 && buffer[i].wristMoving == 0, 
        buffer[i-1].handMoving == 1 && buffer[i].handMoving == 0
      ]
    }


    /* --------- Core Event Loop ----------- */
    let lastVideoTime = -1;
    let results = undefined;
    let saved = [];

    async function predict() {
      // only predict if a video is running
      if (detectionMode === 0) return;
            
      // only predict if the video has advanced
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = handLandmarker.detectForVideo(video, performance.now());

        let inFrame = results.landmarks.length > 0;
        let changed = [false,false];
        
        if (inFrame) {
          changed = detectSignificantChange(inFrame, results.landmarks[0][0], results.worldLandmarks[0]);
        } else {
          changed = detectSignificantChange(inFrame);
        }
        
        if (changed[0]) {
          console.log(performance.now() + ': wrist moved');
          saved.push(buffer[buffer.length-1-STILL_TIME_MIDPOINT].frame);
        } else if (changed[1]) {
          console.log(performance.now() + ': hand moved');
          saved.push(buffer[buffer.length-1-STILL_TIME_MIDPOINT].frame);
        }
      }
      
      // call again once browser is ready
      animationFrame = window.requestAnimationFrame(predict);
    }

    // translation API call
    async function translate() {
      if (saved.length > 0) {
      textOutput.innerHTML = `<image src=${loadingGif}></image>`
      const vform = new FormData()
      
      for (let i = 0; i < saved.length; i++) {
        const blob = await new Promise(resolve => saved[i].toBlob(resolve, "image/jpeg"));
        vform.append('images', blob, `frame_${i}.jpg`);
      }
      
      
      
      const response = await fetch(
        "http://localhost:8000/api/asl-to-english/", {
          method: "POST",
          body: vform
        });
      const result = await response.json();
      
      
	  saved = [];
	  textOutput.innerText=result.translation;
	  //detectedWords.innerText = "Detected: " + result.recognized_signs.join(", ");
      }
    }
    }
  },[])
  
  
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
        <div className="flex align-center mb-2">
			<h1 className="text-3xl font-serif font-semibold w-fit">
			  ASL → English
			</h1>
			<div className="max-w-6xl ml-4">
				<Link
					to="/english-to-asl"
					className="inline-block text-sm px-4 py-2 border border-gray-300 rounded-full bg-white hover:bg-gray-100 hover:border-blue-500 hover:text-blue-600 transition"
				>
					Switch mode
				</Link>
			  </div>
		</div>
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

          <div className="w-full h-72 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-3 mb-5 bg-gray-50">
            {/*<img
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
            />*/}
            <video id='input-video' className='h-full' autoPlay muted></video>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between w-full mt-2">

            <label htmlFor='video-upload' className="hidden-file-input-label text-sm text-gray-600 border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100 transition">
              📁 Upload
            </label>
            <input type='file' className="hidden-file-input" name='video-upload' id='video-upload' accept='video/mp4'></input>

            <button id='toggle-capture' className="bg-blue-600 text-white px-7 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
              Start Capture
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
            <div id='text-output' className="relative z-10 tracking-wide">
              
            </div>
          </div>
			
          <p id='detected-words' className="text-xs text-gray-500 mt-5 text-center">
            Detected gestures will be processed and converted into readable English text.
          </p>

        </div>

      </div>

    </div>
  )
}

export default AslEnglish
