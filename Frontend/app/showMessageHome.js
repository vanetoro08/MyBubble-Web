export function showMessage(message,type = "success"){
  Toastify({
    text: message,
    duration: 4000,
    destination: "https://github.com/apvarun/toastify-js",
    newWindow: true,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: type == "success" ? "green" : "red"
    },
    onClick: function(){} // Callback after click
  }).showToast();
}