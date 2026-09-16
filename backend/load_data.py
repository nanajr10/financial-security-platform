import pandas as pd
from backend.database import get_connection


# Load analyzed security data
df = pd.read_csv("data/analyzed_security_logs.csv")

connection = get_connection()
cursor = connection.cursor()

# Update existing security events
for _, row in df.iterrows():

    cursor.execute("""
        INSERT INTO security_events (
            event_id,
            timestamp,
            username,
            event_type,
            location,
            ip_address,
            failed_attempts,
            data_transferred_mb,
            privileged_account,
            risk_score,
            risk_level
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (event_id)
        DO UPDATE SET
            timestamp = EXCLUDED.timestamp,
            username = EXCLUDED.username,
            event_type = EXCLUDED.event_type,
            location = EXCLUDED.location,
            ip_address = EXCLUDED.ip_address,
            failed_attempts = EXCLUDED.failed_attempts,
            data_transferred_mb = EXCLUDED.data_transferred_mb,
            privileged_account = EXCLUDED.privileged_account,
            risk_score = EXCLUDED.risk_score,
            risk_level = EXCLUDED.risk_level;
    """, (
        int(row["event_id"]),
        row["timestamp"],
        row["username"],
        row["event_type"],
        row["location"],
        row["ip_address"],
        int(row["failed_attempts"]),
        int(row["data_transferred_mb"]),
        bool(row["privileged_account"]),
        int(row["risk_score"]),
        row["risk_level"]
    ))

connection.commit()

cursor.close()
connection.close()

print("Security events updated successfully!")
print(f"Total events processed: {len(df)}")