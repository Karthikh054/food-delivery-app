import { useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import './App.css'
import Restaurants from './pages/Restaurants'
import RestaurantDetails from './pages/RestaurantDetails'
import Cart from './pages/Cart';
import Delivery from "./pages/Delivery";
import OrderSuccess from "./pages/OrderSuccess";

function App() {
  const [count, setCount] = useState(0)

  return (
   <BrowserRouter>
    <Routes>
      <Route path="/" element={<Restaurants/>}/>
      <Route path="/restaurant/:id" element={<RestaurantDetails/>}/>
      <Route path="/cart" element={<Cart/>}/>
      <Route path="/delivery" element={<Delivery/>}/>
      <Route path="/order-success/:id" element={<OrderSuccess/>}/>
      <Route path="*" element={<h1>404 Not Found</h1>}/>
    </Routes>
   </BrowserRouter>
  )
}

export default App
