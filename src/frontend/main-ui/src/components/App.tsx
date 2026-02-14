import React from 'react';
import Header from './header';
import Footer from './footer';
import './App.scss';
import { RouterProvider } from 'react-router-dom';
import { router } from '../router';

const App = () => {
    return <div className='App h-screen'>
        <Header />
        <main className='container mb-auto'>
            <RouterProvider router={router} />
        </main>
        <Footer />
    </div>;
}

export default App;
