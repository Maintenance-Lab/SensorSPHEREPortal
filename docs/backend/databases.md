# SensorSphere Portal Backend Database

The portal currently runs on a MongoDB database, and is using mongoose to interact with it.
All Database schemes are stored in the [Models folder](../../src/models/)

All models have a matching file in the [Services folder](../../src/services/) where all logic is handled. Functions to add, remove and edit data should be defined there.

These models are defined currently.
## Account Model
```ts
{
  _id: string;
  enabled: boolean;
  name: string;
  email: string;
  password: string;
  meta: object; // Extra info if needed
  createdBy?: string | AccountModel;
  createdAt?: Date;
  hasChangedPassword?: boolean;
  role: "administrator" | "student" | "teacher" | "staff";
  hasAvatar: boolean;
  pinnedProjects?: string[] | Project[];
}
```

## Login Sessions Model
```ts
{
  _id?: string;
  Account: AccountModel | string;
  date: Date;
  userAgent: string;
  ip: string;
  token: string;
}
```

## Project Model
```ts
{
  _id: string;
  name: string;
  description: string;
  meta: object; // Extra info if needed
  owner?: string | AccountModel;
  createdAt?: Date;
  sensorUnits?: string[];
  lastActive?: Date;
  archived?: boolean;
  collaborators?: string[] | AccountModel[]; // Array of Account IDs
}
```

## Session Model
```ts
{
  _id: string;
  name: string;
  description: string;
  project: string | Project;
  meta: object; // Extra info if needed
  createdAt?: Date;
  sensorUnits?: string[];
  lastActive?: Date;
  archived?: boolean;
  status: "inactive" | "active" | "activeScheduled" | "paused" | "completed" | "error" | "scheduled" | "stopped";
}
```