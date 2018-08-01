<!doctype html>
<html>
    <head>
        <title><?= @$data['title']; ?></title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="<?= @$data['base_path']; ?>/web/css/dist/all.min.css">
        <link rel="shortcut icon" type="image/x-icon" href="<?= @$data['base_path']; ?>/favicon.ico">
        <link rel="apple-touch-icon" sizes="57x57" href="<?= @$data['base_path']; ?>/web/img/favicon/apple-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60" href="<?= @$data['base_path']; ?>/web/img/favicon/apple-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72" href="<?= @$data['base_path']; ?>/web/img/favicon/apple-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76" href="<?= @$data['base_path']; ?>/web/img/favicon/apple-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="<?= @$data['base_path']; ?>/web/img/favicon/apple-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="<?= @$data['base_path']; ?>/web/img/favicon/apple-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="<?= @$data['base_path']; ?>/web/img/favicon/apple-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="<?= @$data['base_path']; ?>/web/img/favicon/apple-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="180x180" href="<?= @$data['base_path']; ?>/web/img/favicon/apple-icon-180x180.png">
        <link rel="icon" type="image/png" sizes="192x192"  href="<?= @$data['base_path']; ?>/web/img/favicon/android-icon-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="<?= @$data['base_path']; ?>/web/img/favicon/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="96x96" href="<?= @$data['base_path']; ?>/web/img/favicon/favicon-96x96.png">
        <link rel="icon" type="image/png" sizes="16x16" href="<?= @$data['base_path']; ?>/web/img/favicon/favicon-16x16.png">
        <link rel="manifest" href="<?= @$data['base_path']; ?>/web/img/favicon/manifest.json">
        <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-TileImage" content="<?= @$data['base_path']; ?>/web/img/favicon/ms-icon-144x144.png">
        <meta name="theme-color" content="#ffffff">
    </head>
    <body class="<?= @$data['controller']; ?><?php if (!@$data['is_loggedin']): ?> logged-out<?php endif; ?>">
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
                <p class="float-left github">
                    <a class="github-button" href="https://github.com/dneustadt/gol.li" data-size="large" aria-label="Star gol.li on GitHub">gol.li @ GitHub</a>
                    <a class="github-button" href="https://github.com/dneustadt/gol.li/issues" data-icon="octicon-issue-opened" data-size="large" aria-label="Issue gol.li on GitHub">Issue</a>
                </p>
                <p class="float-right">
                    <a href="<?= @$data['base_path']; ?>/terms" title="Terms of Service">Terms of Service</a>&nbsp;&nbsp;|&nbsp;
                    <a href="<?= @$data['base_path']; ?>/terms/privacy" title="Privacy Policy">Privacy Policy</a>&nbsp;&nbsp;|&nbsp;
                    gol.li &copy; 2018
                </p>
            </section>
        </footer>
        <script type="text/javascript" src="<?= @$data['base_path']; ?>/web/js/dist/scripts.min.js"></script>
        <script async defer src="https://buttons.github.io/buttons.js"></script>
    </body>
</html>