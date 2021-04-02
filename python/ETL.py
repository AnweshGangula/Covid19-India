import pandas as pd

CovidData = pd.read_csv(
    "https://api.covid19india.org/csv/latest/state_wise_daily.csv")
statesAbbr = pd.read_csv(".\Resources\states_abbr.csv")
state_cols = CovidData.columns[3:]
pd.to_datetime(CovidData["Date_YMD"])

# Unpivot State columns
df_melt = CovidData.melt(
    id_vars=["Date", "Date_YMD", "Status"],
    value_vars=state_cols,
    var_name="State_Abbr",
    value_name="Daily Cases",
)
df_melt["State_Abbr"].replace("TT", "_TT", inplace=True)

# Pivot Stauts Columns
df_pivoted = df_melt.pivot_table(
    index=["Date", "Date_YMD", "State_Abbr"],
    columns="Status",
    values="Daily Cases",
    aggfunc="first",
).reset_index()
df_pivoted = df_pivoted.sort_values(
    ["Date_YMD", "State_Abbr"], ascending=[True, True])

# Expand State Abbreviations
df_merged = pd.merge(df_pivoted, statesAbbr, on=["State_Abbr"], how="left")
df_merged["Daily Active"] = (
    df_merged["Confirmed"] - df_merged["Recovered"] - df_merged["Deceased"]
)
df = df_merged.groupby(["Date_YMD", "State_Abbr"])[["Daily Active"]].sum()

# cumsum reference: https://stackoverflow.com/a/48070870/6908282
df_merged["Active"] = df_merged.groupby(
    ["State_Abbr"])["Daily Active"].cumsum()

# Trim strings to remove leading and trailing spaces: https://stackoverflow.com/a/40950485/6908282
df_trim = df_merged.select_dtypes(['object'])
df_merged[df_trim.columns] = df_trim.apply(lambda x: x.str.strip())

print(df_merged.head())

df_merged.to_csv(".\Resources\state_wise_daily - Python.csv", index=False)

# now check out this video to use this data in website: https://www.youtube.com/watch?v=aoMzOgiE7rY
#  another reference: https://stackoverflow.com/questions/13175510/call-python-function-from-javascript-code

# Note: use code "python python\ETL.py" to run above code in terminal
