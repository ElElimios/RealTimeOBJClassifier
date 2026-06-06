Real-Time Object Classifier 
This project is a computer vision web application designed to detect objects in real time using the user's webcam. It features a decoupled architecture optimized to deliver the lowest possible latency on free-tier server environments.

---Project Architecture---
-Backend (Hugging Face Spaces): A Flask-based API that receives optimized images, runs the YOLOv8 nano model limited to a single CPU thread (to prevent server saturation), and returns object coordinates along with their detection labels.

-Frontend (Vercel): A modern web interface built with HTML, CSS, and JavaScript. It captures the video stream, processes frames using an in-memory offscreen canvas to drastically reduce bandwidth usage, and dynamically scales coordinates to draw bounding boxes accurately on the screen.

NOTE: THIS MODEL STILL NEEDS SOME OPTIMIZATION BUT I WANTED TO TRY AND WORK WITH IT. I HOPE YOU LIKE IT.



 -------------------------Detectable Classes (80 COCO Classes)
The model comes pre-trained on the COCO dataset and can recognize the following objects organized by category:
------ People & Vehicles
Person
Bicycle
Car
Motorcycle
Airplane
Bus
Train
Truck
Boat
🐕 Animals
Bird
Cat
Dog
Horse
Sheep
Cow
Elephant
Bear
Zebra
Giraffe
------ Accessories & Everyday Items
Backpack
Umbrella
Handbag
Tie
Suitcase
Book
Clock
Vase
Scissors
Teddy bear
Hair drier
Toothbrush
------ Sports & Entertainment
Frisbee
Skis
Snowboard
Sports ball
Kite
Baseball bat
Baseball glove
Skateboard
Surfboard
Tennis racket
------ Electronics & Furniture
Chair
Couch
Potted plant
Bed
Dining table
Toilet
TV
Laptop
Mouse
Remote
Keyboard
Cell phone
------ Kitchen & Utensils
Bottle
Wine glass
Cup
Fork
Knife
Spoon
Bowl
Microwave
Oven
Toaster
Sink
Refrigerator
------ Food
Banana
Apple
Sandwich
Orange
Broccoli
Carrot
Hot dog
Pizza
Donut
Cake
------ Street Objects
Traffic light
Fire hydrant
Stop sign
Parking meter
Bench
