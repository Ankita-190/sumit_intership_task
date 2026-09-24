function placeOrder(event) {

    event.preventDefault();

    // Customer details

    let name =
        document.getElementById("name").value;

    let email =
        document.getElementById("email").value;

    let mobile =
        document.getElementById("mobile").value;

    let address =
        document.getElementById("address").value;

    let city =
        document.getElementById("city").value;

    let pincode =
        document.getElementById("pincode").value;

    let payment =
        document.getElementById("payment").value;


    // Cart

    let cart =
        JSON.parse(localStorage.getItem("cart")) || [];


    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;

    }


    // Calculate subtotal

    let subtotal = 0;

    cart.forEach(function(product) {

        subtotal +=
            product.price * product.quantity;

    });


    // Tax

    let tax =
        subtotal * 0.18;


    // Discount

    let discount = 0;

    if (subtotal >= 10000) {

        discount =
            subtotal * 0.10;

    }


    // Final amount

    let finalAmount =
        subtotal + tax - discount;


    // Generate Order ID

    let orderId =
        "ORD-" +
        Math.floor(
            100000 + Math.random() * 900000
        );


    // Create order

    let order = {

        orderId: orderId,

        name: name,

        email: email,

        mobile: mobile,

        address: address,

        city: city,

        pincode: pincode,

        payment: payment,

        cart: cart,

        subtotal: subtotal,

        tax: tax,

        discount: discount,

        finalAmount: finalAmount,

        date: new Date().toLocaleString("en-IN")

    };


    // Get old orders

    let orders =
        JSON.parse(localStorage.getItem("orders")) || [];


    // Add new order

    orders.push(order);


    // Save ALL orders

    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );


    // Save current order separately

    localStorage.setItem(
        "order",
        JSON.stringify(order)
    );


    // Clear cart

    localStorage.removeItem("cart");


    // Go to receipt

    window.location.href =
        "receipt.html";

}