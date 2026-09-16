import pandas as pd
import random
from datetime import datetime, timedelta

users = [
    "admin01",
    "employee01",
    "employee02",
    "employee03",
    "analyst01",
    "developer01",
    "trader01",
    "finance01",
]

event_types = [
    "Successful Login",
    "Failed Login",
    "Password Reset",
    "Privilege Change",
    "File Access",
    "Data Transfer",
]

locations = [
    "New York",
    "Connecticut",
    "New Jersey",
    "Texas",
    "California",
    "London",
    "Chicago",
]

ip_addresses = [
    "192.168.1.10",
    "192.168.1.20",
    "192.168.1.30",
    "10.0.0.15",
    "10.0.0.25",
    "172.16.0.10",
]

records = []

start_time = datetime.now() - timedelta(days=30)

for i in range(10000):

    timestamp = start_time + timedelta(
        minutes=random.randint(0, 30 * 24 * 60)
    )

    user = random.choice(users)
    event = random.choice(event_types)
    location = random.choice(locations)
    ip_address = random.choice(ip_addresses)

    failed_attempts = 0
    data_transferred_mb = 0
    privileged_account = user.startswith("admin")

    if event == "Failed Login":
        failed_attempts = random.randint(1, 10)

    if event == "Data Transfer":
        data_transferred_mb = random.randint(10, 5000)

    records.append({
        "event_id": i + 1,
        "timestamp": timestamp,
        "username": user,
        "event_type": event,
        "location": location,
        "ip_address": ip_address,
        "failed_attempts": failed_attempts,
        "data_transferred_mb": data_transferred_mb,
        "privileged_account": privileged_account,
    })

df = pd.DataFrame(records)

df.to_csv("data/security_logs.csv", index=False)

print("Security log dataset created!")
print(f"Total events: {len(df)}")
print("\nSample events:")
print(df.head())