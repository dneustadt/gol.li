Array.from(document.querySelectorAll('.column.remove .remove--button')).forEach((element) =>
{
    let id = element.getAttribute('data-id'),
        selectorDropdown = '.service-select--dropdown input[value="' + id + '"]',
        selectorHandle = '.column.handle input[data-id="' + id + '"]';

    element.addEventListener('click', function(event) {
        event.preventDefault();

        Array.from(document.querySelectorAll(selectorDropdown)).forEach((element) =>
        {
            element.checked = false;
        });

        Array.from(document.querySelectorAll(selectorHandle)).forEach((element) =>
        {
            element.value = '';
            element.parentElement.parentElement.setAttribute('style', 'display: none;')
        });
    });
});

Array.from(document.querySelectorAll('.service-select--dropdown input')).forEach((element) =>
{
    let id = element.value,
        selectorHandle = '.column.handle input[data-id="' + id + '"]';

    element.addEventListener('change', function(event) {
        event.preventDefault();

        if (event.target.checked) {
            Array.from(document.querySelectorAll(selectorHandle)).forEach((element) =>
            {
                let container = element.parentElement.parentElement;

                container.removeAttribute('style');
                container.scrollIntoView(true);
            });
        }
    });
});