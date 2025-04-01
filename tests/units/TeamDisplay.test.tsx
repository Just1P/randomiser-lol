import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamDisplay from '../../src/components/TeamDisplay';
import { Role } from '@/enums/role';
import { Player } from '@/types/player';

describe('TeamDisplay', () => {
  const mockTeam: Player[] = [
    { id: '1', name: 'Player1', role: Role.TOP, champion: 'Darius' },
    { id: '2', name: 'Player2', role: Role.JUNGLE, champion: 'LeeSin' },
    { id: '3', name: 'Player3', role: Role.MID, champion: 'Ahri' },
  ];

  it('renders team members in correct order', () => {
    render(<TeamDisplay team={mockTeam} includeChampions={true} />);
    
    const playerNames = screen.getAllByText(/Player\d/);
    expect(playerNames).toHaveLength(3);
    expect(playerNames[0]).toHaveTextContent('Player1');
    expect(playerNames[1]).toHaveTextContent('Player2');
    expect(playerNames[2]).toHaveTextContent('Player3');
  });

  it('displays role indicators with correct colors', () => {
    render(<TeamDisplay team={mockTeam} includeChampions={true} />);
    
    expect(screen.getByText('TOP')).toHaveClass('bg-amber-500');
    expect(screen.getByText('JUNGLE')).toHaveClass('bg-emerald-500');
    expect(screen.getByText('MID')).toHaveClass('bg-blue-500');
  });

  it('shows champion information when includeChampions is true', () => {
    render(<TeamDisplay team={mockTeam} includeChampions={true} />);
    
    expect(screen.getByText('Darius')).toBeInTheDocument();
    expect(screen.getByText('LeeSin')).toBeInTheDocument();
    expect(screen.getByText('Ahri')).toBeInTheDocument();
  });

  it('hides champion information when includeChampions is false', () => {
    render(<TeamDisplay team={mockTeam} includeChampions={false} />);
    
    expect(screen.queryByText('Darius')).not.toBeInTheDocument();
    expect(screen.queryByText('LeeSin')).not.toBeInTheDocument();
    expect(screen.queryByText('Ahri')).not.toBeInTheDocument();
  });

  it('displays correct number of players text', () => {
    render(<TeamDisplay team={mockTeam} includeChampions={true} />);
    
    expect(screen.getByText('3 joueurs avec des rôles aléatoires')).toBeInTheDocument();
  });

  it('renders Lolalytics links when champions are included', () => {
    render(<TeamDisplay team={mockTeam} includeChampions={true} />);
    
    const lolalyticsLinks = screen.getAllByText('Voir le guide sur Lolalytics');
    expect(lolalyticsLinks).toHaveLength(3);
    
    // Vérifie que les liens sont correctement formatés
    lolalyticsLinks.forEach((link) => {
      expect(link.closest('a')).toHaveAttribute('target', '_blank');
      expect(link.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
}); 