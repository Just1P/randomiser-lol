import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HistoryList from '@/components/HistoryList';
import { useHistoryStore } from '@/stores/historyStore';
import { Role } from '@/enums/role';

// Mock du store Zustand
jest.mock('@/stores/historyStore');

const mockUseHistoryStore = useHistoryStore as jest.MockedFunction<typeof useHistoryStore>;

describe('HistoryList', () => {
  const mockEntry = {
    id: '1',
    date: '31/03/2024',
    players: [
      {
        name: 'Player1',
        role: Role.TOP,
        champion: 'Aatrox',
      },
      {
        name: 'Player2',
        role: Role.JUNGLE,
        champion: 'Amumu',
      },
    ],
  };

  const mockStore = {
    entries: [mockEntry],
    deleteEntry: jest.fn(),
    clearHistory: jest.fn(),
  };

  const mockOnSelectTeam = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHistoryStore.mockReturnValue(mockStore);
  });

  it('renders empty state when no entries', () => {
    mockUseHistoryStore.mockReturnValue({ ...mockStore, entries: [] });
    render(<HistoryList onSelectTeam={mockOnSelectTeam} />);
    expect(screen.getByText('Aucune composition d\'équipe dans l\'historique.')).toBeInTheDocument();
  });

  it('renders history entries correctly', () => {
    render(<HistoryList onSelectTeam={mockOnSelectTeam} />);

    // Vérifie que les joueurs sont affichés
    expect(screen.getByText('2 joueurs')).toBeInTheDocument();
    expect(screen.getByText('31/03/2024')).toBeInTheDocument();
  });

  it('expands entry details on click', () => {
    render(<HistoryList onSelectTeam={mockOnSelectTeam} />);

    // Clique pour développer l'entrée
    const entryElement = screen.getByText('31/03/2024').closest('.cursor-pointer');
    fireEvent.click(entryElement!);
    
    // Vérifie que les détails sont affichés
    expect(screen.getByText('Player1')).toBeInTheDocument();
    expect(screen.getByText('Player2')).toBeInTheDocument();
    expect(screen.getByText('Aatrox')).toBeInTheDocument();
    expect(screen.getByText('Amumu')).toBeInTheDocument();
  });

  it('calls onSelectTeam when reuse button is clicked', () => {
    render(<HistoryList onSelectTeam={mockOnSelectTeam} />);

    const reuseButton = screen.getByTitle('Réutiliser cette composition');
    fireEvent.click(reuseButton);

    const expectedPlayers = mockEntry.players.map(p => ({
      ...p,
      id: `${p.name}-${p.role}-${mockEntry.id}`
    }));
    expect(mockOnSelectTeam).toHaveBeenCalledWith(expectedPlayers);
  });

  it('calls deleteEntry when delete button is clicked', () => {
    render(<HistoryList onSelectTeam={mockOnSelectTeam} />);

    const deleteButton = screen.getByTitle('Supprimer de l\'historique');
    fireEvent.click(deleteButton);

    expect(mockStore.deleteEntry).toHaveBeenCalledWith('1');
  });

  it('calls clearHistory when clear all button is clicked', () => {
    render(<HistoryList onSelectTeam={mockOnSelectTeam} />);

    const clearButton = screen.getByText('Tout effacer');
    fireEvent.click(clearButton);

    expect(mockStore.clearHistory).toHaveBeenCalled();
  });

  it('renders Lolalytics links for champions', () => {
    render(<HistoryList onSelectTeam={mockOnSelectTeam} />);
    
    // Développe l'entrée
    const entryElement = screen.getByText('31/03/2024').closest('.cursor-pointer');
    fireEvent.click(entryElement!);
    
    // Vérifie les liens Lolalytics
    const lolalyticsLinks = screen.getAllByRole('link', { name: /Guide Lolalytics/i });
    expect(lolalyticsLinks).toHaveLength(2);
    expect(lolalyticsLinks[0]).toHaveAttribute('href', 'https://lolalytics.com/lol/aatrox/build/');
    expect(lolalyticsLinks[1]).toHaveAttribute('href', 'https://lolalytics.com/lol/amumu/build/');
  });
}); 