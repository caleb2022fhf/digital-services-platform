
const paymentForm = document.getElementById("paymentForm");
const submitButton = paymentForm.querySelector("button");

paymentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const orderData = {
        customerName: document.getElementById("customerName").value.trim(),
        customerEmail: document.getElementById("customerEmail").value.trim(),
        phoneNumber: document.getElementById("phoneNumber").value.trim(),
        paymentMethod: document.getElementById("paymentMethod").value,
        service: new URLSearchParams(window.location.search).get("service")
    };

    if (!orderData.service) {
        alert("Please select a service first.");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Processing...";

    try {
        const response = await fetch("/api/payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        alert(result.message || "Something went wrong.");

    } catch (error) {
        alert("Unable to connect to the server. Please try again.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Prepare My Order";
    }
});
