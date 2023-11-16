import cv2

# Load the pre-trained Haar cascades for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Load the video file
video_path = 'path_to_your_video_file.mp4'
cap = cv2.VideoCapture(video_path)

# Create a window to display the output
cv2.namedWindow('Face Recognition', cv2.WINDOW_NORMAL)

# Loop through each frame in the video
while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Convert the frame to grayscale for face detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces in the frame
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    # Draw rectangles around the faces and display statistics
    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
        cv2.putText(frame, 'Face', (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)

    # Display the original feed and the processed feed side by side
    combined_frame = cv2.hconcat([frame, cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)])
    cv2.imshow('Face Recognition', combined_frame)

    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the capture and destroy all windows
cap.release()
cv2.destroyAllWindows()
