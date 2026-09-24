import os
import random
from datetime import datetime
from functools import wraps

from flask import (
    Flask,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "svg"}

CATEGORIES = ["Chair", "Table", "Sofa", "Bed"]
ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered"]
CATEGORY_DISCOUNTS = {"Chair": 5, "Table": 8, "Sofa": 10, "Bed": 12}
NORMAL_DISCOUNT = 10
TAX_RATE = 0.18
CART_DISCOUNT_THRESHOLD = 10000
CART_DISCOUNT_RATE = 0.10

app = Flask(__name__)
app.config["SECRET_KEY"] = "myshop-change-this-secret"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(BASE_DIR, "shop.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    mobile = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    gender = db.Column(db.String(20), default="")
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    orders = db.relationship("Order", backref="user", lazy=True)


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    category = db.Column(db.String(40), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default="")


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_code = db.Column(db.String(20), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    mobile = db.Column(db.String(20), nullable=False)
    address = db.Column(db.Text, nullable=False)
    city = db.Column(db.String(80), nullable=False)
    pincode = db.Column(db.String(12), nullable=False)
    payment = db.Column(db.String(40), nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    tax = db.Column(db.Float, nullable=False)
    discount = db.Column(db.Float, nullable=False)
    final_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(30), default="Pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    items = db.relationship(
        "OrderItem", backref="order", lazy=True, cascade="all, delete-orphan"
    )


class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("order.id"), nullable=False)
    product_id = db.Column(db.Integer, nullable=True)
    name = db.Column(db.String(160), nullable=False)
    category = db.Column(db.String(40), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    image = db.Column(db.String(255), nullable=False)


def inr(amount):
    return "₹{:,.0f}".format(round(amount))


def category_discount(category):
    return CATEGORY_DISCOUNTS.get(category, 0)


def product_pricing(product):
    original = float(product.price)
    cat_off = category_discount(product.category)
    total_off = NORMAL_DISCOUNT + cat_off
    discount_amount = original * total_off / 100
    final_price = original - discount_amount
    return {
        "original": original,
        "category_discount": cat_off,
        "total_discount": total_off,
        "final_price": final_price,
    }


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def rupee_filter(value):
    try:
        return inr(float(value))
    except (TypeError, ValueError):
        return inr(0)


app.jinja_env.filters["inr"] = rupee_filter


@app.context_processor
def inject_globals():
    cart = session.get("cart", {})
    cart_count = sum(int(qty) for qty in cart.values())
    return {
        "current_user": get_current_user(),
        "cart_count": cart_count,
        "categories": CATEGORIES,
        "now_year": datetime.now().year,
    }


def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return db.session.get(User, user_id)


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("user_id"):
            flash("Please login to continue.", "error")
            return redirect(url_for("login"))
        return view(*args, **kwargs)

    return wrapped


def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("admin_logged_in"):
            flash("Admin access required.", "error")
            return redirect(url_for("admin_login"))
        user = get_current_user()
        if not user or not user.is_admin:
            session.pop("admin_logged_in", None)
            flash("Admin access required.", "error")
            return redirect(url_for("admin_login"))
        return view(*args, **kwargs)

    return wrapped


def get_total_revenue():
    result = db.session.query(func.coalesce(func.sum(Order.final_amount), 0)).scalar()
    return float(result or 0)


def normalize_order_status(status):
    if status == "Confirmed":
        return "Processing"
    return status if status in ORDER_STATUSES else "Pending"


def get_cart_items():
    cart = session.get("cart", {})
    items = []
    subtotal = 0
    for product_id, quantity in cart.items():
        product = db.session.get(Product, int(product_id))
        if not product:
            continue
        qty = int(quantity)
        pricing = product_pricing(product)
        line_total = pricing["final_price"] * qty
        subtotal += line_total
        items.append(
            {
                "product": product,
                "quantity": qty,
                "unit_price": pricing["final_price"],
                "line_total": line_total,
                "pricing": pricing,
            }
        )
    tax = subtotal * TAX_RATE
    discount = subtotal * CART_DISCOUNT_RATE if subtotal >= CART_DISCOUNT_THRESHOLD else 0
    final_amount = subtotal + tax - discount
    return items, subtotal, tax, discount, final_amount


def generate_order_code():
    while True:
        code = "ORD-" + str(random.randint(100000, 999999))
        if not Order.query.filter_by(order_code=code).first():
            return code


def save_upload(file_storage):
    if not file_storage or not file_storage.filename:
        return None
    if not allowed_file(file_storage.filename):
        return None
    filename = secure_filename(file_storage.filename)
    name, ext = os.path.splitext(filename)
    filename = "{}_{}{}".format(name, random.randint(1000, 9999), ext.lower())
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file_storage.save(path)
    return "uploads/" + filename


def seed_data():
    if User.query.filter_by(email="admin@gmail.com").first():
        return

    admin = User(
        name="Admin",
        email="admin@gmail.com",
        mobile="9999999999",
        password_hash=generate_password_hash("admin123"),
        gender="Other",
        is_admin=True,
    )
    db.session.add(admin)

    samples = [
        (
            "Wooden Chair",
            "Chair",
            2500,
            "images/chair.svg",
            "A sturdy wooden chair with a comfortable seat for everyday use.",
        ),
        (
            "Dining Table",
            "Table",
            8000,
            "images/table.svg",
            "A stylish dining table that fits family meals and gatherings.",
        ),
        (
            "Comfort Sofa",
            "Sofa",
            15000,
            "images/sofa.svg",
            "A modern sofa designed for comfort and a clean living-room look.",
        ),
        (
            "King Size Bed",
            "Bed",
            20000,
            "images/bed.svg",
            "A king size bed with a durable frame and a restful design.",
        ),
        (
            "Study Chair",
            "Chair",
            1800,
            "images/chair.svg",
            "A compact study chair that supports long hours of work.",
        ),
        (
            "Coffee Table",
            "Table",
            4500,
            "images/table.svg",
            "A compact coffee table for your living room.",
        ),
    ]
    for name, category, price, image, description in samples:
        db.session.add(
            Product(
                name=name,
                category=category,
                price=price,
                image=image,
                description=description,
            )
        )
    db.session.commit()


with app.app_context():
    db.create_all()
    seed_data()


@app.route("/")
def home():
    featured = Product.query.limit(4).all()
    priced = [(product, product_pricing(product)) for product in featured]
    return render_template("home.html", featured=priced)


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        mobile = request.form.get("mobile", "").strip()
        password = request.form.get("password", "")
        confirm = request.form.get("confirmPassword", "")
        gender = request.form.get("gender", "")
        terms = request.form.get("terms")

        if not all([name, email, mobile, password, confirm, gender]):
            flash("Please fill in all fields.", "error")
            return render_template("register.html")
        if password != confirm:
            flash("Password and Confirm Password do not match!", "error")
            return render_template("register.html")
        if not terms:
            flash("Please agree to Terms & Conditions!", "error")
            return render_template("register.html")
        if User.query.filter_by(email=email).first():
            flash("This email is already registered!", "error")
            return render_template("register.html")

        user = User(
            name=name,
            email=email,
            mobile=mobile,
            password_hash=generate_password_hash(password),
            gender=gender,
            is_admin=False,
        )
        db.session.add(user)
        db.session.commit()
        flash("Registration successful! Please login.", "success")
        return redirect(url_for("login"))

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = User.query.filter_by(email=email).first()
        if user and not user.is_admin and check_password_hash(user.password_hash, password):
            session.clear()
            session["user_id"] = user.id
            session["cart"] = {}
            flash("Login successful!", "success")
            return redirect(url_for("home"))
        flash("Invalid Email or Password!", "error")
    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))


@app.route("/products")
def products():
    selected = request.args.get("category", "All")
    query = request.args.get("q", "").strip()
    items = Product.query
    if selected in CATEGORIES:
        items = items.filter_by(category=selected)
    if query:
        items = items.filter(Product.name.ilike("%{}%".format(query)))
    products_list = items.order_by(Product.id.asc()).all()
    priced = [(product, product_pricing(product)) for product in products_list]
    return render_template(
        "products.html",
        products=priced,
        selected=selected,
        query=query,
    )


@app.route("/product/<int:product_id>")
def product_details(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        flash("Product not found.", "error")
        return redirect(url_for("products"))
    return render_template(
        "product_details.html",
        product=product,
        pricing=product_pricing(product),
    )


@app.route("/cart/add/<int:product_id>", methods=["POST"])
@login_required
def add_to_cart(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        flash("Product not found.", "error")
        return redirect(url_for("products"))
    quantity = max(1, int(request.form.get("quantity", 1) or 1))
    cart = session.get("cart", {})
    key = str(product_id)
    cart[key] = int(cart.get(key, 0)) + quantity
    session["cart"] = cart
    flash("{} added to cart.".format(product.name), "success")
    return redirect(url_for("cart"))


@app.route("/cart")
@login_required
def cart():
    items, subtotal, tax, discount, final_amount = get_cart_items()
    return render_template(
        "cart.html",
        items=items,
        subtotal=subtotal,
        tax=tax,
        discount=discount,
        final_amount=final_amount,
    )


@app.route("/cart/update/<int:product_id>", methods=["POST"])
@login_required
def update_cart(product_id):
    action = request.form.get("action")
    cart = session.get("cart", {})
    key = str(product_id)
    if key not in cart:
        return redirect(url_for("cart"))
    if action == "increase":
        cart[key] = int(cart[key]) + 1
    elif action == "decrease":
        cart[key] = max(1, int(cart[key]) - 1)
    elif action == "remove":
        cart.pop(key, None)
    session["cart"] = cart
    return redirect(url_for("cart"))


@app.route("/checkout", methods=["GET", "POST"])
@login_required
def checkout():
    items, subtotal, tax, discount, final_amount = get_cart_items()
    if not items:
        flash("Your cart is empty!", "error")
        return redirect(url_for("cart"))

    user = get_current_user()
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()
        mobile = request.form.get("mobile", "").strip()
        address = request.form.get("address", "").strip()
        city = request.form.get("city", "").strip()
        pincode = request.form.get("pincode", "").strip()
        payment = request.form.get("payment", "").strip()
        if not all([name, email, mobile, address, city, pincode, payment]):
            flash("Please complete the checkout form.", "error")
            return render_template(
                "checkout.html",
                items=items,
                subtotal=subtotal,
                tax=tax,
                discount=discount,
                final_amount=final_amount,
            )

        order = Order(
            order_code=generate_order_code(),
            user_id=user.id,
            name=name,
            email=email,
            mobile=mobile,
            address=address,
            city=city,
            pincode=pincode,
            payment=payment,
            subtotal=subtotal,
            tax=tax,
            discount=discount,
            final_amount=final_amount,
            status="Pending",
        )
        db.session.add(order)
        db.session.flush()
        for item in items:
            db.session.add(
                OrderItem(
                    order_id=order.id,
                    product_id=item["product"].id,
                    name=item["product"].name,
                    category=item["product"].category,
                    price=item["unit_price"],
                    quantity=item["quantity"],
                    image=item["product"].image,
                )
            )
        db.session.commit()
        session["cart"] = {}
        flash("Order placed successfully!", "success")
        return redirect(url_for("receipt", order_code=order.order_code))

    return render_template(
        "checkout.html",
        items=items,
        subtotal=subtotal,
        tax=tax,
        discount=discount,
        final_amount=final_amount,
    )


@app.route("/receipt/<order_code>")
@login_required
def receipt(order_code):
    user = get_current_user()
    order = Order.query.filter_by(order_code=order_code).first()
    if not order or (order.user_id != user.id and not user.is_admin):
        flash("Order not found.", "error")
        return redirect(url_for("order_history"))
    return render_template("receipt.html", order=order)


@app.route("/orders")
@login_required
def order_history():
    user = get_current_user()
    orders = (
        Order.query.filter_by(user_id=user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return render_template("order_history.html", orders=orders)


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if session.get("admin_logged_in") and get_current_user():
        return redirect(url_for("admin_dashboard"))
    if request.method == "POST":
        email = request.form.get("adminEmail", "").strip().lower()
        password = request.form.get("adminPassword", "")
        user = User.query.filter_by(email=email, is_admin=True).first()
        if user and check_password_hash(user.password_hash, password):
            session.clear()
            session["user_id"] = user.id
            session["admin_logged_in"] = True
            session["cart"] = {}
            flash("Welcome back, {}!".format(user.name), "success")
            return redirect(url_for("admin_dashboard"))
        flash("Invalid Admin Email or Password!", "error")
    return render_template("admin_login.html")


@app.route("/admin/logout")
def admin_logout():
    session.clear()
    flash("You have been logged out of the admin panel.", "info")
    return redirect(url_for("admin_login"))


@app.route("/admin")
@admin_required
def admin_dashboard():
    section = request.args.get("section", "")
    active_section = section if section else "dashboard"
    product_count = Product.query.count()
    order_count = Order.query.count()
    user_count = User.query.filter_by(is_admin=False).count()
    total_revenue = get_total_revenue()
    products_list = Product.query.order_by(Product.id.desc()).all()
    orders = Order.query.order_by(Order.created_at.desc()).all()
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
    users = User.query.filter_by(is_admin=False).order_by(User.id.desc()).all()
    for order in orders + recent_orders:
        order.status = normalize_order_status(order.status)
    return render_template(
        "admin.html",
        section=section,
        active_section=active_section,
        product_count=product_count,
        order_count=order_count,
        user_count=user_count,
        total_revenue=total_revenue,
        products=products_list,
        orders=orders,
        recent_orders=recent_orders,
        users=users,
        order_statuses=ORDER_STATUSES,
    )


@app.route("/admin/products/add", methods=["GET", "POST"])
@admin_required
def admin_add_product():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        category = request.form.get("category", "")
        price = request.form.get("price", "0")
        description = request.form.get("description", "").strip()
        image_file = request.files.get("image")
        try:
            price_value = float(price)
        except ValueError:
            price_value = 0
        image_path = save_upload(image_file)
        if not name or category not in CATEGORIES or price_value <= 0 or not image_path:
            flash("Please enter all product details and select an image.", "error")
            return redirect(url_for("admin_add_product"))
        db.session.add(
            Product(
                name=name,
                category=category,
                price=price_value,
                image=image_path,
                description=description
                or "A high-quality furniture product designed for home use.",
            )
        )
        db.session.commit()
        flash("Product added successfully!", "success")
        return redirect(url_for("admin_dashboard", section="products"))
    return render_template(
        "admin_product_form.html",
        product=None,
        active_section="products",
    )


@app.route("/admin/products/<int:product_id>/edit", methods=["GET", "POST"])
@admin_required
def admin_edit_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        flash("Product not found.", "error")
        return redirect(url_for("admin_dashboard", section="products"))
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        category = request.form.get("category", "")
        price = request.form.get("price", "0")
        description = request.form.get("description", "").strip()
        try:
            price_value = float(price)
        except ValueError:
            price_value = 0
        if not name or category not in CATEGORIES or price_value <= 0:
            flash("Please enter valid product details.", "error")
            return render_template(
                "admin_product_form.html",
                product=product,
                active_section="products",
            )
        product.name = name
        product.category = category
        product.price = price_value
        product.description = description or product.description
        image_path = save_upload(request.files.get("image"))
        if image_path:
            product.image = image_path
        db.session.commit()
        flash("Product updated successfully!", "success")
        return redirect(url_for("admin_dashboard", section="products"))
    return render_template(
        "admin_product_form.html",
        product=product,
        active_section="products",
    )


@app.route("/admin/products/<int:product_id>/delete", methods=["POST"])
@admin_required
def admin_delete_product(product_id):
    product = db.session.get(Product, product_id)
    if product:
        db.session.delete(product)
        db.session.commit()
        flash("Product deleted successfully!", "success")
    return redirect(url_for("admin_dashboard", section="products"))


@app.route("/admin/orders/<int:order_id>")
@admin_required
def admin_order_detail(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        flash("Order not found.", "error")
        return redirect(url_for("admin_dashboard", section="orders"))
    order.status = normalize_order_status(order.status)
    return render_template(
        "admin_order_detail.html",
        order=order,
        active_section="orders",
        order_statuses=ORDER_STATUSES,
    )


@app.route("/admin/orders/<int:order_id>/status", methods=["POST"])
@admin_required
def admin_update_status(order_id):
    order = db.session.get(Order, order_id)
    status = request.form.get("status", "Pending")
    if order and status in ORDER_STATUSES:
        order.status = status
        db.session.commit()
        flash("Order status updated to {}.".format(status), "success")
    redirect_to = request.form.get("redirect", "list")
    if redirect_to == "detail":
        return redirect(url_for("admin_order_detail", order_id=order_id))
    return redirect(url_for("admin_dashboard", section="orders"))


@app.route("/admin/orders/<int:order_id>/delete", methods=["POST"])
@admin_required
def admin_delete_order(order_id):
    order = db.session.get(Order, order_id)
    if order:
        db.session.delete(order)
        db.session.commit()
        flash("Order deleted.", "success")
    return redirect(url_for("admin_dashboard", section="orders"))


if __name__ == "__main__":
    app.run(debug=True)
