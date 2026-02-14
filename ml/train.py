import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, r2_score
import joblib
import os
from utils.data_prep import load_and_merge_data, preprocess_features, split_data

def train():
    print("Loading and merging data...")
    raw_paths = []
    df = load_and_merge_data(raw_paths)
    
    print(f"Preprocessing {len(df)} records...")
    X, y_hiring, y_match, scaler_exp, tfidf = preprocess_features(df)
    
    X_train_h, X_test_h, y_train_h, y_test_h = split_data(X, y_hiring)
    X_train_m, X_test_m, y_train_m, y_test_m = split_data(X, y_match)
    
    print("Training Hiring Classifier...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train_h, y_train_h)
    
    h_pred = clf.predict(X_test_h)
    print(f"Hiring Accuracy: {accuracy_score(y_test_h, h_pred)}")
    
    print("Training Match Regressor...")
    reg = RandomForestRegressor(n_estimators=100, random_state=42)
    reg.fit(X_train_m, y_train_m)
    
    m_pred = reg.predict(X_test_m)
    print(f"Match R²: {r2_score(y_test_m, m_pred)}")
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(clf, 'models/hiring_classifier.pkl')
    joblib.dump(reg, 'models/match_regressor.pkl')
    joblib.dump(scaler_exp, 'models/experience_scaler.pkl')
    joblib.dump(tfidf, 'models/tfidf_vectorizer.pkl')
    print("Models saved to models/")

if __name__ == "__main__":
    train()