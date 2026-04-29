"""
src/features/feature_engineer.py
============================================================
Feature engineering for ML models (clustering + classification).

WHY this step:
  Raw GTD columns are mostly text/categorical.
  ML algorithms need numeric features.
  This module encodes, scales, and creates meaningful derived features.

Run directly:
  python src/features/feature_engineer.py
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler
from sklearn.impute import SimpleImputer
import joblib
import os
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
log = logging.getLogger(__name__)


class GTDFeatureEngineer:
    """
    Transforms cleaned GTD data into ML-ready numeric features.

    Usage:
        fe = GTDFeatureEngineer()
        X, df_encoded = fe.fit_transform(df)
        # Later, for new data:
        X_new = fe.transform(df_new)
    """

    def __init__(self, output_dir: str = '../data/processed'):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

        self.encoders = {}
        self.scaler = StandardScaler()
        self.imputer = SimpleImputer(strategy='median')
        self.feature_names = []
        self._fitted = False

    # --------------------------------------------------------
    # Step 1: Encode categorical columns
    # --------------------------------------------------------
    def encode_categoricals(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Label-encode key categorical columns.
        WHY LabelEncoder: KMeans needs numeric input.
        WHY not OneHot: too many categories = too many dimensions.
        """
        cat_cols = {
            'region':      'region_enc',
            'attack_type': 'attack_enc',
            'target_type': 'target_enc',
            'weapon_type': 'weapon_enc',
            'ideology':    'ideology_enc',
        }
        # Fallback column names (original GTD names)
        fallback = {
            'region_txt':       'region_enc',
            'attacktype1_txt':  'attack_enc',
            'targtype1_txt':    'target_enc',
            'weaptype1_txt':    'weapon_enc',
        }

        for raw_col, enc_col in {**cat_cols, **fallback}.items():
            if raw_col in df.columns and enc_col not in df.columns:
                le = LabelEncoder()
                df[enc_col] = le.fit_transform(df[raw_col].astype(str))
                self.encoders[enc_col] = le
                log.info(f'Encoded {raw_col} → {enc_col} ({df[enc_col].nunique()} categories)')

        return df

    # --------------------------------------------------------
    # Step 2: Create numeric derived features
    # --------------------------------------------------------
    def create_numeric_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create ML-useful numeric features from existing columns.
        """
        kill_col  = 'killed'  if 'killed'  in df.columns else 'nkill'
        wound_col = 'wounded' if 'wounded' in df.columns else 'nwound'
        year_col  = 'year'    if 'year'    in df.columns else 'iyear'

        # Log-transform casualties: heavy right skew otherwise distorts clustering
        # WHY log1p: handles zeros (log(0) = -inf, log(0+1) = 0)
        if kill_col in df.columns:
            df['log_killed']  = np.log1p(df[kill_col].fillna(0))
        if wound_col in df.columns:
            df['log_wounded'] = np.log1p(df[wound_col].fillna(0))

        # Total casualties (already created in cleaner but ensure it exists)
        if 'total_casualties' not in df.columns:
            k = df[kill_col].fillna(0) if kill_col in df.columns else 0
            w = df[wound_col].fillna(0) if wound_col in df.columns else 0
            df['total_casualties'] = k + w
        df['log_total_cas'] = np.log1p(df['total_casualties'])

        # Year normalized to 0-1 for distance-based algorithms
        if year_col in df.columns:
            yr = df[year_col]
            df['year_norm'] = (yr - yr.min()) / (yr.max() - yr.min() + 1e-9)

        # Boolean to int
        for col in ['suicide', 'success', 'is_suicide']:
            if col in df.columns:
                df[col] = df[col].fillna(0).astype(int)

        return df

    # --------------------------------------------------------
    # Step 3: Select final feature matrix
    # --------------------------------------------------------
    def select_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Return only the numeric feature columns for ML."""
        candidate_features = [
            'year_norm',
            'log_killed',
            'log_wounded',
            'log_total_cas',
            'suicide',
            'success',
            'region_enc',
            'attack_enc',
            'target_enc',
            'weapon_enc',
        ]
        available = [c for c in candidate_features if c in df.columns]
        self.feature_names = available
        log.info(f'Feature matrix: {len(available)} features: {available}')
        return df[available]

    # --------------------------------------------------------
    # Full pipeline
    # --------------------------------------------------------
    def fit_transform(self, df: pd.DataFrame):
        """
        Fit encoders/scalers on training data and return scaled feature matrix.
        Returns: (X_scaled np.array, df_with_encoded_cols)
        """
        df = df.copy()
        df = self.encode_categoricals(df)
        df = self.create_numeric_features(df)
        X_raw = self.select_features(df)

        # Impute any remaining NaNs
        X_imputed = self.imputer.fit_transform(X_raw)

        # Scale to zero-mean unit-variance
        # WHY: KMeans is distance-based; unscaled features dominate unfairly
        X_scaled = self.scaler.fit_transform(X_imputed)

        self._fitted = True
        log.info(f'Feature matrix shape: {X_scaled.shape}')

        # Save fitted objects for later use in the backend API
        self._save_artifacts()

        return X_scaled, df

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transform new data using already-fitted encoders/scaler."""
        if not self._fitted:
            raise RuntimeError('Call fit_transform first.')
        df = df.copy()
        df = self.encode_categoricals(df)
        df = self.create_numeric_features(df)
        X_raw = df[[c for c in self.feature_names if c in df.columns]]
        X_imputed = self.imputer.transform(X_raw)
        return self.scaler.transform(X_imputed)

    def _save_artifacts(self):
        """Save encoders and scaler for use in the Flask API."""
        artifacts = {
            'encoders': self.encoders,
            'scaler':   self.scaler,
            'imputer':  self.imputer,
            'feature_names': self.feature_names,
        }
        path = os.path.join(self.output_dir, 'feature_artifacts.pkl')
        joblib.dump(artifacts, path)
        log.info(f'Saved feature artifacts → {path}')


# Run as script
if __name__ == '__main__':
    df = pd.read_csv('../data/processed/gtd_processed.csv', low_memory=False)
    fe = GTDFeatureEngineer(output_dir='../data/processed')
    X, df_enc = fe.fit_transform(df)
    print(f'\nFeature matrix: {X.shape}')
    print(f'Features: {fe.feature_names}')
    df_enc.to_csv('../data/processed/gtd_features.csv', index=False)
    print('Saved → data/processed/gtd_features.csv')