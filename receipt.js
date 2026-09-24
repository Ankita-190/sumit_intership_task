// Get all orders

let orders =
    JSON.parse(localStorage.getItem("orders")) || [];


// Get old single order

let oldOrder =
    JSON.parse(localStorage.getItem("order"));


// If old order exists,
// add it to orders if not already present

if (oldOrder) {

    let alreadyExists =
        orders.some(function(order) {

            return order.orderId ===
                oldOrder.orderId;

        });


    if (!alreadyExists) {

        orders.push(oldOrder);

        localStorage.setItem(
            "orders",
            JSON.stringify(orders)
        );

    }

}


// Receipt container

let receiptContainer =
    document.getElementById(
        "receiptContainer"
    );


// Display receipts

function displayReceipts() {

    receiptContainer.innerHTML = "";


    if (orders.length === 0) {

        receiptContainer.innerHTML = `

            <div class="empty-receipt">

                <h2>
                    No Receipts Found
                </h2>

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

    let latestOrders =
        [...orders].reverse();


    latestOrders.forEach(function(order) {


        // Products HTML

        let productsHTML = "";


        order.cart.forEach(function(product) {


            let productTotal =
                product.price *
                product.quantity;


            productsHTML += `

                <div class="receipt-product">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                    >


                    <div class="product-info">

                        <h3>
                            ${product.name}
                        </h3>

                        <p>
                            Category:
                            ${product.category}
                        </p>

                        <p>
                            Quantity:
                            ${product.quantity}
                        </p>

                        <p>
                            Price:
                            ₹${product.price.toLocaleString("en-IN")}
                        </p>

                        <strong>
                            Product Total:
                            ₹${productTotal.toLocaleString("en-IN")}
                        </strong>

                    </div>

                </div>

            `;

        });


        // Receipt box

        let receipt =
            document.createElement("div");


        receipt.className =
            "receipt";


        receipt.innerHTML = `

            <div class="receipt-header">

                <h2>
                    My Shop
                </h2>

                <h3>
                    ORDER RECEIPT
                </h3>

                <p>
                    Thank you for your order!
                </p>

            </div>


            <!-- ORDER DETAILS -->

            <div class="order-details">

                <h3>
                    Order Details
                </h3>

                <p>
                    <strong>
                        Order ID:
                    </strong>

                    ${order.orderId}
                </p>

                <p>
                    <strong>
                        Order Date:
                    </strong>

                    ${order.date || "Not Available"}
                </p>

                <p>
                    <strong>
                        Payment:
                    </strong>

                    ${order.payment}
                </p>

            </div>


            <!-- CUSTOMER DETAILS -->

            <div class="customer-details">

                <h3>
                    Customer Details
                </h3>

                <p>
                    <strong>Name:</strong>
                    ${order.name}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${order.email}
                </p>

                <p>
                    <strong>Mobile:</strong>
                    ${order.mobile}
                </p>

                <p>
                    <strong>Address:</strong>
                    ${order.address}
                </p>

                <p>
                    <strong>City:</strong>
                    ${order.city}
                </p>

                <p>
                    <strong>PIN Code:</strong>
                    ${order.pincode}
                </p>

            </div>


            <!-- PRODUCTS -->

            <div class="products-section">

                <h3>
                    Products Purchased
                </h3>

                ${productsHTML}

            </div>


            <!-- BILL -->

            <div class="bill">

                <p>
                    Subtotal:
                    ₹${order.subtotal.toLocaleString("en-IN")}
                </p>

                <p>
                    Tax (18%):
                    ₹${order.tax.toLocaleString("en-IN")}
                </p>

                <p>
                    Discount:
                    ₹${order.discount.toLocaleString("en-IN")}
                </p>

                <hr>

                <h2>
                    Final Amount:
                    ₹${order.finalAmount.toLocaleString("en-IN")}
                </h2>

            </div>


            <!-- BUTTON -->

            <div class="receipt-buttons">

                <button onclick="printReceipt(this)">
                    Print Receipt
                </button>

            </div>

        `;


        receiptContainer.appendChild(receipt);

    });

}


// Print selected receipt

function printReceipt(button) {

    let receipt =
        button.closest(".receipt");


    let original =
        document.body.innerHTML;


    document.body.innerHTML =
        receipt.outerHTML;


    window.print();


    document.body.innerHTML =
        original;


    location.reload();

}


// Run

displayReceipts();