var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;
function init() {
  canvas = document.getElementById("canvas");
  anim_container = document.getElementById("animation_container");
  dom_overlay_container = document.getElementById("dom_overlay_container");
  var comp=AdobeAn.getComposition("F7A122F3428E4E09AE0C45A66105F783");
  var lib=comp.getLibrary();
  var loader = new createjs.LoadQueue(false);
  loader.addEventListener("fileload", function(evt){handleFileLoad(evt,comp)});
  loader.addEventListener("complete", function(evt){handleComplete(evt,comp)});
  var lib=comp.getLibrary();
  loader.loadManifest(lib.properties.manifest);
}
function handleFileLoad(evt, comp) {
  var images=comp.getImages();
  if (evt && (evt.item.type == "image")) { images[evt.item.id] = evt.result; }
}
function handleComplete(evt,comp) {
  var lib=comp.getLibrary();
  var ss=comp.getSpriteSheet();
  var queue = evt.target;
  var ssMetadata = lib.ssMetadata;
  for(i=0; i<ssMetadata.length; i++) {
    ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
  }
  exportRoot = new lib.HandEyeCoordination();
  stage = new lib.Stage(canvas);

  setTimeout(() => {
    animationEnd()
  }, 1500)

  fnStartAnimation = function() {
    stage.addChild(exportRoot);
    createjs.Ticker.framerate = lib.properties.fps;
    createjs.Ticker.addEventListener("tick", stage);
  }
  AdobeAn.makeResponsive(false,'both',false,1,[canvas,anim_container,dom_overlay_container]);
  AdobeAn.compositionLoaded(lib.properties.id);
  fnStartAnimation();
}

function animationEnd() {
  const loginInfo = document.querySelector('.login-info')
  loginInfo.style.display = 'flex'
}
