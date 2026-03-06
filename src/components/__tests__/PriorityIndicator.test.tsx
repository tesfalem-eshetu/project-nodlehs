import { Priority } from '@/types';
import PriorityIndicator from '../PriorityIndicator';
import { renderWithTheme } from './renderHelper';

describe('PriorityIndicator', () => {
  it.each([
    [Priority.Critical, 'Critical'],
    [Priority.High, 'High'],
    [Priority.Medium, 'Medium'],
    [Priority.Low, 'Low'],
  ] as const)('renders label "%s" as "%s"', (priority, label) => {
    const { getByText } = renderWithTheme(<PriorityIndicator priority={priority} />);
    expect(getByText(label)).toBeTruthy();
  });
});
