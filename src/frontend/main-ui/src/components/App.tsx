import React from 'react';
import Header from './header';
import Footer from './footer';
import './App.scss';
import HomePage from "../pages/homePage"

const App = () => {
    return <div className='App h-screen'>
        <Header />
        <main className='container mb-auto'>
            <HomePage/>
        </main>
        <Footer />
    </div>;
}

export default App;
