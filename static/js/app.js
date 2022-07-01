//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var recorder; 						//WebAudioRecorder object
var input; 							//MediaStreamAudioSourceNode  we'll be recording
var encodingType; 					//holds selected encoding for resulting audio (file)
var encodeAfterRecord = true;       // when to encode
var meter = null;
var WIDTH = 500;
var recordingStarted = false;

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //new audio context to help us record

var encodingTypeSelect = document.getElementById("encodingTypeSelect");
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

function startRecording() {
	console.log("startRecording() called");
    var constraints = { audio: true, video:false }

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		audioContext = new AudioContext();

		//update the format 
		document.getElementById("formats").innerHTML="Format: 2 channel "+encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value+" @ "+audioContext.sampleRate/1000+"kHz"

		//assign to gumStream for later use
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);
	  
		//stop the input from playing back through the speakers

		//get the encoding 
		encodingType = encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value;
		
		//disable the encoding selector
		encodingTypeSelect.disabled = true;
		
		recorder = new WebAudioRecorder(input, {
			workerDir: "static/js/", // must end with slash
			encoding: encodingType,
			numChannels:2, //2 is the default, mp3 encoding supports only 2
			onEncoderLoading: function(recorder, encoding) {
				// show "loading encoder..." display
			},
			onEncoderLoaded: function(recorder, encoding) {
				// hide "loading encoder..." display
			}
		});

		recorder.onComplete = function(recorder, blob) { 
			createDownloadLink(blob,recorder.encoding);
			encodingTypeSelect.disabled = false;
		}

		recorder.setOptions({
		  timeLimit:120,
		  encodeAfterRecord:encodeAfterRecord,
	      ogg: {quality: 0.5},
	      mp3: {bitRate: 160}
	    });

		//start the recording process
		recorder.startRecording();
		recordingStarted = true;

	}).catch(function(err) {
	  	//enable the record button if getUSerMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;
	});

	//disable the record button
    recordButton.disabled = true;
    stopButton.disabled = false;
}

function stopRecording() {
	console.log("stopRecording() called");
	
	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//disable the stop button
	stopButton.disabled = true;
	recordButton.disabled = false;
	
	//tell the recorder to finish the recording (stop recording + encode the recorded audio)
	recorder.finishRecording();
}

function createDownloadLink(blob,encoding) {
	
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	document.getElementById("recordingsList").innerHTML = "";

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	//add the new audio and a elements to the li element
	li.appendChild(au);

	//add the li element to the ordered list
	recordingsList.appendChild(li);
}