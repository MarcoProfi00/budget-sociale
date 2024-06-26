/**
 * Data Access Object (DAO) module for accessing proposal data
 */

import Proposal from "../components/Proposal.mjs";
import db from "../db/db.mjs"
import { ProposalsNotFoundError, ProposalAlreadyExistsError, UnauthorizedUserError } from "../errors/proposalError.mjs";

function mapRowsToProposal(rows){
    return rows.map(row => new Proposal(row.id, row.user_id, row.description, row.cost, row.approved))
}


export default function ProposalDAO() {
    
    /**
     * Recupera tutte le proposte create da uno specifico utente
     * @param {*} userId id dell'utente che ha inserito la proposta 
     * @returns La promise si risolve in un array di proposte
     */
    this.getProposalById = (userId) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM Proposal WHERE user_id = ?";
            db.all(sql, [userId], (err, rows) => {
                if(err) {
                    reject(err);
                } else if (rows.length === 0){
                    reject(new ProposalsNotFoundError())
                } else {
                    const proposals = mapRowsToProposal(rows)
                    resolve(proposals);
                }
            }); 
        });
    }

    /**
     * Crea una nuova proposta e salva le informazioni nel database
     * Se la proposta esiste gia ritorna errore
     * @param {*} proposal oggetto proposta da aggiungere
     * @returns La promise si risolve ritornando la proposta appena aggiunta
     */
    this.addProposal = (proposal) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM Proposal WHERE description = ?"
            db.get(sql, [proposal.description], (err, row) => {
                if (err){
                    reject(err)
                } else if(row) {
                    reject(new ProposalAlreadyExistsError())
                } else {
                    sql = "INSERT INTO Proposal (user_id, description, cost, approved) VALUES (?, ?, ?, ?)";
                    db.run(sql, [proposal.userId, proposal.description, proposal.cost, proposal.approved], function (err) {
                    if (err){
                        reject(err);
                    }
                    proposal.id = this.lastID;
                    resolve(proposal);
                    });
                }
            });
        });
    };

    /**
     * Modifica una proposta gia esistente dato il suo id e userId
     * @param {*} userId id dell'utente che ha inserito la proposta e la vuole modificare
     * @param {*} id id della proposta
     * @param {*} proposal oggetto proposta contenente le modifiche
     * @returns La promise si risolve ritornando la proposta modificata
     */
    this.updateProposal = (userId, id, proposal) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM Proposal WHERE id = ? AND user_id = ?";
            db.get(sql, [id, userId], (err, row) => {
                if(err) {
                    reject(err);
                } else if(!row){
                    reject(new UnauthorizedUserError())
                } else {
                    sql = "UPDATE Proposal SET description = ?, cost = ?, approved = 0 WHERE id = ? AND user_id = ?"
                    db.run(sql, [proposal.description, proposal.cost, id, userId], function (err){
                        if(err){
                            reject(err)
                        }
                        if (this.changes !== 1){
                            reject(new ProposalsNotFoundError())
                        } else {
                            resolve(proposal)
                        }
                    })
                }
            })
            
        });
    };

    this.deleteProposal = (userId, id) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM Proposal WHERE id = ? AND user_id = ?";
            db.get(sql, [id, userId], (err, row) => {
                if(err) {
                    reject(err);
                } else if(!row){
                    reject(new UnauthorizedUserError())
                } else {
                    sql = "DELETE FROM Proposal WHERE id = ? AND user_id = ?";
                    db.run(sql, [id, userId], function (err) {
                        if(err) {
                            reject(err);
                        } else {
                            console.log(this.changes)
                            resolve(this.changes); //risolve con il numero di cambiamenti
                        }
                    })
                }
            })
        })
    }
}