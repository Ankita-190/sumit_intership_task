let cart = JSON.parse(localStorage.getItem("cart")) || [];

let cartContainer = document.getElementById("cartContainer");


function displayCart() {

    cartContainer.innerHTML = "";


    if (cart.length === 0) {

        cartContainer.innerHTML = `
            <div class="empty-cart">

                <h2>Your Cart is Empty</h2>

                <p>Please add some products.</p>

                <a href="products.html">
                    Continue Shopping
                </a>

            </div>
        `;

        return;
    }


    // ================= SUBTOTAL =================

    let subtotal = 0;


    cart.forEach(function(product, index) {

        let productTotal =
            product.price * product.quantity;

        subtotal += productTotal;


        let cartItem =
            document.createElement("div");

        cartItem.className = "cart-item";


        cartItem.innerHTML = `

            <img
                src="${product.image}"
                alt="${product.name}"
            >

            <div class="cart-info">

                <h2>${product.name}</h2>

                <p>
                    Category: ${product.category}
                </p>

                <p>
                    Price:
                    ₹${product.price.toLocaleString("en-IN")}
                </p>


                <!-- QUANTITY -->

                <div class="quantity-box">

                    <button onclick="decreaseQuantity(${index})">
                        -
                    </button>

                    <span>
                        ${product.quantity}
                    </span>

                    <button onclick="increaseQuantity(${index})">
                        +
                    </button>

                </div>


                <h3>
                    ₹${productTotal.toLocaleString("en-IN")}
                </h3>


                <button onclick="removeProduct(${index})">
                    Remove
                </button>

            </div>

        `;


        cartContainer.appendChild(cartItem);

    });


    // ================= TAX =================

    let tax = subtotal * 0.18;


    // ================= DISCOUNT =================

    let discount = 0;


    if (subtotal >= 10000) {

        discount = subtotal * 0.10;

    }


    // ================= FINAL AMOUNT =================

    let finalAmount =
        subtotal + tax - discount;


    // ================= TOTAL BOX =================

    let totalBox =
        document.createElement("div");

    totalBox.className = "total-box";


    totalBox.innerHTML = `

        <h3>
            Subtotal:
            ₹${subtotal.toLocaleString("en-IN")}
        </h3>


        <h3>
            Tax (18%):
            ₹${tax.toLocaleString("en-IN")}
        </h3>


        <h3>
            Discount:
            ₹${discount.toLocaleString("en-IN")}
        </h3>


        <hr>


        <h2>
            Final Amount:
            ₹${finalAmount.toLocaleString("en-IN")}
        </h2>


        <button onclick="checkout()">
            Checkout
        </button>

    `;


    cartContainer.appendChild(totalBox);

}



// ================= REMOVE PRODUCT =================

function removeProduct(index) {

    cart.splice(index, 1);


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    displayCart();

}



// ================= INCREASE QUANTITY =================

function increaseQuantity(index) {

    cart[index].quantity++;


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    displayCart();

}



// ================= DECREASE QUANTITY =================

function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;


        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        displayCart();

    }

}



// ================= CHECKOUT =================

function checkout() {

    window.location.href = "checkout.html";

}



// ================= DISPLAY CART =================

displayCart();