from ultralytics import YOLO
import torch


def train_container_detector(
    yolo_model_type: str, number_of_epochs: int, data_yaml_path: str
):
    model = YOLO(f"{yolo_model_type}.yaml")

    if torch.cuda.is_available():
        model.to("cuda")
        print("Using GPU for training")
    else:
        print("GPU not available, using CPU")

    model.train(data=data_yaml_path, epochs=number_of_epochs)
    print(
        f"Training completed for model {yolo_model_type} with {number_of_epochs} epochs."
    )


def main():
    train_container_detector("yolov8m", 100, "config.yaml")


if __name__ == "__main__":
    main()
