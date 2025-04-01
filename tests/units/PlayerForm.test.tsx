import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerForm from '@/components/PlayerForm';
import { Player } from '@/types/player';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string; alt: string; fill?: boolean; priority?: boolean }) => {
    const { src, alt, ...rest } = props;
    return <img src={src} alt={alt || ''} {...rest} />;
  },
}));

const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

describe('PlayerForm', () => {
  const mockOnSubmit = jest.fn();
  const mockSetPlayers = jest.fn();
  const mockOnToggleChampions = jest.fn();

  const defaultProps = {
    players: [] as Player[],
    setPlayers: mockSetPlayers,
    onSubmit: mockOnSubmit,
    includeChampions: false,
    onToggleChampions: mockOnToggleChampions,
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockSetPlayers.mockClear();
    mockOnToggleChampions.mockClear();
    mockAlert.mockClear();
  });

  it('updates player count when clicking plus/minus buttons', () => {
    render(<PlayerForm {...defaultProps} />);
    
    const plusButton = screen.getByRole('button', { name: '3' });
    const minusButton = screen.getByRole('button', { name: '1' });
    
    expect(screen.getAllByRole('textbox')).toHaveLength(5);
    
    fireEvent.click(plusButton);
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    
    fireEvent.click(minusButton);
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  it('shows validation error when submitting with empty names', () => {
    render(<PlayerForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: "Générer l'équipe" });
    fireEvent.click(submitButton);
    
    expect(mockAlert).toHaveBeenCalledWith('Veuillez entrer tous les noms des joueurs');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when submitting with duplicate names', () => {
    render(<PlayerForm {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Player1' } });
    fireEvent.change(inputs[1], { target: { value: 'Player1' } });
    
    const submitButton = screen.getByRole('button', { name: "Générer l'équipe" });
    fireEvent.click(submitButton);
    
    expect(mockAlert).toHaveBeenCalledWith('Tous les noms des joueurs doivent être uniques');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid player names', () => {
    render(<PlayerForm {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Player1' } });
    fireEvent.change(inputs[1], { target: { value: 'Player2' } });
    
    const submitButton = screen.getByRole('button', { name: "Générer l'équipe" });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Player1' }),
        expect.objectContaining({ name: 'Player2' })
      ])
    );
  });

  it('disables submit button when isLoading is true', () => {
    render(<PlayerForm {...defaultProps} isLoading={true} />);
    
    const submitButton = screen.getByRole('button', { name: 'Génération en cours...' });
    expect(submitButton).toBeDisabled();
  });

  it('toggles champion mode when switch is clicked', () => {
    render(<PlayerForm {...defaultProps} />);
    
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    
    expect(mockOnToggleChampions).toHaveBeenCalledWith(true);
  });
}); 