import React, { useEffect, useState, createContext, useContext } from 'react';
import API from '../API';

const PhaseContext = React.createContext(); //Context per la fase e il budget

export const usePhase = () => useContext(PhaseContext); //Hook utilizzato per accedere al valore di PhaseContext

/**
 * Componente per gestire e inizializzare lo stato dell'applicazione.
 * Gestisce il budget e la fase e le loro API per inizializzare, avanzare e ritornare budget e fase.
 * @prop { children } prop componenti figli del context, da App.jsx in poi
 */
export const PhaseProvider = ({ children }) => {
  
  const [fase, setFase] = useState(0); //Stato per la fase inizializzato a 0
  const [budget, setBudget] = useState(null); //Stato per il budget inizializzato a null
  const [error, setError] = useState(null); //Stato per gli errori

  /**
   * Funzione per inizializzare il BudgetSociale con un budget specificato
   * Chiama l'API per inizializzare l'applicazione
   * Chiama l'API per recuperare il budget e la fase attuali
   * Setta budget e fase
   * @param {*} amount budget
   */
  const initApp = async (amount) => {
    try {
      await API.initApp(amount);
      const budgetSociale = await API.getBudgetAndFase();
      setFase(budgetSociale.current_fase);
      setBudget(budgetSociale.amount);
      setError(null);
    } catch (error) {
      console.error("Failed to initialize app", error);
      setError("Failed to initialize app");
    }
  }

  /**
   * Funzione per ottenere il budget e la fase corrente
   * Chiama l'API per recuperare il budget e la fase attuali
   * Setta budget e fase
   */
  const getBudgetAndFase = async () => {
    try {
      const budgetSociale = await API.getBudgetAndFase();
      setFase(budgetSociale.current_fase);
      setBudget(budgetSociale.amount);
      setError(null);
    } catch (error) {
      console.error('Errore nell\'ottenere la fase:', error);
      setError('Errore nel recuperare il budget e la fase'); 
    }
  };

  /**
   * Funzione per avanzare alla fase successiva
   * Chiama l'API per avanzare la fase (+1)
   * Chiama l'APi per recuperare il budget e la fase attuali
   * Setta la fase
   */
  const avanzareFase = async () => {
    try {
      await API.nextFase();
      const budgetSociale = await API.getBudgetAndFase();
      setFase(budgetSociale.current_fase);
      setError(null);
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
   * UseEffect chiama getBudgetAndFase appena il componente viene montato la prima volta
   */
  useEffect(() => {
    getBudgetAndFase();
  }, []);

  /**
   * Provider con i valori e le funzioni da passare ai componenti figli
   */
  return (
    <PhaseContext.Provider value={{ fase, setFase, avanzareFase, initApp, canAdvanceToNextPhase, getBudgetAndFase, budget, setBudget, error }}>
      {children}
    </PhaseContext.Provider>
  );
};