import os

# filled storages
# yolo_data = [
#     (0, 0.310793, 0.200910, 0.111183, 0.110533),
#     (3, 0.526333, 0.226918, 0.138492, 0.136541),
#     (2, 0.835013, 0.265930, 0.129714, 0.131339),
#     (3, 0.812581, 0.539662, 0.153121, 0.137841),
#     (3, 0.799902, 0.804291, 0.153121, 0.170351),
#     (0, 0.538036, 0.464889, 0.138492, 0.149545),
#     (0, 0.537061, 0.693758, 0.132640, 0.152146),
#     (2, 0.331762, 0.600130, 0.125813, 0.131339),
#     (2, 0.322984, 0.399220, 0.118010, 0.124837),
# ]

# empty storages
yolo_data = [
    (0, 0.320375, 0.228396, 0.108250, 0.111208),
    (0, 0.551375, 0.257333, 0.126000, 0.127167),
    (0, 0.845375, 0.317917, 0.149000, 0.156917),
    (0, 0.832875, 0.577208, 0.148250, 0.166667),
    (0, 0.552781, 0.492583, 0.138062, 0.135917),
    (0, 0.550938, 0.726604, 0.123062, 0.144458),
    (0, 0.814813, 0.820917, 0.143625, 0.148167),
    (0, 0.345797, 0.625250, 0.107406, 0.127167),
    (0, 0.335188, 0.432646, 0.117687, 0.124708),
]

image_folder = "sampled_images_empty_storage"

annotation_folder = image_folder + "_annotations"
os.makedirs(annotation_folder, exist_ok=True)


def write_annotations(filename, boxes):
    with open(filename, "w") as f:
        for box in boxes:
            class_id, x_center, y_center, box_width, box_height = box
            f.write(f"{class_id} {x_center} {y_center} {box_width} {y_center}\n")


for filename in os.listdir(image_folder):
    if filename.endswith(".jpg") or filename.endswith(".png"):
        base_name = os.path.splitext(filename)[0]
        annotation_path = os.path.join(annotation_folder, base_name + ".txt")
        write_annotations(annotation_path, yolo_data)
        print(f"Annotation file saved to {annotation_path}")
