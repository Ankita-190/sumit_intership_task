// ===============================
// LOAD DATA
// ===============================

let products =
    JSON.parse(localStorage.getItem("products")) || [];

let orders =
    JSON.parse(localStorage.getItem("orders")) || [];

let users =
    JSON.parse(localStorage.getItem("users")) || [];


// ===============================
// COUNT
// ===============================

document.getElementById("productCount").innerText =
    products.length;

document.getElementById("orderCount").innerText =
    orders.length;

document.getElementById("userCount").innerText =
    users.length;


// ===============================
// SHOW PRODUCTS
// ===============================

function showProducts() {

    let content =
        document.getElementById("adminContent");

    content.innerHTML = `

        <div class="management-header">

            <h2>Product Management</h2>

            <button
                class="add-btn"
                onclick="showAddProductForm()">

                + Add Product

            </button>

        </div>

        <div id="productList"></div>

    `;

    displayProducts();

}


// ===============================
// DISPLAY PRODUCTS
// ===============================

function displayProducts() {

    let productList =
        document.getElementById("productList");

    productList.innerHTML = "";

    if (products.length === 0) {

        productList.innerHTML = `

            <div class="no-data">

                <h2>No Products Available</h2>

                <p>
                    Click "Add Product" to add a product.
                </p>

            </div>

        `;

        return;
    }

    products.forEach(function(product, index) {

        productList.innerHTML += `

            <div class="admin-product">

                <img
                    src="${product.image}"
                    alt="${product.name}">

                <div class="product-info">

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        Category:
                        ${product.category}
                    </p>

                    <p>
                        Price:
                        ₹${Number(product.price)
                            .toLocaleString("en-IN")}
                    </p>

                    <button
                        class="edit-btn"
                        onclick="editProduct(${index})">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteProduct(${index})">

                        Delete

                    </button>

                </div>

            </div>

        `;

    });

}


// ===============================
// ADD PRODUCT FORM
// ===============================

function showAddProductForm() {

    let content =
        document.getElementById("adminContent");

    content.innerHTML = `

        <h2>Add New Product</h2>

        <div class="product-form">

            <label>
                Product Name
            </label>

            <input
                type="text"
                id="productName"
                placeholder="Enter product name">

            <label>
                Category
            </label>

            <select id="productCategory">

                <option value="Chair">
                    Chair
                </option>

                <option value="Table">
                    Table
                </option>

                <option value="Sofa">
                    Sofa
                </option>

                <option value="Bed">
                    Bed
                </option>

            </select>

            <label>
                Price
            </label>

            <input
                type="number"
                id="productPrice"
                placeholder="Enter product price">

            <label>
                Product Image
            </label>

            <input
                type="file"
                id="productImage"
                accept="image/*">

            <br><br>

            <button
                class="save-btn"
                onclick="addProduct()">

                Add Product

            </button>

            <button
                class="cancel-btn"
                onclick="showProducts()">

                Cancel

            </button>

        </div>

    `;

}


// ===============================
// ADD PRODUCT
// ===============================

function addProduct() {

    let name =
        document
        .getElementById("productName")
        .value
        .trim();

    let category =
        document
        .getElementById("productCategory")
        .value;

    let price =
        Number(
            document
            .getElementById("productPrice")
            .value
        );

    let imageFile =
        document
        .getElementById("productImage")
        .files[0];

    if (
        name === "" ||
        price <= 0 ||
        !imageFile
    ) {

        alert(
            "Please enter all product details and select an image."
        );

        return;
    }

    let reader =
        new FileReader();

    reader.onload = function(event) {

        let newProduct = {

            name: name,

            category: category,

            price: price,

            image: event.target.result

        };

        products.push(newProduct);

        localStorage.setItem(
            "products",
            JSON.stringify(products)
        );

        document.getElementById("productCount").innerText =
            products.length;

        alert(
            "Product Added Successfully!"
        );

        showProducts();

    };

    reader.readAsDataURL(imageFile);

}


// ===============================
// EDIT PRODUCT
// ===============================

function editProduct(index) {

    let product =
        products[index];

    let content =
        document.getElementById("adminContent");

    content.innerHTML = `

        <h2>Edit Product</h2>

        <div class="product-form">

            <label>
                Product Name
            </label>

            <input
                type="text"
                id="productName"
                value="${product.name}">

            <label>
                Category
            </label>

            <select id="productCategory">

                <option value="Chair"
                    ${product.category === "Chair"
                    ? "selected" : ""}>

                    Chair

                </option>

                <option value="Table"
                    ${product.category === "Table"
                    ? "selected" : ""}>

                    Table

                </option>

                <option value="Sofa"
                    ${product.category === "Sofa"
                    ? "selected" : ""}>

                    Sofa

                </option>

                <option value="Bed"
                    ${product.category === "Bed"
                    ? "selected" : ""}>

                    Bed

                </option>

            </select>

            <label>
                Price
            </label>

            <input
                type="number"
                id="productPrice"
                value="${product.price}">

            <label>
                Change Product Image
            </label>

            <input
                type="file"
                id="productImage"
                accept="image/*">

            <br><br>

            <button
                class="save-btn"
                onclick="updateProduct(${index})">

                Update Product

            </button>

            <button
                class="cancel-btn"
                onclick="showProducts()">

                Cancel

            </button>

        </div>

    `;

}


// ===============================
// UPDATE PRODUCT
// ===============================

function updateProduct(index) {

    let name =
        document
        .getElementById("productName")
        .value
        .trim();

    let category =
        document
        .getElementById("productCategory")
        .value;

    let price =
        Number(
            document
            .getElementById("productPrice")
            .value
        );

    let imageFile =
        document
        .getElementById("productImage")
        .files[0];

    if (
        name === "" ||
        price <= 0
    ) {

        alert(
            "Please enter valid product details."
        );

        return;
    }

    products[index].name =
        name;

    products[index].category =
        category;

    products[index].price =
        price;

    if (imageFile) {

        let reader =
            new FileReader();

        reader.onload =
            function(event) {

                products[index].image =
                    event.target.result;

                saveUpdatedProduct();

            };

        reader.readAsDataURL(imageFile);

    }

    else {

        saveUpdatedProduct();

    }

}


// ===============================
// SAVE UPDATED PRODUCT
// ===============================

function saveUpdatedProduct() {

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

    alert(
        "Product Updated Successfully!"
    );

    showProducts();

}


// ===============================
// DELETE PRODUCT
// ===============================

function deleteProduct(index) {

    let confirmDelete =
        confirm(
            "Are you sure you want to delete this product?"
        );

    if (!confirmDelete) {

        return;

    }

    products.splice(index, 1);

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

    document.getElementById("productCount").innerText =
        products.length;

    alert(
        "Product Deleted Successfully!"
    );

    showProducts();

}


// ===============================
// SHOW ORDERS
// ===============================

function showOrders() {

    let content =
        document.getElementById("adminContent");

    content.innerHTML = `

        <h2>Order Management</h2>

        <div id="orderList"></div>

    `;

    let orderList =
        document.getElementById("orderList");

    if (orders.length === 0) {

        orderList.innerHTML = `
            <p>No orders available.</p>
        `;

        return;

    }

    let latestOrders =
        orders.map(function(order, index) {

            return {
                order: order,
                index: index
            };

        }).reverse();


    latestOrders.forEach(function(item) {

        let order =
            item.order;

        let orderIndex =
            item.index;

        if (!order.status) {

            order.status =
                "Pending";

        }

        orderList.innerHTML += `

            <div class="admin-order">

                <div class="order-header">

                    <h3>
                        Order ID:
                        ${order.orderId}
                    </h3>

                    <span class="status">
                        ${order.status}
                    </span>

                </div>

                <p>
                    <strong>Customer:</strong>
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

                <p>
                    <strong>Payment:</strong>
                    ${order.payment}
                </p>

                <h3>
                    Final Amount:
                    ₹${Number(order.finalAmount)
                        .toLocaleString("en-IN")}
                </h3>

                <select
                    onchange="updateOrderStatus(
                        ${orderIndex},
                        this.value
                    )">

                    <option value="Pending"
                        ${order.status === "Pending"
                        ? "selected" : ""}>

                        Pending

                    </option>

                    <option value="Confirmed"
                        ${order.status === "Confirmed"
                        ? "selected" : ""}>

                        Confirmed

                    </option>

                    <option value="Shipped"
                        ${order.status === "Shipped"
                        ? "selected" : ""}>

                        Shipped

                    </option>

                    <option value="Delivered"
                        ${order.status === "Delivered"
                        ? "selected" : ""}>

                        Delivered

                    </option>

                </select>

                <button
                    class="delete-order"
                    onclick="deleteOrder(${orderIndex})">

                    Delete Order

                </button>

            </div>

        `;

    });

    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );

}


// ===============================
// UPDATE ORDER STATUS
// ===============================

function updateOrderStatus(index, status) {

    orders[index].status =
        status;

    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );

    alert(
        "Order status updated to " +
        status
    );

    showOrders();

}


// ===============================
// DELETE ORDER
// ===============================

function deleteOrder(index) {

    let confirmDelete =
        confirm(
            "Are you sure you want to delete this order?"
        );

    if (!confirmDelete) {

        return;

    }

    orders.splice(index, 1);

    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );

    document.getElementById("orderCount").innerText =
        orders.length;

    showOrders();

}


// ===============================
// SHOW USERS
// ===============================

function showUsers() {

    let content =
        document.getElementById("adminContent");

    content.innerHTML = `

        <div class="management-header">

            <h2>Registered Users</h2>

        </div>

        <div id="userList"></div>

    `;

    let userList =
        document.getElementById("userList");


    if (users.length === 0) {

        userList.innerHTML = `

            <div class="no-data">

                <h2>No Registered Users</h2>

                <p>
                    No users have registered yet.
                </p>

            </div>

        `;

        return;

    }


    users.forEach(function(user, index) {

        userList.innerHTML += `

            <div class="admin-user">

                <h3>
                    User ${index + 1}
                </h3>

                <p>
                    <strong>Name:</strong>
                    ${user.name}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${user.email}
                </p>

                <p>
                    <strong>Mobile:</strong>
                    ${user.mobile}
                </p>

                <p>
                    <strong>Gender:</strong>
                    ${user.gender || "Not Available"}
                </p>

            </div>

        `;

    });

}


// ===============================
// ADMIN LOGOUT
// ===============================

function adminLogout() {

    localStorage.removeItem(
        "isAdmin"
    );

    window.location.href =
        "admin-login.html";

}