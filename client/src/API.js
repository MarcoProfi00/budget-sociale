import BudgetSociale from "../../server/components/BudgetSociale.mjs";
import Proposal, { ProposalsApproved, ProposalsNotApproved } from "../../server/components/Proposal.mjs"
import { ProposalWithVote } from "../../server/components/Proposal.mjs";

const SERVER_URL = 'http://localhost:3001/api';

/**
 * Esegue la login
 * Vuole username e password dentro all'oggetto "credentials"
 */
const logIn = async (credentials) => {
    return await fetch(SERVER_URL + '/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        //questo parametro specifica che il cookie di autenticazione deve essere inoltrato. È incluso in tutte le API autenticate.
        credentials: 'include',
        body: JSON.stringify(credentials),
    }).then(handleInvalidResponse)
    .then(response => response.json());
};

/**
 * Verifica se l'utente è ancora loggato
 * Ritorna un oggetto JSON con le info dello user
 */
const getUserInfo = async () => {
    return await fetch(SERVER_URL + '/sessions/current', {
        credentials: 'include'
    })
    .then(handleInvalidResponse)
    .then(response => response.json())
    .then(data => {
        setUserRole(data.role); // Imposta il ruolo dell'utente nello stato
        return data; // Restituisci tutti i dati dell'utente, se necessario
    });
};

/**
 * Esegue il logout eliminando la sessione corrente
*/
const logOut = async() => {
    return await fetch(SERVER_URL + '/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    }).then(handleInvalidResponse);
}

/**
 * Esegue l'inizalizzazione dell'applicazione creando un BudgetSociale con budget definito e current_fase = 0
 * @param {*} amount budget da inizializzare
 */
async function initApp(amount) {
    return await fetch(SERVER_URL + '/init', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount })
    }).then(handleInvalidResponse)
};

/**
 * Ritorna il budget e la fase
 */
async function getBudgetAndFase() {
    try {
      const response = await fetch(SERVER_URL + '/budgetandfase', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const budgetSociale = await response.json();
      return budgetSociale;
    } catch (error) {
      console.error('Error fetching budget and fase:', error);
      throw error; // Rilancia l'errore per gestirlo più a monte
    }
}

/**
 * Avanza la fase
 */
async function nextFase(){
    return await fetch(SERVER_URL + '/nextfase', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }).then(handleInvalidResponse)
}

/**
 * Restituisce le proposte di un utente
 */
async function getMyProposals(userId) {
    const proposals = await fetch(SERVER_URL + `/proposals/${userId}`, { credentials: 'include' })
        .then(handleInvalidResponse)
        .then(response => response.json())
        .then(mapApiProposalsToProposals);

    return proposals;
}

/**
 * Restituisce la proposta dato il suo id
 */
async function getProposalById(proposalId) {
    try {
      const response = await fetch(`${SERVER_URL}/proposals/id/${proposalId}`, {
        credentials: 'include'
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
  
      const proposal = await response.json();
      return proposal;
    } catch (error) {
      console.error('Error fetching proposal by ID:', error);
      throw error;
    }
}

/**
 * Elimina la proposta dell'utente in base all'id della proposta
 * @param {*} userId id dell'utente autore della proposta
 * @param {*} proposalId id della proposta da eliminare
 */
async function deleteProposal(userId, proposalId) {
    return await fetch(SERVER_URL + `/proposals/${proposalId}`, { 
        method: 'DELETE',
        credentials: 'include',
    }).then(handleInvalidResponse);
}

/**
 * Aggiunge una nuova proposta
 * @param {*} proposal proposta da aggiungere
 */
async function addProposal(proposal, userId) {
    return await fetch(SERVER_URL + '/proposals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(proposal)
    }).then(handleInvalidResponse);
}

/**
 * Aggiorna una proposta esistente
 * @param {*} proposal proposta da modificare
 */
async function updateProposal(proposal) {
    return await fetch(SERVER_URL + `/proposals/${proposal.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(proposal)
    }).then(handleInvalidResponse);
}

/**
 * Restiuisce tutte le proposte
 */
async function getAllProposals() {
    const proposals = await fetch(SERVER_URL + `/proposals/`, { credentials: 'include' })
        .then(handleInvalidResponse)
        .then(response => response.json())
        .then(mapApiProposalsToProposals);

    return proposals;
}

/**
 * Vota la proposta selezionata con lo score indicato
 * @param {*} userId id dell'utente loggato
 * @param {*} proposalId id della proposta da votare
 * @param {*} score puntaggio assegnato alla proposta
 */
async function voteProposal(userId, proposalId, score) {
    return await fetch (SERVER_URL + `/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ score: score })
    }).then(handleInvalidResponse);
}

/**
 * Restituisce le proposte votate da un utente
 * @param {*} userId id dell'utente 
 */
async function getMyPreferences(userId) {
    const preferences = await fetch(SERVER_URL + `/proposals/voted/${userId}`, { credentials: 'include' })
        .then(handleInvalidResponse)
        .then(response => response.json())
        .then(mapApiPreferencesToPreferences);
    return preferences;
}

/**
 * Elimina la preferenza selezionata
 * @param {*} userId id dell'utente
 * @param {*} proposalId id della proposta
 */
async function deletePreference(userId, proposalId) {
    return await fetch(SERVER_URL + `/proposals/voted/delete/${proposalId}`, {
        method: 'DELETE',
        credentials: 'include',
    }).then(handleInvalidResponse)
}

/**
 * Approva le proposte
 * Le proposte vengono approvate in base al budget la cui ricerca avviene direttamente nel DAO
 */
async function approveProposals(userId) {
    return await fetch(SERVER_URL + "/proposal/approve", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    }).then(handleInvalidResponse)
}

/**
 * Restiuisce le proposte approvate ordinate in modo decrescente per total score
 */
async function getApprovedProposals() {
    const approvedProposals = await fetch(SERVER_URL + "/proposal/approved")
        .then(handleInvalidResponse)
        .then(response => response.json())
        .then(mapApiApprovedProposalsToApprovedProposals);
    return approvedProposals
}

/**
 * Restiuisce le proposte non approvate ordinate in modo decrescente per total score
 */
async function getNotApprovedProposals() {
    const notApprovedProposals = await fetch(SERVER_URL + "/proposal/notApproved", { credentials: 'include' })
        .then(handleInvalidResponse)
        .then(response => response.json())
        .then(mapApiNotApprovedProposalsToNotApprovedProposals);
    return notApprovedProposals;
}

/**
 * Ricomincia il processo da zero, eliminando budget, proposte e votazioni 
 */
async function restartProcess(userId) {
    return await fetch(SERVER_URL + "/proposal/restart", {
        method: 'DELETE',
        credentials: 'include',
    }).then(handleInvalidResponse)
}

/**
 * Gesisce le risposte ottenute dalle chiamate fetch
 */
function handleInvalidResponse(response) {
    if (!response.ok) { throw Error(response.statusText) }
    let type = response.headers.get('Content-Type');
    if (type !== null && type.indexOf('application/json') === -1){
        throw new TypeError(`Expected JSON, got ${type}`)
    }
    return response;
}

function mapApiProposalsToProposals(apiProposals){
    return apiProposals.map(proposal => new Proposal(proposal.id, proposal.userId, proposal.description, proposal.cost, proposal.approved));
}

function mapApiPreferencesToPreferences(apiPreferences){
    return apiPreferences.map(preference => new ProposalWithVote(preference.id, preference.description, preference.cost, preference.score));
}

function mapApiApprovedProposalsToApprovedProposals(apiApprovedProposals){
    return apiApprovedProposals.map(approvedProposal => new ProposalsApproved(approvedProposal.id, approvedProposal.description, approvedProposal.member_name, approvedProposal.cost, approvedProposal.total_score));
}

function mapApiNotApprovedProposalsToNotApprovedProposals(apiNotApprovedProposals){
    return apiNotApprovedProposals.map(notApprovedProposal => new ProposalsNotApproved(notApprovedProposal.id, notApprovedProposal.description, notApprovedProposal.cost, notApprovedProposal.total_score));
}

const API = {
    logIn, 
    getUserInfo, 
    logOut, 
    initApp, 
    getBudgetAndFase, 
    nextFase, 
    getMyProposals,
    getProposalById, 
    deleteProposal,
    addProposal,
    updateProposal,
    getAllProposals,
    voteProposal,
    getMyPreferences,
    deletePreference,
    approveProposals,
    getApprovedProposals,
    getNotApprovedProposals,
    restartProcess
}

export default API;