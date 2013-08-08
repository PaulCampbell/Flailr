
describe("Flailr", function() {

  afterEach(function() {
          document.getElementById('magicDiv').innerHTML = '';

      });

  it("Adds appropriate canvas elements", function() {
    var flailr = new Flailr();
    flailr.containerId = 'magicDiv'
    flailr.start( document.createElement('video'));
    expect(document.getElementById('canvas-blended')).toBeTruthy();
    expect(document.getElementById('canvas-source')).toBeTruthy();
  });

  it("given a single hit target, when motion detected, hit event raised", function() {
    var flailr = new Flailr();
    flailr.containerId = 'magicDiv'
    flailr.showDifferenceCanvas = true;
    var targetHit = 0;
    flailr.hitTargets = [
        {id: 'target1', x: 500, y: 100, width: 100, height: 100, showOutline:false}
      ];

    flailr.addEventListener('targetHit', function(e) {
      targetHit =  targetHit + 1;
    console.log (targetHit)
    })

    var fakevideo = document.createElement('video')
    fakevideo.id = 'webcam'
    fakevideo.setAttribute("width", flailr.width);
    fakevideo.setAttribute("autoplay", "autoplay");
    fakevideo.setAttribute("height", flailr.height);
    fakevideo.src = '/test/test_videos/1.m4v';

    flailr.start(fakevideo);

    waits(2000)
    runs(function () {
    expect(targetHit).toBeGreaterThan(1)
    });
  })

  it("should not rapid fire target hits!", function() {
    var flailr = new Flailr();
    flailr.containerId = 'magicDiv'
    flailr.showDifferenceCanvas = true;
    flailr.maxHitsPerSecond = 1
    var targetHit = 0;
    flailr.hitTargets = [
        {id: 'target1', x: 500, y: 100, width: 100, height: 100, showOutline:false}
      ];

    flailr.addEventListener('targetHit', function(e) {
      targetHit =  targetHit + 1;
    console.log (targetHit)
    })

    var fakevideo = document.createElement('video')
    fakevideo.id = 'webcam'
    fakevideo.setAttribute("width", flailr.width);
    fakevideo.setAttribute("autoplay", "autoplay");
    fakevideo.setAttribute("height", flailr.height);
    fakevideo.src = '/test/test_videos/1.m4v';

    flailr.start(fakevideo);

    waits(2000)
    runs(function () {
    expect(targetHit).toBeLessThan(3)
    });
  });
})