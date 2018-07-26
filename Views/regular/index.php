<h1>
    Hi <?= @$data['name']; ?>!
</h1>

<?php if (!@$data['is_loggedin']): ?>
    <fieldset class="login-form">
        <legend>Login:</legend>
        <form action="<?= @$data['base_path']; ?>/login" method="post">
            <div class="login-form--field">
                <input placeholder="Username" type="text" id="username" name="_username" required>
            </div>
            <div class="login-form--field">
                <input placeholder="Password" type="password" id="password" name="_password" required>
            </div>
            <div class="login-form--field">
                <button type="submit">Login</button>
            </div>
        </form>
    </fieldset>

    <?php include __DIR__ . '/../register/index.php'; ?>
<?php else: ?>
    <a href="<?= @$data['base_path']; ?>/logout" class="button">Logout</a>
<?php endif; ?>
