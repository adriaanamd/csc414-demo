/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '@/pages/not-found';

describe('NotFound Page UI', () => {
  it('renders 404 header and description message', () => {
    render(<NotFound />);

    expect(screen.getByRole('heading', { level: 1, name: /404 Page Not Found/i })).toBeInTheDocument();
    expect(screen.getByText(/Did you forget to add the page to the router\?/i)).toBeInTheDocument();
  });
});
