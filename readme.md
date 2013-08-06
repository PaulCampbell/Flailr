# Flailr js

### verb

Wave or swing or cause to wave or swing wildly.

## Motion detection from your webcam. In your browser.

Flailr js is a library for those of us who haven't got a Leap Motion, but want to interact with the browser by wildly
waving their arms around.


## How does is work?

The basic premise is as follows:

 - We take a feed from the web cam using [navigator.getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/Navigator.getUserMedia)
 - We add a canvas to the page and stream the video onto it.
 - We add some `hitTargets` to the canvas (these are basically areas on the canvas that will shout if there has been significant movement over them.
 - We do some fancy [_blend mode difference_](http://en.wikipedia.org/wiki/Blend_modes#Difference) business to check for movement in the camera and raise an event if there is enough movement over one of our `hitTargets`

Simple.


## But how do you actually make it work?

So there are a few examples in the [examples folder](https://github.com/PaulCampbell/Flailr/tree/master/public/examples) that are also running online at http://flailr.jit.su

Basically, include the script on your page:

        <script src='/scripts/flailr.js'></script>

You can now instantiate a new flailr object:

        var flailr = new Flailr();

Give values to a bunch of settings on your new flailr object:

### Settings
#### containerId

        flailr.containerId = 'container';

The id of a div you want the canvas adding to. Failing to specify will result in the canvas being added
to directly to the body element.

#### showVideo

        flailr.showVideo = true;

Sets whether you want the canvas element (and hence the web-cam stream) to be visible. Defaults to true.

#### showDifferenceCanvas

        flailr.showDifferenceCanvas = false;

Show the __difference__ canvas.  Kind of shows what flailr is seeing wrt camera movement - can be helpful for debugging.
Defaults for false.

#### width and height

        flailr.width = 640
        flailr.height = 480

Pixel width and height of the canvas with the video stream.

#### sensitivity

        flailr.sensitivity = 100;

How sensitive the motion capture is... or: how much movement should flailr see over a `hitTarget` before raising an event.
I seem to be able to get readings of up to about 250 __movement___ by flailing _WILDLY_ over a hit target.

#### hitTargets

        flailr.hitTargets = [
                {x: 70, y: 350, width: 120, height: 120, graphic: '/images/snare.png'},
                {x: 400, y: 350, width: 120, height: 120, graphic: '/images/tom.png'}
              ];

This is an array of hitTargets.  A hitTarget has an x and y position (position on the canvas), a width, a height and optionally
a graphic (if you want the hitTarget to be visible.  When there is movement over the hit target (above the required sensitivity
level) a hit event will be raised.

#### addEventListener

          flailr.addEventListener('targetHit', function(e) {
            console.log('target-hit: ' + JSON.stringify(e))
          })

So, this is just to add functions to be called when certain events are raised. At the moment the only event that flailr will raise
is a `targetHit` event

Now you just call start:

        flailr.start()



### All together now
    <!DOCTYPE html>
    <html>
    <head>
      <title>Drums example</title>
      <script src='/scripts/flailr.js'></script>

    </head>
    <body>
      <div id='container'>

      </div>
    </body>
    <script>
      var flailr = new Flailr();
      flailr.containerId = 'container';
      flailr.showVideo = true;
      flailr.showDifferenceCanvas = false;
      flailr.width = 640;
      flailr.height = 480;
      flailr.sensitivity = 150;
      flailr.hitTargets = [
            {id: 'snare', x: 70, y: 350, width: 120, height: 120, graphic: '/images/snare.png'},
            {id: 'tom', x: 400, y: 350, width: 120, height: 120, graphic: '/images/tom.png'}
          ];

      flailr.addEventListener('targetHit', function(e) {
        console.log('target-hit: ' + JSON.stringify(e))
      })

      flailr.start();

    </script>
    </html>

_As noted - check the [examples folder](https://github.com/PaulCampbell/Flailr/tree/master/public/examples)!_

## Todo

 - Improve API (it seems a bit messy to set up a new flailr atm)
 - Do we like the instantiating with the `new` keyword? Possibly replace this?
 - Check out browser support.
 - Figure out how the hell you test a library that depends on web-cam interaction
 - Get it to raise gesture events
   - SwipeLeftToRight
   - SwipeRightToLeft
   - SwipeDown
   - SwipeUp

