// imports
import express from 'express';
import morgan from 'morgan';
import {check, validationResult} from 'express-validator'; // validation middleware
import ProposalDAO from "./dao/proposalDAO.mjs";
import Proposal from './components/Proposal.mjs';
import { ProposalAlreadyExistsError, ProposalsNotFoundError, UnauthorizedUserError } from './errors/proposalError.mjs';

const proposalDAO = new ProposalDAO();

// init express and set up the middlewares
const app = new express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json());


/** Proposal APIs **/
//FASE 1

/**
 * Get di tutte le proposta di un utente dato il suo id
 * GET /api/proposals/:id
 * TO DO: mettere il controllo utente loggato
 */
app.get('/api/proposals/:userId', async (req, res) => {
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
 * TO DO: mettere il controllo utente loggato
 */
app.post('/api/proposals', [
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
 * TO DO: mettere il controllo utente loggato
 */
app.put('/api/proposals/:id', [
  check('description').isString().notEmpty(),
  check('cost').isNumeric().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const userId = req.body.user_id; //per il momento poi farò la isloggedin
  const proposal = new Proposal(req.params.id, /*per adesso*/userId, req.body.description, req.body.cost, 0);

  try{
    const result = await proposalDAO.updateProposal(/*per adesso*/userId, proposal.id, proposal);
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

app.delete('/api/proposals/:id', async(req, res) => {
  const userIdd = 2 //per il momento poi farò la isloggedin
  try {
    await proposalDAO.deleteProposal(userIdd, req.params.id);
    res.status(200).end();
  } catch (err) {
    if(err instanceof UnauthorizedUserError){
      res.status(err.code).json({ error: err.message });
    } else {
      res.status(503).json({error: `Database error during the deletion of film ${req.params.id}: ${err} `});
    }
  }
})

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});