var Flailr = function () {


  var flailr = {};
  var canvasSource, video, canvasBlended, contextSource, contextBlended, timeOut, lastImageData, container;

  flailr.width = 640
  flailr.height = 480
  flailr.containerId = '';
  flailr.hitTargets = [];
  flailr.sensitivity = 60;
  flailr.showVideo = true;
  flailr.showDifferenceCanvas = false;

  flailr.addEventListener = function(type,listener) {
    eventListeners.push({type:type, listener: listener})
  }

  var eventListeners = [];

  flailr.start = function(){
    var self = this;

    container = document.getElementById(flailr.containerId)
    if(!container) {
      container = document.getElementsByTagName('body')[0]
    }
    // Add all the required elements to the page...
    video = document.createElement('video')
    video.id = 'webcam'
    video.setAttribute("width", self.width.toString());
    video.setAttribute("autoplay", "autoplay");
    video.setAttribute("height", self.height.toString());
    video.setAttribute("style", "display:none;");
    container.appendChild(video)

    canvasSource = document.createElement('canvas');
    canvasSource.setAttribute("width", self.width.toString())
    canvasSource.setAttribute("height", self.height.toString());
    canvasSource.id = 'canvas-source'
    container.appendChild(canvasSource)

    canvasBlended = document.createElement('canvas');
    canvasBlended.setAttribute("width", self.width.toString())
    canvasBlended.setAttribute("height", self.height.toString());
    canvasBlended.id = 'canvas-blended'
    canvasBlended.setAttribute("style", "display:none;");
    container.appendChild(canvasBlended)

    canvasSource = document.getElementById('canvas-source');
    canvasBlended = document.getElementById('canvas-blended')

    contextSource = canvasSource.getContext('2d');
    contextBlended = canvasBlended.getContext('2d');


    // mirror video
    contextSource.translate(canvasSource.width, 0);
    contextSource.scale(-1, 1);

    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio: false, video: true}, function (stream) {
        video.src = stream;
        initialize(self);
      }, webcamError);
    } else if (navigator.webkitGetUserMedia) {
      navigator.webkitGetUserMedia({audio: false, video: true}, function (stream) {
        video.src = window.webkitURL.createObjectURL(stream);
        initialize(self);
      }, webcamError);
    } else {
      alert('browser does not support getUserMedia')
    }


  }

  return flailr;

  var webcamError = function (e) {
    alert('Webcam error!', e);
  };


  function initialize(self) {
    // add hitTargets to the canvas...
    for (var i = 0; i < self.hitTargets.length; i++) {
      var hitTarget = document.createElement('img')
      if(self.hitTargets[i].id) {
        hitTarget.id = self.hitTargets[i].id;
      }
      if(self.hitTargets[i].graphic) {
        hitTarget.setAttribute('src', self.hitTargets[i].graphic)
      }
      hitTarget.setAttribute("style", "position: absolute; left: " + self.hitTargets[i].x + "px; top: " + self.hitTargets[i].y + "px; width:" + self.hitTargets[i].width + "px;  height:" + self.hitTargets[i].height + "px;");
      if(self.hitTargets[i].showOutline) {
        hitTarget.setAttribute("style", "border:solid 1px red; " + hitTarget.getAttribute('style'))
      }
      console.log('adding ' + hitTarget)
      container.appendChild(hitTarget)
    }
    start(self);
  }


  function start(self) {
    if(!self.showVideo) {
      document.getElementById('canvas-source').style.opacity = '0'
    }
    update(self);
  }

  function update(self) {
    drawVideo();
    blend();
    checkAreas(self);
    timeOut = setTimeout(function() {update(self)}, 1000 / 60 );
  }

  function drawVideo() {
    contextSource.drawImage(video, 0, 0, video.width, video.height);
  }

  function blend() {
    var width = canvasSource.width;
    var height = canvasSource.height;
    // get webcam image data
    var sourceData = contextSource.getImageData(0, 0, width, height);
    // create an image if the previous image doesn’t exist
    if (!lastImageData) lastImageData = contextSource.getImageData(0, 0, width, height);
    // create a ImageData instance to receive the blended result
    var blendedData = contextSource.createImageData(width, height);
    // blend the 2 images
    differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
    // draw the result in a canvas
    contextBlended.putImageData(blendedData, 0, 0);
    // store the current webcam image
    lastImageData = sourceData;
  }

  function fastAbs(value) {
    return (value ^ (value >> 31)) - (value >> 31);
  }

  function threshold(value) {
    return (value > 0x15) ? 0xFF : 0;
  }


  function differenceAccuracy(target, data1, data2) {
    if (data1.length != data2.length) return null;
    var i = 0;
    while (i < (data1.length * 0.25)) {
      var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
      var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;
      var diff = threshold(fastAbs(average1 - average2));
      target[4 * i] = diff;
      target[4 * i + 1] = diff;
      target[4 * i + 2] = diff;
      target[4 * i + 3] = 0xFF;
      ++i;
    }
  }

  function raiseEvent(type, e) {
    var appropriateListeners = [];
    for (var i = 0; i < eventListeners.length; ++i) {
      if(eventListeners[i].type == type) {
        appropriateListeners.push(eventListeners[i]);
      }
      for (var r = 0; r < appropriateListeners.length; ++r) {
        appropriateListeners[r].listener(e)
      }
    }
  }

  function checkAreas(self) {
    for (var r = 0; r < self.hitTargets.length; ++r) {
      // get the pixels in a note area from the blended image
      var blendedData = contextBlended.getImageData(self.hitTargets[r].x, self.hitTargets[r].y, self.hitTargets[r].width, self.hitTargets[r].height);
      var i = 0;
      var average = 0;
      // loop over the pixels
      while (i < (blendedData.data.length * 0.25)) {
        // make an average between the color channel
        average += (blendedData.data[i * 4] + blendedData.data[i * 4 + 1] + blendedData.data[i * 4 + 2]) / 3;
        ++i;
      }
      // calculate an average between of the color values of the note area
      average = Math.round(average / (blendedData.data.length * 0.25));
      if (average > self.sensitivity) {
        raiseEvent('targetHit', {vigour: average, hitTarget: self.hitTargets[r]})
      }
    }
  }
}