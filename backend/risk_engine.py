import pandas as pd


# Calculate cybersecurity risk score
def calculate_risk_score(row):

    score = 0

    # Failed login attempts
    if row["failed_attempts"] >= 8:
        score += 40
    elif row["failed_attempts"] >= 5:
        score += 30
    elif row["failed_attempts"] >= 3:
        score += 20

    # Privileged account activity
    if row["privileged_account"]:
        score += 25

    # Large data transfers
    if row["data_transferred_mb"] >= 4000:
        score += 50
    elif row["data_transferred_mb"] >= 3000:
        score += 40
    elif row["data_transferred_mb"] >= 1000:
        score += 25

    # Unusual locations
    if row["location"] in [
        "London",
        "California",
        "Texas"
    ]:
        score += 10

    # Privilege changes
    if row["event_type"] == "Privilege Change":
        score += 30

    # Password reset activity
    if row["event_type"] == "Password Reset":
        score += 10

    # File access activity
    if row["event_type"] == "File Access":
        score += 5

    return min(score, 100)


# Convert risk score into risk level
def classify_risk(score):

    if score >= 80:
        return "Critical"

    elif score >= 60:
        return "High"

    elif score >= 30:
        return "Medium"

    else:
        return "Low"


# Load security logs
df = pd.read_csv("data/security_logs.csv")


# Calculate risk scores
df["risk_score"] = df.apply(
    calculate_risk_score,
    axis=1
)


# Classify risk levels
df["risk_level"] = df["risk_score"].apply(
    classify_risk
)


# Save analyzed security events
df.to_csv(
    "data/analyzed_security_logs.csv",
    index=False
)


print("Security analysis complete!")

print("\nRisk Summary:")

print(
    df["risk_level"].value_counts()
)


print("\nAverage Risk Score:")

print(
    round(df["risk_score"].mean(), 2)
)


print("\nHighest Risk Events:")

print(
    df.sort_values(
        "risk_score",
        ascending=False
    )
    .head(10)
)


print("\nCritical Events:")

print(
    df[df["risk_level"] == "Critical"]
    .head(10)
)