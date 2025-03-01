import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { 
  createBrowserRouter, 
  createRoutesFromChildren, 
  Route, 
  RouterProvider 
} from 'react-router-dom';
import './index.css'

import Redirect from './routes/redirect'
import Dashboard from './routes/desktop/dashboard';
import Home from './routes/mobile/home';
import View from './routes/mobile/view';
import Test from './routes/test';

const router = createBrowserRouter(
  createRoutesFromChildren(
    <Route>
      <Route index element={<Redirect />} />
      <Route path="/home" element={<Home />} />
      <Route path="/home/:id" element={<Home/>}/>
      <Route path="/view" element={<View />} />
      <Route path="/view/:id" element={<View />} />
      <Route path="/desktop" element={<Dashboard />} />
      <Route path="/desktop/:id" element={<Dashboard />} />
      <Route path="/test" element={<Test/>}/>
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
