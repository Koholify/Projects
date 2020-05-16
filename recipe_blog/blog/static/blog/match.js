let password = document.getElementById('password')
let password_conf = document.getElementById('password_conf')
function validate_passwords() {
    if (password.value !== password_conf.value){
        password_conf.setCustomValidity("Passwords must match")
    }
    else {
        password_conf.setCustomValidity("")
    }
}

password.onchange = validate_passwords
password_conf.onkeyup = validate_passwords
