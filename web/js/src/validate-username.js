Array.from(document.querySelectorAll('input[name="_username"]')).forEach((element) =>
{
    element.addEventListener('keydown', function(event) {
        if (event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 8 || event.keyCode === 9 || event.keyCode === 13) {
            return;
        }

        if ((event.keyCode < 48 || event.keyCode > 90 || event.shiftKey) && !(event.shiftKey && event.keyCode === 189)){
            event.preventDefault();
        }
    });
});