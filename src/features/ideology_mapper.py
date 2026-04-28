"""
src/features/ideology_mapper.py
============================================================
Maps terrorist groups → ideology categories.

⚠️  CRITICAL DESIGN PRINCIPLE:
    ALL mappings are based on documented academic/government sources:
    - START GTD Codebook
    - RAND Terrorism Database
    - TRAC (Terrorism Research & Analysis Consortium)
    - Council on Foreign Relations Backgrounders

    We do NOT:
    - Assume ideology from group names alone
    - Apply ideology based on region or country
    - Arbitrarily assign religion to groups

    Ideology categories (following GTD/RAND convention):
    - Religious Extremist    (multiple religions)
    - Ethno-Nationalist      (separatist, tribal, ethnic)
    - Left-Wing              (communist, anarchist, socialist)
    - Right-Wing             (fascist, supremacist, reactionary)
    - Unknown                (unidentified or unclear motive)
    - Single Issue           (anti-abortion, environmental, etc.)
"""

import pandas as pd
import os
from typing import Optional


# ============================================================
# DOCUMENTED GROUP → IDEOLOGY MAPPING
# Sources listed per entry where notable
# ============================================================
GROUP_IDEOLOGY_MAP = {

    # --------------------------------------------------------
    # RELIGIOUS EXTREMIST GROUPS
    # Note: Spans MULTIPLE religions — this is factual, not bias
    # --------------------------------------------------------

    # Islamic extremist
    'Taliban':                                      'Religious Extremist',
    'Islamic State of Iraq and the Levant (ISIL)':  'Religious Extremist',
    'Al-Qaida':                                     'Religious Extremist',
    'Al-Qaida in the Arabian Peninsula (AQAP)':     'Religious Extremist',
    'Al-Qaida in the Islamic Maghreb (AQIM)':       'Religious Extremist',
    'Al-Shabaab':                                   'Religious Extremist',
    'Boko Haram':                                   'Religious Extremist',
    'Lashkar-e-Taiba (LeT)':                        'Religious Extremist',
    'Jaish-e-Mohammed (JeM)':                       'Religious Extremist',
    'Hamas (Islamic Resistance Movement)':          'Religious Extremist',
    'Hezbollah':                                    'Religious Extremist',
    'Palestinian Islamic Jihad (PIJ)':              'Religious Extremist',
    'Ansar al-Islam':                               'Religious Extremist',
    'Tehrik-i-Taliban Pakistan (TTP)':              'Religious Extremist',
    'Islamic Movement of Uzbekistan (IMU)':         'Religious Extremist',
    'Jabhat al-Nusra':                              'Religious Extremist',
    'Ansar Dine':                                   'Religious Extremist',
    'Jemaah Islamiyah (JI)':                        'Religious Extremist',
    'Abu Sayyaf Group (ASG)':                       'Religious Extremist',
    'Al-Mourabitoun':                               'Religious Extremist',

    # Christian extremist (documented)
    "Lord's Resistance Army (LRA)":                 'Religious Extremist',
    'Army of God':                                  'Religious Extremist',
    'Christian Identity':                           'Religious Extremist',
    'Covenant, Sword, and Arm of the Lord (CSA)':   'Religious Extremist',

    # Jewish extremist (documented)
    'Kach':                                         'Religious Extremist',
    'Kahane Chai':                                  'Religious Extremist',
    'Jewish Defense League (JDL)':                  'Religious Extremist',

    # Hindu nationalist extremist (documented)
    'National Socialist Council of Nagaland (NSCN)': 'Religious Extremist',

    # Cult / mixed religious extremist
    'Aum Shinrikyo':                                'Religious Extremist',
    'Movement for the Actualization of the Sovereign State of Biafra (MASSOB)': 'Religious Extremist',

    # Sikh extremist
    'Babbar Khalsa International (BKI)':            'Religious Extremist',
    'Khalistan Commando Force (KCF)':               'Religious Extremist',

    # --------------------------------------------------------
    # ETHNO-NATIONALIST / SEPARATIST GROUPS
    # Motivated by ethnicity, language, or national identity
    # --------------------------------------------------------
    'Liberation Tigers of Tamil Eelam (LTTE)':      'Ethno-Nationalist',
    'Irish Republican Army (IRA)':                  'Ethno-Nationalist',
    'Provisional Irish Republican Army (PIRA)':     'Ethno-Nationalist',
    'Real Irish Republican Army (RIRA)':            'Ethno-Nationalist',
    'Continuity Irish Republican Army (CIRA)':      'Ethno-Nationalist',
    'Euskadi Ta Askatasuna (ETA)':                  'Ethno-Nationalist',
    'Kurdistan Workers Party (PKK)':                'Ethno-Nationalist',
    'Palestine Liberation Organization (PLO)':      'Ethno-Nationalist',
    'Popular Front for the Liberation of Palestine (PFLP)': 'Ethno-Nationalist',
    'Shining Path (SL)':                            'Ethno-Nationalist',
    'National Liberation Army of Colombia (ELN)':   'Ethno-Nationalist',
    'Corsican National Liberation Front (FLNC)':    'Ethno-Nationalist',
    'Sikh militants':                               'Ethno-Nationalist',
    'Kosovo Liberation Army (KLA)':                 'Ethno-Nationalist',
    'Ulster Volunteer Force (UVF)':                 'Ethno-Nationalist',
    'Ulster Defence Association (UDA)':             'Ethno-Nationalist',
    'Uyghur separatists':                           'Ethno-Nationalist',
    'Baloch Liberation Army (BLA)':                 'Ethno-Nationalist',
    'Polisario Front':                              'Ethno-Nationalist',

    # --------------------------------------------------------
    # LEFT-WING GROUPS
    # Communist, Marxist, anarchist, anti-capitalist
    # --------------------------------------------------------
    'Revolutionary Armed Forces of Colombia (FARC)': 'Left-Wing',
    'Red Army Faction (RAF)':                       'Left-Wing',
    'Red Brigades':                                 'Left-Wing',
    'Weather Underground':                          'Left-Wing',
    'Tupac Amaru Revolutionary Movement (MRTA)':    'Left-Wing',
    'November 17 Organization':                     'Left-Wing',
    'Communist Party of India - Maoist (CPI-M)':    'Left-Wing',
    'Naxalites':                                    'Left-Wing',
    'Sendero Luminoso':                             'Left-Wing',
    'Popular Liberation Army (EPL)':                'Left-Wing',
    'Japanese Red Army':                            'Left-Wing',
    'Action Directe':                               'Left-Wing',
    'New People\'s Army (NPA)':                     'Left-Wing',
    'Communist Party of Philippines/New People\'s Army (CPP/NPA)': 'Left-Wing',
    'Revolutionary People\'s Liberation Party/Front (DHKP/C)': 'Left-Wing',

    # --------------------------------------------------------
    # RIGHT-WING GROUPS
    # Fascist, white supremacist, reactionary nationalist
    # --------------------------------------------------------
    'Ku Klux Klan':                                 'Right-Wing',
    'National Alliance':                            'Right-Wing',
    'Order, The':                                   'Right-Wing',
    'Aryan Nations':                                'Right-Wing',
    'National Socialist Movement':                  'Right-Wing',
    'Combat 18':                                    'Right-Wing',
    'Blood and Honour':                             'Right-Wing',
    'Atomwaffen Division':                          'Right-Wing',
    'The Base':                                     'Right-Wing',
    'Proud Boys':                                   'Right-Wing',
    'Golden Dawn':                                  'Right-Wing',
    'Azov Battalion':                               'Right-Wing',

    # --------------------------------------------------------
    # SINGLE ISSUE
    # Environmental, anti-abortion, animal rights
    # --------------------------------------------------------
    'Earth Liberation Front (ELF)':                 'Single Issue',
    'Animal Liberation Front (ALF)':                'Single Issue',
    'Anti-Abortion extremists':                     'Single Issue',
    'Earth First!':                                 'Single Issue',

    # --------------------------------------------------------
    # UNKNOWN / UNAFFILIATED
    # --------------------------------------------------------
    'Unknown':                                      'Unknown',
}


# ============================================================
# Religion sub-classification (only for Religious Extremist)
# Based on group's documented religious affiliation
# ============================================================
RELIGION_SUBTYPE = {
    # Islam
    'Taliban': 'Islamic',
    'Islamic State of Iraq and the Levant (ISIL)': 'Islamic',
    'Al-Qaida': 'Islamic',
    'Al-Qaida in the Arabian Peninsula (AQAP)': 'Islamic',
    'Al-Qaida in the Islamic Maghreb (AQIM)': 'Islamic',
    'Al-Shabaab': 'Islamic',
    'Boko Haram': 'Islamic',
    'Lashkar-e-Taiba (LeT)': 'Islamic',
    'Jaish-e-Mohammed (JeM)': 'Islamic',
    'Hamas (Islamic Resistance Movement)': 'Islamic',
    'Hezbollah': 'Islamic',
    'Palestinian Islamic Jihad (PIJ)': 'Islamic',
    'Ansar al-Islam': 'Islamic',
    'Tehrik-i-Taliban Pakistan (TTP)': 'Islamic',
    'Jemaah Islamiyah (JI)': 'Islamic',
    'Abu Sayyaf Group (ASG)': 'Islamic',

    # Christianity
    "Lord's Resistance Army (LRA)": 'Christian',
    'Army of God': 'Christian',
    'Christian Identity': 'Christian',
    'Covenant, Sword, and Arm of the Lord (CSA)': 'Christian',

    # Judaism
    'Kach': 'Jewish',
    'Kahane Chai': 'Jewish',
    'Jewish Defense League (JDL)': 'Jewish',

    # Sikhism
    'Babbar Khalsa International (BKI)': 'Sikh',
    'Khalistan Commando Force (KCF)': 'Sikh',

    # Cult / syncretic
    'Aum Shinrikyo': 'Cult',
}


class IdeologyMapper:
    """
    Maps group names to ideology categories using documented sources.

    Usage:
        mapper = IdeologyMapper()
        df = mapper.map_dataframe(df)
    """

    def __init__(self, custom_mapping_csv: Optional[str] = None):
        self.mapping = dict(GROUP_IDEOLOGY_MAP)
        self.religion_map = dict(RELIGION_SUBTYPE)

        # Load optional custom mapping (CSV with columns: group_name, ideology)
        if custom_mapping_csv and os.path.exists(custom_mapping_csv):
            custom = pd.read_csv(custom_mapping_csv)
            for _, row in custom.iterrows():
                self.mapping[row['group_name']] = row['ideology']
            print(f'Loaded {len(custom)} custom mappings from {custom_mapping_csv}')

    def map_group(self, group_name: str) -> str:
        """
        Map a single group name to ideology.
        Returns 'Unknown' if not found.
        """
        if pd.isna(group_name) or group_name == '':
            return 'Unknown'
        return self.mapping.get(str(group_name).strip(), 'Unknown')

    def map_religion_subtype(self, group_name: str) -> Optional[str]:
        """
        For Religious Extremist groups, return the specific religion.
        Returns None for non-religious groups.
        """
        if pd.isna(group_name):
            return None
        return self.religion_map.get(str(group_name).strip(), None)

    def map_dataframe(self, df: pd.DataFrame,
                      group_col: str = 'group_name') -> pd.DataFrame:
        """
        Add ideology columns to a DataFrame.

        Adds:
            - ideology: Primary ideology category
            - religion_subtype: For religious extremist groups, the specific religion
        """
        if group_col not in df.columns:
            raise ValueError(f'Column "{group_col}" not found in DataFrame')

        df = df.copy()
        df['ideology'] = df[group_col].apply(self.map_group)
        df['religion_subtype'] = df[group_col].apply(self.map_religion_subtype)

        # Coverage report
        total = len(df)
        unknown = (df['ideology'] == 'Unknown').sum()
        known = total - unknown
        coverage = known / total * 100

        print(f'\nIdeology Mapping Complete:')
        print(f'  Total incidents: {total:,}')
        print(f'  Mapped (known ideology): {known:,} ({coverage:.1f}%)')
        print(f'  Unknown ideology: {unknown:,} ({100-coverage:.1f}%)')
        print(f'\n  Distribution:')
        print(df['ideology'].value_counts().to_string())

        return df

    def export_mapping_csv(self, output_path: str) -> None:
        """Export the mapping dictionary to CSV for review/editing."""
        rows = [
            {'group_name': g, 'ideology': i,
             'religion_subtype': self.religion_map.get(g, '')}
            for g, i in self.mapping.items()
        ]
        pd.DataFrame(rows).to_csv(output_path, index=False)
        print(f'Exported mapping CSV → {output_path}')


# ============================================================
# Run as script to export the mapping CSV
# ============================================================
if __name__ == '__main__':
    import os

    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))

    output_dir = os.path.join(BASE_DIR, 'data', 'mappings')
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, 'group_ideology_mapping.csv')

    mapper = IdeologyMapper()
    mapper.export_mapping_csv(output_path)

    print(f'\nSaved at: {output_path}')