Array.from(document.querySelectorAll('.confirm-checkbox')).forEach((element) =>
{
    element.addEventListener('change', function(event) {
        event.preventDefault();

        let button = event.target.nextElementSibling;

        if (event.target.checked) {
            button.removeAttribute('disabled');
        } else {
            button.setAttribute('disabled', 'disabled')
        }
    });
});