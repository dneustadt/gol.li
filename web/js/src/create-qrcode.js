Array.from(document.querySelectorAll('.create-qrcode')).forEach((element) =>
{
    element.addEventListener('click', function(event) {
        event.preventDefault();

        head.load(event.target.getAttribute('data-js'), function() {
            let qrcodeContainer = document.getElementById('qrcode');

            while (qrcodeContainer.firstChild) {
                qrcodeContainer.removeChild(qrcodeContainer.firstChild);
            }

            let qrcode = new QRCode(qrcodeContainer, {
                width: 200,
                height: 200,
                useSVG: true
            });

            qrcode.makeCode(event.target.getAttribute('data-url'));
        });
    });
});