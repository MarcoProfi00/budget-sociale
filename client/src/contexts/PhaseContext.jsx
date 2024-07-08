import React, { useEffect, useState, createContext, useContext } from 'react';
import API from '../API';

//Context per la fase
const PhaseContext = createContext();

//hook utilizzato per accedere al valore di PhaseContext
export const usePhase = () => useContext(PhaseContext);

/**
 * Componente che utilizza:
 * useState per gestire lo stato della fase
 * useEffect per inizializzarlo utilizzando l'API getPhase al momento del montaggio.
 */
export const PhaseProvider = ({ children }) => {
  
  const [fase, setFase] = useState(0); //Stato per la fase inizializzato a 0
  const [budget, setBudget] = useState(null); //Stato per il budget
  const [error, setError] = useState(null); //Stato per gli errori

  /**
   * Funzione per inizializzare il BudgetSociale con un budget specificato
   * @param {*} amount budget 
   */
  const initApp = async (amount) => {
    try {
      await API.initApp(amount);
      const budgetSociale = await API.getBudgetAndFase();
      setFase(budgetSociale.current_fase); //Imposto la fase
      setBudget(budgetSociale.amount); //Imposto il budget
      setError(null); //Reset error
    } catch (error) {
      console.error("Failed to initialize app", error);
      setError("Failed to initialize app");
    }
  }

  /**
   * Funzione per ottenere il budget e la fase corrente
   */
  const getBudgetAndFase = async () => {
    try {
      const budgetSociale = await API.getBudgetAndFase();
      setFase(budgetSociale.current_fase); // Imposto la fase
      setBudget(budgetSociale.amount); //Imposto il budget
      setError(null);
    } catch (error) {
      console.error('Errore nell\'ottenere la fase:', error);
      setError('Errore nel recuperare il budget e la fase'); 
    }
  };

  /**
   * Funzione per avanzare alla fase successiva
   */
  const avanzareFase = async () => {
    try {
      await API.nextFase();
      const budgetSociale = await API.getBudgetAndFase();
      setFase(budgetSociale.current_fase); //Imposto la fase
      setError(null); //Reset error
    } catch (error) {
      console.error('Failed to advance fase:', error);
      setError('Failed to advance fase');
    }
  };

  /**
   * Funzione per vedere se posso avanzare di fase
   * Controlla se il budget non è null
   * Controlla se la fase è diversa da 0 (fase attuale diversa dalla fase iniziale)
   */
  const canAdvanceToNextPhase = () => {
    return budget !== null && fase !== 0;
  };

  /**
   * UseEffect per inizializzare la fase al montaggio del componente
   */
  useEffect(() => {
    getBudgetAndFase();
  }, []);

  /**
   * Modo in cui PhaseContext viene fornito ai componenti figli
   */
  return (
    <PhaseContext.Provider value={{ fase, setFase, avanzareFase, initApp, canAdvanceToNextPhase, getBudgetAndFase, budget, setBudget, error }}>
      {children}
    </PhaseContext.Provider>
  );
};