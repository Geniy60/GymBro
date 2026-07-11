import { QueryClientProvider } from '@tanstack/react-query';

import { AppNavigator } from './src/AppNavigator';
import { queryClient } from './src/queryClient';
import { ThemeProvider } from './src/ThemeProvider';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
