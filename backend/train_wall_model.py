import cv2
import os
import numpy as np
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from joblib import dump

def extract_features(image_path):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (100, 100))
    
    # Convert to HSV and compute histogram
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist([hsv], [0, 1, 2], None, [8, 8, 8],
                        [0, 180, 0, 256, 0, 256])
    hist = cv2.normalize(hist, hist).flatten()
    return hist

data = []
labels = []

base_path = "C:\\Users\\HP\\OneDrive\\Documents\\MERN\\E-Commerce for HoloDecor\\backend\\wall_dataset"

for label, folder in enumerate(['walls', 'non_walls']):
    folder_path = os.path.join(base_path, folder)
    for filename in os.listdir(folder_path):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            path = os.path.join(folder_path, filename)
            features = extract_features(path)
            data.append(features)
            labels.append(label)

# Train a classifier
X_train, X_test, y_train, y_test = train_test_split(data, labels, test_size=0.2, random_state=42)
clf = SVC(kernel='linear', probability=True)
clf.fit(X_train, y_train)

# Evaluate
print(classification_report(y_test, clf.predict(X_test)))

# Save the model
dump(clf, 'wall_detector_model.joblib')