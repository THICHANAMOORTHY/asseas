import pickle
import pandas as pd

with open("models/campushire_random_forest.pkl", "rb") as f:
    rf_model = pickle.load(f)

student_df = pd.DataFrame([{
    "CGPA": 8.2,
    "Internships": 1,
    "Projects": 2,
    "Workshops/Certifications": 1,
    "AptitudeTestScore": 78,
    "SoftSkillsRating": 4.0,
    "ExtracurricularActivities": 1,
    "PlacementTraining": 1,
    "SSC_Marks": 85,
    "HSC_Marks": 82
}])

prediction = rf_model.predict(student_df)[0]
probability = rf_model.predict_proba(student_df)[0][1]

print("=== RANDOM FOREST MODEL OUTPUT ===")
print(f"Placement Prediction: {'Placed' if prediction == 1 else 'Not Placed'}")
print(f"Random Forest Probability: {probability * 100:.2f}%")
print(f"Total Decision Trees in Forest: {len(rf_model.estimators_)}")
