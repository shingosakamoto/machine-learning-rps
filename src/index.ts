import { detect } from "./touchingDetector";

let currentAudio: string = "audio/honk.mp3";
let audioLastPlayed: Date = new Date();
let audioThrottle: number = 500;

function startVideoStream() {
  if (!navigator.mediaDevices.getUserMedia) return;
  navigator.mediaDevices
    .getUserMedia({ audio: false, video: { facingMode: "user" } })
    .then(function (stream) {
      const video: HTMLVideoElement = document.querySelector("#webcam");
      video.srcObject = stream;
      video.onloadedmetadata = (e) => {
        video.play();
      };

      video.onloadeddata = (e) => {
        startTesting(video);
      };
    })
    .catch(function (err) {
      alert(
        "An error has occurred loading your webcam feed. Try again, or maybe in a different browser?"
      );
    });
}

function playAudio() {
  const now = new Date();
  const differenceInMS = Math.floor(now.getTime() - audioLastPlayed.getTime());

  if (differenceInMS < audioThrottle) return;

  audioLastPlayed = now;

  const audio = new Audio(currentAudio);
  audio.play();
}

let testingTimeout: number;

function startTesting(video: HTMLVideoElement, interval: number = 100) {
  const title = document.getElementById("header");

  const loop = async () => {
    const isTouching = await checkFaceTouching(video);

    if (isTouching) {
      playAudio();
      document.body.classList.add("touching");
    } else {
      document.body.classList.remove("touching");
    }

    testingTimeout = (setTimeout(loop, interval) as unknown) as number;
  };

  loop();
}

function stopTesting() {
  clearTimeout(testingTimeout);
}

async function checkFaceTouching(
  video: HTMLVideoElement
): Promise<boolean | undefined> {
  const result = await detect(video);
  if (!result) return;
  console.log(result);

  return result.chanceTouching > 0.01 && result.chanceNotTouching < 0.002;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("start").addEventListener("click", () => {
    document.getElementById("start").hidden = true;
    startVideoStream();
  });

  if ((window as any).safari) {
    const safari = document.getElementById("safari-warning");
    const safariClose = document.getElementById("close-safari");

    safari.hidden = false;
    safariClose.addEventListener("click", () => {
      safari.hidden = true;
    });
  }
});
