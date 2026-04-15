// Set up landmarker
import {
	HandLandmarker,
	FilesetResolver,
	DrawingUtils
} from "./node_modules/@mediapipe/tasks-vision/vision_bundle.mjs"

const vision = await FilesetResolver.forVisionTasks(
	"./node_modules/@mediapipe/tasks-vision/wasm"
);
const handLandmarker = await HandLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath: "hand_landmarker.task"
      },
	  runningMode: "VIDEO",
      numHands: 1
    });

// Get page elements
const video = document.querySelector("#video");
const canvas = document.querySelector("#output");
const ctx = canvas.getContext("2d");
const btn_enable_webcam = document.querySelector("#enable_webcam");
const btn_upload_video = document.querySelector("#upload_video");
const saved = document.querySelector("#saved");

// initialize drawing utils for the canvas
const draw = new DrawingUtils(ctx,null);
const drawConnectors = (a,b,c,d) => draw.drawConnectors(b,c,d);
const drawLandmarks = (a,b,c) => draw.drawLandmarks(b,c);
const HAND_CONNECTIONS = HandLandmarker.HAND_CONNECTIONS;

let detectionMode = 0; // 1 -> webcam, 2 -> video

/* ------- Webcam ----------- */
// Check if webcam access is supported.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;
// If webcam supported, add event listener to button for when user wants to activate it.
if (hasGetUserMedia()) {
	btn_enable_webcam.addEventListener("click", enableCam);
} else {
	console.warn("getUserMedia() is not supported by your browser");
	btn_enable_webcam.disabled = true;
}

// Enable the live webcam view and start detection.
function stopCam() {
	if (!!video.srcObject?.getTracks) {
		for (const track of video.srcObject.getTracks()) {
			track.stop();
		}
		video.src = "";
		video.removeEventListener("loadeddata", predict);
	}
	detectionMode = 0;
	btn_enable_webcam.innerText = "Start Webcam";		
}
function enableCam() {
  if (!handLandmarker) {
    console.log("Wait! objectDetector not loaded yet.");
    return;
  }

  if (detectionMode == 2) stopVideo();
  if (detectionMode == 1) stopCam(); 
  else if (detectionMode == 0) {
    navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predict);
    });
	detectionMode = 1;
    btn_enable_webcam.innerText = "Stop Webcam";
  }

}

/* ----------- Video ------------ */
let videoWaiting = true;
function waiting() { videoWaiting = true; }
function playing() { videoWaiting = false; predict();}

btn_upload_video.addEventListener('change', enableVideo);

function stopVideo() {
	if (video.src.length > 0) {
		URL.revokeObjectURL(video.src);
		video.src = "";
	}
	video.removeEventListener('waiting', waiting);
	video.removeEventListener('playing', playing);
	btn_upload_video.value = "";
	videoWaiting = true;
	detectionMode = 0;
}
function enableVideo() {
	if (!handLandmarker) {
		console.log("Wait! objectDetector not loaded yet.");
		btn_upload_video.value = "";
		return;
	}
	
	if (detectionMode == 1) stopCam();
	if (detectionMode == 2) stopVideo();
	if (detectionMode == 0) {
		if (btn_upload_video.files?.length > 0) {
			detectionMode = 2;
			video.addEventListener('waiting', waiting);
			video.addEventListener('playing', playing);
			video.src = URL.createObjectURL(btn_upload_video.files[0]);
			
		}
	}
}


/* ------------- Landmarker Settings ------------ */

let MAX_BUFFER = 60;
let STILL_TIME = 5; // number of frames hand must be still to count as stopped
let STILL_TIME_MIDPOINT = 1; // frame to send when movement is detected, counted from end of buffer
let OFF_SCREEN_TIME = 4; // number of frames hand must not be detected to be considered moving again
let STILL_DISTANCE_IMAGE = 0.05; // distance away (within still_time frames) that hand must stay within to count as still -- image coordinates
let STILL_DISTANCE_IMAGE_Z = 0.035; // z-distance away in image coordinates (since it is measured differently)
let STILL_DISTANCE_WORLD = 0.04; // same as above -- world coordinates

const settings = document.querySelector('#settings');
const input_still_time = document.querySelector("#still_time");
const input_send_frame = document.querySelector("#send_frame");
const input_off_screen_time = document.querySelector("#off_screen_time");
const input_still_distance = document.querySelector("#still_distance");
const input_still_distance_z = document.querySelector("#still_distance_z");
const input_still_distance_fingers = document.querySelector("#still_distance_fingers");

input_still_time.value = STILL_TIME; 
input_send_frame.value = STILL_TIME_MIDPOINT; 
input_off_screen_time.value = OFF_SCREEN_TIME; 
input_still_distance.value = STILL_DISTANCE_IMAGE; 
input_still_distance_z.value = STILL_DISTANCE_IMAGE_Z; 
input_still_distance_fingers.value = STILL_DISTANCE_WORLD; 

function onInput() {
	STILL_TIME = (Number(input_still_time) !== NaN) ? Number(input_still_time) : STILL_TIME;
	STILL_TIME_MIDPOINT = (Number(input_send_frame) !== NaN) ? Number(input_send_frame) : STILL_TIME_MIDPOINT;
	OFF_SCREEN_TIME = (Number(input_off_screen_time) !== NaN) ? Number(input_off_screen_time) : OFF_SCREEN_TIME;
	STILL_DISTANCE_IMAGE = (Number(input_still_distance) !== NaN) ? Number(input_still_distance) : STILL_DISTANCE_IMAGE;
	STILL_DISTANCE_IMAGE_Z = (Number(input_still_distance_z) !== NaN) ? Number(input_still_distance_z) : STILL_DISTANCE_IMAGE_Z;
	STILL_DISTANCE_WORLD = (Number(input_still_distance_fingers) !== NaN) ? Number(input_still_distance_fingers) : STILL_DISTANCE_WORLD;
}
settings.addEventListener('change', onInput);


/* ----------- Hand Movement Buffers ---------- */
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
let scaleX = 1;
let scaleY = 1;

async function predict() {
	if (detectionMode === 0) return;
	if (lastVideoTime !== video.currentTime) {
		lastVideoTime = video.currentTime;
		results = handLandmarker.detectForVideo(video, performance.now());
	}
	

	// use results
	let inFrame = results.landmarks.length > 0;
	let justStartedMoving = [false,false];
	if (inFrame) {
		justStartedMoving = detectSignificantChange(inFrame, results.landmarks[0][0], results.worldLandmarks[0]);
	} else {
		justStartedMoving = detectSignificantChange(inFrame);
	}
	if (justStartedMoving[0]) {
		console.log(performance.now() + ': wrist moved');
		if(buffer.length>=STILL_TIME) saved.appendChild(buffer[buffer.length-1-STILL_TIME_MIDPOINT].frame);
	} else if (justStartedMoving[1]) {
		console.log(performance.now() + ': hand moved');
		if(buffer.length>=STILL_TIME) saved.appendChild(buffer[buffer.length-1-STILL_TIME_MIDPOINT].frame);
	}
	

	// draw hand on video
	canvas.style.width = video.videoWidth;
	canvas.style.height = video.videoHeight;
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	scaleX = canvas.width;
	scaleY = canvas.height;
	// mediapipe bug?
	// portrait mode landmarks are off by the image ratio
	if (canvas.height > canvas.width) { 
		scaleY *= canvas.height/canvas.width;
	}
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (results.landmarks) {
		for (const landmarks of results.landmarks) {
			ctx.strokeStyle = "#00FF00";
			ctx.lineWidth = 5;
			for (const {start, end} of HAND_CONNECTIONS) {
				ctx.beginPath();
				ctx.moveTo(landmarks[start].x*scaleX, landmarks[start].y*scaleY)
				ctx.lineTo(landmarks[end].x*scaleX, landmarks[end].y*scaleY)
				ctx.stroke();
			}
			ctx.fillStyle = "#FF0000";
			for (const landmark of landmarks) {
				ctx.beginPath();
				ctx.arc(landmark.x*scaleX, landmark.y*scaleY, 5, 0, 2*Math.PI);
				ctx.fill();
			}
			
			/*drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
				color: "#00FF00",
				lineWidth: 5
			});
			drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 2 });*/
			
		}
	}

	if (detectionMode == 1 || (!videoWaiting && !video.ended)) {
		window.requestAnimationFrame(predict);
	}
}


const btn_send = document.querySelector('#send');

async function send() {
	const images = document.querySelectorAll("#saved canvas");
	const form = new FormData()
	
	for (let i = 0; i < images.length; i++) {
		const blob = await new Promise(resolve => images[i].toBlob(resolve, "image/jpeg"));
		form.append('images', blob, `frame_${i}.jpg`);
	}
	
	const response = await fetch(
		"http://localhost:8000/api/asl-to-english/", {
			method: "POST",
			body: form
		});
	const result = await response.json();
	console.log(result);
}
btn_send.addEventListener('click', send);
