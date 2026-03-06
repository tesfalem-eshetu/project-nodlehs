import type { ActivityEntry } from '@/types';
import ActivityLogEntryComponent from '../ActivityLogEntry';
import { renderWithTheme } from './renderHelper';

describe('ActivityLogEntry', () => {
  it('renders status_change type label and content', () => {
    const entry: ActivityEntry = {
      id: 'act-1',
      timestamp: '2026-03-05T14:30:00.000Z',
      type: 'status_change',
      content: 'Status changed to: In Progress',
    };

    const { getByText } = renderWithTheme(
      <ActivityLogEntryComponent entry={entry} />,
    );

    expect(getByText('Status Change')).toBeTruthy();
    expect(getByText('Status changed to: In Progress')).toBeTruthy();
  });

  it('renders note type label and content', () => {
    const entry: ActivityEntry = {
      id: 'act-2',
      timestamp: '2026-03-05T15:00:00.000Z',
      type: 'note',
      content: 'Checked the air filters',
    };

    const { getByText } = renderWithTheme(
      <ActivityLogEntryComponent entry={entry} />,
    );

    expect(getByText('Note')).toBeTruthy();
    expect(getByText('Checked the air filters')).toBeTruthy();
  });

  it('renders formatted timestamp', () => {
    const entry: ActivityEntry = {
      id: 'act-3',
      timestamp: '2026-03-05T14:30:00.000Z',
      type: 'note',
      content: 'test',
    };

    const { getByText } = renderWithTheme(
      <ActivityLogEntryComponent entry={entry} />,
    );

    expect(getByText(/3\/5\/2026|5\/3\/2026|2026/)).toBeTruthy();
  });
});
