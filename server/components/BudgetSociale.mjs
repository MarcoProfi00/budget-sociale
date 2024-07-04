/**
 * Classe che gestisce il budget
 */

export default function BudgetSociale(id, amount = 0, current_fase = 0) {
    this.id = id;
    this.amount = amount;
    this.current_fase = current_fase;
}