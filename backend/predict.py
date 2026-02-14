import sys
import json
import joblib
import numpy as np
import os

BASE_PATH = os.path.dirname(os.path.abspath(__file__))
MODELS_PATH = os.path.join(BASE_PATH, '..', 'ml', 'models')

hiring_clf = joblib.load(os.path.join(MODELS_PATH, 'hiring_classifier.pkl'))
match_reg = joblib.load(os.path.join(MODELS_PATH, 'match_regressor.pkl'))
scaler_exp = joblib.load(os.path.join(MODELS_PATH, 'experience_scaler.pkl'))
tfidf = joblib.load(os.path.join(MODELS_PATH, 'tfidf_vectorizer.pkl'))

def get_prediction(item):
    candidate_skills = item['candidate_skills']
    job_skills = item['job_skills']
    experience_years = item['experience_years']
    reputation_score = item.get('reputation_score', 80)

    candidate_vec = tfidf.transform([candidate_skills])
    job_vec = tfidf.transform([job_skills])
    skills_match = np.sum(candidate_vec.multiply(job_vec).toarray(), axis=1).reshape(-1, 1)
    
    experience = np.array([[experience_years]])
    experience_scaled = scaler_exp.transform(experience)
    X = np.hstack([skills_match, experience_scaled])

    raw_hiring_prob = float(hiring_clf.predict_proba(X)[0][1]) * 100
    match_score = float(match_reg.predict(X)[0])

    adjusted_hiring_prob = (raw_hiring_prob * 0.6) + (match_score * 0.2) + (reputation_score * 0.2)
    adjusted_hiring_prob = min(max(adjusted_hiring_prob, 0), 100)

    return {
        "match_score": round(match_score, 2),
        "hiring_probability": round(adjusted_hiring_prob, 2),
        "company_reputation": reputation_score
    }

input_data = json.load(sys.stdin)

if isinstance(input_data, list):
    results = [get_prediction(item) for item in input_data]
    print(json.dumps(results))
else:
    print(json.dumps(get_prediction(input_data)))