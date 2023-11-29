'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';

import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import withSuspense from '@src/shared/hoc/withSuspense';
import { store } from '@src/store/store';
import Todos from './components/Todos';

const Popup = () => {
  const queryClient = new QueryClient();

  return (
    <ChakraProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Todos />
        </QueryClientProvider>
      </Provider>
    </ChakraProvider>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
