let name = localStorage.getItem("productName");
let category = localStorage.getItem("productCategory");
let price = Number(localStorage.getItem("productPrice"));
let image = localStorage.getItem("productImage");


// Product details show karna

document.getElementById("productName").innerText = name;

document.getElementById("productCategory").innerText =
    "Category: " + category;

document.getElementById("productPrice").innerText =
    "₹" + price.toLocaleString("en-IN");

document.getElementById("productImage").src = image;


// Add To Cart
function addToCart() {

    let quantity = Number(
        document.getElementById("quantity").value
    );

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let existingProduct = cart.find(function(product) {
        return product.name === name;
    });

    if (existingProduct) {

        existingProduct.quantity += quantity;

    } else {

        cart.push({
            name: name,
            category: category,
            price: price,
            image: image,
            quantity: quantity
        });

    }

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    // Directly Cart Page par jao
    window.location.href = "cart.html";
}


// Back button

function goBack() {

    window.location.href = "products.html";

}