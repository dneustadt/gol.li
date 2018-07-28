Array.from(document.querySelectorAll('.column.remove .remove--button')).forEach((element) =>
{
    let id = element.getAttribute('data-id'),
        selectorDropdown = '.service-select--dropdown input[value="' + id + '"]',
        selectorHandle = '.column.handle input[data-id="' + id + '"]';

    element.addEventListener('click', function(event) {
        event.preventDefault();

        Array.from(document.querySelectorAll(selectorDropdown)).forEach((element) =>
        {
            element.removeAttribute('checked');
        });

        Array.from(document.querySelectorAll(selectorHandle)).forEach((element) =>
        {
            element.removeAttribute('value');
            element.parentElement.parentElement.setAttribute('style', 'display: none;')
        });
    });
});