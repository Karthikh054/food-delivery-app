import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation,} from "@tanstack/react-query";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/orderApi";

function Steps() {
  const steps = ["Cart", "Delivery", "Place order"];
  return (
    <ol className="dv-steps" aria-label="Checkout progress">
      {steps.map((label, i) => (
        <li
          key={label}
          className={i === 1 ? "is-current" : i < 1 ? "is-done" : ""}
          aria-current={i === 1 ? "step" : undefined}
        >
          <span className="dv-step-dot">{i < 1 ? "✓" : i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}

function Delivery() {
  const navigate = useNavigate();

  const { cartItems, cartCount, cartTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    city: "",
    pincode: "",
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (response) => {
      console.log("Order created:",response);
      clearCart();
      navigate(`/order-success/${response.data._id}`);
    },
    onError: (error) =>{
      console.error("Order creation failed:",error);
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      return;
    }
    const restaurantId = cartItems[0].restaurantId;

    const orderData = {
      restaurantId,

      items: cartItems.map(
        (item) => ({
          foodId: item.foodId,
          quantity: item.quantity,
        })
      ),
      customer: {
        name: formData.name,
        mobile: formData.mobile,
      },
      deliveryAddress: {
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
      },
    };
    createOrderMutation.mutate(orderData);
  };

  if (cartItems.length === 0) {
    return (
      <main className="dv-page">
        <div className="dv-empty">
          <h1>Nothing to deliver yet</h1>
          <p>Your cart is empty. Add a few dishes first.</p>
          <Link className="dv-btn" to="/">
            Browse restaurants
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="dv-page">
      <header className="dv-header">
        <span className="dv-orb" aria-hidden="true" />
        <h1>Delivery details</h1>
        <p>Tell us where to bring your food.</p>
      </header>

      <div className="dv-wrap">
        <Steps />

        <div className="dv-layout">
          <form className="dv-form" onSubmit={handleSubmit}>
            <div className="dv-field dv-full">
              <label htmlFor="dv-name">Full name</label>
              <input
                id="dv-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                autoComplete="name"
                required
              />
            </div>

            <div className="dv-field dv-full">
              <label htmlFor="dv-mobile">Mobile number</label>
              <input
                id="dv-mobile"
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                autoComplete="tel-national"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                title="Enter a 10-digit mobile number"
                required
              />
            </div>

            <div className="dv-field dv-full">
              <label htmlFor="dv-address">Address</label>
              <textarea
                id="dv-address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House no, street, landmark"
                autoComplete="street-address"
                rows={3}
                required
              />
            </div>

            <div className="dv-field">
              <label htmlFor="dv-city">City</label>
              <input
                id="dv-city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                autoComplete="address-level2"
                required
              />
            </div>

            <div className="dv-field">
              <label htmlFor="dv-pincode">Pincode</label>
              <input
                id="dv-pincode"
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                autoComplete="postal-code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                title="Enter a 6-digit pincode"
                required
              />
            </div>

            <button type="submit" className="dv-btn dv-full">
              Continue to place order <span aria-hidden="true">→</span>
            </button>
          </form>

          <aside className="dv-summary" aria-label="Order summary">
            <h2>Order summary</h2>

            <ul className="dv-items">
              {cartItems.map((item) => (
                <li key={item.foodId}>
                  <span className="dv-item-name">
                    {item.name} <em>× {item.quantity}</em>
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>

            <dl>
              <div>
                <dt>Items</dt>
                <dd>{cartCount}</dd>
              </div>
              <div className="dv-total">
                <dt>Subtotal</dt>
                <dd>₹{cartTotal}</dd>
              </div>
            </dl>

            <Link className="dv-edit" to="/cart">
              Edit cart
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Delivery;