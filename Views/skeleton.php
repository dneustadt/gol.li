<!doctype html>
<html>
    <head>
        <title><?= @$data['title']; ?></title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="">
    </head>
    <body>

        <header>
        </header>

        <section>
            <?php include @$data['template']; ?>
        </section>

        <footer>
        </footer>

    </body>
</html>