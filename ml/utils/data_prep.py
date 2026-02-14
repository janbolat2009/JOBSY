import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os

def load_vacancies():
    dfs = []
    
    linkedin_path = 'data/raw/linkedin-jobs/postings.csv'
    if os.path.exists(linkedin_path):
        try:
            df_li = pd.read_csv(linkedin_path, low_memory=False)
            df_li = df_li.dropna(subset=['description'] if 'description' in df_li.columns else [])
            df_li['job_skills'] = df_li.get('skills', pd.Series([''] * len(df_li))).fillna('').str.lower()
            df_li['job_description'] = df_li.get('description', pd.Series([''] * len(df_li))).fillna('').str.lower()
            df_li['hiring_label'] = 1
            df_li['match_score'] = 50
            df_li['experience_years'] = 0
            df_li['candidate_skills'] = 'generic_skills'
            dfs.append(df_li[['candidate_skills', 'job_skills', 'experience_years', 'hiring_label', 'match_score']])
        except: pass

    hh_path = 'data/raw/headhunter-vacancies/vacancies.csv'
    if os.path.exists(hh_path):
        try:
            df_hh = pd.read_csv(hh_path, low_memory=False)
            df_hh = df_hh.dropna(subset=['description'] if 'description' in df_hh.columns else [])
            df_hh['job_skills'] = df_hh['key_skills'].fillna('').str.lower() if 'key_skills' in df_hh.columns else ''
            df_hh['job_description'] = df_hh['description'].fillna('').str.lower()
            df_hh['hiring_label'] = 1
            df_hh['match_score'] = 50
            
            # Map experience string to years if possible
            def exp_to_years(e):
                if pd.isna(e): return 0
                if 'no experience' in str(e).lower() or 'нет опыта' in str(e).lower(): return 0
                if '1–3' in str(e): return 2
                if '3–6' in str(e): return 4
                if '6+' in str(e) or 'более 6' in str(e).lower(): return 7
                return 0
            
            df_hh['experience_years'] = df_hh['experience'].apply(exp_to_years) if 'experience' in df_hh.columns else 0
            df_hh['candidate_skills'] = 'generic_skills'
            
            # Save for salary calculator
            df_hh.to_parquet('data/processed/salary_data.parquet') if not os.path.exists('data/processed') else None
            if not os.path.exists('data/processed'):
                os.makedirs('data/processed')
                df_hh.to_parquet('data/processed/salary_data.parquet')
            else:
                df_hh.to_parquet('data/processed/salary_data.parquet')

            dfs.append(df_hh[['candidate_skills', 'job_skills', 'experience_years', 'hiring_label', 'match_score']])
        except Exception as e:
            print(f"Error loading HH vacancies: {e}")

    if not dfs:
        return pd.DataFrame(columns=['candidate_skills', 'job_skills', 'experience_years', 'hiring_label', 'match_score'])

    return pd.concat(dfs, ignore_index=True)

def load_and_merge_data(raw_paths):
    vacancies = load_vacancies()
    dfs = [vacancies] if not vacancies.empty else []

    other_paths = [
        'data/raw/predicting-hiring-decisions-in-recruitment-data.csv',
        'data/raw/ai-driven-resume-screening-dataset.csv',
        'data/raw/job-acceptance-prediction-system.csv',
        'data/raw/AI_Resume_Screening.csv',
        'data/raw/job_applicant_dataset.csv',
        'data/raw/resume_data_for_ranking.csv',
        'data/raw/resume_data.csv'
    ]

    for path in other_paths:
        if not os.path.exists(path): continue
        try:
            df = pd.read_csv(path, low_memory=False)
            temp_df = pd.DataFrame(index=df.index)
            
            cand_skills = df.get('skills', df.get('candidate_skills', pd.Series(['generic_skills'] * len(df))))
            temp_df['candidate_skills'] = pd.Series(cand_skills).astype(str)
            
            job_sk = df.get('job_skills', pd.Series(['generic_job'] * len(df)))
            temp_df['job_skills'] = pd.Series(job_sk).astype(str)
            
            temp_df['experience_years'] = pd.to_numeric(
                df.get('experience_years', df.get('ExperienceYears', pd.Series([0] * len(df)))), errors='coerce'
            ).fillna(0)
            
            temp_df['hiring_label'] = pd.to_numeric(
                df.get('hiring_label', df.get('HiringDecision', df.get('hired', pd.Series([1] * len(df))))), errors='coerce'
            ).fillna(1)
            
            temp_df['match_score'] = pd.to_numeric(
                df.get('match_score', df.get('skills_match_score', df.get('employability_score', pd.Series([50] * len(df))))), errors='coerce'
            ).fillna(50)
            
            dfs.append(temp_df[['candidate_skills', 'job_skills', 'experience_years', 'hiring_label', 'match_score']])
        except: continue

    if not dfs: raise ValueError("No data found")
    
    merged = pd.concat(dfs, ignore_index=True)
    merged = merged.dropna(subset=['hiring_label'])
    for col in ['experience_years', 'hiring_label', 'match_score']:
        merged[col] = pd.to_numeric(merged[col], errors='coerce').fillna(0)
    
    return merged

def preprocess_features(df):
    tfidf = TfidfVectorizer(max_features=1000, stop_words='english')
    candidate_vec = tfidf.fit_transform(df['candidate_skills'])
    job_vec = tfidf.transform(df['job_skills'])
    skills_match = np.sum(candidate_vec.multiply(job_vec).toarray(), axis=1).reshape(-1, 1)
    
    experience = df['experience_years'].values.reshape(-1, 1)
    scaler_exp = StandardScaler()
    experience_scaled = scaler_exp.fit_transform(experience)
    
    X = np.hstack([skills_match, experience_scaled])
    y_hiring = df['hiring_label'].values
    y_match = df['match_score'].values
    return X, y_hiring, y_match, scaler_exp, tfidf

def split_data(X, y, test_size=0.2, random_state=42):
    return train_test_split(X, y, test_size=test_size, random_state=random_state)