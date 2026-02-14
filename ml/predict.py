import joblib
import numpy as np

hiring_clf = joblib.load('models/hiring_classifier.pkl')
match_reg = joblib.load('models/match_regressor.pkl')
scaler_exp = joblib.load('models/experience_scaler.pkl')
tfidf = joblib.load('models/tfidf_vectorizer.pkl')

def predict_hiring_and_match(candidate_skills, job_skills, experience_years):
    candidate_vec = tfidf.transform([candidate_skills])
    job_vec = tfidf.transform([job_skills])
    skills_match = np.mean(candidate_vec.multiply(job_vec).toarray(), axis=1).reshape(-1, 1)

    experience = np.array([[experience_years]])
    experience_scaled = scaler_exp.transform(experience)

    X = np.hstack([skills_match, experience_scaled])

    hiring_prob = hiring_clf.predict_proba(X)[0][1] * 100
    match_score = match_reg.predict(X)[0]

    return {
        'hiring_probability': round(hiring_prob, 2),
        'match_score': round(match_score, 2)
    }

def rank_top_candidates(candidates_list, job_skills):
    ranked = []
    for cand in candidates_list:
        pred = predict_hiring_and_match(
            cand['skills'],
            job_skills,
            cand['experience_years']
        )
        ranked.append({
            'candidate_id': cand['id'],
            'name': cand.get('name', 'Unknown'),
            'hiring_prob': pred['hiring_probability'],
            'match_score': pred['match_score'],
            'skills': cand['skills']
        })
    ranked.sort(key=lambda x: x['match_score'], reverse=True)
    return ranked[:10]

if __name__ == "__main__":
    result = predict_hiring_and_match(
        candidate_skills="Python, Machine Learning, SQL",
        job_skills="Python, Data Science, ML",
        experience_years=5
    )
    print("Single Prediction:", result)

    candidates = [
        {'id': 1, 'skills': "Python, SQL", 'experience_years': 3},
        {'id': 2, 'skills': "Python, ML, TensorFlow", 'experience_years': 7},
        {'id': 3, 'skills': "Java, Spring", 'experience_years': 2}
    ]
    top_cands = rank_top_candidates(candidates, "Python, Data Science, ML")
    print("Top Candidates:", top_cands)