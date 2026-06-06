const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const API_URL = "https://elelimios-real-time-object-classifier.hf.space/detect";

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Error al acceder a la cámara o permiso denegado:", err);
    }
}

async function sendFrame() {
    
    if (video.readyState !== 4) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("image", blob, "frame.jpg");

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (!data.detections) {
                console.error("Backend error:", data);
                return;
            }

            drawDetections(data.detections);

        } catch (err) {
            console.error("Error en la petición al backend:", err);
        }
    }, "image/jpeg");
}

function drawDetections(detections) {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.font = "16px Arial";
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";

    detections.forEach(d => {
        const w = d.x2 - d.x1;
        const h = d.y2 - d.y1;

        ctx.strokeRect(d.x1, d.y1, w, h);
        ctx.fillText(
            `Clase ${d.cls} ${(d.conf * 100).toFixed(0)}%`,
            d.x1,
            d.y1 - 5
        );
    });
}


startCamera();

// Enviar el frame al backend cada 200ms
setInterval(sendFrame, 200);