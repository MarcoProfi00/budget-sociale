/**
 * Data Access Object (DAO) module for accessing user data
 */
import db from "../db/db.mjs"
import crypto from 'crypto';
import { UserNotFoundError } from "../errors/userError.mjs";
import { rejects } from "assert";
import { NotAdminError, NotAdminErrorBudget, FaseError, BudgetNotExistError } from "../errors/proposalError.mjs";
import Budget from "../components/BudgetSociale.mjs";
import BudgetSociale from "../components/BudgetSociale.mjs";

export default function UserDAO() {
    
    /**
     * Recupera l'utente dato il suo id
     * @param {*} id id dell'utente da trovare
     * @returns La promise si risolve restituendo l'utente
     */
    this.getUserById = (id) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM User WHERE id = ?";
            db.get(query, [id], (err, row) => {
                if(err){
                    reject(err)
                } else if (row === undefined) {
                    reject (new UserNotFoundError())
                } else {
                    resolve(row)
                }
            })
        })
    }

    this.getUserByCredentials = (username, password) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM User WHERE username = ?";
            db.get(sql, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row === undefined) {
                    resolve(false);
                } else {
                    const user = { id: row.id, name: row.name, surname: row.surname, role: row.role, username: row.username }
                    crypto.scrypt(password, row.salt, 64, function(err, hashedPassword) {
                        if(err)
                            reject(err)
                        //controlliamo se hash crittografico è uguale a quello slavato nel db
                        if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)) // WARN: it is hash and not password (as in the week example) in the DB
                            resolve(false); //se non è uguale resolve con false
                        else
                            resolve(user); //se è uguale resolve con true
                    });
                }
            })
        })
    }

    /**
     * Inizializza Budget e Fase corrente
     * @param {*} userId id dell'utente che li inserisce (admin)
     * @param {*} budget oggetto budget da aggiungere
     * @returns La promise si risolve ritornando l'oggetto BudgetSociale
     */
    this.initApp = (userId, budgetSociale) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM User WHERE id = ? AND role = 'Admin'";
            db.get(sql, [userId], (err, row) => {
                if(err){
                    reject(err);
                } else if (!row) {
                    reject(new NotAdminErrorBudget())
                } else {
                    sql = "INSERT INTO BudgetSociale (amount, current_fase) VALUES (?, 0)";
                    db.run(sql, [budgetSociale.amount], function (err){
                        if (err){
                            reject(err);
                        } else {
                            budgetSociale.id = this.lastID;
                            resolve(budgetSociale)
                        }
                    })
                }
            })
        })
    }

    /**
     * Recupera budget e fase
     * @returns La promise si risolve ritornando l'oggetto budget
     */
    this.getBudgetAndFase = () => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM BudgetSociale";
            db.get(sql, (err, row) => {
                if(err) {
                    reject(err)
                } else if (!row){
                    //budgetSociale vuoto (inizializzato tutto a 0)
                    const budgetSociale = new BudgetSociale(undefined, 0, 0)
                    //risolvo con il budgetsociale vuoto
                    resolve(budgetSociale)
                    //reject(new BudgetNotExistError())
                } else {
                    const budget = new BudgetSociale(row.id, row.amount, row.current_fase)
                    resolve(budget)
                }
            })
        })
    }

    /**
     * Avanza di fase
     * @param {*} userId id dell'utente che avanza di fase (Admin)
     * @returns la promise si risolve ritornando true se l'udate è andato a buon fine
     */
    this.nextPhase = (userId) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM User WHERE id = ? AND role = 'Admin'";
            db.get(sql, [userId], (err, row) => {
                if(err) {
                    reject(err);
                } else if (!row) {
                    reject(new NotAdminErrorBudget())
                } else {
                    sql = "SELECT * FROM BudgetSociale";
                    db.get(sql, (err, row) => {
                        if(err){
                            reject(err)
                        } else if (!row) {
                            reject(new BudgetNotExistError())
                        } else {
                            const current_fase = Number(row.current_fase) //mi prendo la fase corrente
                            let nextFase = current_fase + 1;
                            let id = row.id;
                            if(nextFase > 3) {
                                reject(new FaseError())
                            } else {
                                sql = "UPDATE BudgetSociale SET current_fase = ? WHERE id = ?";
                                db.run(sql, [nextFase, id], function(err){
                                    if(err){
                                        reject(err)
                                    } else {
                                        resolve(true)
                                    }
                                })
                            }
                        }
                    })
                }
            })
        })
    }

    /**
     * Elimina le proposte, le votazioni e il budget (restart the process)
     * @param {*} userId id dell'utente che effettua il restart (deve essere admin)
     * @returns La promise si risolve ritornando true se l'eliminazione delle righe è andato a buon fine
     */
    this.restartProcess = (userId) => {
        return new Promise((resolve, reject) => {
            //query per verificare che l'utente è l'admin
            let sql = `SELECT * FROM User WHERE user.id = ? AND User.role = 'Admin'`;
            db.get(sql, [userId], (err, row) => {
                if(err){
                    reject(err);
                    //se la riga è vuota vuol dire che non è un admin
                } else if(!row){
                    reject(new NotAdminError())
                } else {
                    //query per svuotare la tabella Vote
                    sql = "DELETE FROM Vote;";
                    db.run(sql, function(err) {
                        if(err){
                            reject(err)
                        } else {
                            //query per svuotare la tabella Proposal
                            sql = "DELETE FROM Proposal;";
                            db.run(sql, function(err) {
                                if(err){
                                    reject(err)
                                } else {
                                    sql = "DELETE FROM BudgetSociale;";
                                    db.run(sql, function(err) {
                                        if(err){
                                            reject(err)
                                        } else {
                                            resolve(true)
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        })
    }
}