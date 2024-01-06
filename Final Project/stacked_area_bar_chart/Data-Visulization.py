#!/usr/bin/env python
# coding: utf-8

# In[4]:


import pandas as pd
df = pd.read_csv('covid-vaccine-doses-by-manufacturer.csv')

# Convert 'Day' column to datetime
df['Day'] = pd.to_datetime(df['Day'])

# Filter data to the desired date range
start_date = pd.to_datetime('2020-12-19')
end_date = pd.to_datetime('2023-11-16')
df = df[(df['Day'] >= start_date) & (df['Day'] <= end_date)]

# Group by 'Day' and sum the doses for each vaccine
grouped_df = df.groupby('Day').agg({
    'Pfizer/BioNTech': 'sum',
    'Moderna': 'sum',
    'Oxford/AstraZeneca': 'sum',
    'Johnson&Johnson': 'sum',
    'Sputnik V': 'sum',
    'Sinovac': 'sum',
    'Sinopharm/Beijing': 'sum',
    'CanSino': 'sum',
    'Novavax': 'sum',
    'Covaxin': 'sum',
    'Medicago': 'sum',
    'Sanofi/GSK': 'sum',
    'SKYCovione': 'sum',
    'Valneva': 'sum'
})

print(grouped_df)


# In[5]:


# Export the grouped DataFrame to a CSV file
grouped_df.to_csv('vaccinetype_data.csv', index=True)


# In[ ]:




