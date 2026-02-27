import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common';
import { router } from '@/router';

const App = () => {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default App;
