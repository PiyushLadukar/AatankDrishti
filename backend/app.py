"""
backend/app.py
============================================================
Flask REST API serving processed terrorism data to the frontend.

Endpoints:
  GET /api/summary           - overall stats
  GET /api/ideology          - incidents by ideology
  GET /api/timeline          - incidents per year by ideology
  GET /api/region            - incidents by region
  GET /api/top-groups        - top 20 most active groups
  GET /api/religion-subtype  - religious extremist breakdown by religion
  GET /api/attack-types      - attack type distribution
  GET /api/health            - server health check

Run:
  cd backend
  python app.py
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)


# ============================================================
# Load data at startup
# ============================================================
def load_data() -> pd.DataFrame:

    # Path to processed file (created by notebook 02)
    processed_path = os.path.join('..', 'data', 'processed', 'gtd_processed.csv')

    # Path to raw GTD file as fallback
    raw_gtd_path = os.path.join('..', 'data', 'raw', 'gtd.csv')

    if os.path.exists(processed_path):
        print(f'Loading: {processed_path}')
        df = pd.read_csv(processed_path, low_memory=False)
        print(f'Loaded {len(df):,} rows from processed file')

    elif os.path.exists(raw_gtd_path):
        print(f'Processed file not found. Loading raw GTD: {raw_gtd_path}')
        df = pd.read_csv(raw_gtd_path, encoding='latin-1', low_memory=False)

        # Basic rename so API works
        rename = {
            'iyear': 'year', 'imonth': 'month', 'iday': 'day',
            'country_txt': 'country', 'region_txt': 'region',
            'attacktype1_txt': 'attack_type', 'targtype1_txt': 'target_type',
            'gname': 'group_name', 'nkill': 'killed', 'nwound': 'wounded',
            'weaptype1_txt': 'weapon_type',
        }
        df = df.rename(columns={k: v for k, v in rename.items() if k in df.columns})
        df['ideology'] = 'Unknown'
        print(f'Loaded {len(df):,} rows from raw GTD')

    else:
        # No data found at all — return empty dataframe with correct columns
        print('ERROR: No data file found!')
        print('Please run notebook 02_preprocessing.ipynb first')
        print('Expected file: data/processed/gtd_processed.csv')
        df = pd.DataFrame(columns=[
            'year', 'country', 'region', 'group_name',
            'killed', 'wounded', 'ideology', 'attack_type',
            'target_type', 'weapon_type', 'religion_subtype'
        ])

    # Fill missing values so API never crashes
    if 'killed' in df.columns:
        df['killed'] = pd.to_numeric(df['killed'], errors='coerce').fillna(0)
    if 'wounded' in df.columns:
        df['wounded'] = pd.to_numeric(df['wounded'], errors='coerce').fillna(0)
    if 'ideology' in df.columns:
        df['ideology'] = df['ideology'].fillna('Unknown')

    return df


# Load once at startup — stays in memory
DF = load_data()


# ============================================================
# API Routes
# ============================================================
@app.route("/")
def home():
    return {
        "message": "AatankDrishti API is running....",
        "status": "ok"
    }

@app.route('/api/health')
def health():
    """Check if server is running."""
    return jsonify({
        'status': 'ok',
        'rows': len(DF),
        'columns': list(DF.columns)
    })


@app.route('/api/summary')
def summary():
    """Overall statistics."""
    year_col  = 'year'    if 'year'    in DF.columns else 'iyear'
    kill_col  = 'killed'  if 'killed'  in DF.columns else 'nkill'
    wound_col = 'wounded' if 'wounded' in DF.columns else 'nwound'

    return jsonify({
        'total_incidents':    int(len(DF)),
        'years_covered':      f"{int(DF[year_col].min())} to {int(DF[year_col].max())}" if year_col in DF.columns else 'N/A',
        'total_killed':       int(DF[kill_col].sum())  if kill_col  in DF.columns else 0,
        'total_wounded':      int(DF[wound_col].sum()) if wound_col in DF.columns else 0,
        'countries':          int(DF['country'].nunique())    if 'country'    in DF.columns else 0,
        'groups':             int(DF['group_name'].nunique()) if 'group_name' in DF.columns else 0,
        'ideology_categories':int(DF['ideology'].nunique())   if 'ideology'   in DF.columns else 0,
    })


@app.route('/api/ideology')
def ideology():
    """Incident count and casualties by ideology."""
    year_col = 'year'   if 'year'   in DF.columns else 'iyear'
    kill_col = 'killed' if 'killed' in DF.columns else 'nkill'

    year_from = request.args.get('year_from', type=int, default=int(DF[year_col].min()) if year_col in DF.columns else 1970)
    year_to   = request.args.get('year_to',   type=int, default=int(DF[year_col].max()) if year_col in DF.columns else 2020)

    filtered = DF
    if year_col in DF.columns:
        filtered = DF[(DF[year_col] >= year_from) & (DF[year_col] <= year_to)]

    grouped = (
        filtered.groupby('ideology')
        .agg(incidents=('ideology', 'count'), killed=(kill_col, 'sum'))
        .reset_index()
        .sort_values('incidents', ascending=False)
    )
    return jsonify(grouped.to_dict(orient='records'))


@app.route('/api/timeline')
def timeline():
    """Incidents per year broken down by ideology."""
    year_col = 'year' if 'year' in DF.columns else 'iyear'

    if year_col not in DF.columns or 'ideology' not in DF.columns:
        return jsonify([])

    grouped = (
        DF.groupby([year_col, 'ideology'])
        .size()
        .reset_index(name='incidents')
        .rename(columns={year_col: 'year'})
    )
    return jsonify(grouped.to_dict(orient='records'))


@app.route('/api/region')
def region():
    """Incidents by region and ideology."""
    region_col = 'region' if 'region' in DF.columns else 'region_txt'

    if region_col not in DF.columns:
        return jsonify([])

    grouped = (
        DF.groupby([region_col, 'ideology'])
        .size()
        .reset_index(name='incidents')
        .rename(columns={region_col: 'region'})
        .sort_values('incidents', ascending=False)
    )
    return jsonify(grouped.to_dict(orient='records'))


@app.route('/api/top-groups')
def top_groups():
    """Top 20 most active groups."""
    group_col = 'group_name' if 'group_name' in DF.columns else 'gname'
    kill_col  = 'killed'     if 'killed'     in DF.columns else 'nkill'

    if group_col not in DF.columns:
        return jsonify([])

    top = (
        DF.groupby([group_col, 'ideology'])
        .agg(incidents=(group_col, 'count'), killed=(kill_col, 'sum'))
        .reset_index()
        .sort_values('incidents', ascending=False)
        .head(20)
        .rename(columns={group_col: 'group_name'})
    )
    return jsonify(top.to_dict(orient='records'))


@app.route('/api/religion-subtype')
def religion_subtype():
    """Religious extremist incidents by specific religion."""
    if 'ideology' not in DF.columns or 'religion_subtype' not in DF.columns:
        return jsonify([])

    religious = DF[DF['ideology'] == 'Religious Extremist'].copy()

    if len(religious) == 0:
        return jsonify([])

    grouped = (
        religious.groupby('religion_subtype')
        .size()
        .reset_index(name='incidents')
        .sort_values('incidents', ascending=False)
    )
    grouped['religion_subtype'] = grouped['religion_subtype'].fillna('Unknown')
    return jsonify(grouped.to_dict(orient='records'))


@app.route('/api/attack-types')
def attack_types():
    """Attack type distribution."""
    attack_col = 'attack_type' if 'attack_type' in DF.columns else 'attacktype1_txt'

    if attack_col not in DF.columns:
        return jsonify([])

    grouped = (
        DF.groupby(attack_col)
        .size()
        .reset_index(name='incidents')
        .rename(columns={attack_col: 'attack_type'})
        .sort_values('incidents', ascending=False)
    )
    return jsonify(grouped.to_dict(orient='records'))


# ============================================================
if __name__ == '__main__':
    print('\nGlobal Terrorism Analysis API')
    print('Running at http://localhost:5000')
    print('\nEndpoints:')
    print('  http://localhost:5000/api/health')
    print('  http://localhost:5000/api/summary')
    print('  http://localhost:5000/api/ideology')
    print('  http://localhost:5000/api/timeline')
    print('  http://localhost:5000/api/region')
    print('  http://localhost:5000/api/top-groups')
    print('  http://localhost:5000/api/religion-subtype')
    print('  http://localhost:5000/api/attack-types')
    print()
    app.run(debug=True, port=5000)