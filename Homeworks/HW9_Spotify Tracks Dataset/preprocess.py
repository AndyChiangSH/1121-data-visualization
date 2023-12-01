import pandas as pd

df = pd.read_csv("Homeworks/HW9_Spotify Tracks Dataset/spotify_tracks.csv")
print(df.head())

features = ["track_name", "popularity", "duration_ms", "danceability", "energy", "loudness", "speechiness", "acousticness", "instrumentalness", "liveness", "valence", "track_genre"]

features_df = df[features]
print(features_df.head())

# copy the data
nomalized_df = features_df.copy()

# apply normalization techniques
for column in ["popularity", "duration_ms", "danceability", "energy", "loudness", "speechiness", "acousticness", "instrumentalness", "liveness", "valence"]:
    nomalized_df[column] = ((nomalized_df[column] - nomalized_df[column].min()) / (
        nomalized_df[column].max() - nomalized_df[column].min())) * 100

# view normalized data
print(nomalized_df.head())
print(nomalized_df.info())

nomalized_df.to_csv("Homeworks/HW9_Spotify Tracks Dataset/spotify_tracks_preprocess.csv")
