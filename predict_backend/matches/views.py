

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.conf import settings
from pathlib import Path
from rest_framework.views import APIView
import json
import os


@api_view(['GET'])
def matches(request):
    json_path = Path(settings.BASE_DIR) / "matches" / "matches_data" / "matches_scores.json"
    with open(json_path, "r") as f:
        data = json.load(f)
    return JsonResponse(data, safe=False)

class PredictionsView(APIView):
    def get(self, request, username=None):
        prediction_file = Path(settings.BASE_DIR) / "matches" / "matches_data" / "user_predictions.json"
        
        if not username:
            return JsonResponse({"error": "Username is required for GET requests"}, status=400)
            
        if not prediction_file.exists():
            return JsonResponse({"error": "Prediction file not found"}, status=404)

        with open(prediction_file, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                return JsonResponse({"error": "Invalid JSON format"}, status=500)

        user_predictions = [p for p in data if p.get("user") == username]

        if not user_predictions:
            return JsonResponse({"message": "No predictions found for this user"}, status=404)

        return JsonResponse(user_predictions, safe=False)

    def post(self, request):
        prediction_file = Path(settings.BASE_DIR) / "matches" / "matches_data" / "user_predictions.json"
        user = request.data.get("user")    
        match_id = request.data.get("match_id")
        predicted_home_score = request.data.get("predicted_home_score")
        predicted_away_score = request.data.get("predicted_away_score")

        if not all([user, match_id, predicted_home_score, predicted_away_score]):
            return Response({"error": "Missing fields"}, status=400)

        if os.path.exists(prediction_file):
            with open(prediction_file, "r") as f:
                try:
                    predictions = json.load(f)
                except json.JSONDecodeError:
                    predictions = []
        else:
            predictions = []

        for pred in predictions:
            if pred["user"] == user and pred["match_id"] == int(match_id):
                return Response({"error": "Prediction for this user and match already exists"}, status=400)
        
        new_prediction = {
            "user": user,
            "match_id": int(match_id),
            "predicted_home_score": int(predicted_home_score),
            "predicted_away_score": int(predicted_away_score)
        }
        predictions.append(new_prediction)
        with open(prediction_file, "w") as f:
            json.dump(predictions, f, indent=2)

        return Response({"message": "Prediction saved successfully!"}, status=201)

@api_view(['GET'])
def leaderboard(request):
    prediction_file_users = Path(settings.BASE_DIR) / "matches" / "matches_data" / "user_predictions.json"
    matches_scores = Path(settings.BASE_DIR) / "matches" / "matches_data" / "matches_scores.json"

    if not prediction_file_users.exists() or not matches_scores.exists():
        return JsonResponse({"error": "Required data files not found"}, status=404)

    with open(prediction_file_users, "r") as f:
        try:
            user_data = json.load(f)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format in user predictions"}, status=500)

    with open(matches_scores, "r") as f:
        try:
            match_data = json.load(f)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format in match scores"}, status=500)

    leaderboard = {}
    
    for user in user_data:
        username = user.get("user")
        predicted_home = user.get("predicted_home_score")
        predicted_away = user.get("predicted_away_score")

        actual_scores = next((m for m in match_data if m.get("id") == user.get("match_id")), None)
        
        if actual_scores:
            actual_home = actual_scores.get("home_score")
            actual_away = actual_scores.get("away_score")
         
            score = 0
            

            if predicted_home == actual_home and predicted_away == actual_away:
                score += 3
            elif (predicted_home - predicted_away) == 0 and (actual_home - actual_away) == 0:
                score += 1
            elif (predicted_home - predicted_away > 0 and actual_home - actual_away > 0) or (predicted_home - predicted_away < 0 and actual_home - actual_away < 0):
                score += 1
            leaderboard[username] = leaderboard.get(username, 0) + score

    sorted_leaderboard = sorted(leaderboard.items(), key=lambda x: x[1], reverse=True)
    return JsonResponse(sorted_leaderboard, safe=False)