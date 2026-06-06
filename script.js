const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const offscreenCanvas = document.createElement("canvas");
const offscreenCtx = offscreenCanvas.getContext("2d");

const API_URL = "https://elelimios-real-time-object-classifier.hf.space/detect";


const SEND_WIDTH = 320;
const SEND_HEIGHT = 240;

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Error al acceder a la cámara:", err);
    }
}

function getFrameBlob() {
    return new Promise((resolve) => {
        
        offscreenCanvas.width = SEND_WIDTH;
        offscreenCanvas.height = SEND_HEIGHT;
        
        
        offscreenCtx.drawImage(video, 0, 0, SEND_WIDTH, SEND_HEIGHT);
        
        
        offscreenCanvas.toBlob((blob) => {
            resolve(blob);
        }, "image/jpeg", 0.5); 
    });
}

async function detectionLoop() {
    if (video.readyState === 4) {
        const blob = await getFrameBlob();

        if (blob) {
            const formData = new FormData();
            formData.append("image", blob, "frame.jpg");

            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    body: formData
                });

                const data = await res.json();

                if (data.detections) {
                    drawDetections(data.detections);
                }
            } catch (err) {
                console.error("Error en la petición:", err);
            }
        }
    }
    // Siguiente frame inmediato
    setTimeout(detectionLoop, 50);
}

function drawDetections(detections) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 3;
    ctx.font = "bold 16px Arial";
    ctx.strokeStyle = "#00ff00"; 
    ctx.fillStyle = "#00ff00";

    
    const scaleX = canvas.width / SEND_WIDTH;
    const scaleY = canvas.height / SEND_HEIGHT;

    detections.forEach(d => {
        
        const x1 = d.x1 * scaleX;
        const y1 = d.y1 * scaleY;
        const w = (d.x2 - d.x1) * scaleX;
        const h = (d.y2 - d.y1) * scaleY;

        ctx.strokeRect(x1, y1, w, h);
        ctx.fillText(
            `${d.cls} ${(d.conf * 100).toFixed(0)}%`,
            x1,
            y1 - 7
        );
    });
}

startCamera().then(() => {
    detectionLoop();
});