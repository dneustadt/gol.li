<!doctype html>
<html>
    <head>
        <title><?= @$data['title']; ?></title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="<?= @$data['base_path']; ?>/web/css/dist/all.min.css">
    </head>
    <body>
        <header class="wrapper">
            <section class="container">
                <h1><?= @$data['title']; ?></h1>
            </section>
        </header>

        <main class="wrapper">
            <section class="container">
                <?php include @$data['template']; ?>
            </section>
        </main>

        <footer>
        </footer>
    </body>
</html>