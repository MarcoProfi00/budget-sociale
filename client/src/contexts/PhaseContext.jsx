import React, { useEffect, useState, createContext, useContext } from 'react';
import API from '../API';

// Creo il context
const PhaseContext = createContext();

// hook usePhase: utilizza useContext per accedere al valore di PhaseContext
export const usePhase = () => useContext(PhaseContext);

/**
 * Componente che utilizza:
 * useState per gestire lo stato della fase
 * useEffect per inizializzarlo utilizzando l'API getPhase al momento del montaggio.
 */
export const PhaseProvider = ({ children }) => {
  // State "fase" inizializzato a 0
  const [fase, setFase] = useState(0);
  const [budget, setBudget] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Funzione per inizializzare il BudgetSociale con un budget specificato
   * @param {*} amount budget 
   */
  const initApp = async (amount) => {
    try {
      await API.initApp(amount); // chiamo l'API per inizializzare il BudgetSociale
      const budgetSociale = await API.getBudgetAndFase(); // Ottengo il budget e la fase dopo l'inizializzazione
      setFase(budgetSociale.current_fase); // Imposto la fase
      setBudget(budgetSociale.amount);
      setError(null); // Reset error
    } catch (error) {
      console.error("Failed to initialize app", error);
      setError("Failed to initialize app"); // Gestire errore nell'interfaccia utente
    }
  }

  /**
   * Funzione per ottenere il budget e la fase corrente
   */
  const getBudgetAndFase = async () => {
    try {
      const budgetSociale = await API.getBudgetAndFase(); // Ottengo il budget e la fase dopo l'inizializzazione
      setFase(budgetSociale.current_fase); // Imposto la fase
      setBudget(budgetSociale.amount);
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
      await API.nextFase(); // chiamo API per avanzare la fase
      const budgetSociale = await API.getBudgetAndFase(); // ottengo il nuovo stato del budget e della fase
      setFase(budgetSociale.current_fase); // imposto la fase in base alla risposta dell'API
      setError(null); // Reset error
    } catch (error) {
      console.error('Failed to advance fase:', error);
      setError('Failed to advance fase'); // Puoi gestire l'errore in modo appropriato nell'interfaccia utente
    }
  };

  /**
   * Funzione per vedere se posso avanzare di fase
   */
  const canAdvanceToNextPhase = () => {
    return budget !== null && fase !== 0;
  };

  /**
   * Effect per inizializzare la fase al montaggio del componente
   */
  useEffect(() => {
    getBudgetAndFase();
  }, []);

  return (
    <PhaseContext.Provider value={{ fase, setFase, avanzareFase, initApp, canAdvanceToNextPhase, getBudgetAndFase, budget, setBudget, error }}>
      {children}
    </PhaseContext.Provider>
  );
};