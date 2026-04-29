"""
src/models/clustering.py
============================================================
KMeans clustering to discover natural patterns in GTD data.

WHY clustering?
  We want to find groups of incidents that share similar characteristics
  WITHOUT assuming ideology in advance. The clusters are then labelled
  AFTER the fact by examining which ideologies dominate each cluster.

This approach is more honest than supervised classification because it
lets the data reveal its own patterns.

Run:
  python src/models/clustering.py
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
import joblib
import os
import sys
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
log = logging.getLogger(__name__)

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from features.feature_engineer import GTDFeatureEngineer


IDEOLOGY_COLORS = {
    'Religious Extremist': '#e74c3c',
    'Ethno-Nationalist':   '#3498db',
    'Left-Wing':           '#e67e22',
    'Right-Wing':          '#9b59b6',
    'Single Issue':        '#2ecc71',
    'Unknown':             '#95a5a6',
}


class GTDClustering:
    """
    Discovers incident patterns using KMeans clustering.

    Usage:
        clusterer = GTDClustering(n_clusters=6)
        df = clusterer.fit(df, X_scaled)
        clusterer.visualize(df, X_scaled)
        clusterer.save('../data/processed')
    """

    def __init__(self, n_clusters: int = 6, random_state: int = 42):
        self.n_clusters = n_clusters
        self.random_state = random_state
        self.model = None
        self.pca = None

    def find_optimal_k(self, X: np.ndarray, k_range=range(2, 12)) -> int:
        """
        Elbow + Silhouette method to find best number of clusters.
        WHY: Don't just guess k=6. Let the data guide you.
        """
        inertias = []
        silhouettes = []

        for k in k_range:
            km = KMeans(n_clusters=k, random_state=self.random_state, n_init=10)
            labels = km.fit_predict(X)
            inertias.append(km.inertia_)
            sil = silhouette_score(X, labels, sample_size=min(5000, len(X)))
            silhouettes.append(sil)
            log.info(f'k={k}: inertia={km.inertia_:.0f}, silhouette={sil:.3f}')

        # Plot
        fig, axes = plt.subplots(1, 2, figsize=(12, 4))
        axes[0].plot(k_range, inertias, 'bo-')
        axes[0].set_title('Elbow method — inertia vs k', fontweight='bold')
        axes[0].set_xlabel('Number of clusters (k)')
        axes[0].set_ylabel('Inertia')

        axes[1].plot(k_range, silhouettes, 'ro-')
        axes[1].set_title('Silhouette score vs k', fontweight='bold')
        axes[1].set_xlabel('Number of clusters (k)')
        axes[1].set_ylabel('Silhouette score (higher = better)')

        plt.tight_layout()
        plt.savefig('../data/processed/clustering_k_selection.png', dpi=150)
        plt.show()

        # Best k by silhouette
        best_k = list(k_range)[np.argmax(silhouettes)]
        log.info(f'Best k by silhouette: {best_k}')
        return best_k

    def fit(self, df: pd.DataFrame, X: np.ndarray) -> pd.DataFrame:
        """Fit KMeans and add cluster labels to DataFrame."""
        log.info(f'Fitting KMeans with k={self.n_clusters}...')
        self.model = KMeans(
            n_clusters=self.n_clusters,
            random_state=self.random_state,
            n_init=15,
            max_iter=300,
        )
        df = df.copy()
        df['cluster'] = self.model.fit_predict(X)
        log.info(f'Cluster sizes:\n{df["cluster"].value_counts().sort_index().to_string()}')
        return df

    def profile_clusters(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Describe each cluster by its dominant ideology, region, attack type.
        WHY: This step converts meaningless cluster numbers into insight.
        """
        kill_col = 'killed' if 'killed' in df.columns else 'nkill'
        year_col = 'year'   if 'year'   in df.columns else 'iyear'

        profiles = []
        for cluster_id in sorted(df['cluster'].unique()):
            sub = df[df['cluster'] == cluster_id]

            # Dominant values
            dominant_ideology = sub['ideology'].value_counts().idxmax() if 'ideology' in sub.columns else 'N/A'
            region_col = 'region' if 'region' in sub.columns else 'region_txt'
            dominant_region = sub[region_col].value_counts().idxmax() if region_col in sub.columns else 'N/A'
            attack_col = 'attack_type' if 'attack_type' in sub.columns else 'attacktype1_txt'
            dominant_attack = sub[attack_col].value_counts().idxmax() if attack_col in sub.columns else 'N/A'

            profiles.append({
                'cluster':            cluster_id,
                'n_incidents':        len(sub),
                'dominant_ideology':  dominant_ideology,
                'dominant_region':    dominant_region,
                'dominant_attack':    dominant_attack,
                'avg_killed':         sub[kill_col].mean().round(2) if kill_col in sub.columns else 0,
                'pct_suicide':        (sub.get('suicide', pd.Series([0])).mean() * 100).round(1),
                'year_range':         f"{int(sub[year_col].min())}-{int(sub[year_col].max())}" if year_col in sub.columns else '',
            })

        profile_df = pd.DataFrame(profiles)
        print('\n=== CLUSTER PROFILES ===')
        print(profile_df.to_string(index=False))
        return profile_df

    def visualize(self, df: pd.DataFrame, X: np.ndarray) -> None:
        """
        PCA 2D scatter plot of clusters.
        WHY PCA: Reduce multi-dimensional feature space to 2D for visualization.
        """
        log.info('Running PCA for visualization...')
        self.pca = PCA(n_components=2, random_state=42)
        coords = self.pca.fit_transform(X)

        df = df.copy()
        df['pca_x'] = coords[:, 0]
        df['pca_y'] = coords[:, 1]

        fig, axes = plt.subplots(1, 2, figsize=(16, 6))

        # Plot A: Color by cluster
        scatter_colors = plt.cm.Set2(np.linspace(0, 1, self.n_clusters))
        for cid in sorted(df['cluster'].unique()):
            mask = df['cluster'] == cid
            axes[0].scatter(
                df.loc[mask, 'pca_x'], df.loc[mask, 'pca_y'],
                c=[scatter_colors[cid]], alpha=0.4, s=8, label=f'Cluster {cid}'
            )
        axes[0].set_title('PCA projection — colored by cluster', fontweight='bold')
        axes[0].set_xlabel(f'PC1 ({self.pca.explained_variance_ratio_[0]*100:.1f}% var)')
        axes[0].set_ylabel(f'PC2 ({self.pca.explained_variance_ratio_[1]*100:.1f}% var)')
        axes[0].legend(markerscale=2, fontsize=8)

        # Plot B: Color by ideology
        if 'ideology' in df.columns:
            for ideology, color in IDEOLOGY_COLORS.items():
                mask = df['ideology'] == ideology
                if mask.sum() > 0:
                    axes[1].scatter(
                        df.loc[mask, 'pca_x'], df.loc[mask, 'pca_y'],
                        c=color, alpha=0.4, s=8, label=ideology
                    )
            axes[1].set_title('PCA projection — colored by ideology', fontweight='bold')
            axes[1].set_xlabel(f'PC1')
            axes[1].set_ylabel(f'PC2')
            axes[1].legend(markerscale=2, fontsize=8, bbox_to_anchor=(1.01, 1))

        plt.tight_layout()
        plt.savefig('../data/processed/clustering_pca.png', dpi=150, bbox_inches='tight')
        plt.show()

    def save(self, output_dir: str) -> None:
        """Save fitted model and PCA for use in API."""
        path = os.path.join(output_dir, 'kmeans_model.pkl')
        joblib.dump({'model': self.model, 'pca': self.pca, 'n_clusters': self.n_clusters}, path)
        log.info(f'Model saved → {path}')


# ============================================================
# Run as script — full clustering pipeline
# ============================================================
if __name__ == '__main__':
    # Load processed data
    df = pd.read_csv('../data/processed/gtd_processed.csv', low_memory=False)
    print(f'Loaded {len(df):,} rows')

    # Build feature matrix
    fe = GTDFeatureEngineer(output_dir='../data/processed')
    X, df_enc = fe.fit_transform(df)

    # Find optimal k (optional — can be slow; set auto_k=False to skip)
    auto_k = False
    if auto_k:
        clusterer = GTDClustering()
        best_k = clusterer.find_optimal_k(X, k_range=range(2, 11))
    else:
        best_k = 6  # Reasonable default for GTD ideologies

    # Fit and profile
    clusterer = GTDClustering(n_clusters=best_k)
    df_enc = clusterer.fit(df_enc, X)
    profiles = clusterer.profile_clusters(df_enc)
    clusterer.visualize(df_enc, X)
    clusterer.save('../data/processed')

    # Save data with cluster labels
    df_enc.to_csv('../data/processed/gtd_clustered.csv', index=False)
    profiles.to_csv('../data/processed/cluster_profiles.csv', index=False)
    print('\nDone. → Next: src/models/classifier.py')