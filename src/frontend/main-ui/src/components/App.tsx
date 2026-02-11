import React from 'react';
import Header from './header';
import Footer from './footer';
import './App.scss';

const App = () => {
    return <div className='App h-screen'>
        <Header />
        <main className='container mb-auto'>
            <h1>WOOP</h1>
        </main>
        <Footer />
    </div>;
}

export default App;
