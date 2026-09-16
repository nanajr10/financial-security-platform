import psycopg2


def get_connection():
    return psycopg2.connect(
        dbname="financial_security",
        user="nanayeboah",
        host="localhost",
        port="5432"
    )