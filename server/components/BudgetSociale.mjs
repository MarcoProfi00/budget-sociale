/**
 * Costruttore di BudgetSociale
 * @param {*} id id del budget
 * @param {*} amount budget, inizialmente 0
 * @param {*} current_fase fase in cui si trova l'applicazione, inizialmente 0
 */
export default function BudgetSociale(id, amount = 0, current_fase = 0) {
    this.id = id;
    this.amount = amount;
    this.current_fase = current_fase;
}