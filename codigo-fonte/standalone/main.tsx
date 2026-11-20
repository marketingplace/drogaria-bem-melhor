import React from 'react';
import {createRoot} from 'react-dom/client';
import Store from '../app/store';
import '../app/globals.css';
createRoot(document.getElementById('root')!).render(<Store portable/>);
