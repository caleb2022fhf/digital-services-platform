
const paymentForm = document.getElementById("paymentForm");
const submitButton = document.getElementById("submitButton");

const serviceName = document.getElementById("serviceName");
const servicePrice = document.getElementById("servicePrice");
const serviceMessage = document.getElementById("serviceMessage");

const serviceId = new URLSearchParams(window.location.search).get("service");

let selectedService = null;

async function loadSelectedService() {
    if (!serviceId) {
        serviceName.textContent = "No service selected";
        servicePrice.textContent = "";
        serviceMessage.textContent = "Please select a service first.";
        return;
    }

    try {
        const response = await fetch("/api/services");

        if (!response.ok) {
            throw new Error("Unable to load services.");
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.services)) {
            throw new Error("Invalid services response.");
        }

        selectedService = result.services.find(
            service => service.id === serviceId
        );

        if (!selectedService) {
            serviceName.textContent = "Service not found";
            servicePrice.textContent = "";
            serviceMessage.textContent = "This service is unavailable or inactive.";
            return;
        }

        serviceName.textContent = selectedService.name;

        servicePrice.textContent =
            Number(selectedService.price_rwf).toLocaleString("en-US") + " RWF";

        serviceMessage.textContent =
            selectedService.description || "Selected digital service.";

        submitButton.disabled = false;

    } catch (error) {
        console.error(error);

        serviceName.textContent = "Unable to load service";
        servicePrice.textContent = "";
        serviceMessage.textContent =
            "Please refresh the page or try again later.";
    }
}

paymentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!selectedService) {
        alert("Please select a valid service.");
        return;
    }

    const orderData = {
        customerName: document.getElementById("customerName").value.trim(),
        customerEmail: document.getElementById("customerEmail").value.trim(),
        phoneNumber: document.getElementById("phoneNumber").value.trim(),
        paymentMethod: document.getElementById("paymentMethod").value,
        service: selectedService.id
    };

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
        console.error(error);

        alert("Unable to connect to the server. Please try again.");

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Prepare My Order";
    }
});

loadSelectedService();
