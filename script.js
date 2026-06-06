const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    return new Promise(resolve => {
        video.onloadeddata = () => resolve(video);
    });
}

async function sendFrame() {

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;

    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(video, 0, 0);

    tempCanvas.toBlob(async (blob) => {

        const formData = new FormData();
        formData.append("image", blob, "frame.jpg");

        const response = await fetch("https://elelimios-real-time-object-classifier.hf.space/detect", {
            method: "POST",
            body: formData
        });

        const detections = await response.json();

        console.log("Detections:", detections);

        // 🔥 FIX CRÍTICO
        if (!Array.isArray(detections)) {
            console.error("Backend error:", detections);
            return;
        }

        drawDetections(detections);

    }, "image/jpeg");
}

function drawDetections(detections) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach(det => {

        const [x1, y1, x2, y2] = det.bbox;

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;

        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        ctx.fillStyle = "red";
        ctx.font = "16px Arial";

        ctx.fillText(
            `${det.class} ${(det.confidence * 100).toFixed(1)}%`,
            x1,
            y1 - 5
        );
    });
}

async function main() {
    await setupCamera();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    console.log("Video:", video.videoWidth, video.videoHeight);
    console.log("Canvas:", canvas.width, canvas.height);

    setInterval(sendFrame, 300);
}

main();