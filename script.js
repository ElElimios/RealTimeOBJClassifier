const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let processing = false;

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: 640,
            height: 480
        }
    });

    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function sendFrame() {

    if (processing) return;
    processing = true;

    try {

        const tempCanvas = document.createElement("canvas");

        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;

        const tempCtx = tempCanvas.getContext("2d");

        tempCtx.drawImage(
            video,
            0,
            0,
            tempCanvas.width,
            tempCanvas.height
        );

        const blob = await new Promise(resolve =>
            tempCanvas.toBlob(resolve, "image/jpeg")
        );

        const formData = new FormData();
        formData.append("image", blob, "frame.jpg");

        const response = await fetch("https://TU-SPACE.hf.space/detect", {
                                method: "POST",
                                body: formData
        })

        const detections = await response.json();

        console.log("Detections:", detections);

        drawDetections(detections);

    } catch (error) {

        console.error(error);

    } finally {

        processing = false;

    }
}

function drawDetections(detections) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

    detections.forEach(det => {

        let [x1, y1, x2, y2] = det.bbox;

        x1 = Number(x1);
        y1 = Number(y1);
        x2 = Number(x2);
        y2 = Number(y2);

        const bx = x1 * scaleX;
        const by = y1 * scaleY;
        const bw = (x2 - x1) * scaleX;
        const bh = (y2 - y1) * scaleY;

        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 3;

        ctx.strokeRect(
            bx,
            by,
            bw,
            bh
        );

        ctx.fillStyle = "#ff0000";
        ctx.font = "18px Arial";

        ctx.fillText(
            `${det.class} ${Math.round(det.confidence * 100)}%`,
            bx,
            by > 20 ? by - 5 : 20
        );
    });
}

async function main() {

    await setupCamera();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    console.log(
        "Video:",
        video.videoWidth,
        video.videoHeight
    );

    console.log(
        "Canvas:",
        canvas.width,
        canvas.height
    );

    setInterval(sendFrame, 300);
}

main();