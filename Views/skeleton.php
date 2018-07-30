<!doctype html>
<html>
    <head>
        <title><?= @$data['title']; ?></title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="<?= @$data['base_path']; ?>/web/css/dist/all.min.css">
    </head>
    <body>
        <?php if (@$data['no_skeleton']): ?>
            <?php include @$data['template']; ?>
            </body></html>
            <?php return; ?>
        <?php endif; ?>
        <header class="wrapper">
            <section class="container">
                <h1><a href="<?= @$data['base_path']; ?>/">gol.li</a></h1>
            </section>
        </header>

        <main class="wrapper">
            <section class="container">
                <?php include @$data['template']; ?>
            </section>
        </main>

        <footer class="wrapper">
            <section class="container clearfix">
                <p class="float-right">
                    <a href="<?= @$data['base_path']; ?>/terms" title="Terms of Service">Terms of Service</a>&nbsp;&nbsp;|&nbsp;
                    <a href="<?= @$data['base_path']; ?>/terms/privacy" title="Privacy Policy">Privacy Policy</a>&nbsp;&nbsp;|&nbsp;
                    gol.li &copy; 2018
                </p>
            </section>
        </footer>
        <script type="text/javascript" src="<?= @$data['base_path']; ?>/web/js/dist/scripts.min.js"></script>
    </body>
</html>