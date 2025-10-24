from pathlib import Path
import json
import os
from django.conf import settings

class UserPrediction:
    def __init__(self, user, match_id, predicted_home_score, predicted_away_score):
        if not all([user, match_id, predicted_home_score, predicted_away_score]):
            raise ValueError("All fields are required")
        
        self.user = user
        self.match_id = int(match_id)
        self.predicted_home_score = int(predicted_home_score)
        self.predicted_away_score = int(predicted_away_score)

    def save_prediction(self):
        prediction_file = Path(settings.BASE_DIR) / "matches" / "matches_data" / "user_predictions.json"
        
        if os.path.exists(prediction_file):
            with open(prediction_file, "r") as f:
                try:
                    predictions = json.load(f)
                except json.JSONDecodeError:
                    predictions = []
        else:
            predictions = []

        for pred in predictions:
            if pred["user"] == self.user and pred["match_id"] == self.match_id:
                raise ValueError("Prediction for this user and match already exists")

        new_prediction = {
            "user": self.user,
            "match_id": self.match_id,
            "predicted_home_score": self.predicted_home_score,
            "predicted_away_score": self.predicted_away_score
        }
        predictions.append(new_prediction)
        
        with open(prediction_file, "w") as f:
            json.dump(predictions, f, indent=2)
        
        return new_prediction

    @classmethod
    def get_user_predictions(cls, username):
        prediction_file = Path(settings.BASE_DIR) / "matches" / "matches_data" / "user_predictions.json"
        
        if not prediction_file.exists():
            return []
            
        with open(prediction_file, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                return []
        
        return [pred for pred in data if pred.get("user") == username]

    @classmethod
    def get_all_predictions(cls):
        prediction_file = Path(settings.BASE_DIR) / "matches" / "matches_data" / "user_predictions.json"
        
        if not prediction_file.exists():
            return []
            
        with open(prediction_file, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []


class Match:
    def __init__(self, id, home_team, away_team, home_score, away_score , date):
        self.id = id
        self.home_team = home_team
        self.away_team = away_team
        self.home_score = home_score
        self.away_score = away_score
        self.date = date

    @classmethod
    def get_all_matches(cls):
        matches_file = Path(settings.BASE_DIR) / "matches" / "matches_data" / "matches_scores.json"
        
        if not matches_file.exists():
            return []
            
        with open(matches_file, "r") as f:
            try:
                data = json.load(f)
                return [cls(**match) for match in data]
            except json.JSONDecodeError:
                return []
    @classmethod
    def get_match_by_date(cls, date):
        matches = cls.get_all_matches()
        return [match for match in matches if match.date == date]