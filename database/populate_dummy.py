import sqlite3
import random
import string
import datetime

database_path = "fill_in"

# connect to the database
conn = sqlite3.connect(database_path)
c = conn.cursor()

# First delete all existing data
def delete_all():
    for table in ['AccountProjectMapping', 'DeviceSensorConfiguration', 'DeviceSensorMapping', 'SessionDeviceMapping', 'SensorProperty', 'Sensor', 'Manufacturer', 'SensorCategory', 'Device', 'Session', 'Project', 'Account']:
        c.execute(f'DELETE FROM {table};')

delete_all();

# Create dummy accounts
accounts = [
    (1, 1, "Test", "password123", "admin", "test@example.com", None, "2023-01-01", 0, 1),
    (2, 1, "Bob Smith", "password123", "student", "bob@example.com", None, "2023-01-02", 0, 1),
    (3, 1, "Charlie Brown", "password123", "student", "charlie@example.com", None, "2023-01-03", 0, 0),
    (4, 1, "David Wilson", "password123", "student", "david@example.com", None, "2023-01-04", 0, 1),
    (5, 1, "Eva Green", "password123", "student", "eva@example.com", None, "2023-01-05", 0, 0)
]

c.executemany('''
    INSERT INTO Account (accountId, enabled, name, password, role, email, meta, createdAt, hasChangedPassword, hasAvatar)
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
    INSERT INTO Project (projectId, name, description, meta, createdAt, lastActive, archived)
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
    INSERT INTO Session (sessionId, name, status, scheduledFrom, scheduledTo, meta, createdAt, lastActive, archived)
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
    INSERT INTO Device (deviceId, connectStatus, maxHz)
    VALUES (?, ?, ?)
''', devices)

# Create dummy sensor categories
sensor_categories = [
    ("Temperature"),
    ("Pressure"),
    ("Humidity")
]

c.executemany('''
    INSERT INTO SensorCategory (categoryName)
    VALUES (?)
''', [(category,) for category in sensor_categories])

# Create dummy manufacturers
manufacturers = [
    ("SensorCo"),
    ("DeviceInc"),
    ("GadgetWorks")
]

c.executemany('''
    INSERT INTO Manufacturer (manufacturerName)
    VALUES (?)
''', [(manufacturer,) for manufacturer in manufacturers])

# Create dummy sensors
sensors = [
    ("TempSensor", "SensorCo", "Temperature", "Temperature"),
    ("PressureSensor", "DeviceInc", "Pressure", "Pressure"),
    ("HumiditySensor", "GadgetWorks", "Humidity", "Humidity")
]

c.executemany('''
    INSERT INTO Sensor (model, manufacturerName, categoryName, propertyName)
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
    INSERT INTO SensorProperty (propertyName, model, manufacturerName)
    VALUES (?, ?, ?)
''', sensor_properties)

# Create mappings between sessions and devices
session_device_mappings = [
    (1, 1),  # Session 1 is using Device 1
    (1, 2),  # Session 1 is using Device 2
    (2, 3),  # Session 2 is using Device 3
    (3, 4),  # Session 3 is using Device 4
    (4, 1),  # Session 4 is using Device 1
    (4, 5),  # Session 4 is using Device 5
    (5, 2)   # Session 5 is using Device 2
]

c.executemany('''
    INSERT INTO SessionDeviceMapping (sessionId, deviceId)
    VALUES (?, ?)
''', session_device_mappings)

# Create mappings between devices and sensors
device_sensor_mappings = [
    (1, "TempSensor", "SensorCo", 1),  # Device 1 is mapped to TempSensor
    (2, "PressureSensor", "DeviceInc", 1),  # Device 2 is mapped to PressureSensor
    (3, "HumiditySensor", "GadgetWorks", 1),  # Device 3 is mapped to HumiditySensor
    (4, "TempSensor", "SensorCo", 1),  # Device 4 is mapped to TempSensor
    (5, "PressureSensor", "DeviceInc", 1)   # Device 5 is mapped to PressureSensor
]

c.executemany('''
    INSERT INTO DeviceSensorMapping (deviceId, sensorModel, manufacturerName, channel)
    VALUES (?, ?, ?, ?)
''', device_sensor_mappings)


# Create mappings between accounts and projects
account_project_mappings = [
    (1, 1),
    (1, 2),
    (2, 1),
    (2, 3),
    (3, 4),
    (4, 5),
    (5, 1)
]

c.executemany('''
    INSERT INTO AccountProjectMapping (accountId, projectId)
    VALUES (?, ?)
''', account_project_mappings)

# Device sensor configurations
device_sensor_configurations = [
    (1, 1, "MaxTemperature", 1),  # Device 1 is configured to monitor MaxTemperature
    (1, 1, "MinTemperature", 0),  # Device 1 is configured to monitor MinTemperature
    (1, 1, "GyroX", 0),  # Device 1 is configured to monitor GyroX
    (1, 1, "GyroY", 1),  # Device 1 is configured to monitor GyroY
    (1, 1, "GyroZ", 0),  # Device 1 is configured to monitor GyroZ
    (1, 2, "PressureLevel", 1),  # Device 2 is configured to monitor PressureLevel
    (2, 3, "HumidityLevel", 1),  # Device 3 is configured to monitor HumidityLevel
    (3, 4, "MaxTemperature", 0),  # Device 4 is configured to monitor MaxTemperature
    (4, 1, "PressureLevel", 1),  # Device 1 is configured to monitor PressureLevel
    (4, 5, "HumidityLevel", 0),  # Device 5 is configured to monitor HumidityLevel
    (5, 2, "MaxTemperature", 1)   # Device 2 is configured to monitor MaxTemperature
]

c.executemany('''
    INSERT INTO DeviceSensorConfiguration (sessionId, deviceId, propertyName, active)
    VALUES (?, ?, ?, ?)
''', device_sensor_configurations)

# add 1 loginsession
loginsession = [
    (0, 1, "2023-01-01", "Mozilla/5.0", "127.000.1", "1234567890")
]

c.executemany('''
    INSERT INTO LoginSession (loginSessionId, account, loginSessionDate, userAgent, ip, token)
    VALUES (?, ?, ?, ?, ?, ?)
''', loginsession)


# Commit the changes and close the connection
conn.commit()
conn.close()

print("Dummy data inserted successfully.")



