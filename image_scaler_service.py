import hashlib
import os

import cv2
from dotenv import load_dotenv

load_dotenv()


def downscale_image(input_image_path: str, scaled_image_path: str, target_width: int, target_height: int):
    img = cv2.imread(input_image_path)
    height, width = img.shape[:2]
    if width > target_width or height > target_height:
        resized_img = cv2.resize(img, (target_width, target_height), interpolation=cv2.INTER_LANCZOS4)
        cv2.imwrite(scaled_image_path, resized_img)
        print(f'Successfully saved the scaled image {os.path.basename(scaled_image_path)}')


def downscale_images_from_folder(input_folder_path: str, output_folder_path: str, target_width: int,
                                 target_height: int):
    for filename in os.listdir(input_folder_path):
        if filename.endswith(('.jpg', '.jpeg', '.png')):
            input_image_path = os.path.join(input_folder_path, filename)
            image_file_name, image_file_extension = os.path.splitext(os.path.basename(input_image_path))
            hashed_image_name = hashlib.sha256(image_file_name.encode()).hexdigest() + image_file_extension
            output_image_path = os.path.join(output_folder_path, hashed_image_name)
            downscale_image(input_image_path, output_image_path, target_width, target_height)


downscale_images_from_folder(os.getenv('DEFAULT_INPUT_FOLDER_PATH'), os.getenv('DEFAULT_OUTPUT_FOLDER_PATH'),
                             int(os.getenv('IMAGE_DOWNSCALE_WIDTH')), int(os.getenv('IMAGE_DOWNSCALE_HEIGHT')))
