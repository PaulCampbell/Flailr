

describe("Flailr", function() {

  var fakeVideo = null;
  var flailr = null;
  beforeEach(function() {
    flailr = new Flailr();
    flailr.showVideo = false
    fakeVideo = document.createElement('video')
    fakeVideo.id = 'webcam'
    fakeVideo.setAttribute("width", flailr.width);
    fakeVideo.setAttribute("autoplay", "autoplay");
    fakeVideo.setAttribute("height", flailr.height);
    fakeVideo.src = '/test/test_videos/1.m4v';
    flailr.containerId = 'magicDiv'
    flailr.showDifferenceCanvas = true;
  });


  afterEach(function() {
      document.getElementById('magicDiv').innerHTML = '';
  });

  it("Adds appropriate canvas elements", function() {

    flailr.containerId = 'magicDiv'
    flailr.start( document.createElement('video'));
    expect(document.getElementById('canvas-blended')).toBeTruthy();
    expect(document.getElementById('canvas-source')).toBeTruthy();
  });

  it("given a single hit target, when motion detected, hit event raised", function() {
    var targetHit = 0;
    flailr.hitTargets = [
        {id: 'target1', x: 500, y: 100, width: 100, height: 100, showOutline:false}
      ];

    flailr.addEventListener('targetHit', function(e) {
      targetHit =  targetHit + 1;
    console.log (targetHit)
    })

    flailr.start(fakeVideo);

    waits(2000)
    runs(function () {
    expect(targetHit).toBeGreaterThan(0)
    });
  })

  it("should not rapid fire target hits! (i.e. respect maxHitsPerSecond)", function() {
      flailr.maxHitsPerSecond = 1
      var targetHit = 0;
      flailr.hitTargets = [
          {id: 'target1', x: 500, y: 100, width: 100, height: 100, showOutline:false}
        ];
      flailr.addEventListener('targetHit', function(e) {
        targetHit =  targetHit + 1;
        console.log (targetHit)
      })
      flailr.start(fakeVideo);

      waits(2000)
      runs(function () {
        expect(targetHit).toBeLessThan(3)
      });
    });

  it("Should only fire hit for correct target", function() {
    flailr.maxHitsPerSecond = 1
    var targetHit = 0;
    flailr.hitTargets = [
        {id: 'target1', x: 500, y: 100, width: 100, height: 100, showOutline:true},
        {id: 'target2', x: 1, y: 1, width: 100, height: 100, showOutline:true}
      ];

    var hitEvents = [];
    flailr.addEventListener('targetHit', function(e) {
      hitEvents.push(e);
      console.log(e.hitTarget.id + ' hit')
    })
    flailr.start(fakeVideo);

    waits(2000)
    runs(function () {
      var targetTwoEvents = []
      hitEvents.forEach(function(e) {
        if(e.hitTarget.id == 'target2') {
          targetTwoEvents.push(e)
        }
      })
      expect(targetTwoEvents.length).toBe(0)
    });
  });
})