import React, { createContext, useContext, useState } from 'react';

//Creo il context
const PhaseContext = createContext();

//hook per accedere al contesto "PhaseContext"
export const usePhase = () => useContext(PhaseContext);

/**
 * Componente che fornisce il contesto ai suoi figli
 */
export const PhaseProvider = ({ children }) => {
  //State "fase" inizializzato a 0
  //fase: fase corrente
  //setFase: aggiorna lo stato 
  const [fase, setFase] = useState(0);

  //Aggiorna lo stato "fase" incrementandolo di 1 se il valore attuale è inferiore a 3
  const avanzareFase = () => {
    setFase(prevFase => prevFase < 3 ? prevFase + 1 : prevFase);
  };

  return (
    <PhaseContext.Provider value={{ fase, setFase, avanzareFase }}>
      {children}
    </PhaseContext.Provider>
  );
};