export function debug(type, message) {
    console.log(type + ": " + message);
}

export function openModal(modal, modalItem) {
    modal.classList.add("show");
    modalItem.classList.add("show");
}

export function closeModal(modal) {
    modal.classList.remove("show");
    modal.querySelectorAll(".modal-item").forEach(m => m.classList.remove("show"));
}

export function validateItemQuantity(input) {
    let value = input.value;
    debug("Input", value);

    // Allow empty temporarily so the user can type freely
    if (value === "") return;

    value = parseInt(value);

    if (isNaN(value) || value < 1) value = 1; // This avoid letting the user input the value `0`
    if (value > 99) value = 99;

    return value;
}