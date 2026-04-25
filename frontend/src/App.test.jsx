import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { describe, it, expect, beforeEach } from 'vitest';

describe('App Component', () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом, 
    // чтобы симулировать "незалогиненного" пользователя
    localStorage.clear();
  });

  it('рендерит форму входа по умолчанию', () => {
    // 1. Отрисовываем компонент в виртуальном DOM
    render(<App />);
    
    // 2. Ищем элемент с текстом "Вход в систему"
    const headingElement = screen.getByRole('heading', { name: /Вход в систему/i });
    
    // 3. Проверяем, что он действительно есть на экране
    expect(headingElement).toBeInTheDocument();
  });
});