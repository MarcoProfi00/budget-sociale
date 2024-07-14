/**
 * Costruttore di Proposal
 * @param {*} id id della proposta
 * @param {*} userId id dell'autore della proposta
 * @param {*} description descrizione della proposta
 * @param {*} cost prezzo della proposta
 * @param {*} approved valore che indica se una proposta viene approvata (1) oppure no (0). Inizialmente 0
 */
export default function Proposal(id, userId, description, cost, approved = 0) {
    this.id = id;
    this.userId = userId;
    this.description = description;
    this.cost = cost;
    this.approved = approved;
}

/**
 * Costruttore di Vote
 * @param {*} userId id dell'utente che vota
 * @param {*} proposalId id della proposta votata 
 * @param {*} score punteggio assegnato, inizialmente 0
 */
export function Vote(userId, proposalId, score = 0) {
    this.userId = userId;
    this.proposalId = proposalId;
    this.score = score;
}

/**
 * Costruttore della proposta con il voto associato
 * @param {*} id id della proposta
 * @param {*} description descrizione della proposta
 * @param {*} cost prezzo della proposta
 * @param {*} score punteggio assegnato (1, 2, 3)
 */
export function ProposalWithVote(id, description, cost, score) {
    this.id = id;
    this.description = description;
    this.cost = cost;
    this.score = score;
}

/**
 * Costruttore della proposta con la somma delle preferenze espresse per quella proposta
 * @param {*} id id della proposta
 * @param {*} userId autore della proposta
 * @param {*} description descrizione della proposta
 * @param {*} cost prezzo della proposta
 * @param {*} approved valore che indica se una proposta viene approvata (1) oppure no (0).
 * @param {*} total_score punteggio totale dato dalla somma di tutte le preferenze per la medesima proposta
 */
export function ProposalsWhithSumOfScore(id, userId, description, cost, approved, total_score) {
    this.id = id,
    this.userId = userId;
    this.description = description;
    this.cost = cost;
    this.approved = approved;
    this.total_score = total_score;
}

/**
 * Costruttore di una proposta approvata
 * @param {*} id id della proposta
 * @param {*} description descrzione della proposta
 * @param {*} member_name nome e cognome dell'autore della proposta
 * @param {*} cost prezzo della proposta
 * @param {*} total_score punteggio totale dato dalla somma di tutte le preferenze per la medesima proposta
 */
export function ProposalsApproved(id, description, member_name, cost, total_score) {
    this.id = id;
    this.description = description;
    this.member_name = member_name;
    this.cost = cost;
    this.total_score = total_score;
}

/**
 * Costruttore di una proposta non approvata
 * @param {*} id id della proposta
 * @param {*} description descrzione della proposta
 * @param {*} cost prezzo della proposta
 * @param {*} total_score punteggio totale dato dalla somma di tutte le preferenze per la medesima proposta
 */
export function ProposalsNotApproved(id, description, cost, total_score) {
    this.id = id,
    this.description = description;
    this.cost = cost;
    this.total_score = total_score;
}

