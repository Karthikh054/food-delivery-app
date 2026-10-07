import { Link, useParams } from "react-router-dom";

function OrderSuccess() {
  const { id } = useParams();

  return (
    <div>
      <h1>
        🎉 Order Placed Successfully!
      </h1>

      <p>
        Thank you for your order.
      </p>

      <p>
        Order ID: {id}
      </p>

      <Link to="/">
        Continue Shopping
      </Link>
    </div>
  );
}

export default OrderSuccess;