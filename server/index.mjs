import express from 'express';
import morgan from 'morgan';
import {check, validationResult} from 'express-validator'; // validation middleware
import ProposalDAO from "./dao/proposalDAO.mjs";
import Proposal, { Vote } from './components/Proposal.mjs';
import { ProposalAlreadyExistsError, ProposalsNotFoundError, UnauthorizedUserError, UnauthorizedUserErrorVote, VoteNotFoundError } from './errors/proposalError.mjs';
import UserDAO from './dao/userDAO.mjs';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session'; //middleware per gestire le sessioni in Express.
import cors from 'cors';

const proposalDAO = new ProposalDAO();
const userDAO = new UserDAO();

// init express and set up the middlewares
const app = new express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json());


/** Passport **/
/**
 * Funzione per trovare user con credenziali fornite
 * Se non viene trovato alcun utente, la funzione ritorna un callback con false e un messaggio di errore.
 * Se l'utente viene trovato, viene restituito al callback. Le informazioni dell'utente saranno memorizzate nella sessione.
 */
passport.use(new LocalStrategy(async function verify(username, password, callback){
  const user = await userDAO.getUserByCredentials(username, password)
  if(!user)
    return callback(null, false, "Incorrect username or password")

  return callback(null, user)
}))

/**
 * Serializzazione dell'utente nella sessione
 * serializeUser: Questa funzione prende l'oggetto utente restituito dalla strategia locale e lo memorizza nella sessione.
 */
passport.serializeUser(function (user, callback) {
  callback(null, user)
})

/**
 * Deserializzazione dell'utente dalla sessione
 * Partendo dai dati in sessione, estraiamo il corrente utente loggato
 */
passport.deserializeUser(function (user, callback) {
  return callback(null, user); // this will be available in req.user
});

/** Creating the session */

app.use(session({
    secret: "This is a very secret information used to initialize the session!",
    resave: false, //Impedisce di salvare la sessione se non ci sono state modifiche.
    saveUninitialized: false, // Impedisce di salvare una sessione vuota.
}));
//Configura Passport per utilizzare l'autenticazione basata su sessione
//Questo middleware è responsabile di recuperare l'utente autenticato dalla sessione e rendere disponibile 
//req.isAuthenticated().
app.use(passport.authenticate('session'));

/**
 * Defining authentication verification middleware
 */
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

/** Users APIs **/

/**
 * Route usata per fare il login
 * POST /api/sessions
 */
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if(err)
      return next(err);
      if(!user) {
        // display wrong login messages
        return res.status(401).json({ error: info });
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);

        // req.user contiene l'user autenticato, inviamo indietro le info dello user
        return res.json(req.user);
      })
  })(req, res, next);
});

/**
 * Route controlla se l'utente è loggato o meno
 * GET /api/sessions/current
 */
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

/**
 * Route per loggin out
 * DELETE /api/session/current
 */
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});


/** Proposal APIs **/
//FASE 1

/**
 * Get di tutte le proposta di un utente dato il suo id
 * GET /api/proposals/:id
 */
app.get('/api/proposals/:userId', isLoggedIn, async (req, res) => {
  try{
    const result = await proposalDAO.getProposalById(req.params.userId);
    if(result.error){
      res.status(404).json(result)
    } else {
      res.json(result);
    }
  } catch (err) {
    if (err instanceof ProposalsNotFoundError) {
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(500).end();
    }
  }
});

/**
 * Crea una nuova proposta, fornendo le informazioni necessarie
 * POST /api/proposals
 */
app.post('/api/proposals', isLoggedIn, [
  check('user_id').isNumeric().notEmpty(),
  check('description').isString().notEmpty(),
  check('cost').isNumeric().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const proposal = new Proposal(undefined, req.body.user_id, req.body.description, req.body.cost, 0)

  try {
    const result = await proposalDAO.addProposal(proposal)
    res.json(result);
  } catch (err) {
    if (err instanceof ProposalAlreadyExistsError) {
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(503).json({error: `Database error during the creation of the new proposal: ${err}`});
    }
  }
})

/**
 * Modifica una proposta dato il suo id, fornendo le informazioni necessarie
 * PUT /api/proposals/:id
 */
app.put('/api/proposals/:id', isLoggedIn, [
  check('description').isString().notEmpty(),
  check('cost').isNumeric().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const proposal = new Proposal(req.params.id, req.user.id, req.body.description, req.body.cost, 0);

  try{
    const result = await proposalDAO.updateProposal(req.user.id, proposal.id, proposal);
    if(result.error){
      res.status(404).json(result);
    } else {
      res.json(result);
    }
  } catch (err) {
    if(err instanceof UnauthorizedUserError){
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(503).json({error: `Database error during the update of proposal ${req.params.id}: ${err}`});
    }
  }
})

/**
 * Elimina la proposta in base al suo id
 * DELETE /api/proposals/:id
 */
app.delete('/api/proposals/:id', isLoggedIn, async(req, res) => {
  try {
    await proposalDAO.deleteProposal(req.user.id, req.params.id);
    res.status(200).end();
  } catch (err) {
    if(err instanceof UnauthorizedUserError){
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(503).json({error: `Database error during the deletion of film ${req.params.id}: ${err} `});
    }
  }
})

//Fase 2
/**
 * Get di tutte le proposte presenti nel db
 * GET /api/proposals
 */
app.get('/api/proposals', isLoggedIn, async (req, res) => {
  try{
    const result = await proposalDAO.getAllProposals()
    if(result.error){
      res.status(404).json(result)
    } else {
      res.json(result);
    }
  } catch (err) {
    if (err instanceof ProposalsNotFoundError) {
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(500).end();
    }
  }
});

/**
 * Vota una proposta creando una riga nella tabella Vote
 * POST /api/proposals/:id/vote
 */
app.post('/api/proposals/:id/vote', isLoggedIn, [
  check('score').isInt({ min: 1, max: 3 }).notEmpty()
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const vote = new Vote(req.user.id, req.params.id, req.body.score);
  try{
    const result = await proposalDAO.voteProposal(req.user.id, vote.proposalId, vote.score);
    if(result.error){
      res.status(404).json(result);
    } else {
      res.json(result);
    }
  } catch (err) {
    if(err instanceof UnauthorizedUserErrorVote){
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(503).json({error: `Database error during the vote of proposal ${req.params.id}: ${err}`});
    }
  }
})

app.get('/api/proposals/voted/:id', isLoggedIn, async (req, res) => {
  try{
    const result = await proposalDAO.getOwnPreference(req.params.id)
    if(result.error){
      res.status(404).json(result)
    } else {
      res.json(result);
    }
  } catch (err) {
    if (err instanceof VoteNotFoundError) {
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(500).end();
    }
  }
});


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});