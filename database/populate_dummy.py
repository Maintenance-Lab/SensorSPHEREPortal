import sqlite3
import random
import string
import datetime

# connect to the database
conn = sqlite3.connect('db.sqlite3')
c = conn.cursor()

# Create dummy accounts
accounts = [
    (1, 1, "Alice Johnson", "password123", "Admin", "alice@example.com", None, "2023-01-01", 0, 1),
    (2, 1, "Bob Smith", "password123", "User", "bob@example.com", None, "2023-01-02", 0, 1),
    (3, 1, "Charlie Brown", "password123", "User", "charlie@example.com", None, "2023-01-03", 0, 0),
    (4, 1, "David Wilson", "password123", "Admin", "david@example.com", None, "2023-01-04", 0, 1),
    (5, 1, "Eva Green", "password123", "User", "eva@example.com", None, "2023-01-05", 0, 0)
]

c.executemany('''
    INSERT INTO Account (AccountId, Enabled, Name, Password, Role, Email, Meta, CreatedAt, HasChangedPassword, HasAvatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
''', accounts)

# Create dummy projects
projects = [
    (1, "Project Alpha", "Description for project Alpha", None, "2023-01-01", "2023-09-01", 0),
    (2, "Project Beta", "Description for project Beta", None, "2023-02-01", "2023-09-02", 0),
    (3, "Project Gamma", "Description for project Gamma", None, "2023-03-01", "2023-09-03", 1),
    (4, "Project Delta", "Description for project Delta", None, "2023-04-01", "2023-09-04", 0),
    (5, "Project Epsilon", "Description for project Epsilon", None, "2023-05-01", "2023-09-05", 0)
]

c.executemany('''
    INSERT INTO Project (ProjectId, Name, Description, Meta, CreatedAt, LastActive, Archived)
    VALUES (?, ?, ?, ?, ?, ?, ?)
''', projects)

# Create dummy sessions
sessions = [
    (1, "Session 1", "Scheduled", "2023-06-01", "2023-06-10", None, "2023-01-01", "2023-09-01", 0),
    (2, "Session 2", "Completed", "2023-07-01", "2023-07-10", None, "2023-01-02", "2023-09-02", 0),
    (3, "Session 3", "Cancelled", "2023-08-01", "2023-08-10", None, "2023-01-03", "2023-09-03", 1),
    (4, "Session 4", "Scheduled", "2023-09-01", "2023-09-10", None, "2023-01-04", "2023-09-04", 0),
    (5, "Session 5", "Scheduled", "2023-10-01", "2023-10-10", None, "2023-01-05", "2023-09-05", 0)
]

c.executemany('''
    INSERT INTO Session (SessionId, Name, Status, ScheduledFrom, ScheduledTo, Meta, CreatedAt, LastActive, Archived)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
''', sessions)

# Create dummy devices
devices = [
    (1, 1, 100),
    (2, 1, 200),
    (3, 0, 150),
    (4, 1, 300),
    (5, 1, 250)
]

c.executemany('''
    INSERT INTO Device (DeviceId, ConnectStatus, MaxHz)
    VALUES (?, ?, ?)
''', devices)

# Create dummy sensor categories
sensor_categories = [
    ("Temperature"),
    ("Pressure"),
    ("Humidity")
]

c.executemany('''
    INSERT INTO SensorCategory (CategoryName)
    VALUES (?)
''', [(category,) for category in sensor_categories])

# Create dummy manufacturers
manufacturers = [
    ("SensorCo"),
    ("DeviceInc"),
    ("GadgetWorks")
]

c.executemany('''
    INSERT INTO Manufacturer (ManufacturerName)
    VALUES (?)
''', [(manufacturer,) for manufacturer in manufacturers])

# Create dummy sensors
sensors = [
    ("TempSensor", "SensorCo", "Temperature", "Temperature"),
    ("PressureSensor", "DeviceInc", "Pressure", "Pressure"),
    ("HumiditySensor", "GadgetWorks", "Humidity", "Humidity")
]

c.executemany('''
    INSERT INTO Sensor (Model, ManufacturerName, CategoryName, PropertyName)
    VALUES (?, ?, ?, ?)
''', sensors)

# Create dummy sensor properties
sensor_properties = [
    ("MaxTemperature", "TempSensor", "SensorCo"),
    ("MinTemperature", "TempSensor", "SensorCo"),
    ("PressureLevel", "PressureSensor", "DeviceInc"),
    ("HumidityLevel", "HumiditySensor", "GadgetWorks")
]

c.executemany('''
    INSERT INTO SensorProperty (PropertyName, Model, ManufacturerName)
    VALUES (?, ?, ?)
''', sensor_properties)

# Commit the changes and close the connection
conn.commit()
conn.close()

print("Dummy data inserted successfully.")



