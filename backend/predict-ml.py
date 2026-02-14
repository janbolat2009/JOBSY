import sys
import json
import joblib
import numpy as np

hiring_clf = joblib.load('models/hiring_classifier.pkl')
match_reg = joblib.load('models/match_regressor.pkl')
scaler_exp = joblib.load('models/experience_scaler.pkl')
tfidf = joblib.load('models/tfidf_vectorizer.pkl')

data = json.load(sys.stdin)
candidate_skills = data.get('candidate_skills', 'generic_skills')
job_skills = data.get('job_skills', 'generic_job')
experience_years = data.get('experience_years', 0)

candidate_vec = tfidf.transform([candidate_skills])
job_vec = tfidf.transform([job_skills])
skills_match = np.mean(candidate_vec.multiply(job_vec).toarray(), axis=1).reshape(-1, 1)
experience = np.array([[experience_years]])
experience_scaled = scaler_exp.transform(experience)
X = np.hstack([skills_match, experience_scaled])

hiring_prob = hiring_clf.predict_proba(X)[0][1] * 100
match_score = match_reg.predict(X)[0]

result = {
    "ml_match_score": round(match_score, 2),
    "ml_hiring_probability": round(hiring_prob, 2)
}

print(json.dumps(result))