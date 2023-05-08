import cv2
import urllib.request
import numpy as np
import json
import urllib.parse
# import tkinter as tk
# from tkinter import filedialog
import sys
from urllib.parse import urlparse
import traceback


# thres = 0.45 # Threshold to detect object

classNames = []
classFile = r'./obj_file/coco.names'
with open(classFile,"rt") as f:
    classNames = f.read().rstrip("\n").split("\n")

configPath = r'./obj_file/ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt'
weightsPath = r'./obj_file/frozen_inference_graph.pb'

net = cv2.dnn_DetectionModel(weightsPath,configPath)
net.setInputSize(320,320)
net.setInputScale(1.0/ 127.5)
net.setInputMean((127.5, 127.5, 127.5))
net.setInputSwapRB(True)

def getObjects(img, thres, nms, draw=True, objects=[]):
    classIds, confs, bbox = net.detect(img,confThreshold=thres,nmsThreshold=nms)

    if len(objects) == 0: objects = classNames
    objectInfo =[]

    if len(classIds) != 0:
        for classId, confidence,box in zip(classIds.flatten(),confs.flatten(),bbox):
            className = classNames[classId - 1]
            if className in objects:
                objectInfo.append([box,className])
                # print(objectInfo)
                print(f"{className}: {confidence}")
                if (draw):
                    cv2.rectangle(img,box,color=(0,255,0),thickness=2)
                    cv2.putText(img,f"{classNames[classId-1].upper()} {round(confidence*100,2)}%",
                    (box[0]+10,box[1]+30),
                    cv2.FONT_HERSHEY_COMPLEX,1,(0,255,0),2)

    return img,objectInfo


if __name__ == "__main__":

    # Load image
    # root = tk.Tk()
    # root.withdraw()

    # Open a file dialog box to select an image file
    # file_path = filedialog.askopenfilename(title="Select Image File",
    #                                     filetypes=(("Image Files", "*.jpg;*.jpeg;*.png"), ("All files", "*.*")))

    # Read the selected image using cv2.imread()
    # img = cv2.imread(file_path)
    
    # Load image from URL
    # url = "https://www.sciencenews.org/wp-content/uploads/2019/10/110919_review_feat-1028x579.jpg"
    # url = 'https://petconnect.sgp1.digitaloceanspaces.com/development/advt_images/92e8520f-1b68-4261-8023-8a9c5a3b9f91-CompressJPEG.online_512x512_image.jpeg'
    # url_str = '["https://petconnect.sgp1.digitaloceanspaces.com/development/advt_images/92e8520f-1b68-4261-8023-8a9c5a3b9f91-CompressJPEG.online_512x512_image.jpeg"]'
    url = sys.argv[1] 
    with open('./js_json/url.txt', 'w') as file:
    # Write the value of url to the file
        file.write(url)   
    parsed_url = urlparse(url)
    try:
        if not all([parsed_url.scheme, parsed_url.netloc]):
            raise ValueError("Invalid URL: {}".format(url))
        else:
            pass
    except Exception as e:
    # Print the full traceback
        traceback.print_exc()
    # print(url)
    # encode any special characters in the URL
    # encoded_url = urllib.parse.quote(url_str, safe=':/')
    # url_list = json.loads(json.dumps(url))

    with urllib.request.urlopen(url) as url_response:
        s = url_response.read()
    arr = np.asarray(bytearray(s), dtype=np.uint8)
    img = cv2.imdecode(arr, -1)

    # for encoded_url in url_str:
    #     # print("i am executing")
    #     try:
    #         print("i am executing:try")
    #         with urllib.request.urlopen(encoded_url) as url_response:
    #             print("i am executing: Inside try")
    #             s = url_response.read()
    #         arr = np.asarray(bytearray(s), dtype=np.uint8)
    #         img = cv2.imdecode(arr, -1)
    #         print("below img")
    #     except Exception as e:
    #         print("i am expect: inside e")
    #         print(encoded_urls)
    #         print(f"Error fetching URL: {e}")
    #         sys.exit(1)

    # Remove alpha channel if present
    if img.shape[-1] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
    else:
        pass
    # Resize image to fit screen
    img = cv2.resize(img, (640, 480))

    result, objectInfo = getObjects(img,0.45,0.2)
    # print(objectInfo)
    # cv2.imshow("Output",img)
    cv2.waitKey(0)
