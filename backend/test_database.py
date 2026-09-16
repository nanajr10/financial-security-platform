from backend.database import get_connection


connection = get_connection()

print("Successfully connected to PostgreSQL!")

connection.close()