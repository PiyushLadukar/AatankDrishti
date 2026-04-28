"""
src/preprocessing/cleaner.py
============================================================
Data cleaning pipeline for GTD dataset.

WHY this file exists:
  Raw GTD data has inconsistencies, missing values, and encoding issues.
  This module standardizes everything so downstream analysis is reliable.

Run directly:
  python src/preprocessing/cleaner.py
"""

import pandas as pd
import numpy as np
import os
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
log = logging.getLogger(__name__)


# ============================================================
# Column renaming map: GTD internal names → readable names
# ============================================================
COLUMN_RENAME = {
    'iyear':            'year',
    'imonth':           'month',
    'iday':             'day',
    'country_txt':      'country',
    'region_txt':       'region',
    'attacktype1_txt':  'attack_type',
    'targtype1_txt':    'target_type',
    'gname':            'group_name',
    'nkill':            'killed',
    'nwound':           'wounded',
    'nkillter':         'terrorists_killed',
    'weaptype1_txt':    'weapon_type',
}

# Columns to drop if they exist — high missingness or not needed
COLS_TO_DROP = [
    'eventid', 'approxdate', 'extended', 'resolution', 'country',
    'region', 'specificity', 'vicinity', 'location', 'summary',
    'crit1', 'crit2', 'crit3', 'doubtterr', 'alternative',
    'alternative_txt', 'multiple', 'related',
    'corp1', 'corp2', 'corp3',
    'target1', 'target2', 'target3',
    'natlty1', 'natlty1_txt',
    'guncertain1', 'individual',
    'nperps', 'nperpcap', 'claimed', 'claimmode',
    'compclaim', 'weapsubtype1_txt',
    'nhostkid', 'nhostkidus', 'nhours', 'ndays',
    'ransom', 'ransomamt', 'ransompaid',
    'hostkidoutcome', 'hostkidoutcome_txt',
    'nreleased', 'addnotes', 'scite1', 'scite2', 'scite3',
    'dbsource', 'INT_LOG', 'INT_IDEO', 'INT_MISC', 'INT_ANY',
]


class GTDCleaner:
    """
    Cleans and standardizes the Global Terrorism Database.

    Usage:
        cleaner = GTDCleaner()
        df_clean = cleaner.run('../data/raw/gtd_sample.csv')
    """

    def __init__(self, output_dir: str = '../data/processed'):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def load(self, path: str) -> pd.DataFrame:
        """Load raw GTD from CSV or Excel."""
        log.info(f'Loading: {path}')
        if path.endswith('.xlsx'):
            df = pd.read_excel(path, low_memory=False)
        else:
            df = pd.read_csv(path, encoding='latin-1', low_memory=False)
        log.info(f'Loaded {df.shape[0]:,} rows × {df.shape[1]} columns')
        return df

    def drop_unused_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove columns we don't need for this analysis."""
        # WHY: Fewer columns = faster processing, less memory, clearer data
        cols_to_drop = [c for c in COLS_TO_DROP if c in df.columns]
        df = df.drop(columns=cols_to_drop)
        log.info(f'Dropped {len(cols_to_drop)} unused columns → {df.shape[1]} remain')
        return df

    def rename_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Rename GTD internal column names to human-readable names."""
        rename_map = {k: v for k, v in COLUMN_RENAME.items() if k in df.columns}
        df = df.rename(columns=rename_map)
        log.info(f'Renamed {len(rename_map)} columns')
        return df

    def fix_dates(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create a proper date column.
        WHY: GTD stores year/month/day separately; 0 = unknown.
        """
        # Replace 0 month/day with 1 (January 1st) to allow date parsing
        df['month'] = df['month'].replace(0, 1)
        df['day'] = df['day'].replace(0, 1)

        # Clamp day values to valid range
        df['day'] = df['day'].clip(1, 28)

        try:
            df['date'] = pd.to_datetime(
                df[['year', 'month', 'day']].rename(
                    columns={'year': 'year', 'month': 'month', 'day': 'day'}
                ),
                errors='coerce'
            )
            log.info(f'Date column created; {df["date"].isnull().sum()} nulls')
        except Exception as e:
            log.warning(f'Date creation failed: {e}')

        return df

    def clean_casualties(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean numeric casualty columns.
        WHY: GTD uses -99 and -9 for "unknown" — must convert to NaN
        """
        for col in ['killed', 'wounded', 'terrorists_killed']:
            if col in df.columns:
                # Replace sentinel values
                df[col] = df[col].replace([-99, -9], np.nan)
                # No negative casualties
                df[col] = df[col].clip(lower=0)
                # Fill NaN with 0 for calculation purposes
                df[col] = df[col].fillna(0).astype(int)

        # Total casualties column (useful for severity analysis)
        if 'killed' in df.columns and 'wounded' in df.columns:
            df['total_casualties'] = df['killed'] + df['wounded']

        log.info('Casualty columns cleaned')
        return df

    def clean_text_fields(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Standardize text fields.
        WHY: GTD has inconsistent casing and whitespace in group/country names
        """
        text_cols = ['group_name', 'country', 'region', 'city',
                     'attack_type', 'target_type', 'weapon_type']

        for col in text_cols:
            if col in df.columns:
                df[col] = (
                    df[col]
                    .astype(str)
                    .str.strip()
                    .str.replace(r'\s+', ' ', regex=True)
                )
                # Replace 'nan' strings from .astype(str)
                df[col] = df[col].replace('nan', 'Unknown')

        # Normalize 'Unknown' variants
        for col in ['group_name']:
            if col in df.columns:
                df[col] = df[col].replace(
                    {'unknown': 'Unknown', 'UNKNOWN': 'Unknown', '': 'Unknown'}
                )

        log.info('Text fields cleaned')
        return df

    def add_decade_column(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add decade for time-period analysis."""
        if 'year' in df.columns:
            df['decade'] = (df['year'] // 10 * 10).astype(str) + 's'
        return df

    def flag_suicide_attacks(self, df: pd.DataFrame) -> pd.DataFrame:
        """Convert suicide flag to boolean."""
        if 'suicide' in df.columns:
            df['is_suicide'] = df['suicide'].fillna(0).astype(bool)
        return df

    def run(self, input_path: str) -> pd.DataFrame:
        """
        Full cleaning pipeline.
        Runs all steps in order and saves the result.
        """
        log.info('=' * 50)
        log.info('Starting GTD Cleaning Pipeline')
        log.info('=' * 50)

        df = self.load(input_path)

        # Pipeline steps
        df = self.drop_unused_columns(df)
        df = self.rename_columns(df)
        df = self.fix_dates(df)
        df = self.clean_casualties(df)
        df = self.clean_text_fields(df)
        df = self.add_decade_column(df)
        df = self.flag_suicide_attacks(df)

        # Final summary
        log.info('=' * 50)
        log.info(f'✅ Cleaning complete: {df.shape[0]:,} rows × {df.shape[1]} columns')
        log.info(f'   Null counts: killed={df["killed"].isnull().sum()}, '
                 f'wounded={df["wounded"].isnull().sum()}')

        # Save
        out_path = os.path.join(self.output_dir, 'gtd_cleaned.csv')
        df.to_csv(out_path, index=False)
        log.info(f'   Saved → {out_path}')

        return df


# ============================================================
# Run as script
# ============================================================
if __name__ == '__main__':
    import sys

    input_file = sys.argv[1] if len(sys.argv) > 1 else './data/raw/gtd.csv'
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')) 
    output_dir = os.path.join(BASE_DIR, 'data', 'processed')

    cleaner = GTDCleaner(output_dir=output_dir)
    df_clean = cleaner.run(input_file)
    print(f'\nFirst 5 rows:')
    print(df_clean.head())