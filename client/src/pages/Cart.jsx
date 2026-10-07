import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
    const { cartItems, increaseQuantity, decreaseQuantity, removeFromCart, cartCount, cartTotal } = useCart();
    const [removingId, setRemovingId] = useState(null);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    const handleRemove = (foodId) => {
        setRemovingId(foodId);
        timer.current = setTimeout(() => {
            removeFromCart(foodId);
            setRemovingId(null);
        }, 260);
    };

    if (cartItems.length === 0) {
        return (
            <main className="ct-page">
                <div className="ct-empty">
                    <div className="ct-empty-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                            <circle cx="9" cy="20" r="1.5" />
                            <circle cx="18" cy="20" r="1.5" />
                            <path d="M2 3h3l2.6 12.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H6" />
                        </svg>
                    </div>
                    <h1>Your cart is empty</h1>
                    <p>Add a few dishes and they'll show up here.</p>
                    <Link className="ct-btn" to="/">Browse restaurants</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="ct-page">
            <header className="ct-header">
                <span className="ct-orb" aria-hidden="true" />
                <h1>Your Cart</h1>
                <p>{cartCount} {cartCount === 1 ? "item" : "items"} ready to order</p>
            </header>

            <div className="ct-layout">
                <ul className="ct-list">
                    {cartItems.map((item, i) => (
                        <li
                            className={`ct-item ${removingId === item.foodId ? "is-removing" : ""}`}
                            key={item.foodId}
                            style={{ "--i": i }}
                        >
                            <div className="ct-item-info">
                                <h2>{item.name}</h2>
                                <p className="ct-unit">₹{item.price} each</p>

                                <div className="ct-stepper" role="group" aria-label={`Quantity of ${item.name}`}>
                                    <button
                                        type="button"
                                        aria-label={`Decrease ${item.name}`}
                                        onClick={() => decreaseQuantity(item.foodId)}
                                    >
                                        −
                                    </button>
                                    <span aria-live="polite">{item.quantity}</span>
                                    <button
                                        type="button"
                                        aria-label={`Increase ${item.name}`}
                                        onClick={() => increaseQuantity(item.foodId)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="ct-item-side">
                                <p className="ct-line-total">₹{item.price * item.quantity}</p>
                                <button
                                    type="button"
                                    className="ct-remove"
                                    onClick={() => handleRemove(item.foodId)}
                                >
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

                <aside className="ct-summary" aria-label="Order summary">
                    <h2>Order summary</h2>
                    <dl>
                        <div>
                            <dt>Items</dt>
                            <dd>{cartCount}</dd>
                        </div>
                        <div className="ct-total">
                            <dt>Total</dt>
                            <dd>₹{cartTotal}</dd>
                        </div>
                    </dl>
                    <Link to="/delivery" type="button" className="ct-btn ct-btn-block">
                        Proceed to delivery <span aria-hidden="true">→</span>
                    </Link>
                    <Link className="ct-more" to="/">Add more dishes</Link>
                </aside>
            </div>
        </main>
    );
}

export default Cart;