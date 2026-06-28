import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/antd.css';
import '../public/css/styles.css';
import '../components/TopNav';
import TopNav from '../components/TopNav';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '../lib/query-client';

function MyApp({ Component, pageProps }) {
    return (
        <QueryClientProvider client={queryClient}>
            <TopNav />
            <Component {...pageProps} />
        </QueryClientProvider>
    )
}

export default MyApp;