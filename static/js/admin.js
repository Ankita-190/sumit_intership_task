(function () {
    "use strict";

    var sidebar = document.getElementById("adminSidebar");
    var toggle = document.getElementById("sidebarToggle");
    var overlay = document.getElementById("adminOverlay");

    function openSidebar() {
        if (sidebar) sidebar.classList.add("open");
        if (overlay) overlay.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove("open");
        if (overlay) overlay.classList.remove("show");
        document.body.style.overflow = "";
    }

    if (toggle) {
        toggle.addEventListener("click", function () {
            if (sidebar && sidebar.classList.contains("open")) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }

    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });

    document.querySelectorAll(".status-select").forEach(function (select) {
        select.addEventListener("change", function () {
            if (confirm("Update order status to " + select.value + "?")) {
                select.closest("form").submit();
            } else {
                select.selectedIndex = select.dataset.originalIndex;
            }
        });
        select.dataset.originalIndex = select.selectedIndex;
    });

    var imageInput = document.getElementById("productImage");
    var imagePreview = document.getElementById("imagePreview");
    if (imageInput && imagePreview) {
        imageInput.addEventListener("change", function () {
            var file = imageInput.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }
})();
