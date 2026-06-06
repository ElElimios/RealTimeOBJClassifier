const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const offscreenCanvas = document.createElement("canvas");
const offscreenCtx = offscreenCanvas.getContext("2d");

const API_URL = "https://elelimios-real-time-object-classifier.hf.space/detect";

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

async function sendFrame() {
    if (video.readyState !== 4) return;

    
    offscreenCanvas.width = video.videoWidth;
    offscreenCanvas.height = video.videoHeight;

    // Tomamos la foto en el canvas oculto
    offscreenCtx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

    offscreenCanvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("image", blob, "frame.jpg");

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            if (!data.detections) return;

            
            drawDetections(data.detections);

        } catch (err) {
            console.error("Error en la petición:", err);
        }
    }, "image/jpeg");
}

function drawDetections(detections) {
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    ctx.lineWidth = 3;
    ctx.font = "bold 16px Arial";
    ctx.strokeStyle = "#ff0000"; 
    ctx.fillStyle = "#ff0000";

    detections.forEach(d => {
        const w = d.x2 - d.x1;
        const h = d.y2 - d.y1;

        
        ctx.strokeRect(d.x1, d.y1, w, h);
        
        
        ctx.fillText(
            `${d.cls} ${(d.conf * 100).toFixed(0)}%`,
            d.x1,
            d.y1 - 7
        );
    });
}

startCamera();
setInterval(sendFrame, 200);