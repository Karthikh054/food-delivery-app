import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = sessionStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        sessionStorage.setItem('cart', JSON.stringify(cartItems));
    },[cartItems]);

    const addToCart = (food, restaurantId) => {
        setCartItems((currentItems) => {
            if(currentItems.length > 0 && currentItems[0].restaurantId !== restaurantId){
                const confirmChange = window.confirm("Your cart contains items from another restaurant. Do you want to clear the cart and add this item?");
                if(!confirmChange){
                    return currentItems;
                }

                return [
                    {
                        foodId: food._id,
                        name: food.name,
                        price: food.price,
                        image: food.image,
                        restaurantId: restaurantId,
                        quantity: 1,
                    },
                ];
            }
            const existingItem = currentItems.find((item) => item.foodId === food._id);
            if(existingItem){
                return currentItems.map((item) => 
                    item.foodId === food._id ? { ...item, quantity: item.quantity + 1} : item
                );
            }

            return [
                ...currentItems, {
                    foodId: food._id,
                    name: food.name,
                    price: food.price,
                    restaurantId: restaurantId,
                    quantity: 1,
                },
            ];
        });
    };


    const increaseQuantity = (foodId) => {
        setCartItems((currentItems) => 
            currentItems.map((item) => item.foodId === foodId ? { ...item, quantity: item.quantity + 1} : item )
        );
    };

    const decreaseQuantity = (foodId) => {
        setCartItems((currentItems) => 
            currentItems.map((item) => item.foodId === foodId ? { ...item, quantity: item.quantity - 1} : item ).filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (foodId) => {
        setCartItems((currentItems) => currentItems.filter((item) => item.foodId !== foodId) );
    };

    const clearCart = () => {
        setCartItems([]);
    }

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems, addToCart, increaseQuantity,decreaseQuantity, removeFromCart, clearCart, cartCount, cartTotal
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    return useContext(CartContext);
}

