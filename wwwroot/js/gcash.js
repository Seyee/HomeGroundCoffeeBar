// DEBUGGER
console.log("This is gcash.js");

const phoneNumber = document.getElementById("phoneNumber");

// DISABLE INPUT NUMBER "e, +, and -"
phoneNumber.addEventListener('keydown', (e) => {
    if ((e.key >= '0' && e.key <= '9') || ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        return null;
    }

    e.preventDefault();
});


// POP UP FLOW
// POP UP LAYOUTS
const loginPop = document.getElementById("loginPop");
const otpPop = document.getElementById("otpPop");
const mpinPop = document.getElementById("mpinPop");
const payDetPop = document.getElementById("payDetPop");
const paySucPop = document.getElementById("paySucPop");

// BUTTONS
const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const btn3 = document.getElementById("btn3");
const btn4 = document.getElementById("btn4");
const btn5 = document.getElementById("btn5");

btn1.addEventListener(`click`, () => {
    loginPop.classList.toggle("inactive");
    otpPop.classList.toggle("active");
    mpinPop.classList.remove("active");
    payDetPop.classList.remove("active");
    paySucPop.classList.remove("active");
});

btn2.addEventListener('click', () => {
    otpPop.classList.remove("active");
    mpinPop.classList.toggle("active");
    payDetPop.classList.remove("active");
    paySucPop.classList.remove("active");
});

btn3.addEventListener('click', () => {
    otpPop.classList.remove("active");
    mpinPop.classList.remove("active");
    payDetPop.classList.toggle("active");
    paySucPop.classList.remove("active");
});

btn5.addEventListener('click', () => {
    loginPop.classList.remove("inactive");
    otpPop.classList.remove("active");
    mpinPop.classList.remove("active");
    payDetPop.classList.remove("active");
    paySucPop.classList.remove("active");
});

// AVAILABLE BALANCE VALIDATION
const amountError = document.getElementById("amountError");
const payAmountForm = document.getElementById("payAmountForm");

payAmountForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    amountError.textContent = "";

    const form = event.target;
    const totalAmount = parseInt(document.getElementById("totalAmount").value) || 0;

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
            btn4.innerHTML = "Go back to merchant";
            const url = btn4.dataset.url;
            btn4.addEventListener("click", () => {
                location.href = url;
            });
        } 
        else
        {
            otpPop.classList.remove("active");
            mpinPop.classList.remove("active");
            payDetPop.classList.remove("active");
            paySucPop.classList.toggle("active");
        }
    } 
    catch (err)
    {
        amountError.textContent = "Network error occured. Please try again later.";
    }
});

// PREVENT FORM SUBMISSION OTP
const otpForm = document.getElementById("otpForm");

otpForm.addEventListener("submit", (e) => {
    e.preventDefault();
});

// PREVENT FORM SUBMISSION MPIN
const mpinForm = document.getElementById("mpinForm");

mpinForm.addEventListener("submit", (e) => {
    e.preventDefault();
});

// VARIABLES
const otp = document.querySelectorAll(".otp_con input");
const firstOtp = document.getElementById("otpPin1");
const otpInputs = document.querySelectorAll(".no_spinner");

const mpin = document.querySelectorAll(".mpin_con input");

// MAKE USER ALWAYS START AT THE FIRST INPUT
document.addEventListener("DOMContentLoaded", () => {

    // ONLY ACCEPT NUMBER
    otpInputs.forEach((input) => {
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

    // ALWAYS START AT FIRST INPUT OTP
    otp.forEach((input, index) => {
        if (index !== 0) input.disabled = true; 
    });

    otpForm.addEventListener("submit", (e) => {
        e.preventDefault();

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

    // ONLY ACCEPT NUMBER
    mpin.forEach((input) => {
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

    // ALWAYS START AT FIRST INPUT
    mpin.forEach((input, index) => {
        if (index !== 0) input.disabled = true;
    });

    mpinForm.addEventListener("submit", (e) => {
        e.preventDefault();

        mpin.forEach(i => i.value = "");

        mpin[0].focus();
    });

    mpin.forEach((input, index) => {
        input.addEventListener("input", () => {
            const value = input.value.trim();

            if (value) {
                input.classList.add("active");
                input.readOnly = true;

                if (index < mpin.length - 1) {
                    mpin[index + 1].disabled = false;
                    mpin[index + 1].focus();
                }
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace") {
                if (input.value !== "") {
                    input.value = "";
                    input.classList.remove("active");
                    input.readOnly = false;
                    input.disabled = false;
                } else if (index > 0) {
                    input.disabled = true;
                    input.classList.remove("active");
                    mpin[index - 1].classList.remove("active");
                    mpin[index].disabled = true;
                    mpin[index - 1].focus();
                    mpin[index - 1].value = "";
                    mpin[index - 1].readOnly = false;
                }

            }


            if (index > 0 && mpin[index - 1].disabled) {
                e.preventDefault();
                mpin[0].focus();
            }
        });

        input.addEventListener("focus", () => {
            if (index > 0 && mpin[index - 1].disabled) {
                mpin[0].focus();
            }
        });
    });

});