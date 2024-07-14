import express from 'express';
import morgan from 'morgan';
import {check, validationResult} from 'express-validator';
import ProposalDAO from "./dao/proposalDAO.mjs";
import Proposal, { Vote } from './components/Proposal.mjs';
import { ProposalOverToBudgetError, WrongFaseError, BudgetNotExistError, FaseError, NotAdminError, NotAdminErrorBudget, ProposalAlreadyExistsError, ProposalsNotFoundError, UnauthorizedUserError, UnauthorizedUserErrorVote, VoteNotFoundError, AlreadyThreeProposalsError } from './errors/proposalError.mjs';
import UserDAO from './dao/userDAO.mjs';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import cors from 'cors';
import BudgetSociale from './components/BudgetSociale.mjs';

//Istanze dei DAO
const proposalDAO = new ProposalDAO();
const userDAO = new UserDAO();

//Inizializzazione express
const app = new express();

app.use(morgan('dev'));
app.use(express.json());

/** Set up and abilitazione di CORS **/
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions))


/** Passport **/
/**
 * Funzione per trovare l'user con le credenziali fornite
 * Se non viene trovato alcun utente, la funzione ritorna un callback con false e un messaggio di errore
 * Se l'utente viene trovato, viene restituito al callback. Le informazioni dell'utente saranno memorizzate nella sessione
 */
passport.use(new LocalStrategy(async function verify(username, password, callback){
  const user = await userDAO.getUserByCredentials(username, password)
  if(!user)
    return callback(null, false, "Incorrect username or password")

  return callback(null, user)
}))

/**
 * Serializzazione dell'utente nella sessione
 * serializeUser: Questa funzione prende l'oggetto utente restituito dalla strategia locale e lo memorizza nella sessione
 */
passport.serializeUser(function (user, callback) {
  callback(null, user)
})

/**
 * Deserializzazione dell'utente dalla sessione
 * Partendo dai dati in sessione, estraiamo il corrente utente loggato
 */
passport.deserializeUser(function (user, callback) {
  return callback(null, user);
});

/**
 * Creazione della sessione
 */
app.use(session({
    secret: "This is a very secret information used to initialize the session!",
    resave: false, //Impedisce di salvare la sessione se non ci sono state modifiche.
    saveUninitialized: false, //Impedisce di salvare una sessione vuota.
}));

app.use(passport.authenticate('session'));

/**
 * Autenticazione con verification middleware
 */
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

/** Users APIs **/
/**
 * Route usata per eseguire il login
 * POST /api/sessions
 */
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if(err)
      return next(err);
      if(!user) {
        //messaggio di errore login
        return res.status(401).json({ error: info });
      }
      //esegue la login e stabilisce la sessione
      req.login(user, (err) => {
        if (err)
          return next(err);

        // req.user contiene le info dell'user autenticato
        return res.json(req.user);
      })
  })(req, res, next);
});

/**
 * Route che controlla se l'utente è loggato o meno
 * GET /api/sessions/current
 */
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

/**
 * Route per logout
 * DELETE /api/session/current
 */
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

/**
 * Inizializza l'applicazione creando un nuovo budget e impostando la fase a 0, fornendo le informazioni necessarie
 * POST /api/init
 */
app.post('/api/init', isLoggedIn, [
  check('amount').isNumeric().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const budget = new BudgetSociale(undefined, req.body.amount, 0)

  try {
    const result = await userDAO.initApp(req.user.id, budget)
    res.json(result);
  } catch (err) {
    if (err instanceof NotAdminErrorBudget) {
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(503).json({error: `Database error during init of application: ${err}`});
    }
  }
})

/**
 * Recupera il budget e la fase
 * GET /api/budgetandfase
 */
app.get('/api/budgetandfase', async (req, res) => {
  try{
    const result = await userDAO.getBudgetAndFase();
    if(result.error){
      res.status(404).json(result)
    } else {
      res.json(result);
    }
  } catch(err) {
    res.status(503).json({error: `Database error during the get of the budget`})
  }
});

/**
 * Avanza di 1 la fase
 * PUT /api/nextfase
 */
app.put('/api/nextfase', isLoggedIn, async (req, res) => {
  try{
    const result = await userDAO.nextPhase(req.user.id);
    if(result.error){
      res.status(404).json(result);
    } else {
      res.json(result);
    }
  } catch (err){
    if(err instanceof NotAdminErrorBudget, BudgetNotExistError, FaseError){
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(503).json({error: `Database error during the update the phase`});
    }
  }
})

/** Proposal APIs **/
/*** FASE 1 ***/

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
 * Get della proposta dato il suo id
 * GET /api/proposals/id/:proposalId
 */
app.get('/api/proposals/id/:proposalId', isLoggedIn, async (req, res) => {
  try{
    const result = await proposalDAO.getOnceProposalById(req.params.proposalId);
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
  check('description').isString().notEmpty().isLength({ max: 50 }),
  check('cost').isNumeric().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const proposal = new Proposal(undefined, req.user.id, req.body.description, req.body.cost, 0)

  try {
    const result = await proposalDAO.addProposal(proposal, req.user.id)
    res.json(result);
  } catch (err) {
    if (err instanceof WrongFaseError, ProposalAlreadyExistsError, BudgetNotExistError, ProposalOverToBudgetError, AlreadyThreeProposalsError) {
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
  check('description').isString().notEmpty().isLength({ max: 50 }),
  check('cost').isNumeric()
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
    if(err instanceof UnauthorizedUserError, WrongFaseError, BudgetNotExistError, ProposalsNotFoundError){
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
    if(err instanceof UnauthorizedUserError, WrongFaseError, BudgetNotExistError){
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(503).json({error: `Database error during the deletion of proposal ${req.params.id}: ${err} `});
    }
  }
})

/*** FASE 2 ***/
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
    if(err instanceof UnauthorizedUserErrorVote, BudgetNotExistError, WrongFaseError){
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(503).json({error: `Database error during the vote of proposal ${req.params.id}: ${err}`});
    }
  }
})

/**
 * Get delle proposte votate da uno user
 * GET /api/proposals/voted/:id
 */
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

/**
 * Rimuove lo score di una proposta precedentemente votata da un utente
 * DELETE api/proposals/voted/:id
 */
app.delete('/api/proposals/voted/delete/:id', isLoggedIn, async(req, res) => {
  try{
    await proposalDAO.deleteOwnPreference(req.user.id, req.params.id);
    res.status(200).end();
  } catch (err) {
    if(err instanceof UnauthorizedUserError, BudgetNotExistError, WrongFaseError){
      res.status(err.code).json({ error: err.message });
    } else {
    res.status(503).json({error: `Database error during the deletion of score of proposal ${req.params.id}: ${err} `});
    }
  }
});

/*** FASE 3 ***/
/**
 * Ordina le proposte in base al total_score in ordine decrescente (API intermedia per l'approvazione)
 * GET /api/proposal/ordered
 */
app.get('/api/proposal/ordered', isLoggedIn, async (req, res) => {
  try{
    const result = await proposalDAO.getProposalsOrderedToScore()
    if(result.error) {
      res.status(404).json(result)
    } else {
      res.json(result)
    }
  } catch (err){
    if(err instanceof ProposalsNotFoundError) {
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(500).end();
    }
  }
})

/**
 * Approva le proposte che rientrano nel budget
 * PUT /api/proposal/approve
 */
app.put('/api/proposal/approve', isLoggedIn, async (req, res) => {
  try{
    const result = await proposalDAO.approveProposals()
    if(result.error){
      res.status(404).json(result);
    } else {
      res.json(result);
    }
  } catch(err) {
    if(err instanceof WrongFaseError) {
      res.status(err.code).json({ error: err.message });
    } else {
    res.status(503).json({error: `Database error during the update of approved field's proposal`})
    }
  }
})

/**
 * Recupera le proposte approvate in ordine decrescente di total_score
 * GET /api/proposal/approved
 */
app.get('/api/proposal/approved', async (req, res) => {
  try{
    const result = await proposalDAO.getProposalApproved()
    if(result.error) {
      res.status(404).json(result)
    } else {
      res.json(result)
    }
  } catch (err){
    if(err instanceof ProposalsNotFoundError) {
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(500).end();
    }
  }
})

/**
 * Recupera le proposte non approvate in ordine decrescente di total_score
 * GET /api/proposal/notApproved
 */
app.get('/api/proposal/notApproved', isLoggedIn, async (req, res) => {
  try{
    const result = await proposalDAO.getProposalNotApproved()
    if(result.error) {
      res.status(404).json(result)
    } else {
      res.json(result)
    }
  } catch (err){
    if(err instanceof ProposalsNotFoundError) {
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(500).end();
    }
  }
})

/**
 * Ricomincia il processo eliminando le tuple nelle tabelle Vote, Proposal e BudgetSociale
 * DELETE /api/proposal/restart
 */
app.delete('/api/proposal/restart', isLoggedIn, async(req, res) => {
  try{
    await userDAO.restartProcess(req.user.id);
    res.status(200).end();
  } catch (err) {
    if(err instanceof NotAdminError, WrongFaseError, BudgetNotExistError){
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(503).json({error: `Database error during the deletion of proposal`});
    }
  }
})

//Attivazione del server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));