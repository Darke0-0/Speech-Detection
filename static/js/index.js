window.onload = function () {
    "use strict";
    var paths = document.getElementsByTagName('path');
    var visualizer = document.getElementById('visualizer');
    var mask = visualizer.getElementById('mask');
    var AudioContext;
    var audioContent;
    var permission = false;
    var path;
    
	var au = document.createElement('audio');
	var li = document.createElement('li');
	au.controls = true;
	//add the new audio and a elements to the li element
	li.appendChild(au);

	//add the li element to the ordered list
	recordingsList.appendChild(li);

    var soundAllowed = function (stream) {
        permission = true;
        var audioStream = audioContent.createMediaStreamSource( stream );
        var analyser = audioContent.createAnalyser();
        var fftSize = 1024;

        analyser.fftSize = fftSize;
        audioStream.connect(analyser);

        var bufferLength = analyser.frequencyBinCount;
        var frequencyArray = new Uint8Array(bufferLength);
        
        visualizer.setAttribute('viewBox', '0 0 255 255');
      
        for (var i = 0 ; i < 255; i++) {
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('stroke-dasharray', '4,1');
            mask.appendChild(path);
        }
        var doDraw = function () {
            requestAnimationFrame(doDraw);
            analyser.getByteFrequencyData(frequencyArray);
            var adjustedLength;
            for (var i = 0 ; i < 255; i++) {
                adjustedLength = Math.floor(frequencyArray[i]) - (Math.floor(frequencyArray[i]) % 5);
                paths[i].setAttribute('d', 'M '+ (i) +',255 l 0,-' + adjustedLength);
            }
        }
        doDraw();
    }

    var soundNotAllowed = function (error) {
        console.log(error);
    }


    document.getElementById('recordButton').onclick = function () {
        if (!permission) {
            navigator.mediaDevices.getUserMedia({audio:true})
                .then(soundAllowed)
                .catch(soundNotAllowed);

            AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContent = new AudioContext();
        }
        this.className = "green-button";
    };
};