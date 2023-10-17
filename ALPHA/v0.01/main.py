import cv2
import numpy as np
from collections import Counter
from sklearn.cluster import KMeans
import os
import random
from webcolors import CSS3_HEX_TO_NAMES, hex_to_rgb, rgb_to_name

# Load the image
image_folder = 'images'

# Check if folder exists
if not os.path.exists(image_folder):
    print("Folder does not exist")
    exit()
    
image_extensions = ['.jpg', '.png', '.jpeg']

# Function to find closest color name
def find_closest_color(rgb_color):
    min_color_diff = float('inf')
    closest_color = None
    for hex_color, name in CSS3_HEX_TO_NAMES.items():
        color_rgb = hex_to_rgb(hex_color)
        color_diff = sum((abs(a-b) for a, b in zip(rgb_color, color_rgb)))
        if color_diff < min_color_diff:
            min_color_diff = color_diff
            closest_color = name
    
    return closest_color

def detectFace(image_path):
    
    # Load the image        
    image = cv2.imread(image_path)
            
    # Check if the image contains a face
    face_cascade=cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier('haarcascade_eye.xml')
    mouth_cascade = cv2.CascadeClassifier('haarcascade_mcs_mouth.xml')
    grey = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(image, 1.4, 4)
    eyes = eye_cascade.detectMultiScale(grey, 1.3, 5)
    mouth = mouth_cascade.detectMultiScale(grey, 1.5, 11)
                                    
    if ((len(faces) and len(eyes)) or ((len(faces) and len(mouth))) or ((len(eyes) and len(mouth))) or ((len(faces) and len(mouth) and len(eyes)))) > 0:
        return "Yes"
    else:
        return "No"
        
def rgbPercentage(image_path, image_two_path, color):
    
    # Load the image        
    image1 = cv2.imread(image_path)
    image2 = cv2.imread(image_two_path)
    
    # Calculate the percentage of R, G and B in the image
    image1_total_pixels = image1.shape[0] * image1.shape[1]
    image1_blue_percent = (np.sum(image1[:, :, 0]) / 255) / image1_total_pixels * 100
    image1_green_percent = (np.sum(image1[:, :, 1]) / 255) / image1_total_pixels * 100
    image1_red_percent = (np.sum(image1[:, :, 2]) / 255) / image1_total_pixels * 100
    
    image2_total_pixels = image2.shape[0] * image2.shape[1]
    image2_blue_percent = (np.sum(image2[:, :, 0]) / 255) / image2_total_pixels * 100
    image2_green_percent = (np.sum(image2[:, :, 1]) / 255) / image2_total_pixels * 100
    image2_red_percent = (np.sum(image2[:, :, 2]) / 255) / image2_total_pixels * 100
    
    if (color == "red"):
        return image1_red_percent, image2_red_percent, image_path, image_two_path
    elif (color == "green"):
        return image1_green_percent, image2_green_percent, image_path, image_two_path
    elif (color == "blue"):
        return image1_blue_percent, image2_blue_percent, image_path, image_two_path
    else:
        return "Invalid color"
    
    
def closestColor(image_path):
        
    # Load the image        
    image = cv2.imread(image_path)
    
    # Find the most prominent color in the image
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = image.reshape((image.shape[0] * image.shape[1], 3))
            
    kmeans = KMeans(n_clusters = 1, n_init=10).fit(image)
    prominent_color = kmeans.cluster_centers_.astype(int)[0]
            
    closest_color_name = find_closest_color(prominent_color)
    
    return closest_color_name

def imageFolderIterator(image_folder):
    
    image_files = []
    
    # Loop through images in folder
    for root, dirs, files in os.walk(image_folder):
        for file in files:
            if any(file.lower().endswith(ext) for ext in image_extensions):
                image_path = os.path.join(root, file)
                image_files.append(image_path)
    
    return image_files

def playGame(images):
    
    game_modes = [rgbPercentage, closestColor, detectFace]
    selected_game_mode = random.choice(game_modes)
    
    
    if (selected_game_mode == detectFace):
        random_image1 = random.choice(images)
        random_image2 = random.choice(images)
            
        image1_results = detectFace(random_image1)
        image2_results = detectFace(random_image2)
        answers = ["Face Detection", "Object Detection", "Color Detection"]
        correct_answer = "Face Detection"
            
        print(f"Image 1 - {random_image1}: {image1_results} \t\t Image 2 {random_image2}: {image2_results}")
        print(f"What Analysis was performed on the images?")
        print(f"1. Face Detection")
        print(f"2. Object Detection")
        print(f"3. Color Detection")
        response = int(input(">> "))
        
        if (response == 1):
            print("Correct!")
        elif (response == 2):
            print("Incorrect!")
            print(f"The correct answer was {correct_answer}")
        elif (response == 3):
            print("Incorrect!")
            print(f"The correct answer was {correct_answer}")
        else:
            print("Invalid response")
            
        playGame(images)
    
    elif (selected_game_mode == rgbPercentage):
        
        colors = ["red", "green", "blue"]
        random_color = random.choice(colors)
        
        random_image1 = random.choice(images)
        random_image2 = random.choice(images)
            
        results = rgbPercentage(random_image1, random_image2, random_color)
        answers = ["Percentage of Red in the image", "Percentage of Green in the image", "Percentage of Blue in the image"]
            
        print(f"Image 1 {random_image1}: {round(results[0])}% \t\t Image 2 {random_image2}: {round(results[1])}%")
        print(f"What Color Percentage was calculated?")
        print(f"1. Percentage of Red in the image")
        print(f"2. Percentage of Green in the image")
        print(f"3. Percentage of Blue in the image")
        response = int(input(">> "))
        
        if (random_color == "red"):
            correct_answer = "Percentage of Red in the image"
        elif (random_color == "green"):
            correct_answer = "Percentage of Green in the image"
        else:
            correct_answer = "Percentage of Blue in the image"
        
        if (response == 1):
            response = "Percentage of Red in the image"
        elif (response == 2):
            response = "Percentage of Green in the image"
        elif (response == 3):
            response = "Percentage of Blue in the image"
        else:
            print("Invalid response")
            playGame(images)
        
        if (random_color == "red" and response == "Percentage of Red in the image"):
            print("Correct!")
        
        elif (random_color == "blue" and response == "Percentage of Blue in the image"):
            print("Correct!")
        
        elif (random_color == "green" and response == "Percentage of Green in the image"):
            print("Correct!")
        
        else:
            print("Incorrect!")
            print(f"The correct answer was {correct_answer}")
            
        playGame(images)
    
    elif (selected_game_mode == closestColor):
        
        random_image1 = random.choice(images)
        random_image2 = random.choice(images)
            
        image1_results = closestColor(random_image1)
        image2_results = closestColor(random_image2)
        answers = ["Most Common Color", "Least Common Color"]
            
        print(f"Image 1 {random_image1}: {image1_results} \t\t Image 2 {random_image2}: {image2_results}")
        print(f"What Analysis was performed on the images?")
        print(f"1. {answers[0]}")
        print(f"2. {answers[1]}")
        response = int(input(">> "))
        
        if response == 1:
            print("Correct!")
        elif response == 2:
            print("Incorrect!")
            print(f"The correct answer was {answers[0]}")
        else:
            print("Invalid response")

        playGame(images)
    

def gameRunner():
    
    images = imageFolderIterator(image_folder)
    
    print("Press 1 to play the game")
    print("Press 2 to quit the game")
    response = int(input(">> "))
    
    if (response == 1):
        playGame(images)
    elif (response == 2):
        exit()
    else:
        print("Invalid response")
        gameRunner()
            
def main():
    
    print("\tAlgoPic\t")
    print("\t=======\t")
    print()
    gameRunner()
    
if __name__ == "__main__":
    main()