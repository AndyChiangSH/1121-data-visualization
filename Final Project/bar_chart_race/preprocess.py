import pandas as pd
import math


target_column = "total_deaths"

df = pd.read_csv("Final Project/data/owid-covid-data.csv")
df.info()

image_df = pd.read_csv("Final Project/data/flourish.csv")
image_df.info()

features = ["continent", "location", "date", target_column]

features_df = df[features]
features_df.info()

date_df = features_df.pivot_table("date", ["continent", "location"], "date")
date_df = date_df.reset_index()
date_df.insert(2, "image_url", "")
# date_df.drop(columns="date")
print(date_df.head())
date_df.info()

for i in range(len(date_df)):
    location = date_df.iloc[i]["location"]
    # print("location:", location)
    image_url = image_df.loc[image_df["Country Name"] == location, "Image URL"]
    # print("image_url:", image_url)
    if len(image_url) != 0:
        date_df.at[i, "image_url"] = image_url.values[0]
    
    value = 0
    for j in range(3, len(date_df.iloc[i])):
        # print(type(date_df.iloc[i, j]))
        if math.isnan(date_df.iloc[i, j]):
            date_df.iloc[i, j] = value
        else:
            value = date_df.iloc[i, j]

print(date_df.head())
date_df.info()

date_df.to_csv(
    f"Final Project/Bar Chart Race/{target_column}.csv", index=False)
