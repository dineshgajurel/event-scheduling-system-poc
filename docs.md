## Event Scheduling System (POC)

### Major Tools and Technologies used:

1.  Scripting:

- Typescript/Javascript

2.  Run environment

- Node (Node.js 18.x or more recommended)

3.  Framework

- NestJS

4.  Database:
   -PostgreSQL

- TypORM (Database ORM)

5.  Luxon (Library to handle Date and Time)

and so on......

### Before Start:

1. clone the repository:

[SSH](git@github.com:dineshgajurel/event-scheduling-system-poc.git)

[HTTPS](https://github.com/dineshgajurel/event-scheduling-system-poc.git)

1. run and up the PostgreSQL

`Note: there is docker config available if you want to run and test the postgres db locally if that helps you.`

1. use the .env file to define environment configuration

`Note: there is .env.example file to help you`

1. update "src/config/typeorm.config.ts" to make synchronize true for local run and testing
  `Note: there is also migration configured and added if that might help you`

1. We need user data as well to simulate the user and related functionalities, so generate some random data

- for now please use this SQL script to generate some user data
 (sorry for not being able to complete the seeder this time 🙂)

          INSERT
              INTO
              users (username,
              name,
              country)
          VALUES ('rohit_np',
          'Rohit Poudel',
          'Nepal'),
          ('rohit_ind',
          'Rohit Sharma',
          'India'),
          ('monank',
          'Monank Patel',
          'USA'),
          ('tatsuro',
          'Tatsuro Chino',
          'Japan', true);

5. For all the /events endpoints we need to provide the user-id in the header (to simulate user authentication/user-level functionalities)

and of course, other stuff that will be needed to run the project 🙂 ...

### Initial Note/concerns:

1. There was/is some confusion about users and participants. However, I have finalized by separating the user as the owner of the event and the participant as the attendee of the event.
2. There was/is some confusion about user input start and end time. However, I have finalized by accepting users' local time (respective timezone), saving it in the UTC format in the database, and displaying it back to the local time zone accordingly.

other can be discussed 🙂...

## Place to future improvements

1. A New User module can be considered to handle all the user/Auth related functionalities
2. The user-id middleware can be extended to actual auth middleware and handle all the auth-related functions
3. The Seeder script to generate users and other required data (couldnot finalized that due to time limit and wanted to complete functionalities first)
4. The /event PATCH request can be further extended to handle and manage all the event-related (like scheduling time, timezone, etc.) and participant-related functionalities of respective events/users. We can use the already implemented logic in the create events (to handle timezone, schedule conflict, etc.).
5. While working on it, I realized we can handle all the events with a recurrence approach by using once instead of none. (but can be finalized and improved later). for now, I have left both approaches working
6. The Participant module also can be further extended to authorize the user level access (events created by the user) -- note: if needed
7. Test cases (in fact, I wanted to go with TDD, but thought of completing the major functionlities without considering the test case due to time constraint)

and the further observations from your side while reviewing this repository 🙂...

## Major API endpoints

1.  Create Events

POST /events

sample payload:

header: user-id

body:

     {
         "title": "Team Meeting",
         "description": "Monthly team sync to discuss project updates",
         "startTime": "2024-11-23T17:31:18.157+05:45",
         "endTime": "2024-11-23T17:41:18.157+05:45",
         "timeZone": "Asia/Kathmandu",
         "location": "Zoom Meeting",
         "recurrence":"none/once/daily/weekly"
     }

### response:

- Success: 201

      {
          "message": "Event Created Successfully",
          "data": [
              {
                  "title": "Team Meeting",
                  "description": "Monthly team sync to discuss project updates",
                  "startTime": "2024-11-23T11:46:18.157Z",
                  "endTime": "2024-11-23T11:56:18.157Z",
                  "timeZone": "Asia/Kathmandu",
                  "location": "Zoom Meeting",
                  "userId": 1,
                  "user": {
                      "createdAt": "2024-11-24T06:29:57.842Z",
                      "updatedAt": "2024-11-24T06:29:57.842Z",
                      "id": 1,
                      "username": "rohit_np",
                      "name": "Rohit Poudel",
                      "country": "Nepal",
                      "subscription": false
                  },
                  "createdAt": "2024-11-24T00:54:58.416Z",
                  "updatedAt": "2024-11-24T00:54:58.416Z",
                  "id": 1
              },
              {
                  "title": "Team Meeting",
                  "description": "Monthly team sync to discuss project updates",
                  "startTime": "2024-11-24T11:46:18.157Z",
                  "endTime": "2024-11-24T11:56:18.157Z",
                  "timeZone": "Asia/Kathmandu",
                  "location": "Zoom Meeting",
                  "userId": 1,
                  "user": {
                      "createdAt": "2024-11-24T06:29:57.842Z",
                      "updatedAt": "2024-11-24T06:29:57.842Z",
                      "id": 1,
                      "username": "rohit_np",
                      "name": "Rohit Poudel",
                      "country": "Nepal",
                      "subscription": false
                  },
                  "createdAt": "2024-11-24T00:54:58.416Z",
                  "updatedAt": "2024-11-24T00:54:58.416Z",
                  "id": 2
              }
              ...
          ]
      }

- Error
 400 - bad request

{
"message": "Event overlaps with another event, title: \"Team Meeting, id: 1\"",
"error": "Bad Request",
"statusCode": 400
}

2.  Get all events
   GET /events
   header: user-id

       {
           "message": "Event created by user fetched Successfully",
           "data": [
               {
                   "createdAt": "2024-11-24T00:54:58.416Z",
                   "updatedAt": "2024-11-24T00:54:58.416Z",
                   "id": 1,
                   "title": "Team Meeting",
                   "description": "Monthly team sync to discuss project updates",
                   "startTime": "2024-11-23T11:46:18.157Z",
                   "endTime": "2024-11-23T11:56:18.157Z",
                   "timeZone": "Asia/Kathmandu",
                   "location": "Zoom Meeting",
                   "userId": 1,
                   "localStartTime": "2024-11-23T17:31:18.157+05:45",
                   "localEndTime": "2024-11-23T17:41:18.157+05:45"
               },
               ...
           ]
       }

3.  GET Event by ID:
   GET /events/{id}
4.  Update event:
   PATCH /events/{id}
5.  Delete event:
   DELETE /events/{id}

6.  Add participant in the event
   POST /participants

sample payload

     {
         "eventId": 15,
         "name":"Dinesh",
         "email":"dinesh@dinesh.com",
         "rsvpStatus":"pending"
     }

- success

      {
          "message": "Participant Created Successfully",
          "data": {
              "eventId": 1,
              "name": "Dinesh",
              "email": "dinesh@dinesh.com",
              "rsvpStatus": "pending",
              "event": {
                  "createdAt": "2024-11-24T00:54:58.416Z",
                  "updatedAt": "2024-11-24T00:54:58.416Z",
                  "id": 1,
                  "title": "Team Meeting",
                  "description": "Monthly team sync to discuss project updates",
                  "startTime": "2024-11-23T11:46:18.157Z",
                  "endTime": "2024-11-23T11:56:18.157Z",
                  "timeZone": "Asia/Kathmandu",
                  "location": "Zoom Meeting",
                  "userId": 1
              },
              "createdAt": "2024-11-24T01:10:39.089Z",
              "updatedAt": "2024-11-24T01:10:39.089Z",
              "id": 1
          }
      }

- error
- 400
 {
 "message": "Participant already added to this event",
 "error": "Bad Request",
 "statusCode": 400
 }

7.Update Participant (Get participant's response)

PATCH /participants/{id}

sample:

     http://localhost:3000/participants/1

     {
         "rsvpStatus":"accepted"
     }


     Success response: 200

     {
         "message": "Participant updated successfully",
         "data": {
             "createdAt": "2024-11-24T01:10:39.089Z",
             "updatedAt": "2024-11-24T01:12:18.788Z",
             "id": 1,
             "eventId": 1,
             "name": "Dinesh G",
             "email": "dinesh@dinesh.com",
             "rsvpStatus": "accepted"
         }
     }

     Error response: 400

     {
         "message": [
             "rsvpStatus must be one of the following values: accepted, declined, pending"
         ],
         "error": "Bad Request",
         "statusCode": 400
     }

8. Get all participants:
  GET /participants

9. Get Participant by ID:
  GET /participants/{id}

10. delete participant:
   DELETE /participants/{id}

