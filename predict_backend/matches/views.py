from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.conf import settings
from pathlib import Path
from rest_framework.views import APIView
from django.http import HttpResponse
import json
import os
from .models import Match
from .models import UserPrediction 


@api_view(['GET'])
def matches(request):
    date = request.GET.get('date')
    
    matches = Match.get_all_matches()
    matches_data = [
        {
            "id": match.id,
            "home_team": match.home_team,
            "away_team": match.away_team,
            "home_score": match.home_score,
            "away_score": match.away_score,
            "date": match.date 
        }
        for match in matches
    ]
    if date:
        filtered_matches = [match for match in matches_data if match["date"] == date]
        return JsonResponse(filtered_matches, safe=False)
    else:
        return JsonResponse(matches_data, safe=False)

class PredictionsView(APIView):
    def get(self, request, username=None):
        if not username:
            return JsonResponse({"error": "Username is required for GET requests"}, status=400)
        
        user_predictions = UserPrediction.get_user_predictions(username)
        
        if not user_predictions:
            return JsonResponse({"message": "No predictions found for this user"}, status=404)

        return JsonResponse(user_predictions, safe=False)

    def post(self, request):
        user = request.data.get("user")    
        match_id = request.data.get("match_id")
        predicted_home_score = request.data.get("predicted_home_score")
        predicted_away_score = request.data.get("predicted_away_score")

        if not all([user, match_id, predicted_home_score, predicted_away_score]):
            return Response({"error": "Missing fields"}, status=400)

        try:
            prediction = UserPrediction(user, match_id, predicted_home_score, predicted_away_score)
            prediction.save_prediction()
            return Response({"message": "Prediction saved successfully!"}, status=201)
            
        except ValueError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            return Response({"error": "An unexpected error occurred"}, status=500)


@api_view(['GET'])
def leaderboard(request):
    matches_scores = Path(settings.BASE_DIR) / "matches" / "matches_data" / "matches_scores.json"

    if not matches_scores.exists():
        return JsonResponse({"error": "Match scores file not found"}, status=404)

    user_data = UserPrediction.get_all_predictions()

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