import pickle
import pandas as pd

# Load the trained Scikit-Learn Random Forest model
with open("models/campushire_random_forest.pkl", "rb") as f:
    rf_model = pickle.load(f)

# Define a diverse set of student test cases
students = [
    {
        "Candidate": "1. Top Tier Achiever (High CGPA, Projects, Aptitude)",
        "CGPA": 9.2,
        "Internships": 2,
        "Projects": 3,
        "Workshops/Certifications": 2,
        "AptitudeTestScore": 92,
        "SoftSkillsRating": 4.8,
        "ExtracurricularActivities": 1,
        "PlacementTraining": 1,
        "SSC_Marks": 92,
        "HSC_Marks": 90
    },
    {
        "Candidate": "2. Competitive Tech Profile (Balanced Academics & Projects)",
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
    },
    {
        "Candidate": "3. Average Candidate (Moderate Aptitude, 1 Project)",
        "CGPA": 7.1,
        "Internships": 0,
        "Projects": 1,
        "Workshops/Certifications": 1,
        "AptitudeTestScore": 68,
        "SoftSkillsRating": 3.4,
        "ExtracurricularActivities": 0,
        "PlacementTraining": 1,
        "SSC_Marks": 68,
        "HSC_Marks": 65
    },
    {
        "Candidate": "4. At-Risk Candidate (Low Aptitude, Minimal Experience)",
        "CGPA": 5.9,
        "Internships": 0,
        "Projects": 0,
        "Workshops/Certifications": 0,
        "AptitudeTestScore": 48,
        "SoftSkillsRating": 2.5,
        "ExtracurricularActivities": 0,
        "PlacementTraining": 0,
        "SSC_Marks": 52,
        "HSC_Marks": 50
    }
]

df = pd.DataFrame(students)
candidate_names = df.pop("Candidate")

predictions = rf_model.predict(df)
probabilities = rf_model.predict_proba(df)[:, 1]

print("=" * 70)
print(f" CAMPUSHIRE RANDOM FOREST CLASSIFIER - BATCH INFERENCE RUN ")
print(f" Ensemble Size: {len(rf_model.estimators_)} Decision Trees | Model: Scikit-Learn 1.6+")
print("=" * 70)

for name, pred, prob in zip(candidate_names, predictions, probabilities):
    status = "PLACED [PASS]" if pred == 1 else "NOT PLACED [AT-RISK]"
    tier = (
        "Tier 1 (Dream 8-15 LPA)" if prob >= 0.75 else
        "Tier 2 (Core 5-8 LPA)" if prob >= 0.55 else
        "Tier 3 (Mass Recruiters 3.5-5 LPA)" if prob >= 0.40 else
        "At-Risk (Intervention Needed)"
    )
    print(f"\n{name}")
    print(f"  Result:      {status}")
    print(f"  Probability: {prob * 100:.2f}%")
    print(f"  Target Tier: {tier}")

print("\n" + "=" * 70)
print(" Top Feature Importances in Random Forest:")
for feature, imp in sorted(zip(df.columns, rf_model.feature_importances_), key=lambda x: x[1], reverse=True)[:5]:
    print(f"  - {feature:25s}: {imp * 100:.2f}%")
print("=" * 70)
