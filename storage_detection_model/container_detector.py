import os
from typing import List

import cv2
import numpy as np
import yaml
from dotenv import load_dotenv
from ultralytics import YOLO

load_dotenv()


def get_local_config_from_yaml():
    current_directory = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(current_directory, "sdm_config.yaml"), 'r') as file:
        data = yaml.full_load(file)
        ref_matrix = data.get('reference_matrix')
        sim_diff = data.get('similarity_diff')
    return ref_matrix, sim_diff


reference_matrix, similarity_diff = get_local_config_from_yaml()


def coordinates_to_matrix(coordinates: List):
    global reference_matrix
    if len(coordinates) == 0:
        return []
    x_sorted_coordinates = sorted(coordinates, key=lambda x: x[0])
    coord_matrix = fit_matrix_columns(x_sorted_coordinates)

    for index, column in enumerate(coord_matrix):
        coord_matrix[index] = sorted(column, key=lambda coord: coord[1])
    return coord_matrix


def get_missing_storage_spaces(coordinate_matrix: List[List]):
    global similarity_diff
    global reference_matrix
    evidence_matrix = [[0 for _ in range(len(row))] for row in reference_matrix]
    for idx in range(0, len(reference_matrix)):
        for jdx, coord in enumerate(reference_matrix[idx]):
            if not len(coordinate_matrix) <= idx and not len(coordinate_matrix[idx]) <= jdx:
                if abs(coordinate_matrix[idx][jdx][1] - reference_matrix[idx][jdx][1]) < similarity_diff:
                    evidence_matrix[idx][jdx] = 1
                else:
                    for index, point in enumerate(reference_matrix[idx]):
                        if abs(coordinate_matrix[idx][jdx][1] - point[1]) < similarity_diff:
                            evidence_matrix[idx][index] = 1
                            break
    return evidence_matrix


def fit_matrix_columns(sorted_list: List) -> List[List]:
    global similarity_diff
    coordinates_matrix = [[], [], []]
    group_count = 0
    previous_element = sorted_list[0]
    for point in sorted_list:
        if point[0] - previous_element[0] < similarity_diff:
            coordinates_matrix[group_count].append(point)
            previous_element = point
        else:
            group_count += 1
            coordinates_matrix[group_count].append(point)
            previous_element = point
    return coordinates_matrix


def get_object_center_coordinates(x1: float, y1: float, x2: float, y2: float) -> (float, float):
    return (x1 + x2) / 2, (y1 + y2) / 2


def train_container_detector(yolo_model_type: str, number_of_epochs: int):
    model = YOLO(yolo_model_type + '.yaml')
    model.train(data="yolo_config.yaml", epochs=number_of_epochs)


def identify_container_units(model_path: str, image: cv2.typing.MatLike, threshold: float) -> List | List[List]:
    detection_model_used = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                        os.path.join('runs', 'detect', model_path, 'weights', 'last.pt'))
    try:
        trained_model = YOLO(detection_model_used)
    except Exception as e:
        print(e)
        exit(0)
    results = trained_model(image)[0]
    center_of_objects = []
    for result in results.boxes.data.tolist():
        x1, y1, x2, y2, score, class_id = result
        if score > threshold:
            center_of_objects.append(get_object_center_coordinates(x1, y1, x2, y2))
    return coordinates_to_matrix(center_of_objects)


def get_missing_workpiece_count(coordinates_matrix: List[List]) -> int:
    evidence_matrix = get_missing_storage_spaces(coordinates_matrix)
    zeros_in_evidence = np.argwhere(np.array(evidence_matrix) == 0)
    if len(zeros_in_evidence):
        missing_positions = ""
        for idx in zeros_in_evidence:
            missing_positions += f'Column {idx[0] + 1}, Row {idx[1] + 1} | '
        print(f"More than one workpiece missing at:{missing_positions.strip()}")
    return len(zeros_in_evidence)
