const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const checklistUI = document.getElementById("checklist");
const counterUI = document.getElementById("discovered-count");

const offscreenCanvas = document.createElement("canvas");
const offscreenCtx = offscreenCanvas.getContext("2d");

const API_URL = "https://elelimios-real-time-object-classifier.hf.space/detect";
const SEND_WIDTH = 320;
const SEND_HEIGHT = 240;

// 🎯 Set global para almacenar las clases descubiertas sin duplicados
const discoveredClasses = new Set();

// 🏷️ Las 80 clases oficiales del dataset COCO de YOLO
const cocoClasses = [
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
    "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe",
    "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard",
    "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket",
    "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
    "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake",
    "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop",
    "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink",
    "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"
];

// 🛠️ Generar la lista visual en el panel lateral al cargar la app
function initChecklist() {
    // Ordenamos alfabéticamente para que sea fácil de buscar por el usuario
    const sortedClasses = [...cocoClasses].sort();
    
    sortedClasses.forEach(className => {
        const li = document.createElement("li");
        li.textContent = className;
        // Le asignamos un ID plano para identificarlo rápido en el DOM (removiendo espacios)
        li.id = `class-${className.replace(" ", "-")}`;
        checklistUI.appendChild(li);
    });
}

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
        }, "image/jpeg", 0.4); 
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
                    // 🎯 Analizar qué objetos nuevos se detectaron en este frame
                    checkNewDiscoveries(data.detections);
                }
            } catch (err) {
                console.error("Error en la petición:", err);
            }
        }
    }
    setTimeout(detectionLoop, 60);
}

// 🎯 Revisa las detecciones y marca las nuevas estampitas encontradas
function checkNewDiscoveries(detections) {
    detections.forEach(d => {
        const name = d.cls;
        
        // Si el objeto pertenece a la lista y no lo habíamos descubierto antes
        if (cocoClasses.includes(name) && !discoveredClasses.has(name)) {
            discoveredClasses.add(name);
            
            // Actualizamos el contador numérico en la pantalla
            counterUI.textContent = discoveredClasses.size;
            
            // Buscamos el elemento LI en la interfaz y le metemos la clase CSS animada
            const elementId = `class-${name.replace(" ", "-")}`;
            const itemElement = document.getElementById(elementId);
            if (itemElement) {
                itemElement.classList.add("discovered");
            }
        }
    });
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
        ctx.fillText(`${d.cls} ${(d.conf * 100).toFixed(0)}%`, x1, y1 - 7);
    });
}

// Arrancar todo ordenadamente
initChecklist();
startCamera().then(() => {
    detectionLoop();
});