// ================= GET ALL ORDERS =================

let orders =
    JSON.parse(localStorage.getItem("orders")) || [];


// ================= GET OLD SINGLE ORDER =================
// Agar pehle order sirf "order" ke naam se save hua tha,
// to usko bhi Order History me add karenge.

let oldOrder =
    JSON.parse(localStorage.getItem("order"));


if (oldOrder) {

    let alreadyExists =
        orders.some(function(order) {

            return order.orderId === oldOrder.orderId;

        });


    if (!alreadyExists) {

        orders.push(oldOrder);

        localStorage.setItem(
            "orders",
            JSON.stringify(orders)
        );

    }

}


// ================= CONTAINER =================

let orderContainer =
    document.getElementById("orderContainer");


// ================= DISPLAY ORDERS =================

function displayOrders() {

    orderContainer.innerHTML = "";


    if (orders.length === 0) {

        orderContainer.innerHTML = `

            <div class="empty-orders">

                <h2>No Orders Found</h2>

                <p>
                    You have not placed any orders yet.
                </p>

                <a href="products.html">
                    Start Shopping
                </a>

            </div>

        `;

        return;
    }


    // Latest order first
    // [...orders] creates a copy, so original array
    // will not be changed.

    let latestOrders =
        [...orders].reverse();


    latestOrders.forEach(function(order) {


        let orderBox =
            document.createElement("div");


        orderBox.className =
            "order-box";


        let productsHTML = "";


        // ================= PRODUCTS =================

        order.cart.forEach(function(product) {


            let productTotal =
                product.price * product.quantity;


            productsHTML += `

                <div class="order-product">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                    >

                    <div>

                        <h3>
                            ${product.name}
                        </h3>

                        <p>
                            Quantity:
                            ${product.quantity}
                        </p>

                        <p>
                            Price:
                            ₹${product.price.toLocaleString("en-IN")}
                        </p>

                        <p>
                            Total:
                            ₹${productTotal.toLocaleString("en-IN")}
                        </p>

                    </div>

                </div>

            `;

        });


        // ================= ORDER BOX =================

        orderBox.innerHTML = `

            <div class="order-header">

                <h2>
                    Order ID:
                    ${order.orderId}
                </h2>

                <span>
                    ${order.payment}
                </span>

            </div>


            <div class="customer-info">

                <p>
                    <strong>Name:</strong>
                    ${order.name}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${order.email || "Not Available"}
                </p>

                <p>
                    <strong>Mobile:</strong>
                    ${order.mobile}
                </p>

                <p>
                    <strong>Address:</strong>
                    ${order.address},
                    ${order.city} -
                    ${order.pincode}
                </p>

            </div>


            <h3>Products</h3>


            <div class="products">

                ${productsHTML}

            </div>


            <div class="order-total">

                <p>
                    Subtotal:
                    ₹${order.subtotal.toLocaleString("en-IN")}
                </p>

                <p>
                    Tax:
                    ₹${order.tax.toLocaleString("en-IN")}
                </p>

                <p>
                    Discount:
                    ₹${order.discount.toLocaleString("en-IN")}
                </p>

                <h2>
                    Final Amount:
                    ₹${order.finalAmount.toLocaleString("en-IN")}
                </h2>

            </div>

        `;


        orderContainer.appendChild(orderBox);

    });

}


// ================= RUN =================

displayOrders();