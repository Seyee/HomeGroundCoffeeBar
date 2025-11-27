console.log("This is paymaya");

// CHECK IF AMOUNT EXCEEDED THE AVAILABLE BALANCE
const amountError = document.getElementById("amountError");
const paymentFormCon = document.getElementById("paymentFormCon");
const paymayaBtn = document.getElementById("paymaya");

if (paymentFormCon) {
    paymentFormCon.addEventListener("submit", async function (event) {
        event.preventDefault();
        amountError.textContent = "";

        const form = event.target;
        const totalAmount = parseInt(document.getElementById("totalAmount").textContent) || 0;

        try {
            const response = await fetch(form.action, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Amount: totalAmount
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.warn("Server error: ", data);
                amountError.textContent = data?.message || "Amount exceeded!";
                paymayaBtn.innerHTML = "Go back to merchant";
                const url = paymayaBtn.dataset.url;
                paymayaBtn.addEventListener("click", () => {
                    location.href = url;
                });
            } else if (data.redirect) {
                // Store payment method before redirect
                localStorage.setItem('paymentMethod', 'paymaya');
                window.location.href = data.redirect;
            }
        } 
        catch (err) {
            amountError.textContent = "Network error occured. Please try again later.";
        }
    });
}

// FUNCTION TO REDIRECT TO RECEIPT (for success button)
function redirectToReceipt() {
    // Get order ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    // Store payment method in localStorage
    localStorage.setItem('paymentMethod', 'paymaya');
    
    // Redirect to receipt page
    if (orderId) {
        window.location.href = `/Home/Receipt?orderNumber=${orderId}`;
    } else {
        window.location.href = '/Home/Receipt';
    }
}

// Make function available globally
window.redirectToReceipt = redirectToReceipt;

// OTP
const otp = document.querySelectorAll(".otp_con_input input");
const otpInput = document.querySelectorAll(".otp_box");

document.addEventListener("DOMContentLoaded", () => {
    
    const otpForm = document.getElementById("otpForm"); 

    // ONLY ACCEPT NUMBERS
    otpInput.forEach((input) => {
        input.addEventListener("input", () => {
            input.value = input.value.replace(/[^0-9]/g, "");
        });

        input.addEventListener("keydown", (e) => {
            if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
            }
        });

        input.addEventListener("paste", (e) => {
            e.preventDefault();
        });
    });

    otp.forEach((input, index) => {
        if (index !== 0) input.disabled = true;
    });

    otpForm.addEventListener("submit", (e) => {
        otp.forEach(i => i.value = "");

        otp[0].focus();
    });

    otp.forEach((input, index) => {
        input.addEventListener("input", () => {
            const value = input.value;

            if (value && index < otp.length - 1) {
                otp[index + 1].disabled = false;
                otp[index + 1].focus();
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && index > 0 && !input.value) {
                otp[index].disabled = true;
                otp[index - 1].focus();
                otp[index - 1].value = "";
            }

            if (index > 0 && otp[index - 1].disabled) {
                e.preventDefault();
                otp[0].focus();
            }
        });

        input.addEventListener("focus", () => {
            if (index > 0 && otp[index - 1].disabled) {
                otp[0].focus();
            }
        });
    });
});