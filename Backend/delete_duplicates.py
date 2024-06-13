import os

processed_folder = "C:/Projects/Testing/datasets_og/labels/train"
compared_folder = "C:/Projects/Testing/licenta_annotation/dataset/labels/val"

warehouse_files = set(
    os.path.splitext(filename)[0] for filename in os.listdir(compared_folder)
)

for filename in os.listdir(processed_folder):
    file_root, file_ext = os.path.splitext(filename)
    if file_root in warehouse_files:
        file_path = os.path.join(processed_folder, filename)
        os.remove(file_path)
        print(f"Deleted {filename} from {processed_folder}")

print("Deletion process completed.")
