import os
import json
import requests
from PIL import Image
from io import BytesIO

# Define the directory containing JSON files
PLACES_DIR = "PLACES"

def download_and_process_images():
    ua = "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0"

    # Loop through all files in the directory
    for filename in os.listdir(PLACES_DIR):
        if filename.endswith(".json") and filename[:-5].isdigit():
            file_path = os.path.join(PLACES_DIR, filename)
            
            # Read the JSON file
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)

            # Process the 'img' field if it exists
            if 'img' in data and isinstance(data['img'], list):
                processed_images = []

                for img_url in data['img']:
                    try:
                        # Download the image
                        headers = {'User-Agent': ua}
                        response = requests.get(img_url, headers=headers)
                        response.raise_for_status()

                        # Load the image with PIL
                        image = Image.open(BytesIO(response.content))
                        width, height = image.size
                        print(f"Processed {img_url}")

                        # Add image details to the processed list
                        processed_images.append({
                            "src": img_url,
                            "width": width,
                            "height": height
                        })
                    except Exception as e:
                        print(f"Error processing image {img_url}: {e}")

                # Replace the 'img' field in the JSON data
                data['img'] = processed_images

                # Save the updated JSON data back to the file
                with open(file_path, 'w', encoding='utf-8') as file:
                    json.dump(data, file, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    download_and_process_images()