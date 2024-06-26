[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/OLXYiqlj)
# Exam #N: "Exam Title"
## Student: s123456 LASTNAME FIRSTNAME 

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

- POST `/api/something`
  - request parameters and request body content
  - response body content
- GET `/api/something`
  - request parameters
  - response body content
- POST `/api/something`
  - request parameters and request body content
  - response body content
- ...

- GET `/api/proposals/:userId`
  - Description: Recupera tutte le proposte create da uno specifico utente
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: Array di proposte

  ``` json
  [
    {
      "id": 1,
      "userId": 2,
      "description": "Acquisto di nuovi libri per la biblioteca comunitaria",
      "cost": 500,
      "approved": 0
    },
    {
      "id": 3,
      "userId": 2,
      "description": "Pulizia villa comunale",
      "cost": 200,
      "approved": 1
    },
    ...
  ]
  ```

  - Error responses: `500 Internal Server Error` (generic error), `404 Proposals not found`

- POST `/api/proposals`
  - Description: Aggiunge una nuova proposta di uno specifico user
  - Request body: descrizione della proposta da aggiungere

  ``` json
    {
      "user_id": 2,
      "description": "Pulizia fondale marino",
      "cost": 450
    }
    ```
    
    - Response: `200 OK` (success)
    - Response body: Intera proposta aggiunta
    
    ``` json
    {
      "id": 7,
      "userId": 2,
      "description": "Pulizia fondale marino",
      "cost": 450,
      "approved": 0
    }
  ```

  - Error responses: `404 Proposal Already Exists` (proposal already exists), `422 Unprocessable Entity` (invalid input), `503 Service Unavailable` (database error)

- PUT `/api/proposals/:id`
  - Description: Modifica la proposta di uno specificato utente
  - Request body: descrizione della proposta da modificare

  ``` json
  {
    "description": "Acquisto di nuovi libri per la biblioteca comunale",
    "cost": 300
  }
  ```

  - Response: `200 OK` (success)
  - Response body: Intera proposta aggiunta
  
  ``` json
  {
    "id": "1",
    "userId": 2,
    "description": "Acquisto di nuovi libri per la biblioteca comunale",
    "cost": 300,
    "approved": 0
  }
  ```
  - Error responses: `404 Another user's proposal` (proposal of another user), `422 Unprocessable Entity` (invalid input), `503 Service Unavailable` (database error)

- DELETE `/api/proposals/:id`
  - Description: Elimina la proposta di un determinato utente
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: _None_
  - Error responses:  `404 Another user's proposal` (proposal of another user), `503 Service Unavailable` (database error)


  


## Database Tables

- Table `users` - contains xx yy zz
- Table `something` - contains ww qq ss
- ...

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- username, password (plus any other requested info)
- username, password (plus any other requested info)
