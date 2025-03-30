"use client";

import { useState, useEffect } from 'react';
import { Champion, ChampionWithRole, ChampionsData, getAllChampions, getChampionsByRole } from './api';
import { Role, ROLES } from './constants';

// Type pour le store de champions
interface ChampionsStore {
  isLoading: boolean;
  error: string | null;
  champions: ChampionsData | null;
  championsByRole: Record<Role, ChampionWithRole[]>;
  getRandomChampionForRole: (role: Role) => Champion | null;
}

// Hook personnalisé pour le store de champions
export function useChampionsStore(): ChampionsStore {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [champions, setChampions] = useState<ChampionsData | null>(null);
  const [championsByRole, setChampionsByRole] = useState<Record<Role, ChampionWithRole[]>>({
    TOP: [],
    JUNGLE: [],
    MID: [],
    ADC: [],
    SUPPORT: []
  });

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Récupérer tous les champions
        const allChampions = await getAllChampions();
        setChampions(allChampions);
        
        // Récupérer les champions par rôle selon la méta
        const roleMap: Record<Role, ChampionWithRole[]> = {
          TOP: [],
          JUNGLE: [],
          MID: [],
          ADC: [],
          SUPPORT: []
        };
        
        // Récupérer les champions pour chaque rôle en parallèle
        const promises = ROLES.map(async (role) => {
          try {
            const championsForRole = await getChampionsByRole(role);
            // Vérifie que nous avons obtenu des champions pour ce rôle
            if (championsForRole.length === 0) {
              console.warn(`Aucun champion trouvé pour le rôle ${role}. Vérifiez les noms des champions.`);
            }
            roleMap[role] = championsForRole;
          } catch (err) {
            console.error(`Erreur lors de la récupération des champions pour ${role}:`, err);
            // On ne définit pas l'erreur globale ici pour permettre de continuer avec les autres rôles
          }
        });
        
        await Promise.all(promises);
        
        // Vérifier si nous avons des champions pour chaque rôle
        let hasEmptyRole = false;
        for (const role of ROLES) {
          if (roleMap[role].length === 0) {
            hasEmptyRole = true;
            console.error(`Aucun champion trouvé pour le rôle ${role}`);
          }
        }
        
        if (hasEmptyRole) {
          setError('Certains rôles n\'ont pas de champions. Vérifiez la console pour plus de détails.');
        }
        
        setChampionsByRole(roleMap);
      } catch (err) {
        console.error('Erreur lors du chargement des champions:', err);
        setError('Erreur lors du chargement des champions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChampions();
  }, []);

  // Fonction pour obtenir un champion aléatoire pour un rôle donné
  const getRandomChampionForRole = (role: Role): Champion | null => {
    const championsForRole = championsByRole[role];
    
    // Vérifier que nous avons des champions pour ce rôle
    if (!championsForRole || championsForRole.length === 0) {
      console.error(`Aucun champion disponible pour le rôle ${role}`);
      return null;
    }
    
    // Vérification supplémentaire pour s'assurer que les champions sont bien de ce rôle
    const validChampions = championsForRole.filter(champion => 
      champion.assignedRole === role
    );
    
    if (validChampions.length === 0) {
      console.error(`Pas de champions valides pour le rôle ${role} après filtrage`);
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * validChampions.length);
    return validChampions[randomIndex];
  };

  return {
    isLoading,
    error,
    champions,
    championsByRole,
    getRandomChampionForRole
  };
} 