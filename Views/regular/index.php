<?php if (@$data['name']): ?>
    <h2>
        <?= @$data['name']; ?>
    </h2>
<?php else: ?>
    <?php if (!@$data['is_loggedin']): ?>
        <fieldset class="login-form">
            <legend>Login:</legend>
            <form action="<?= @$data['base_path']; ?>/login" method="post">
                <div class="login-form--field">
                    <input placeholder="Username" type="text" id="login-username" name="_username" required>
                </div>
                <div class="login-form--field">
                    <input placeholder="Password" type="password" id="login-password" name="_password" required>
                </div>
                <div class="login-form--field">
                    <button type="submit">Login</button>
                </div>
            </form>
        </fieldset>

        <?php include __DIR__ . '/../register/index.php'; ?>
    <?php else: ?>
        <h2>Hello <?= @$data['username']; ?>!</h2>
        <p>
            You're logged in. Head over to your <a href="<?= @$data['base_path']; ?>/<?= @$data['username']; ?>">profile</a>
            and manage your social media profiles.
        </p>
        <a href="<?= @$data['base_path']; ?>/logout" class="button">Logout</a>
    <?php endif; ?>
<?php endif; ?>
