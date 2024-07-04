[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/OLXYiqlj)
# Exam #N: "Exam Title"
## Student: s123456 LASTNAME FIRSTNAME 

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

- POST `/api/sessions`
  - Description: Esegue il login di un utente con le credenziali fornite
  - Request body: 
  ``` json
  {
    "username": "francesca.bianchi@gmail.com",
    "password": "abcd"
  }
  ```
  - Response: `200 OK` (success)
  - Response body: 
  ``` json
  {
    "id": 1,
    "username": "francesca.bianchi@gmail.com",
    "name": "Francesca",
    "surname": "Bianchi",
    "token": "some-auth-token"
  }
  ```
  - Error responses: `401 Unauthorized` (invalid credentials), `422 Unprocessable Entity` (missing or invalid input), `503 Service Unavailable` (database error)

- GET `/api/sessions/current`
  - Description: Controlla se l'utente è ancora loggato e restituisce le informazioni dell'utente corrente
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body:
  ``` json
  {
    "id": 1,
    "username": "francesca.bianchi@gmail.com",
    "name": "Francesca",
    "surname": "Bianchi",
    "token": "some-auth-token"
  }
  ```
   - Error responses: `401 Unauthorized` (invalid credentials), `503 Service Unavailable` (database error)

- DELETE `/api/sessions/current`
  - Description: Esegue il logout dell'utente corrente, terminando la sessione
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: _None_
  - Error responses: `401 Unauthorized` (invalid credentials), `503 Service Unavailable` (database error)



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
  - Error responses: `409 Proposal Already Exists` (proposal already exists), `422 Unprocessable Entity` (invalid input), `503 Service Unavailable` (database error)

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
  - Error responses: `403 Another user's proposal` (proposal of another user), `422 Unprocessable Entity` (invalid input), `503 Service Unavailable` (database error)

- DELETE `/api/proposals/:id`
  - Description: Elimina la proposta di un determinato utente
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: _None_
  - Error responses:  `403 Another user's proposal` (proposal of another user), `503 Service Unavailable` (database error)

- GET `/api/proposals`
  - Description: Recupera tutte le proposte presenti nel db
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

- POST `/api/proposals/:id/vote`
  - Description: Vota la proposta non propria inserendo una riga nella tabella Vote
  - Request body: 
  ``` json
  {
    "score": 3
  }
  ```
  - Response: `200 OK` (success)
  - Response body: score appena aggiunto
  - Error responses: `500 Internal Server Error` (generic error), `403 You cannot vote your proposal`

- GET `/api/proposals/voted/:id`
  - Description: Recupera tutte le proposte votate da uno specifico utente
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: Array di proposte

  ``` json
  [
    {
      "id": 2,
      "description": "Costruzione piscina giochi olimpici",
      "cost": 1800,
      "score": 3
    },
    {
      "id": 15,
      "description": "Pulizia fondale marino",
      "cost": 500,
      "score": 3
    }
  ]
  ```
 - Error responses: `500 Internal Server Error` (generic error), `404 User has not voted on any proposal`

- DELETE `/api/proposals/voted/delete/:id`
  - Description: Elimina la preferenza espressa precedentemente da un determinato utente
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: _None_
  - Error responses:  `403 Another user's proposal` (proposal of another user), `503 Service Unavailable` (database error)

- GET `/api/proposal/ordered`
  - Description: Ordina le proposte presenti nel database in base al total_score (somma degli score della stessa proposa) in ordine decrescente
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: Array di proposte
  ``` json
  [
    {
      "id": 2,
      "userId": 1,
      "description": "Costruzione piscina giochi olimpici",
      "cost": 1800,
      "approved": 0,
      "total_score": 6
    },
    {
      "id": 1,
      "userId": 2,
      "description": "Acquisto nuovi libri per la biblioteca comunale",
      "cost": 400,
      "approved": 0,
      "total_score": 3
    },
    ...
  ]
  ```
  - Error responses: `500 Internal Server Error` (generic error), `404 Proposals not found`

- PUT `/api/proposal/approve`
  - Description: Approva le proposte che rientrano nel budget
  - Request body: budget 
  ``` json
    {
      "budget": 3000
    }
  ```
  - Response: `200 OK` (success)
  - Response body: true
  - Error responses: `500 Internal Server Error` (generic error)

- GET `/api/proposal/approved`
  - Description: Recupera le proposte approvate presenti nel database in base al total_score (somma degli score della stessa proposa) in ordine decrescente
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: Array di proposte
  ``` json
  [
    {
      "id": 2,
      "description": "Costruzione piscina giochi olimpici",
      "member_name": "Marco Profilo",
      "cost": 1800,
      "total_score": 6
    },
    {
      "id": 1,
      "description": "Acquisto nuovi libri per la biblioteca comunale",
      "member_name": "Francesca Bianchi",
      "cost": 400,
      "total_score": 3
    },
    ...
  ]
  ```
  - Error responses: `500 Internal Server Error` (generic error), `404 Proposals not found`

- GET `/api/proposal/notApproved`
  - Description: Recupera le proposte non approvate presenti nel database in base al total_score (somma degli score della stessa proposa) in ordine decrescente
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: Array di proposte
  ``` json
  [
    {
      "id": 17,
      "description": "Costruzione area giochi per bambini",
      "cost": 1150,
      "total_score": 2
    },
    {
      "id": 16,
      "description": "Costruzione campi sportivi",
      "cost": 1800,
      "total_score": 0
    }
  ]
  ```
  - Error responses: `500 Internal Server Error` (generic error), `404 Proposals not found`

- DELETE `/api/proposal/restart`
  - Description: Svuota la tabella Vote, la tabella Proposal e la tabella Budget
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: true
  - Error responses:  `403 Only the admin can do the reset` (not admin), `503 Service Unavailable` (database error)

- POST `/api/init`
  - Description: Inizializza l'applicazione inserendo un nuovo budget e la fase a 0
  - Request body: Amount del budget
  ``` json
  {
    "amount": 3000
  }
  ```
  - Response: `200 OK` (success)
  - Response body: oggetto BudgetSociale
  ``` json
  {
    "id": 1,
    "amount": 3000,
    "current_fase": 0
  }
  ```
  - Error responses: `403 Only the admin can insert the budget` (not admin), `503 Service Unavailable` (database error)

- GET `/api/budgetandfase`
  - Description: Recupera il budget e la fase attuale
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: budget
  ``` json
  {
    "id": 1,
    "amount": 3000,
    "current_fase": 0
  }
  ```
  - Error responses: `503 Service Unavailable` (database error), `404 Budget not found` (budget not exist)

- PUT `/api/nextfase`
  - Description: Avanza di uno la fase
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: true
  - Error responses: `503 Service Unavailable` (database error), `403 Only the admin can insert the budget or next phase` (not admin error budget), `404 Budget not found` (budget not exist), `403 The phase not allowed` (Fase error)



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
