"use client";

import { useState, useEffect } from 'react';
import { Champion, ChampionWithRole, ChampionsData, getAllChampions, getChampionsByRole } from './api';
import { Role, ROLES } from './constants';

interface ChampionsStore {
  isLoading: boolean;
  error: string | null;
  champions: ChampionsData | null;
  championsByRole: Record<Role, ChampionWithRole[]>;
  getRandomChampionForRole: (role: Role) => Champion | null;
}

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
        
        const allChampions = await getAllChampions();
        setChampions(allChampions);
        
        const roleMap: Record<Role, ChampionWithRole[]> = {
          TOP: [],
          JUNGLE: [],
          MID: [],
          ADC: [],
          SUPPORT: []
        };
        
        const promises = ROLES.map(async (role) => {
          try {
            const championsForRole = await getChampionsByRole(role);
            if (championsForRole.length === 0) {
              console.warn(`Aucun champion trouvé pour le rôle ${role}. Vérifiez les noms des champions.`);
            }
            roleMap[role] = championsForRole;
          } catch (err) {
            console.error(`Erreur lors de la récupération des champions pour ${role}:`, err);
          }
        });
        
        await Promise.all(promises);
        
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

  const getRandomChampionForRole = (role: Role): Champion | null => {
    const championsForRole = championsByRole[role];
    
    if (!championsForRole || championsForRole.length === 0) {
      console.error(`Aucun champion disponible pour le rôle ${role}`);
      return null;
    }
    
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